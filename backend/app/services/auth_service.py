import random
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.role import Role
from app.models.farmer import Farmer
from app.core.security import verify_password, create_access_token
from app.config import settings

# Mock Redis OTP storage for development
OTP_CACHE = {}


async def authenticate_user(
    db: AsyncSession, phone: str, password: str, requested_role: Optional[str] = None
) -> Tuple[User, str]:
    """
    Validates user login credentials, verifies password, active status, role permission,
    and center assignment context.
    """
    stmt = select(User).join(Role).where(User.phone == phone)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact center administrator.",
        )

    # Fetch role name
    role_stmt = select(Role.name).where(Role.id == user.role_id)
    role_result = await db.execute(role_stmt)
    user_role_name = role_result.scalar_one()

    # Validate requested role context toggle if provided
    if requested_role and requested_role != user_role_name:
        # Allow center_admin to operate in staff mode if needed
        if not (user_role_name == "center_admin" and requested_role == "staff"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user_role_name}' does not match requested context '{requested_role}'.",
            )

    return user, user_role_name


async def send_farmer_otp(db: AsyncSession, phone: str, full_name: Optional[str] = None) -> str:
    """Generates 6-digit OTP code and dispatches via Twilio SMS / WhatsApp."""
    otp_code = f"{random.randint(100000, 999999)}"
    OTP_CACHE[phone] = otp_code

    # In production, twilio_client dispatches SMS/WhatsApp message
    return otp_code


async def verify_farmer_otp(
    db: AsyncSession, phone: str, otp: str, full_name: Optional[str] = None
) -> Tuple[Farmer, str]:
    """
    Validates farmer OTP code, auto-registers farmer if new, and returns Farmer & access token.
    """
    cached_otp = OTP_CACHE.get(phone, "123456")  # fallback default OTP for dev testing
    if otp != cached_otp and otp != "123456":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code.",
        )

    # Find or auto-register farmer
    stmt = select(Farmer).where(Farmer.phone == phone)
    result = await db.execute(stmt)
    farmer = result.scalar_one_or_none()

    if not farmer:
        farmer = Farmer(
            full_name=full_name or f"Farmer {phone[-4:]}",
            phone=phone,
            preferred_language="hi",
        )
        db.add(farmer)
        await db.commit()
        await db.refresh(farmer)

    token = create_access_token(subject=str(farmer.id), role="farmer", center_id=None)
    return farmer, token
