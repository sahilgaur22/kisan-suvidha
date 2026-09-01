from datetime import date
from typing import Optional
from fastapi import HTTPException, status
import redis.asyncio as aioredis


async def check_daily_booking_limit(
    redis: aioredis.Redis, farmer_id: str, booking_date: date, max_limit: int = 3
) -> int:
    """
    Redis-backed fast pre-check for farmer 3-bookings-per-day rule.
    Format: rate_limit:booking:{farmer_id}:{booking_date}
    Raises 429 Too Many Requests if farmer exceeds 3 bookings for that date.
    """
    key = f"rate_limit:booking:{farmer_id}:{booking_date.isoformat()}"
    try:
        current_count = await redis.get(key)
        count = int(current_count) if current_count else 0

        if count >= max_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"DAILY_LIMIT_EXCEEDED: Farmer already has {count} bookings on {booking_date}. Maximum allowed is {max_limit} per day.",
            )
        return count
    except HTTPException:
        raise
    except Exception:
        # Fall through to PostgreSQL trigger validation on Redis cache error
        return 0


async def increment_daily_booking_limit(
    redis: aioredis.Redis, farmer_id: str, booking_date: date
) -> int:
    """Increments Redis booking counter and sets 24h key expiration."""
    key = f"rate_limit:booking:{farmer_id}:{booking_date.isoformat()}"
    try:
        new_count = await redis.incr(key)
        if new_count == 1:
            await redis.expire(key, 86400)  # 24 hours TTL
        return new_count
    except Exception:
        return 0
