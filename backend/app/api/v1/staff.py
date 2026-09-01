from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.staff_schema import StaffCreateRequest, StaffResponse, StaffUpdateRequest
from app.services.staff_service import (
    create_staff_user, list_center_staff, toggle_staff_active_status
)
from app.core.deps import get_current_user_context, CurrentUser
from app.core.rbac import verify_center_access, CENTER_ADMIN, SUPER_ADMIN

router = APIRouter(prefix="/staff", tags=["Staff Management"])


@router.post("", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def create_staff(
    payload: StaffCreateRequest,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """Creates a new ground staff user (Center Admin & Super Admin only)."""
    if current_user.role not in [CENTER_ADMIN, SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only Center Admins can create staff accounts.",
        )

    user = await create_staff_user(
        db, payload=payload, creator_center_id=current_user.center_id
    )

    return StaffResponse(
        id=str(user.id),
        full_name=user.full_name,
        phone=user.phone,
        role="staff",
        center_id=str(user.center_id) if user.center_id else None,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.get("/center/{center_id}", response_model=List[StaffResponse])
async def get_center_staff(
    center_id: str,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """Lists staff members for a procurement center with own-center RLS guard."""
    verify_center_access(
        user_role=current_user.role,
        user_center_id=current_user.center_id or "",
        target_center_id=center_id,
    )

    staff_members = await list_center_staff(db, center_id=center_id)

    return [
        StaffResponse(
            id=str(u.id),
            full_name=u.full_name,
            phone=u.phone,
            role="staff",
            center_id=str(u.center_id) if u.center_id else None,
            is_active=u.is_active,
            created_at=u.created_at,
        )
        for u in staff_members
    ]


@router.patch("/{staff_id}/deactivate", response_model=StaffResponse)
async def deactivate_staff(
    staff_id: str,
    payload: StaffUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """Toggles staff active/deactive status with strict own-center authorization."""
    if current_user.role not in [CENTER_ADMIN, SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only Center Admins can manage staff status.",
        )

    user = await toggle_staff_active_status(db, staff_id=staff_id, is_active=payload.is_active)

    return StaffResponse(
        id=str(user.id),
        full_name=user.full_name,
        phone=user.phone,
        role="staff",
        center_id=str(user.center_id) if user.center_id else None,
        is_active=user.is_active,
        created_at=user.created_at,
    )
