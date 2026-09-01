import uuid
from datetime import date
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.models.booking import Booking, BookingStatusEnum
from app.models.center import Center
from app.schemas.booking_schema import BookingCreateRequest
from app.core.rate_limiter import check_daily_booking_limit, increment_daily_booking_limit
from app.services.queue_engine import calculate_dynamic_slot, release_slot_on_cancellation


async def generate_token_number(db: AsyncSession, center_id: str, booking_date: date) -> str:
    """Generates human-readable token number e.g. CTR014-0091 based on center code and daily count."""
    center_stmt = select(Center.code).where(Center.id == center_id)
    center_res = await db.execute(center_stmt)
    center_code = center_res.scalar_one_or_none() or "CTR001"

    count_stmt = select(func.count(Booking.id)).where(
        Booking.center_id == center_id, Booking.booking_date == booking_date
    )
    count_res = await db.execute(count_stmt)
    daily_seq = (count_res.scalar_one() or 0) + 1

    return f"{center_code}-{daily_seq:04d}"


async def create_booking(
    db: AsyncSession,
    redis: aioredis.Redis,
    farmer_id: str,
    payload: BookingCreateRequest,
) -> Booking:
    """
    Creates a new token booking with:
      - 3-bookings/day Redis rate limit pre-check.
      - Dynamic slot calculation engine computation.
      - Sequential human-readable token number generation.
    """
    # 1. Check Redis rate limit pre-check
    await check_daily_booking_limit(redis, farmer_id, payload.booking_date)

    # 2. Fetch center capacity parameters
    center_stmt = select(Center).where(Center.id == payload.center_id)
    center_res = await db.execute(center_stmt)
    center = center_res.scalar_one_or_none()

    avg_minutes = center.avg_processing_minutes if center else 15
    max_capacity = center.max_daily_throughput if center else 100

    # 3. Calculate arrival slot window
    slot_info = await calculate_dynamic_slot(
        redis=redis,
        center_id=payload.center_id,
        booking_date=payload.booking_date,
        crop_volume_quintals=payload.crop_volume_quintals,
        vehicle_type=payload.vehicle_type.value,
        center_avg_processing_minutes=avg_minutes,
        center_max_throughput=max_capacity,
    )

    # 4. Generate token number
    token_num = await generate_token_number(db, payload.center_id, payload.booking_date)

    # 5. Create Booking DB record
    booking = Booking(
        id=uuid.uuid4(),
        token_number=token_num,
        farmer_id=farmer_id,
        center_id=payload.center_id,
        crop_name=payload.crop_name,
        crop_volume_quintals=payload.crop_volume_quintals,
        vehicle_type=payload.vehicle_type.value,
        booking_date=payload.booking_date,
        slot_start_time=slot_info["slot_start_time"],
        slot_end_time=slot_info["slot_end_time"],
        status=BookingStatusEnum.SCHEDULED.value,
        channel=payload.channel.value,
    )

    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    # 6. Increment Redis rate limit counter
    await increment_daily_booking_limit(redis, farmer_id, payload.booking_date)

    return booking


async def get_center_queue(
    db: AsyncSession, center_id: str, booking_date: date
) -> List[Booking]:
    """
    Queries center token queue with STRICT Date & Time ordering:
    ORDER BY booking_date ASC, slot_start_time ASC, created_at ASC.
    """
    stmt = (
        select(Booking)
        .where(
            Booking.center_id == center_id,
            Booking.booking_date == booking_date,
            Booking.status.in_(["scheduled", "checked_in", "in_progress"]),
        )
        .order_by(
            Booking.booking_date.asc(),
            Booking.slot_start_time.asc(),
            Booking.created_at.asc(),
        )
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_booking_status(
    db: AsyncSession, redis: aioredis.Redis, booking_id: str, new_status: str
) -> Booking:
    """Updates booking status and handles slot release on cancellation."""
    stmt = select(Booking).where(Booking.id == booking_id)
    result = await db.execute(stmt)
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking token not found."
        )

    booking.status = new_status
    await db.commit()
    await db.refresh(booking)

    if new_status == BookingStatusEnum.CANCELLED.value:
        await release_slot_on_cancellation(redis, str(booking.center_id), booking.booking_date)

    return booking
