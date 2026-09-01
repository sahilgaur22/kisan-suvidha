from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app.database import get_db
from app.core.deps import get_current_user_context, CurrentUser
from app.models.payment import Payment


@pytest.mark.asyncio
async def test_payment_audit_trail_endpoint():
    """Verify Center Admin can view payment audit trail for their center."""
    center_id = "11111111-1111-1111-1111-111111111111"
    mock_admin = CurrentUser(user_id="admin-1", role="center_admin", center_id=center_id)

    mock_payment = Payment(
        id="p1111111-1111-1111-1111-111111111111",
        booking_id="b1111111-1111-1111-1111-111111111111",
        center_id=center_id,
        amount=120000.0,
        msp_rate_applied=2400.0,
        payment_status="processed",
        transaction_ref="PAY-2026-0001",
        created_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars().all.return_value = [mock_payment]
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_current_user_context] = lambda: mock_admin
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                f"{settings.API_V1_STR}/payments/audit?center_id={center_id}"
            )
            assert resp.status_code == 200
            data = resp.json()
            assert len(data) == 1
            assert data[0]["transaction_ref"] == "PAY-2026-0001"
            assert data[0]["amount"] == 120000.0
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_dashboard_stats_endpoint():
    """Verify Center Admin can fetch aggregated dashboard metrics."""
    center_id = "11111111-1111-1111-1111-111111111111"
    mock_admin = CurrentUser(user_id="admin-1", role="center_admin", center_id=center_id)

    mock_db = AsyncMock()

    # 1. Booking counts query mock
    mock_b_res = MagicMock()
    mock_b_res.all.return_value = [("scheduled", 10, 200.0), ("completed", 5, 100.0)]

    # 2. Payments sum mock
    mock_p_res = MagicMock()
    mock_p_res.scalar.return_value = 240000.0

    # 3. Complaints count mock
    mock_c_res = MagicMock()
    mock_c_res.scalar.return_value = 2

    mock_db.execute.side_effect = [mock_b_res, mock_p_res, mock_c_res]

    app.dependency_overrides[get_current_user_context] = lambda: mock_admin
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                f"{settings.API_V1_STR}/dashboard/stats?center_id={center_id}"
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["center_id"] == center_id
            assert data["total_bookings_today"] == 15
            assert data["completed_today"] == 5
            assert data["total_payments_disbursed_inr"] == 240000.0
            assert data["open_complaints_count"] == 2
    finally:
        app.dependency_overrides.clear()
