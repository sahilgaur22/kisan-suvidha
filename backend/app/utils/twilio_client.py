import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger("kisan_suvidha.omnichannel")


async def send_sms_notification(
    to_phone: str, message_body: str
) -> Dict[str, Any]:
    """
    Dispatches SMS notification using Twilio REST API or Fast2SMS API.
    Falls back to dev mock logging if live API credentials are missing.
    """
    # Clean phone number (format +91 for Indian numbers)
    clean_phone = to_phone.strip()
    if not clean_phone.startswith("+"):
        clean_phone = f"+91{clean_phone.lstrip('0')}"

    # 1. Live Twilio SMS Dispatch
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
        data = {
            "To": clean_phone,
            "From": settings.TWILIO_PHONE_NUMBER,
            "Body": message_body,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    url,
                    data=data,
                    auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
                )
                if response.status_code in [200, 201]:
                    res_json = response.json()
                    logger.info(f"Twilio SMS dispatched to {clean_phone}: SID {res_json.get('sid')}")
                    return {"status": "sent", "sid": res_json.get("sid"), "provider": "twilio"}
                else:
                    logger.error(f"Twilio SMS Error ({response.status_code}): {response.text}")
        except Exception as err:
            logger.error(f"Failed to communicate with Twilio SMS API: {err}")

    # 2. Fast2SMS Provider Alternative (India Regional SMS)
    if settings.FAST2SMS_API_KEY:
        url = "https://www.fast2sms.com/dev/bulkV2"
        headers = {"authorization": settings.FAST2SMS_API_KEY}
        payload = {
            "route": "otp",
            "variables_values": message_body,
            "numbers": clean_phone.replace("+91", ""),
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    logger.info(f"Fast2SMS dispatched to {clean_phone}")
                    return {"status": "sent", "provider": "fast2sms"}
                else:
                    logger.error(f"Fast2SMS Error ({response.status_code}): {response.text}")
        except Exception as err:
            logger.error(f"Failed to communicate with Fast2SMS API: {err}")

    # 3. Development Mode Mock Log Output
    mock_log = f"📱 [DEV MODE MOCK SMS] To: {clean_phone} | Body: {message_body}"
    print(f"\n{'='*70}\n{mock_log}\n{'='*70}\n", flush=True)
    logger.info(mock_log)
    return {
        "status": "queued_mock",
        "to": clean_phone,
        "body": message_body,
        "sid": f"SM{clean_phone[-6:]}mock",
        "provider": "mock",
    }


async def send_whatsapp_notification(
    to_phone: str, message_body: str
) -> Dict[str, Any]:
    """
    Dispatches WhatsApp notification using Meta Cloud API or Twilio WhatsApp API.
    Falls back to dev mock logging if live API credentials are missing.
    """
    clean_phone = to_phone.strip().replace("+", "").replace(" ", "")

    # 1. Meta Cloud WhatsApp Graph API Dispatch
    if settings.WHATSAPP_PHONE_NUMBER_ID and settings.WHATSAPP_ACCESS_TOKEN:
        url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
        headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
            "Content-Type": "application/json",
        }
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_phone,
            "type": "text",
            "text": {"preview_url": False, "body": message_body},
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code in [200, 201]:
                    res_json = response.json()
                    wa_id = res_json.get("messages", [{}])[0].get("id", "wa_id")
                    logger.info(f"Meta WhatsApp dispatched to {clean_phone}: ID {wa_id}")
                    return {"status": "sent", "id": wa_id, "provider": "meta_whatsapp"}
                else:
                    logger.error(f"Meta WhatsApp API Error ({response.status_code}): {response.text}")
        except Exception as err:
            logger.error(f"Failed to communicate with WhatsApp Cloud API: {err}")

    # 2. Development Mode Mock Log Output
    mock_wa_log = f"💬 [DEV MODE MOCK WHATSAPP] To: whatsapp:+{clean_phone} | Body: {message_body}"
    print(f"\n{mock_wa_log}\n{'='*70}\n", flush=True)
    logger.info(mock_wa_log)
    return {
        "status": "queued_mock",
        "to": f"whatsapp:+{clean_phone}",
        "body": message_body,
        "sid": f"WA{clean_phone[-6:]}mock",
        "provider": "mock",
    }
