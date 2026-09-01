from datetime import date, time
from unittest.mock import AsyncMock, MagicMock
import pytest
from app.services.queue_engine import calculate_dynamic_slot, release_slot_on_cancellation, CenterFullyBookedError


@pytest.mark.asyncio
async def test_calculate_dynamic_slot_success():
    """Verify dynamic slot calculation computes start time and processing duration."""
    mock_redis = AsyncMock()
    mock_redis.get.side_effect = [None, None]  # current_count = 0, cursor_raw = None
    mock_redis.incr.return_value = 1

    # Create mock lock async context manager
    mock_lock = MagicMock()
    mock_lock.__aenter__ = AsyncMock(return_value=None)
    mock_lock.__aexit__ = AsyncMock(return_value=None)
    mock_redis.lock = MagicMock(return_value=mock_lock)

    result = await calculate_dynamic_slot(
        redis=mock_redis,
        center_id="center-101",
        booking_date=date(2026, 9, 1),
        crop_volume_quintals=50.0,
        vehicle_type="tractor_trolley",
        center_avg_processing_minutes=15,
        center_max_throughput=100,
    )

    assert "slot_start_time" in result
    assert "slot_end_time" in result
    assert isinstance(result["slot_start_time"], time)
    assert result["slot_start_time"] == time(6, 0)
    assert result["estimated_processing_minutes"] >= 15


@pytest.mark.asyncio
async def test_calculate_dynamic_slot_fully_booked():
    """Verify CenterFullyBookedError raised when center capacity reached."""
    mock_redis = AsyncMock()
    mock_redis.get.return_value = "100"  # capacity limit reached

    with pytest.raises(CenterFullyBookedError):
        await calculate_dynamic_slot(
            redis=mock_redis,
            center_id="center-101",
            booking_date=date(2026, 9, 1),
            crop_volume_quintals=20.0,
            center_max_throughput=100,
        )


@pytest.mark.asyncio
async def test_release_slot_on_cancellation():
    """Verify slot release decrements Redis count key."""
    mock_redis = AsyncMock()
    mock_redis.get.return_value = "5"

    await release_slot_on_cancellation(mock_redis, center_id="center-101", booking_date=date(2026, 9, 1))
    mock_redis.decr.assert_called_once_with("queue:count:center-101:2026-09-01")
