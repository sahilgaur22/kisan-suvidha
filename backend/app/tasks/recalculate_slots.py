import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy import select
from app.celery_app import celery_app
from app.database import get_db_session
from app.models.booking import Booking, BookingStatusEnum
from app.services.queue_engine import VEHICLE_PROCESSING_FACTOR, VOLUME_MINUTES_PER_QUINTAL


async def _async_recalculate_queue(center_id: str, booking_date: str) -> Dict[str, Any]:
    """
    Asynchronously pulls scheduled/checked_in bookings for a center & date,
    compresses time gaps caused by cancellations, and updates arrival windows.
    """
    async with get_db_session() as db:
        stmt = (
            select(Booking)
            .where(
                Booking.center_id == center_id,
                Booking.booking_date == booking_date,
                Booking.status.in_([BookingStatusEnum.SCHEDULED.value, BookingStatusEnum.CHECKED_IN.value]),
            )
            .order_by(Booking.slot_start_time.asc(), Booking.created_at.asc())
        )
        result = await db.execute(stmt)
        bookings = list(result.scalars().all())

        if not bookings:
            return {"center_id": center_id, "recalculated_count": 0}

        # Baseline day start: 06:00 IST
        day_start = datetime.strptime(f"{booking_date} 06:00", "%Y-%m-%d %H:%M")
        cursor_dt = day_start

        updated_count = 0
        for booking in bookings:
            vehicle_factor = VEHICLE_PROCESSING_FACTOR.get(booking.vehicle_type.lower(), 1.2)
            duration_mins = max(
                15,
                round(float(booking.crop_volume_quintals) * VOLUME_MINUTES_PER_QUINTAL * vehicle_factor),
            )

            slot_start = cursor_dt
            slot_end = cursor_dt + timedelta(minutes=duration_mins)

            booking.slot_start_time = slot_start.time()
            booking.slot_end_time = slot_end.time()

            cursor_dt = slot_end
            updated_count += 1

        await db.commit()
        return {"center_id": center_id, "recalculated_count": updated_count}


@celery_app.task(name="app.tasks.recalculate_slots.recalculate_center_queue")
def recalculate_center_queue(center_id: str, booking_date: str) -> Dict[str, Any]:
    """Celery worker task wrapper executing queue recalculation pass."""
    return asyncio.run(_async_recalculate_queue(center_id, booking_date))
