import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app.core.deps import get_current_user_context, CurrentUser


@pytest.mark.asyncio
async def test_e2e_multi_tenant_isolation_cross_center_blocked():
    """
    End-to-End Multi-Tenant Isolation Test Suite:
    Simulates Center Admin A attempting to breach Center B resources across:
    1. Queue API
    2. Payment Audit API
    3. Staff Management API
    4. Dashboard Stats API
    Verifies 403 Forbidden response across all endpoints.
    """
    center_a = "11111111-1111-1111-1111-111111111111"
    center_b = "22222222-2222-2222-2222-222222222222"

    mock_admin_a = CurrentUser(user_id="admin-a", role="center_admin", center_id=center_a)
    app.dependency_overrides[get_current_user_context] = lambda: mock_admin_a

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Queue API Breach Attempt
            q_resp = await client.get(
                f"{settings.API_V1_STR}/bookings/queue/{center_b}?booking_date=2026-09-10"
            )
            assert q_resp.status_code == 403

            # 2. Payment Audit API Breach Attempt
            p_resp = await client.get(
                f"{settings.API_V1_STR}/payments/audit?center_id={center_b}"
            )
            assert p_resp.status_code == 403

            # 3. Staff Management API Breach Attempt
            s_resp = await client.get(
                f"{settings.API_V1_STR}/staff/center/{center_b}"
            )
            assert s_resp.status_code == 403

            # 4. Dashboard Stats API Breach Attempt
            d_resp = await client.get(
                f"{settings.API_V1_STR}/dashboard/stats?center_id={center_b}"
            )
            assert d_resp.status_code == 403
    finally:
        app.dependency_overrides.clear()
