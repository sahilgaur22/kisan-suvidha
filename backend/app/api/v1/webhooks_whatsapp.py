from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.config import settings
from app.database import get_db
from app.redis_client import get_redis_client

router = APIRouter(prefix="/webhooks/whatsapp", tags=["Omnichannel Webhooks"])


@router.get("")
async def verify_whatsapp_webhook_challenge(
    mode: Optional[str] = Query(None, alias="hub.mode"),
    token: Optional[str] = Query(None, alias="hub.verify_token"),
    challenge: Optional[str] = Query(None, alias="hub.challenge"),
):
    """
    WhatsApp Cloud API Webhook Verification Challenge endpoint.
    Verifies hub.verify_token and returns hub.challenge.
    """
    verify_token = getattr(settings, "WHATSAPP_VERIFY_TOKEN", "kisan_suvidha_verify_token")
    if mode == "subscribe" and token == verify_token:
        return int(challenge) if challenge and challenge.isdigit() else challenge

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN, detail="Verification token mismatch."
    )


@router.post("")
async def handle_whatsapp_webhook_payload(
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis_client),
):
    """Handles incoming Meta WhatsApp Cloud API webhooks."""
    payload = await request.json()
    return {"status": "received", "payload": payload}
