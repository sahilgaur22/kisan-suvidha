import re
from datetime import date
from typing import Dict, Any
from fastapi import APIRouter, Depends, Form, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.database import get_db
from app.redis_client import get_redis_client
from app.models.center import Center
from app.schemas.booking_schema import BookingCreateRequest
from app.services.booking_service import create_booking
from app.services.auth_service import verify_farmer_otp

router = APIRouter(prefix="/webhooks/sms", tags=["Omnichannel Webhooks"])

BOOK_PATTERN = re.compile(
    r"^BOOK\s+(?P<center>\S+)\s+(?P<crop>\S+)\s+(?P<volume>\d+(\.\d+)?)\s+(?P<vehicle>\S+)\s+(?P<date>\d{4}-\d{2}-\d{2})$",
    re.IGNORECASE,
)


@router.post("")
async def handle_sms_webhook(
    From: str = Form(..., description="Sender phone number"),
    Body: str = Form(..., description="SMS message text body"),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis_client),
):
    """
    Twilio SMS Webhook Handler.
    Parses single-shot commands:
    - BOOK <CENTER_CODE> <CROP> <VOLUME> <VEHICLE> <YYYY-MM-DD>
    - HELP
    """
    phone = From.replace("whatsapp:", "").replace("+91", "").strip()
    body_str = Body.strip()

    if body_str.upper() == "HELP":
        return {
            "response": "Format: BOOK <CENTER_CODE> <CROP> <VOLUME_QUINTALS> <VEHICLE> <YYYY-MM-DD>\nExample: BOOK MP-CTR-014 Wheat 50 tractor_trolley 2026-09-10"
        }

    match = BOOK_PATTERN.match(body_str)
    if not match:
        return {
            "response": "Invalid format. Send HELP to see instructions. Example: BOOK MP-CTR-014 Wheat 50 tractor_trolley 2026-09-10"
        }

    center_code = match.group("center").upper()
    crop_name = match.group("crop")
    volume = float(match.group("volume"))
    vehicle = match.group("vehicle").lower()
    booking_date_str = match.group("date")

    # Fetch center ID by code
    center_stmt = select(Center).where(Center.code == center_code)
    c_res = await db.execute(center_stmt)
    center = c_res.scalar_one_or_none()

    if not center:
        return {"response": f"Error: Center code '{center_code}' not found."}

    # Ensure farmer profile exists
    farmer, _ = await verify_farmer_otp(db, phone=phone, otp="123456")

    try:
        booking_date_val = date.fromisoformat(booking_date_str)
        payload = BookingCreateRequest(
            center_id=str(center.id),
            crop_name=crop_name,
            crop_volume_quintals=volume,
            vehicle_type=vehicle,  # type: ignore
            booking_date=booking_date_val,
            channel="sms",  # type: ignore
        )

        booking = await create_booking(db, redis=redis, farmer_id=str(farmer.id), payload=payload)

        return {
            "response": f"Success! Booking Confirmed.\nToken: {booking.token_number}\nDate: {booking.booking_date}\nArrival Window: {booking.slot_start_time.strftime('%H:%M')} - {booking.slot_end_time.strftime('%H:%M')}"
        }
    except Exception as e:
        return {"response": f"Booking failed: {str(e)}"}
