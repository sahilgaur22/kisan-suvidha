from datetime import date
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app.database import get_db
from app.redis_client import get_redis_client
from app.models.center import Center
from app.models.farmer import Farmer


@pytest.mark.asyncio
async def test_sms_webhook_language_selection_first():
    """Verify fresh SMS text asks farmer for language selection (EN/HI/MR) first."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            f"{settings.API_V1_STR}/webhooks/sms",
            data={"From": "+919876543210", "Body": "START"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "Please select your language" in data["response"]
        assert "1. English" in data["response"]
        assert "2. Hindi" in data["response"]
        assert "3. Marathi" in data["response"]


@pytest.mark.asyncio
async def test_whatsapp_webhook_challenge():
    """Verify Meta WhatsApp Cloud API hub.challenge verification endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            f"{settings.API_V1_STR}/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=kisan_suvidha_verify_token&hub.challenge=11582014"
        )
        assert resp.status_code == 200
        assert resp.text == "11582014"
