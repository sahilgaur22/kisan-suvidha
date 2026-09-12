import uuid
from datetime import date, time, datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app.database import get_db
from app.redis_client import get_redis_client
from app.core.deps import get_current_user_context, CurrentUser
from app.models.booking import Booking, BookingStatusEnum, BookingChannelEnum
from app.models.farmer import Farmer


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
        id="11111111-1111-1111-1111-111111111111",
        token_number="CTR001-0001",
        farmer_id="22222222-2222-2222-2222-222222222222",
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
        id="33333333-3333-3333-3333-333333333333",
        token_number="CTR001-0002",
        farmer_id="44444444-4444-4444-4444-444444444444",
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


@pytest.mark.asyncio
async def test_cancel_and_uncancel_token_status():
    """Verify staff/admin can cancel a token and uncancel (retrieve) it with SMS dispatch."""
    center_id = "11111111-1111-1111-1111-111111111111"
    booking_id = "55555555-5555-5555-5555-555555555555"
    farmer_id = "66666666-6666-6666-6666-666666666666"

    mock_user = CurrentUser(
        user_id="user-staff-1",
        role="staff",
        center_id=center_id
    )

    mock_farmer = Farmer(
        id=uuid.UUID(farmer_id),
        full_name="Ramesh Kumar",
        phone="9876543210",
        preferred_language="hi",
        created_at=datetime.now(timezone.utc),
    )

    mock_booking = Booking(
        id=uuid.UUID(booking_id),
        token_number="CTR001-0099",
        farmer_id=uuid.UUID(farmer_id),
        center_id=uuid.UUID(center_id),
        crop_name="Wheat",
        crop_volume_quintals=50.0,
        vehicle_type="tractor_trolley",
        booking_date=date(2026, 9, 10),
        slot_start_time=time(10, 0),
        slot_end_time=time(10, 30),
        status=BookingStatusEnum.SCHEDULED.value,
        channel=BookingChannelEnum.WEB.value,
        created_at=datetime.now(timezone.utc),
    )
    mock_booking.farmer = mock_farmer

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_booking
    mock_db.execute.return_value = mock_result

    mock_redis = AsyncMock()

    app.dependency_overrides[get_current_user_context] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_redis_client] = lambda: mock_redis

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            with patch("app.services.booking_service.notify_farmer_token_event") as mock_notify:
                # 1. Cancel token
                resp_cancel = await client.patch(
                    f"{settings.API_V1_STR}/bookings/{booking_id}/status",
                    json={"status": "cancelled"}
                )
                assert resp_cancel.status_code == 200
                assert resp_cancel.json()["status"] == "cancelled"
                mock_notify.assert_called_with(mock_db, mock_booking, "cancelled")

                # 2. Uncancel / Retrieve token back to scheduled
                resp_uncancel = await client.patch(
                    f"{settings.API_V1_STR}/bookings/{booking_id}/status",
                    json={"status": "scheduled"}
                )
                assert resp_uncancel.status_code == 200
                assert resp_uncancel.json()["status"] == "scheduled"
                mock_notify.assert_called_with(mock_db, mock_booking, "retrieved")
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_booking_endpoint():
    """Verify farmer slot booking creation and response serialization."""
    center_id = "11111111-1111-1111-1111-111111111111"
    farmer_id = "66666666-6666-6666-6666-666666666666"

    mock_user = CurrentUser(
        user_id=farmer_id,
        role="farmer",
        center_id=None
    )

    mock_farmer = Farmer(
        id=uuid.UUID(farmer_id),
        full_name="Ramesh Kumar",
        phone="9876543210",
        preferred_language="hi",
        created_at=datetime.now(timezone.utc),
    )

    mock_created_booking = Booking(
        id=uuid.uuid4(),
        token_number="CTR001-0001",
        farmer_id=uuid.UUID(farmer_id),
        center_id=uuid.UUID(center_id),
        crop_name="Paddy (Dhan)",
        crop_volume_quintals=50.0,
        vehicle_type="tractor_trolley",
        booking_date=date(2026, 9, 15),
        slot_start_time=time(9, 0),
        slot_end_time=time(9, 30),
        status=BookingStatusEnum.SCHEDULED.value,
        channel=BookingChannelEnum.WEB.value,
        created_at=datetime.now(timezone.utc),
    )
    mock_created_booking.farmer = mock_farmer

    mock_db = AsyncMock()
    mock_redis = AsyncMock()

    app.dependency_overrides[get_current_user_context] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_redis_client] = lambda: mock_redis

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            with patch("app.api.v1.bookings.create_booking", return_value=mock_created_booking):
                resp = await client.post(
                    f"{settings.API_V1_STR}/bookings",
                    json={
                        "center_id": center_id,
                        "crop_name": "Paddy (Dhan)",
                        "crop_volume_quintals": 50.0,
                        "vehicle_type": "tractor_trolley",
                        "booking_date": "2026-09-15",
                        "channel": "web"
                    }
                )
                assert resp.status_code == 201
                data = resp.json()
                assert data["token_number"] == "CTR001-0001"
                assert data["farmer_name"] == "Ramesh Kumar"
                assert data["status"] == "scheduled"
    finally:
        app.dependency_overrides.clear()

