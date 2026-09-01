from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app.database import get_db
from app.models.farmer import Farmer


@pytest.mark.asyncio
async def test_farmer_send_otp_endpoint():
    """Verify farmer send OTP endpoint dispatches OTP code."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"{settings.API_V1_STR}/auth/farmer/otp/send",
            json={"phone": "9876543210", "full_name": "Ramesh Kumar"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "debug_otp" in data
        assert data["phone"] == "9876543210"


@pytest.mark.asyncio
async def test_farmer_verify_otp_endpoint_mocked_db():
    """Verify farmer OTP verification route logic with mocked DB session."""
    # Create mock DB session
    mock_db = AsyncMock()
    mock_result = MagicMock()
    
    # Mock existing farmer
    mock_farmer = Farmer(
        id="11111111-1111-1111-1111-111111111111",
        full_name="Ramesh Kumar",
        phone="9876543210",
        preferred_language="hi"
    )
    mock_result.scalar_one_or_none.return_value = mock_farmer
    mock_db.execute.return_value = mock_result

    async def override_get_db():
        yield mock_db

    # Override get_db dependency
    app.dependency_overrides[get_db] = override_get_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                f"{settings.API_V1_STR}/auth/farmer/otp/verify",
                json={"phone": "9876543210", "otp": "123456"}
            )
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["phone"] == "9876543210"
            assert data["token_type"] == "bearer"
    finally:
        app.dependency_overrides.clear()
