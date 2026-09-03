from datetime import date, datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app.database import get_db
from app.core.deps import get_current_user_context, CurrentUser
from app.models.center import Center
from app.models.msp_rate import MSPRate


@pytest.mark.asyncio
async def test_list_centers_endpoint():
    """Verify list centers API route returns active centers."""
    mock_center = Center(
        id="11111111-1111-1111-1111-111111111111",
        name="Sehore Mandi Center",
        code="MP-CTR-014",
        state="Madhya Pradesh",
        district="Sehore",
        address="Main Mandi Road",
        max_daily_throughput=100,
        avg_processing_minutes=15,
        latitude=23.2000,
        longitude=77.0800,
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars().all.return_value = [mock_center]
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(f"{settings.API_V1_STR}/centers")
            assert resp.status_code == 200
            data = resp.json()
            assert len(data) == 1
            assert data[0]["code"] == "MP-CTR-014"
            assert data[0]["state"] == "Madhya Pradesh"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_msp_rate_endpoint():
    """Verify MSP rate creation and live update route."""
    admin_id = "11111111-1111-1111-1111-111111111111"
    mock_user = CurrentUser(user_id=admin_id, role="center_admin", center_id="center-1")
    mock_msp = MSPRate(
        id="22222222-2222-2222-2222-222222222222",
        crop_name="Wheat",
        rate_per_quintal=2400.0,
        permitted_moisture_percent=12.0,
        max_rejection_moisture_percent=14.0,
        effective_from=date(2026, 9, 1),
        updated_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_msp
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_current_user_context] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                f"{settings.API_V1_STR}/msp",
                json={"crop_name": "Wheat", "rate_per_quintal": 2400.0}
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["crop_name"] == "Wheat"
            assert data["rate_per_quintal"] == 2400.0
    finally:
        app.dependency_overrides.clear()
