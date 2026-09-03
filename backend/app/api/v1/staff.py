from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.staff_schema import StaffCreateRequest, StaffResponse, StaffUpdateRequest
from app.services.staff_service import (
    create_staff_user, list_center_staff, toggle_staff_active_status
)
from app.core.deps import get_current_user_context, CurrentUser
from app.core.rbac import verify_center_access, CENTER_ADMIN

router = APIRouter(prefix="/staff", tags=["Staff Management"])


@router.post("", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def create_staff(
    payload: StaffCreateRequest,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """Creates a new ground staff user (Center Admin only)."""
    if current_user.role != CENTER_ADMIN:
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
    """Lists staff members for a procurement center with own-center guard."""
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


@router.patch("/{staff_id}/approve", response_model=StaffResponse)
async def approve_staff(
    staff_id: str,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """Approves a pending ground staff account (Center Admin only)."""
    if current_user.role != CENTER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only Center Admins can approve staff accounts.",
        )

    user = await toggle_staff_active_status(db, staff_id=staff_id, is_active=True)

    return StaffResponse(
        id=str(user.id),
        full_name=user.full_name,
        phone=user.phone,
        role="staff",
        center_id=str(user.center_id) if user.center_id else None,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.patch("/{staff_id}/deactivate", response_model=StaffResponse)
async def deactivate_staff(
    staff_id: str,
    payload: StaffUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """Toggles staff active/deactive status with strict authorization."""
    if current_user.role != CENTER_ADMIN:
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
from pydantic import BaseModel, Field
from app.utils.twilio_client import send_sms_notification, send_whatsapp_notification


class StaffNotificationRequest(BaseModel):
    farmer_phone: str = Field(..., description="Farmer 10-digit phone number")
    message: str = Field(..., min_length=3, description="Notification message text")
    channel: str = Field("sms", description="Channel: sms or whatsapp")


@router.post("/notify-farmer", status_code=status.HTTP_200_OK)
async def notify_farmer_gate_call(
    payload: StaffNotificationRequest,
    current_user: CurrentUser = Depends(get_current_user_context),
):
    """Ground Staff sends direct SMS or WhatsApp gate alert notification to farmer."""
    if payload.channel == "whatsapp":
        res = await send_whatsapp_notification(payload.farmer_phone, payload.message)
    else:
        res = await send_sms_notification(payload.farmer_phone, payload.message)
    return {"status": "success", "provider_response": res}
