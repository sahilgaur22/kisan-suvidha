from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app.database import get_db
from app.core.deps import get_current_user_context, CurrentUser
from app.models.complaint import Complaint, ComplaintCategoryEnum, ComplaintStatusEnum


@pytest.mark.asyncio
async def test_submit_complaint_endpoint():
    """Verify farmer grievance submission endpoint."""
    farmer_id = "11111111-1111-1111-1111-111111111111"
    center_id = "22222222-2222-2222-2222-222222222222"

    mock_user = CurrentUser(user_id=farmer_id, role="farmer", center_id=None)
    mock_complaint = Complaint(
        id="33333333-3333-3333-3333-333333333333",
        ticket_number="TKT-2026-0001",
        farmer_id=farmer_id,
        center_id=center_id,
        booking_id=None,
        category=ComplaintCategoryEnum.DELAY.value,
        description="Unreasonable 3-hour delay at weighbridge.",
        status=ComplaintStatusEnum.OPEN.value,
        resolution_notes=None,
        resolved_by=None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one.return_value = 0
    mock_db.execute.return_value = mock_result
    mock_db.refresh = AsyncMock()

    app.dependency_overrides[get_current_user_context] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                f"{settings.API_V1_STR}/complaints",
                json={
                    "center_id": center_id,
                    "category": "delay",
                    "description": "Unreasonable 3-hour delay at weighbridge."
                }
            )
            assert resp.status_code == 201
            data = resp.json()
            assert data["ticket_number"] == "TKT-2026-0001"
            assert data["status"] == "open"
            assert data["category"] == "delay"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_staff_blocked_from_admin_complaint_inbox():
    """Verify ground staff is blocked from accessing center grievance inbox (Admin-only)."""
    center_id = "22222222-2222-2222-2222-222222222222"
    mock_staff_user = CurrentUser(user_id="staff-1", role="staff", center_id=center_id)

    app.dependency_overrides[get_current_user_context] = lambda: mock_staff_user

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                f"{settings.API_V1_STR}/complaints/center/{center_id}"
            )
            assert resp.status_code == 403
            assert "Only Center Admins" in resp.json()["detail"]
    finally:
        app.dependency_overrides.clear()
