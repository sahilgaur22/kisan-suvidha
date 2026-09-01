from datetime import date
from unittest.mock import AsyncMock
import pytest
from fastapi import HTTPException
from app.core.rate_limiter import check_daily_booking_limit, increment_daily_booking_limit


@pytest.mark.asyncio
async def test_check_daily_booking_limit_below_max():
    """Verify rate limiter passes when count is below 3 bookings."""
    mock_redis = AsyncMock()
    mock_redis.get.return_value = "2"

    count = await check_daily_booking_limit(mock_redis, farmer_id="farmer-1", booking_date=date(2026, 9, 1))
    assert count == 2


@pytest.mark.asyncio
async def test_check_daily_booking_limit_exceeded():
    """Verify rate limiter throws 429 when farmer reaches 3 bookings."""
    mock_redis = AsyncMock()
    mock_redis.get.return_value = "3"

    with pytest.raises(HTTPException) as exc_info:
        await check_daily_booking_limit(mock_redis, farmer_id="farmer-1", booking_date=date(2026, 9, 1))

    assert exc_info.value.status_code == 429
    assert "DAILY_LIMIT_EXCEEDED" in exc_info.value.detail


@pytest.mark.asyncio
async def test_increment_daily_booking_limit():
    """Verify counter increment and key TTL expiration setup."""
    mock_redis = AsyncMock()
    mock_redis.incr.return_value = 1

    new_count = await increment_daily_booking_limit(mock_redis, farmer_id="farmer-1", booking_date=date(2026, 9, 1))
    assert new_count == 1
    mock_redis.expire.assert_called_once()
