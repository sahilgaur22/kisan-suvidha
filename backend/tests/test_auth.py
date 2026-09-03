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


@pytest.mark.asyncio
async def test_admin_login_with_admin_context():
    """Verify center_admin user can log in with login_context='admin' or 'center_admin'."""
    from app.models.user import User
    from app.core.security import get_password_hash

    mock_db = AsyncMock()
    mock_user = User(
        id="33333333-3333-3333-3333-333333333333",
        full_name="Bhopal Mandi Admin",
        email="admin@kisansuvidha.gov.in",
        phone="9876543210",
        password_hash=get_password_hash("password123"),
        role_id=1,
        center_id="11111111-1111-1111-1111-111111111111",
        is_active=True,
    )
    mock_user_res = MagicMock()
    mock_user_res.scalar_one_or_none.return_value = mock_user

    mock_role_res = MagicMock()
    mock_role_res.scalar_one.return_value = "center_admin"

    mock_db.execute.side_effect = [mock_user_res, mock_role_res, mock_user_res, mock_role_res]

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Test with login_context = "admin"
            resp = await client.post(
                f"{settings.API_V1_STR}/auth/login",
                json={
                    "email": "admin@kisansuvidha.gov.in",
                    "password": "password123",
                    "login_context": "admin",
                },
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["role"] == "center_admin"
            assert "access_token" in data

            # Test with login_context = "center_admin"
            resp2 = await client.post(
                f"{settings.API_V1_STR}/auth/login",
                json={
                    "email": "admin@kisansuvidha.gov.in",
                    "password": "password123",
                    "login_context": "center_admin",
                },
            )
            assert resp2.status_code == 200
            data2 = resp2.json()
            assert data2["role"] == "center_admin"
    finally:
        app.dependency_overrides.clear()

