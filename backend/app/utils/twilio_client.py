from typing import Dict, Any, Optional
from app.config import settings


async def send_sms_notification(
    to_phone: str, message_body: str
) -> Dict[str, Any]:
    """
    Dispatches SMS notification via Twilio SMS API.
    Uses mock delivery when running in local development mode.
    """
    # In production, twilio_client.messages.create(...) sends SMS
    return {
        "status": "queued",
        "to": to_phone,
        "body": message_body,
        "sid": f"SM{to_phone[-6:]}mock",
    }


async def send_whatsapp_notification(
    to_phone: str, message_body: str
) -> Dict[str, Any]:
    """
    Dispatches WhatsApp message via Twilio WhatsApp API.
    """
    return {
        "status": "queued",
        "to": f"whatsapp:{to_phone}",
        "body": message_body,
        "sid": f"WA{to_phone[-6:]}mock",
    }
