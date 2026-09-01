import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.role import Role, RoleEnum
from app.schemas.staff_schema import StaffCreateRequest
from app.core.security import get_password_hash
from app.services.msp_service import parse_uuid_or_none


async def create_staff_user(
    db: AsyncSession, payload: StaffCreateRequest, creator_center_id: Optional[str]
) -> User:
    """Creates a new ground staff user assigned to the Center Admin's center."""
    # Check phone uniqueness
    phone_stmt = select(User).where(User.phone == payload.phone)
    existing = await db.execute(phone_stmt)
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with phone number '{payload.phone}' already exists.",
        )

    # Fetch staff role ID
    role_stmt = select(Role).where(Role.name == RoleEnum.STAFF.value)
    role_res = await db.execute(role_stmt)
    staff_role = role_res.scalar_one_or_none()

    if not staff_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="System role 'staff' not initialized in database.",
        )

    assigned_center = parse_uuid_or_none(payload.center_id) or parse_uuid_or_none(creator_center_id)
    if not assigned_center:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Staff creation requires a valid center assignment.",
        )

    user = User(
        id=uuid.uuid4(),
        full_name=payload.full_name,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
        role_id=staff_role.id,
        center_id=assigned_center,
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


async def list_center_staff(db: AsyncSession, center_id: str) -> List[User]:
    """Queries active staff members assigned to a specific procurement center."""
    center_uuid = parse_uuid_or_none(center_id)
    stmt = (
        select(User)
        .join(Role)
        .where(User.center_id == center_uuid, Role.name == RoleEnum.STAFF.value)
        .order_by(User.full_name.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def toggle_staff_active_status(
    db: AsyncSession, staff_id: str, is_active: bool
) -> User:
    """Activates or deactivates a ground staff account."""
    staff_uuid = parse_uuid_or_none(staff_id)
    stmt = select(User).where(User.id == staff_uuid)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Staff account not found."
        )

    user.is_active = is_active
    if not is_active:
        user.deactivated_at = datetime.now(timezone.utc)
    else:
        user.deactivated_at = None

    await db.commit()
    await db.refresh(user)

    return user
