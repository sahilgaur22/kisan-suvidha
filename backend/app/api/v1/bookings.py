from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.database import get_db
from app.redis_client import get_redis_client
from app.schemas.booking_schema import (
    BookingCreateRequest, BookingResponse, BookingStatusUpdateRequest
)
from app.services.booking_service import (
    create_booking, get_center_queue, get_farmer_bookings, update_booking_status
)
from app.core.deps import get_current_user_context, CurrentUser
from app.core.rbac import require_roles, verify_center_access, CENTER_ADMIN, STAFF, FARMER

router = APIRouter(prefix="/bookings", tags=["Bookings Queue"])


@router.get("/my", response_model=List[BookingResponse])
async def read_farmer_my_bookings(
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """Returns booking token history for the currently authenticated farmer."""
    bookings = await get_farmer_bookings(db, farmer_id=current_user.user_id)
    return [
        BookingResponse(
            id=str(b.id),
            token_number=b.token_number,
            farmer_id=str(b.farmer_id),
            center_id=str(b.center_id),
            crop_name=b.crop_name,
            crop_volume_quintals=float(b.crop_volume_quintals),
            actual_weight_quintals=float(b.actual_weight_quintals) if b.actual_weight_quintals is not None else None,
            moisture_content_percent=float(b.moisture_content_percent) if b.moisture_content_percent is not None else None,
            adjusted_weight_quintals=float(b.adjusted_weight_quintals) if b.adjusted_weight_quintals is not None else None,
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
        actual_weight_quintals=float(booking.actual_weight_quintals) if booking.actual_weight_quintals is not None else None,
        moisture_content_percent=float(booking.moisture_content_percent) if booking.moisture_content_percent is not None else None,
        adjusted_weight_quintals=float(booking.adjusted_weight_quintals) if booking.adjusted_weight_quintals is not None else None,
        vehicle_type=booking.vehicle_type,
        booking_date=booking.booking_date,
        slot_start_time=booking.slot_start_time,
        slot_end_time=booking.slot_end_time,
        status=booking.status,
        channel=booking.channel,
        created_at=booking.created_at,
    )


@router.get("/queue", response_model=List[BookingResponse])
@router.get("/queue/{center_id}", response_model=List[BookingResponse])
async def read_center_queue(
    center_id: Optional[str] = None,
    booking_date: Optional[date] = None,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Staff & Admin Queue Interface: Returns token queue for a specific center & date
    guaranteed with STRICT Date & Time ordering (slot_start_time ASC).
    """
    target_center = center_id or current_user.center_id or "11111111-1111-1111-1111-111111111111"

    if current_user.center_id and current_user.role != "super_admin":
        verify_center_access(
            user_role=current_user.role,
            user_center_id=current_user.center_id,
            target_center_id=target_center,
        )

    bookings = await get_center_queue(db, center_id=target_center, booking_date=booking_date)

    return [
        BookingResponse(
            id=str(b.id),
            token_number=b.token_number,
            farmer_id=str(b.farmer_id),
            center_id=str(b.center_id),
            crop_name=b.crop_name,
            crop_volume_quintals=float(b.crop_volume_quintals),
            actual_weight_quintals=float(b.actual_weight_quintals) if b.actual_weight_quintals is not None else None,
            moisture_content_percent=float(b.moisture_content_percent) if b.moisture_content_percent is not None else None,
            adjusted_weight_quintals=float(b.adjusted_weight_quintals) if b.adjusted_weight_quintals is not None else None,
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
    """Updates token status (scheduled -> checked_in -> in_progress -> completed / cancelled / rejected)."""
    booking = await update_booking_status(
        db=db,
        redis=redis,
        booking_id=booking_id,
        new_status=payload.status.value,
        actual_weight_quintals=payload.actual_weight_quintals,
        moisture_content_percent=payload.moisture_content_percent,
    )

    return BookingResponse(
        id=str(booking.id),
        token_number=booking.token_number,
        farmer_id=str(booking.farmer_id),
        center_id=str(booking.center_id),
        crop_name=booking.crop_name,
        crop_volume_quintals=float(booking.crop_volume_quintals),
        actual_weight_quintals=float(booking.actual_weight_quintals) if booking.actual_weight_quintals is not None else None,
        moisture_content_percent=float(booking.moisture_content_percent) if booking.moisture_content_percent is not None else None,
        adjusted_weight_quintals=float(booking.adjusted_weight_quintals) if booking.adjusted_weight_quintals is not None else None,
        vehicle_type=booking.vehicle_type,
        booking_date=booking.booking_date,
        slot_start_time=booking.slot_start_time,
        slot_end_time=booking.slot_end_time,
        status=booking.status,
        channel=booking.channel,
        created_at=booking.created_at,
    )
