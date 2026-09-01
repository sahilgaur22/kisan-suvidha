from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.database import get_db
from app.redis_client import get_redis_client
from app.schemas.booking_schema import (
    BookingCreateRequest, BookingResponse, BookingStatusUpdateRequest
)
from app.services.booking_service import (
    create_booking, get_center_queue, update_booking_status
)
from app.core.deps import get_current_user_context, CurrentUser
from app.core.rbac import require_roles, verify_center_access, SUPER_ADMIN, CENTER_ADMIN, STAFF, FARMER

router = APIRouter(prefix="/bookings", tags=["Bookings Queue"])


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_new_booking(
    payload: BookingCreateRequest,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis_client),
):
    """
    Creates a new slot booking for a farmer.
    Enforces 3-booking/day limit and dynamic arrival slot calculation.
    """
    booking = await create_booking(
        db=db, redis=redis, farmer_id=current_user.user_id, payload=payload
    )

    return BookingResponse(
        id=str(booking.id),
        token_number=booking.token_number,
        farmer_id=str(booking.farmer_id),
        center_id=str(booking.center_id),
        crop_name=booking.crop_name,
        crop_volume_quintals=float(booking.crop_volume_quintals),
        vehicle_type=booking.vehicle_type,
        booking_date=booking.booking_date,
        slot_start_time=booking.slot_start_time,
        slot_end_time=booking.slot_end_time,
        status=booking.status,
        channel=booking.channel,
        created_at=booking.created_at,
    )


@router.get("/queue/{center_id}", response_model=List[BookingResponse])
async def read_center_queue(
    center_id: str,
    booking_date: date,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Staff & Admin Queue Interface: Returns token queue for a specific center & date
    guaranteed with STRICT Date & Time ordering (slot_start_time ASC).
    """
    verify_center_access(
        user_role=current_user.role,
        user_center_id=current_user.center_id or "",
        target_center_id=center_id,
    )

    bookings = await get_center_queue(db, center_id=center_id, booking_date=booking_date)

    return [
        BookingResponse(
            id=str(b.id),
            token_number=b.token_number,
            farmer_id=str(b.farmer_id),
            center_id=str(b.center_id),
            crop_name=b.crop_name,
            crop_volume_quintals=float(b.crop_volume_quintals),
            vehicle_type=b.vehicle_type,
            booking_date=b.booking_date,
            slot_start_time=b.slot_start_time,
            slot_end_time=b.slot_end_time,
            status=b.status,
            channel=b.channel,
            created_at=b.created_at,
        )
        for b in bookings
    ]


@router.patch("/{booking_id}/status", response_model=BookingResponse)
async def change_booking_status(
    booking_id: str,
    payload: BookingStatusUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis_client),
):
    """Updates token status (scheduled -> checked_in -> in_progress -> completed / cancelled)."""
    booking = await update_booking_status(
        db=db, redis=redis, booking_id=booking_id, new_status=payload.status.value
    )

    return BookingResponse(
        id=str(booking.id),
        token_number=booking.token_number,
        farmer_id=str(booking.farmer_id),
        center_id=str(booking.center_id),
        crop_name=booking.crop_name,
        crop_volume_quintals=float(booking.crop_volume_quintals),
        vehicle_type=booking.vehicle_type,
        booking_date=booking.booking_date,
        slot_start_time=booking.slot_start_time,
        slot_end_time=booking.slot_end_time,
        status=booking.status,
        channel=booking.channel,
        created_at=booking.created_at,
    )
