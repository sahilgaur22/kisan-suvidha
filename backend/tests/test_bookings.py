from datetime import date, time, datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app.database import get_db
from app.redis_client import get_redis_client
from app.core.deps import get_current_user_context, CurrentUser
from app.models.booking import Booking, BookingStatusEnum, BookingChannelEnum


@pytest.mark.asyncio
async def test_read_center_queue_strict_ordering():
    """Verify staff queue route returns tokens in strict date/time order."""
    center_id = "11111111-1111-1111-1111-111111111111"

    # Mock user context
    mock_user = CurrentUser(
        user_id="user-staff-1",
        role="staff",
        center_id=center_id
    )

    # Mock DB bookings list (ordered by slot_start_time)
    mock_b1 = Booking(
        id="b1111111-1111-1111-1111-111111111111",
        token_number="CTR001-0001",
        farmer_id="f1111111-1111-1111-1111-111111111111",
        center_id=center_id,
        crop_name="Wheat",
        crop_volume_quintals=40.0,
        vehicle_type="tractor_trolley",
        booking_date=date(2026, 9, 1),
        slot_start_time=time(6, 0),
        slot_end_time=time(6, 30),
        status=BookingStatusEnum.SCHEDULED.value,
        channel=BookingChannelEnum.WEB.value,
        created_at=datetime.now(timezone.utc),
    )
    mock_b2 = Booking(
        id="b2222222-2222-2222-2222-222222222222",
        token_number="CTR001-0002",
        farmer_id="f2222222-2222-2222-2222-222222222222",
        center_id=center_id,
        crop_name="Paddy",
        crop_volume_quintals=60.0,
        vehicle_type="truck",
        booking_date=date(2026, 9, 1),
        slot_start_time=time(6, 30),
        slot_end_time=time(7, 15),
        status=BookingStatusEnum.SCHEDULED.value,
        channel=BookingChannelEnum.WEB.value,
        created_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars().all.return_value = [mock_b1, mock_b2]
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_current_user_context] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                f"{settings.API_V1_STR}/bookings/queue/{center_id}?booking_date=2026-09-01"
            )
            assert resp.status_code == 200
            data = resp.json()
            assert len(data) == 2
            assert data[0]["token_number"] == "CTR001-0001"
            assert data[1]["token_number"] == "CTR001-0002"
            assert data[0]["slot_start_time"] < data[1]["slot_start_time"]
    finally:
        app.dependency_overrides.clear()
