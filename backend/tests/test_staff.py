from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app.database import get_db
from app.core.deps import get_current_user_context, CurrentUser
from app.models.user import User
from app.models.role import Role


@pytest.mark.asyncio
async def test_create_staff_user_endpoint():
    """Verify Center Admin can create new staff accounts for their assigned center."""
    admin_center_id = "11111111-1111-1111-1111-111111111111"
    mock_admin = CurrentUser(user_id="admin-1", role="center_admin", center_id=admin_center_id)

    mock_staff_role = Role(id="role-staff-1", name="staff")
    mock_staff_user = User(
        id="22222222-2222-2222-2222-222222222222",
        full_name="Vikram Singh",
        phone="9876500000",
        password_hash="hashedpass",
        role_id="role-staff-1",
        center_id=admin_center_id,
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_phone_res = MagicMock()
    mock_phone_res.scalar_one_or_none.return_value = None  # phone unique

    mock_role_res = MagicMock()
    mock_role_res.scalar_one_or_none.return_value = mock_staff_role

    mock_db.execute.side_effect = [mock_phone_res, mock_role_res]

    app.dependency_overrides[get_current_user_context] = lambda: mock_admin
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                f"{settings.API_V1_STR}/staff",
                json={
                    "full_name": "Vikram Singh",
                    "phone": "9876500000",
                    "password": "securepassword123",
                    "center_id": admin_center_id
                }
            )
            assert resp.status_code == 201
            data = resp.json()
            assert data["full_name"] == "Vikram Singh"
            assert data["phone"] == "9876500000"
            assert data["role"] == "staff"
    finally:
        app.dependency_overrides.clear()
