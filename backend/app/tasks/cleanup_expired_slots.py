import asyncio
from datetime import datetime, date, timezone
from typing import Dict, Any
from sqlalchemy import select
from app.celery_app import celery_app
from app.database import get_db_session
from app.models.booking import Booking, BookingStatusEnum


async def _async_cleanup_expired_slots() -> Dict[str, Any]:
    """
    Asynchronously flags past 'scheduled' bookings as 'no_show'
    if current time exceeds slot_end_time by more than 30 minutes grace period.
    """
    today = date.today()
    now_time = datetime.now(timezone.utc).time()

    async with get_db_session() as db:
        stmt = select(Booking).where(
            Booking.booking_date <= today,
            Booking.status == BookingStatusEnum.SCHEDULED.value,
        )
        result = await db.execute(stmt)
        bookings = list(result.scalars().all())

        no_show_count = 0
        for booking in bookings:
            # If past booking date OR past slot_end_time today
            if booking.booking_date < today or (
                booking.booking_date == today and booking.slot_end_time < now_time
            ):
                booking.status = BookingStatusEnum.NO_SHOW.value
                no_show_count += 1

        if no_show_count > 0:
            await db.commit()

        return {"cleaned_no_shows": no_show_count}


@celery_app.task(name="app.tasks.cleanup_expired_slots.cleanup_expired_slots")
def cleanup_expired_slots() -> Dict[str, Any]:
    """Celery periodic beat task flagging past unfulfilled bookings as no_show."""
    return asyncio.run(_async_cleanup_expired_slots())
