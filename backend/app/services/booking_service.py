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


from app.models.msp_rate import MSPRate


async def generate_token_number(db: AsyncSession, center_id: str, booking_date: date) -> str:
    """Generates human-readable token number e.g. CTR014-0091 based on center code and daily count."""
    try:
        center_uuid = uuid.UUID(center_id)
    except (ValueError, TypeError):
        center_uuid = uuid.UUID("11111111-1111-1111-1111-111111111111")

    center_stmt = select(Center.code).where(Center.id == center_uuid)
    center_res = await db.execute(center_stmt)
    center_code = center_res.scalar_one_or_none() or "CTR001"

    count_stmt = select(func.count(Booking.id)).where(
        Booking.center_id == center_uuid, Booking.booking_date == booking_date
    )
    count_res = await db.execute(count_stmt)
    daily_seq = (count_res.scalar_one() or 0) + 1

    return f"{center_code}-{daily_seq:04d}"


from app.models.farmer import Farmer
from app.utils.twilio_client import send_sms_notification, send_whatsapp_notification


async def notify_farmer_token_event(db: AsyncSession, booking: Booking, event_type: str) -> None:
    """Helper to send dual SMS and WhatsApp notifications to farmer on token status change."""
    try:
        farmer_stmt = select(Farmer).where(Farmer.id == booking.farmer_id)
        farmer_res = await db.execute(farmer_stmt)
        farmer = farmer_res.scalar_one_or_none()
        if not farmer or not farmer.phone:
            return

        phone = farmer.phone
        token = booking.token_number
        crop = booking.crop_name

        if event_type == "created":
            msg = f"Kisan Suvidha: Your slot token #{token} for {crop} on {booking.booking_date} is CONFIRMED (Arrival window: {booking.slot_start_time} - {booking.slot_end_time})."
        elif event_type == "checked_in":
            msg = f"Kisan Suvidha: Token #{token} for {crop} is now CHECKED-IN at Mandi Gate. Please wait near the unloading bay."
        elif event_type == "in_progress":
            msg = f"Kisan Suvidha: Token #{token} for {crop} is IN-PROGRESS. Weighbridge & moisture measurement taking place."
        elif event_type == "completed":
            actual = booking.adjusted_weight_quintals or booking.actual_weight_quintals or booking.crop_volume_quintals
            msg = f"Kisan Suvidha: Token #{token} PROCUREMENT COMPLETED! Net Payable Weight: {actual} Quintals. MSP payout details generated."
        elif event_type == "rejected":
            actual_m = booking.moisture_content_percent or 0.0
            msg = f"Kisan Suvidha: Token #{token} LOT REJECTED. Measured moisture ({actual_m}%) exceeds maximum limit. Sun-drying required before re-entry."
        elif event_type == "cancelled":
            msg = f"Kisan Suvidha: Token #{token} has been CANCELLED."
        else:
            msg = f"Kisan Suvidha: Token #{token} status updated to {event_type.upper()}."

        await send_sms_notification(phone, msg)
        await send_whatsapp_notification(phone, msg)
    except Exception as err:
        print(f"Notification dispatch error: {err}", flush=True)


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
    try:
        center_uuid = uuid.UUID(payload.center_id)
    except (ValueError, TypeError):
        center_uuid = uuid.UUID("11111111-1111-1111-1111-111111111111")

    # 1. Check Redis rate limit pre-check
    await check_daily_booking_limit(redis, farmer_id, payload.booking_date)

    # 2. Fetch center capacity parameters
    center_stmt = select(Center).where(Center.id == center_uuid)
    center_res = await db.execute(center_stmt)
    center = center_res.scalar_one_or_none()

    avg_minutes = center.avg_processing_minutes if center else 15
    max_capacity = center.max_daily_throughput if center else 100

    # 3. Calculate arrival slot window
    slot_info = await calculate_dynamic_slot(
        redis=redis,
        center_id=str(center_uuid),
        booking_date=payload.booking_date,
        crop_volume_quintals=payload.crop_volume_quintals,
        vehicle_type=payload.vehicle_type.value,
        center_avg_processing_minutes=avg_minutes,
        center_max_throughput=max_capacity,
    )

    # 4. Generate token number
    token_num = await generate_token_number(db, str(center_uuid), payload.booking_date)

    # 5. Create Booking DB record
    booking = Booking(
        id=uuid.uuid4(),
        token_number=token_num,
        farmer_id=uuid.UUID(farmer_id) if isinstance(farmer_id, str) else farmer_id,
        center_id=center_uuid,
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

    # 7. Send automated creation SMS & WhatsApp notifications
    await notify_farmer_token_event(db, booking, "created")

    return booking


async def get_center_queue(
    db: AsyncSession, center_id: str, booking_date: Optional[date] = None
) -> List[Booking]:
    """
    Queries center token queue with STRICT Date & Time ordering:
    ORDER BY booking_date ASC, slot_start_time ASC, created_at ASC.
    """
    try:
        center_uuid = uuid.UUID(center_id)
    except (ValueError, TypeError):
        center_uuid = uuid.UUID("11111111-1111-1111-1111-111111111111")

    stmt = select(Booking).where(
        Booking.center_id == center_uuid,
        Booking.status.in_(["scheduled", "checked_in", "in_progress"]),
    )

    if booking_date:
        stmt = stmt.where(Booking.booking_date == booking_date)

    stmt = stmt.order_by(
        Booking.booking_date.asc(),
        Booking.slot_start_time.asc(),
        Booking.created_at.asc(),
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_farmer_bookings(
    db: AsyncSession, farmer_id: str
) -> List[Booking]:
    """Retrieves all past and active booking tokens for a specific farmer."""
    try:
        farmer_uuid = uuid.UUID(farmer_id)
    except (ValueError, TypeError):
        return []

    stmt = (
        select(Booking)
        .where(Booking.farmer_id == farmer_uuid)
        .order_by(Booking.booking_date.desc(), Booking.slot_start_time.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_booking_status(
    db: AsyncSession,
    redis: aioredis.Redis,
    booking_id: str,
    new_status: str,
    actual_weight_quintals: Optional[float] = None,
    moisture_content_percent: Optional[float] = None,
) -> Booking:
    """Updates booking status, records actual measured crop weight, evaluates moisture content, and dispatches automated SMS/WhatsApp alerts."""
    try:
        booking_uuid = uuid.UUID(booking_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid booking token ID."
        )

    stmt = select(Booking).where(Booking.id == booking_uuid)
    result = await db.execute(stmt)
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking token not found."
        )

    if actual_weight_quintals is not None and actual_weight_quintals > 0:
        booking.actual_weight_quintals = actual_weight_quintals

    if moisture_content_percent is not None and moisture_content_percent >= 0:
        booking.moisture_content_percent = moisture_content_percent

        # Query crop MSP & moisture limits
        msp_stmt = select(MSPRate).where(MSPRate.crop_name == booking.crop_name)
        msp_res = await db.execute(msp_stmt)
        msp_crop = msp_res.scalar_one_or_none()

        permitted = float(msp_crop.permitted_moisture_percent) if msp_crop else 14.0
        max_rejection = float(msp_crop.max_rejection_moisture_percent) if msp_crop else 16.0

        actual_qty = float(booking.actual_weight_quintals or booking.crop_volume_quintals)

        if moisture_content_percent > max_rejection:
            new_status = BookingStatusEnum.REJECTED.value
            booking.adjusted_weight_quintals = 0.0
        else:
            if moisture_content_percent > permitted:
                adjusted_qty = actual_qty * ((100.0 - moisture_content_percent) / (100.0 - permitted))
                booking.adjusted_weight_quintals = round(adjusted_qty, 2)
            else:
                booking.adjusted_weight_quintals = actual_qty

    booking.status = new_status
    await db.commit()
    await db.refresh(booking)

    if new_status == BookingStatusEnum.CANCELLED.value:
        await release_slot_on_cancellation(redis, str(booking.center_id), booking.booking_date)

    # Dispatch automated status update notifications to farmer
    await notify_farmer_token_event(db, booking, new_status)

    return booking
