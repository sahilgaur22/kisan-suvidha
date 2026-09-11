import math
from datetime import datetime, timedelta, date, time
from typing import Dict, Any, Union
import redis.asyncio as aioredis

VEHICLE_PROCESSING_FACTOR = {
    "bullock_cart": 1.4,
    "tractor_trolley": 1.0,
    "pickup": 0.8,
    "truck": 1.6,
    "other": 1.2,
}

VOLUME_MINUTES_PER_QUINTAL = 0.8  # average processing minutes per quintal of crop


class CenterFullyBookedError(Exception):
    def __init__(self, center_id: str, booking_date: str):
        self.center_id = center_id
        self.booking_date = booking_date
        super().__init__(f"Center {center_id} is fully booked for date {booking_date}.")


async def calculate_dynamic_slot(
    redis: aioredis.Redis,
    center_id: str,
    booking_date: Union[str, date],
    crop_volume_quintals: float,
    vehicle_type: str = "tractor_trolley",
    center_avg_processing_minutes: int = 15,
    center_max_throughput: int = 100,
) -> Dict[str, Any]:
    """
    Computes a dynamic arrival time window for a new token booking based on:
      - Existing cumulative queue load for that center & date from Redis.
      - Crop volume & vehicle type processing factor.
      - Center daily throughput capacity limits.
    Returns: {"slot_start_time": time_obj, "slot_end_time": time_obj, "estimated_processing_minutes": int}
    """
    date_str = booking_date.isoformat() if isinstance(booking_date, date) else str(booking_date)
    day_key = f"queue:cursor:{center_id}:{date_str}"
    count_key = f"queue:count:{center_id}:{date_str}"

    current_count = 0
    try:
        current_count_str = await redis.get(count_key)
        current_count = int(current_count_str) if current_count_str else 0
    except Exception:
        current_count = 0

    if current_count >= center_max_throughput:
        raise CenterFullyBookedError(center_id, date_str)

    # Calculate processing duration for this specific booking
    vehicle_factor = VEHICLE_PROCESSING_FACTOR.get(vehicle_type.lower(), 1.2)
    processing_minutes = max(
        center_avg_processing_minutes,
        round(crop_volume_quintals * VOLUME_MINUTES_PER_QUINTAL * vehicle_factor),
    )

    # Baseline day start time: 06:00 IST
    day_start = datetime.strptime(f"{date_str} 06:00", "%Y-%m-%d %H:%M")

    # Atomic lock to prevent race conditions during concurrent slot reservations
    lock_key = f"lock:{day_key}"
    try:
        async with redis.lock(lock_key, timeout=5):
            cursor_raw = await redis.get(day_key)
            if cursor_raw:
                cursor_str = cursor_raw.decode("utf-8") if isinstance(cursor_raw, bytes) else str(cursor_raw)
                cursor_dt = datetime.strptime(cursor_str, "%Y-%m-%d %H:%M")
            else:
                cursor_dt = day_start

            slot_start_dt = cursor_dt
            slot_end_dt = cursor_dt + timedelta(minutes=processing_minutes)

            # Update cursor & increment count with 20h TTL
            await redis.set(day_key, slot_end_dt.strftime("%Y-%m-%d %H:%M"), ex=72000)
            await redis.incr(count_key)
            await redis.expire(count_key, 72000)
    except Exception:
        # Fallback slot computation if Redis service is offline in local dev environment
        slot_start_dt = day_start
        slot_end_dt = day_start + timedelta(minutes=processing_minutes)

    return {
        "slot_start_time": slot_start_dt.time(),
        "slot_end_time": slot_end_dt.time(),
        "estimated_processing_minutes": processing_minutes,
    }


async def release_slot_on_cancellation(
    redis: aioredis.Redis, center_id: str, booking_date: Union[str, date]
) -> None:
    """Decrements center booking count in Redis upon token cancellation."""
    try:
        date_str = booking_date.isoformat() if isinstance(booking_date, date) else str(booking_date)
        count_key = f"queue:count:{center_id}:{date_str}"
        current_count_str = await redis.get(count_key)
        if current_count_str and int(current_count_str) > 0:
            await redis.decr(count_key)
    except Exception as e:
        print(f"Redis release slot error: {e}", flush=True)
