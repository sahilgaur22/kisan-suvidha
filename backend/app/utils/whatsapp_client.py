from typing import Dict, Any, List, Optional


async def send_whatsapp_cloud_message(
    to_phone: str, text_message: str
) -> Dict[str, Any]:
    """Sends text message payload via Meta WhatsApp Cloud API."""
    return {
        "messaging_product": "whatsapp",
        "to": to_phone,
        "type": "text",
        "text": {"body": text_message},
    }


async def send_whatsapp_interactive_buttons(
    to_phone: str, header_text: str, button_options: List[Dict[str, str]]
) -> Dict[str, Any]:
    """Sends interactive button options payload via Meta WhatsApp Cloud API."""
    return {
        "messaging_product": "whatsapp",
        "to": to_phone,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {"text": header_text},
            "action": {
                "buttons": [
                    {
                        "type": "reply",
                        "reply": {"id": btn["id"], "title": btn["title"]},
                    }
                    for btn in button_options[:3]  # WhatsApp max 3 quick-reply buttons
                ]
            },
        },
    }
