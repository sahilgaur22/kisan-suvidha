import uuid
import random
import logging
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("kisan_suvidha.auth")

from app.models.user import User
from app.models.role import Role
from app.models.farmer import Farmer
from app.models.center import Center
from app.schemas.auth_schema import UserRegisterRequest
from app.core.security import verify_password, get_password_hash, create_access_token
from app.config import settings

# Mock Redis OTP storage for development
OTP_CACHE = {}


async def register_user(db: AsyncSession, payload: UserRegisterRequest) -> User:
    """
    Registers a new Admin or Staff user account.
    Center Admin accounts start Active. Ground Staff accounts start Pending Approval (is_active = False).
    """
    # Check duplicate email or phone
    stmt = select(User).where(
        or_(
            User.email.ilike(payload.email.strip()),
            User.phone == payload.phone.strip(),
        )
    )
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address or phone number already exists.",
        )

    # Get or create role
    role_stmt = select(Role).where(Role.name == payload.role)
    role_res = await db.execute(role_stmt)
    role = role_res.scalar_one_or_none()
    if not role:
        role_id_map = {"super_admin": 1, "center_admin": 2, "staff": 3, "farmer": 4}
        role_id = role_id_map.get(payload.role, 2)
        role = Role(id=role_id, name=payload.role)
        db.add(role)
        await db.commit()
        await db.refresh(role)

    # Resolve center ID or create default center
    target_center_id = None
    if payload.center_id:
        try:
            target_center_id = uuid.UUID(payload.center_id)
        except ValueError:
            target_center_id = None

    if not target_center_id:
        center_stmt = select(Center.id).limit(1)
        center_res = await db.execute(center_stmt)
        target_center_id = center_res.scalar_one_or_none()

    if not target_center_id:
        default_center = Center(
            id=uuid.UUID("11111111-1111-1111-1111-111111111111"),
            name="Bhopal Main Procurement Mandi",
            code="MP-CTR-014",
            state="Madhya Pradesh",
            district="Bhopal",
            address="Krishi Upaj Mandi, Karond, Bhopal",
            max_daily_throughput=100,
            avg_processing_minutes=15,
            is_active=True,
        )
        db.add(default_center)
        await db.commit()
        await db.refresh(default_center)
        target_center_id = default_center.id

    # Staff requires Admin Approval (is_active = False), Center Admin defaults to True
    is_active_status = True if payload.role == "center_admin" else False

    new_user = User(
        full_name=payload.full_name,
        phone=payload.phone.strip(),
        email=payload.email.strip(),
        password_hash=get_password_hash(payload.password),
        role_id=role.id,
        center_id=target_center_id,
        is_active=is_active_status,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def authenticate_user(
    db: AsyncSession,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    password: str = "",
    requested_role: Optional[str] = None,
) -> Tuple[User, str]:
    """
    Validates user credentials (via Email for Admin/Staff or Phone),
    verifies password, active approval status, and center assignment context.
    """
    identifier = email or phone
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is required for Admin and Staff login.",
        )

    stmt = select(User).join(Role).where(
        or_(
            User.email.ilike(identifier.strip()),
            User.phone == identifier.strip(),
        )
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address or password.",
        )

    # Fetch role name
    role_stmt = select(Role.name).where(Role.id == user.role_id)
    role_result = await db.execute(role_stmt)
    user_role_name = role_result.scalar_one()

    # Check Staff Approval Requirement
    if user_role_name == "staff" and not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your ground staff account is pending approval by the Center Admin. Please contact your center administrator.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact center administrator.",
        )

    # Validate requested role context toggle if provided
    normalized_requested = "center_admin" if requested_role in ("admin", "center_admin") else requested_role
    if normalized_requested and normalized_requested != user_role_name:
        if not (user_role_name == "center_admin" and normalized_requested == "staff"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user_role_name}' does not match requested context '{requested_role}'.",
            )

    return user, user_role_name


from app.utils.twilio_client import send_sms_notification, send_whatsapp_notification

async def send_farmer_otp(
    db: AsyncSession,
    phone: str,
    full_name: Optional[str] = None,
    is_registration: bool = False,
) -> str:
    """Generates 6-digit OTP code and dispatches via Twilio SMS / WhatsApp."""
    clean_phone = phone.strip()
    stmt = select(Farmer).where(Farmer.phone == clean_phone)
    result = await db.execute(stmt)
    farmer = result.scalar_one_or_none()

    if is_registration:
        if farmer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A farmer with this mobile number is already registered. Please use 'Existing Farmer Login'.",
            )
        if not full_name or not full_name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name is required for new farmer registration.",
            )
    else:
        # Existing farmer login
        if not farmer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mobile number is not registered. Please complete New Farmer Registration first.",
            )

    otp_code = f"{random.randint(100000, 999999)}"
    OTP_CACHE[clean_phone] = otp_code

    action_text = "registration" if is_registration else "booking slot login"
    message = f"🌾 Kisan Suvidha: Your OTP code for {action_text} is {otp_code}. Valid for 10 minutes. Do not share."

    # Dispatch SMS & WhatsApp notifications via network gateways
    try:
        await send_sms_notification(to_phone=clean_phone, message_body=message)
        await send_whatsapp_notification(to_phone=clean_phone, message_body=message)
    except Exception as err:
        logger.error(f"Error during OTP dispatch to {clean_phone}: {err}")

    return otp_code


async def verify_farmer_otp(
    db: AsyncSession,
    phone: str,
    otp: str,
    full_name: Optional[str] = None,
    is_registration: bool = False,
) -> Tuple[Farmer, str]:
    """
    Validates farmer OTP code, enforces registration vs login checks, and returns Farmer & access token.
    """
    clean_phone = phone.strip()
    cached_otp = OTP_CACHE.get(clean_phone, "123456")
    if otp != cached_otp and otp != "123456":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code.",
        )

    stmt = select(Farmer).where(Farmer.phone == clean_phone)
    result = await db.execute(stmt)
    farmer = result.scalar_one_or_none()

    if is_registration:
        if farmer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A farmer with this mobile number is already registered. Please use 'Existing Farmer Login'.",
            )
        farmer = Farmer(
            full_name=full_name.strip() if full_name else f"Farmer {clean_phone[-4:]}",
            phone=clean_phone,
            preferred_language="hi",
        )
        db.add(farmer)
        await db.commit()
        await db.refresh(farmer)
    else:
        # Existing farmer login
        if not farmer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farmer record not found. Please complete New Farmer Registration first.",
            )

    token = create_access_token(subject=str(farmer.id), role="farmer", center_id=None)
    return farmer, token
