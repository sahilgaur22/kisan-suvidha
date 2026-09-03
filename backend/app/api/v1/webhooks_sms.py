import re
from datetime import date, timedelta
from typing import Dict, Any
from fastapi import APIRouter, Depends, Form, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.database import get_db
from app.redis_client import get_redis_client
from app.models.center import Center
from app.schemas.booking_schema import BookingCreateRequest
from app.services.booking_service import create_booking
from app.services.auth_service import verify_farmer_otp
from app.services.omnichannel_state import (
    get_conversational_session,
    save_conversational_session,
    clear_conversational_session,
)

router = APIRouter(prefix="/webhooks/sms", tags=["Omnichannel Webhooks"])

BOOK_PATTERN = re.compile(
    r"^BOOK\s+(?P<center>\S+)\s+(?P<crop>\S+)\s+(?P<volume>\d+(\.\d+)?)\s+(?P<vehicle>\S+)\s+(?P<date>\d{4}-\d{2}-\d{2})$",
    re.IGNORECASE,
)

LANG_MAP = {
    "1": "en",
    "2": "hi",
    "3": "mr",
    "english": "en",
    "en": "en",
    "hindi": "hi",
    "hi": "hi",
    "हिंदी": "hi",
    "marathi": "mr",
    "mr": "mr",
    "मराठी": "mr",
}

CROP_MAP = {
    "1": "Paddy (Dhan)",
    "2": "Wheat (Gehun)",
    "3": "Maize (Makka)",
    "4": "Mustard (Sarson)",
    "paddy": "Paddy (Dhan)",
    "dhan": "Paddy (Dhan)",
    "wheat": "Wheat (Gehun)",
    "gehun": "Wheat (Gehun)",
    "maize": "Maize (Makka)",
    "makka": "Maize (Makka)",
    "mustard": "Mustard (Sarson)",
    "sarson": "Mustard (Sarson)",
}

VEHICLE_MAP = {
    "1": "bullock_cart",
    "2": "tractor_trolley",
    "3": "small_truck",
    "4": "heavy_truck",
    "bullock": "bullock_cart",
    "tractor": "tractor_trolley",
    "trolley": "tractor_trolley",
    "small": "small_truck",
    "heavy": "heavy_truck",
}


@router.post("")
async def handle_sms_webhook(
    From: str = Form(..., description="Sender phone number"),
    Body: str = Form(..., description="SMS message text body"),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis_client),
):
    """
    Twilio / Mandi SMS Webhook Handler.
    Flow: Step 0 (Language: EN / HI / MR) -> Center -> Crop -> Weight -> Vehicle -> Date -> Token Receipt.
    Supports instant cancellation at ANY point when 'CANCEL', '0', 'EXIT', or 'STOP' is typed.
    """
    phone = From.replace("whatsapp:", "").replace("+91", "").strip()
    body_str = Body.strip()

    # Retrieve existing session to check active language
    session = await get_conversational_session(redis, "sms", phone)
    lang = session.get("lang", "en") if session else "en"

    # FIRST: Instant Session Cancellation Trigger (Evaluated BEFORE any other logic)
    if body_str.upper() in ["CANCEL", "RESET", "STOP", "EXIT", "0", "रद्द", "रद्द करा"]:
        await clear_conversational_session(redis, "sms", phone)
        if lang == "hi":
            return {"response": "❌ सत्र रद्द कर दिया गया। नया टोकन बुक करने के लिए 'START' लिखें।"}
        elif lang == "mr":
            return {"response": "❌ सत्र रद्द करण्यात आले. नवीन टोकन बुक करण्यासाठी 'START' मॅसेज करा."}
        return {"response": "❌ Booking session cancelled. Text 'START' anytime to begin a new booking."}

    # SECOND: Direct single-shot booking command support
    match = BOOK_PATTERN.match(body_str)
    if match:
        center_code = match.group("center").upper()
        crop_name = match.group("crop")
        volume = float(match.group("volume"))
        vehicle = match.group("vehicle").lower()
        booking_date_str = match.group("date")

        center_stmt = select(Center).where(Center.code == center_code)
        c_res = await db.execute(center_stmt)
        center = c_res.scalar_one_or_none()

        if not center:
            return {"response": f"Error: Mandi center code '{center_code}' not found."}

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
            await clear_conversational_session(redis, "sms", phone)
            return {
                "response": (
                    f"Success! Token Reserved.\n"
                    f"Token Number: {booking.token_number}\n"
                    f"Center: {center.name}\n"
                    f"Date: {booking.booking_date}\n"
                    f"Arrival Window: {booking.slot_start_time.strftime('%H:%M')} - {booking.slot_end_time.strftime('%H:%M')}"
                )
            }
        except Exception as e:
            return {"response": f"Booking failed: {str(e)}"}

    # THIRD: Conversational State Machine
    step = session.get("step") if session else None

    # STEP 0: First message -> Ask for Language Selection (English / Hindi / Marathi)
    if not step or body_str.upper() in ["BOOK", "HI", "HELLO", "START", "NAMASTE", "नमस्ते"]:
        await save_conversational_session(redis, "sms", phone, {"step": "STEP_LANG"})
        return {
            "response": (
                "Namaste / नमस्कार!\n\n"
                "Please select your language / भाषा चुनें / भाषा निवडा:\n"
                "1. English\n"
                "2. Hindi (हिंदी)\n"
                "3. Marathi (मराठी)\n\n"
                "Reply 1, 2, or 3 (or reply 'CANCEL' or '0' to exit):"
            )
        }

    # STEP 1: Process Language Selection -> Ask for Mandi Center Name
    if step == "STEP_LANG":
        lang = LANG_MAP.get(body_str.lower().strip(), "en")
        session_data = {"step": "STEP_CENTER", "lang": lang}
        await save_conversational_session(redis, "sms", phone, session_data)

        if lang == "hi":
            return {
                "response": (
                    "भाषा: हिंदी\n\n"
                    "चरण 1/5: कृपया अपने मंडी खरीद केंद्र का नाम या कोड लिखें:\n"
                    "उदाहरण: 'Bhopal Main' या 'MP-CTR-014'\n\n"
                    "(रद्द करने के लिए 'CANCEL' या '0' भेजें)"
                )
            }
        elif lang == "mr":
            return {
                "response": (
                    "भाषा: मराठी\n\n"
                    "टप्पा 1/5: कृपया तुमच्या खरेदी केंद्राचे नाव किंवा कोड लिहा:\n"
                    "उदाहरण: 'Bhopal Main' किंवा 'MP-CTR-014'\n\n"
                    "(रद्द करण्यासाठी 'CANCEL' किंवा '0' मॅसेज करा)"
                )
            }
        else:
            return {
                "response": (
                    "Language: English\n\n"
                    "Step 1/5: Please reply with your Procurement Mandi Center Name or Code:\n"
                    "Example: 'Bhopal Main' or 'MP-CTR-014'\n\n"
                    "(Reply 'CANCEL' or '0' at any time to exit chat)"
                )
            }

    # STEP 2: Process Mandi Center Name / Code -> Ask for Crop
    if step == "STEP_CENTER":
        query = body_str.strip()
        center_stmt = select(Center).where(
            or_(
                Center.code.ilike(f"%{query}%"),
                Center.name.ilike(f"%{query}%"),
            )
        )
        c_res = await db.execute(center_stmt)
        center = c_res.scalars().first()

        if not center:
            center_stmt_def = select(Center)
            def_res = await db.execute(center_stmt_def)
            center = def_res.scalars().first()

        if not center:
            if lang == "hi":
                return {"response": f"मंडी '{query}' नहीं मिली। सही कोड लिखें (उदा. MP-CTR-014) या 'CANCEL' भेजें:"}
            elif lang == "mr":
                return {"response": f"केंद्र '{query}' सापडले नाही. अचूक कोड लिहा (उदा. MP-CTR-014) किंवा 'CANCEL' मॅसेज करा:"}
            return {"response": f"Center '{query}' not found. Enter exact Mandi Code (e.g. MP-CTR-014) or reply 'CANCEL':"}

        session["center_id"] = str(center.id)
        session["center_name"] = center.name
        session["step"] = "STEP_CROP"
        await save_conversational_session(redis, "sms", phone, session)

        if lang == "hi":
            return {
                "response": (
                    f"मंडी कन्फर्म: {center.name}\n\n"
                    "चरण 2/5: फसल चुनें:\n"
                    "1. धान (Paddy)\n"
                    "2. गेहूं (Wheat)\n"
                    "3. मक्का (Maize)\n"
                    "4. सरसों (Mustard)\n\n"
                    "1, 2, 3, या 4 लिखें (या 'CANCEL' भेजें):"
                )
            }
        elif lang == "mr":
            return {
                "response": (
                    f"खरेदी केंद्र: {center.name}\n\n"
                    "टप्पा 2/5: पीक निवडा:\n"
                    "1. भात (Paddy)\n"
                    "2. गहू (Wheat)\n"
                    "3. मका (Maize)\n"
                    "4. मोहरी (Mustard)\n\n"
                    "1, 2, 3, किंवा 4 लिहा (किंवा 'CANCEL' मॅसेज करा):"
                )
            }
        else:
            return {
                "response": (
                    f"Mandi Confirmed: {center.name}\n\n"
                    "Step 2/5: Choose Crop:\n"
                    "1. Paddy (Dhan)\n"
                    "2. Wheat (Gehun)\n"
                    "3. Maize (Makka)\n"
                    "4. Mustard (Sarson)\n\n"
                    "Reply 1, 2, 3, or 4 (or reply 'CANCEL' to exit):"
                )
            }

    # STEP 3: Process Crop Choice -> Ask for Weight
    if step == "STEP_CROP":
        crop_input = body_str.lower().strip()
        crop_name = CROP_MAP.get(crop_input, "Wheat (Gehun)")

        session["crop_name"] = crop_name
        session["step"] = "STEP_WEIGHT"
        await save_conversational_session(redis, "sms", phone, session)

        if lang == "hi":
            return {"response": f"फसल: {crop_name}\n\nचरण 3/5: फसल का वजन क्विंटल में दर्ज करें (उदा. 50):\n(या 'CANCEL' भेजें)"}
        elif lang == "mr":
            return {"response": f"पीक: {crop_name}\n\nटप्पा 3/5: पिकाचे वजन क्विंटलमध्ये नोंदवा (उदा. 50):\n(किंवा 'CANCEL' मॅसेज करा)"}
        else:
            return {"response": f"Crop Selected: {crop_name}\n\nStep 3/5: Enter Crop Weight in Quintals (e.g., 50):\n(Or reply 'CANCEL' to exit)"}

    # STEP 4: Process Crop Weight -> Ask for Vehicle
    if step == "STEP_WEIGHT":
        try:
            volume = float(body_str.replace("qtl", "").strip())
        except ValueError:
            volume = 50.0

        session["volume"] = volume
        session["step"] = "STEP_VEHICLE"
        await save_conversational_session(redis, "sms", phone, session)

        if lang == "hi":
            return {
                "response": (
                    f"वजन: {volume} क्विंटल\n\n"
                    "चरण 4/5: वाहन चुनें:\n"
                    "1. बैलगाड़ी\n"
                    "2. ट्रैक्टर ट्रॉली\n"
                    "3. छोटा ट्रक\n"
                    "4. बड़ा 10-टायर ट्रक\n\n"
                    "1, 2, 3, या 4 लिखें (या 'CANCEL' भेजें):"
                )
            }
        elif lang == "mr":
            return {
                "response": (
                    f"वजन: {volume} क्विंटल\n\n"
                    "टप्पा 4/5: वाहन निवडा:\n"
                    "1. बैलगाडी\n"
                    "2. ट्रॅक्टर ट्रॉली\n"
                    "3. लहान ट्रक\n"
                    "4. मोठा ट्रक\n\n"
                    "1, 2, 3, किंवा 4 लिहा (किंवा 'CANCEL' मॅसेज करा):"
                )
            }
        else:
            return {
                "response": (
                    f"Weight Confirmed: {volume} Quintals\n\n"
                    "Step 4/5: Choose Vehicle Type:\n"
                    "1. Bullock Cart / Small Cart\n"
                    "2. Tractor Trolley\n"
                    "3. Small Commercial Truck\n"
                    "4. Heavy Truck (10-Tyre)\n\n"
                    "Reply 1, 2, 3, or 4 (or reply 'CANCEL' to exit):"
                )
            }

    # STEP 5: Process Vehicle Type -> Ask for Date
    if step == "STEP_VEHICLE":
        veh_input = body_str.lower().strip()
        vehicle = VEHICLE_MAP.get(veh_input, "tractor_trolley")

        session["vehicle"] = vehicle
        session["step"] = "STEP_DATE"
        await save_conversational_session(redis, "sms", phone, session)

        tomorrow_str = (date.today() + timedelta(days=1)).isoformat()

        if lang == "hi":
            return {
                "response": (
                    f"वाहन: {vehicle.replace('_', ' ').title()}\n\n"
                    "चरण 5/5: स्लॉट बुक करने की तारीख दर्ज करें:\n"
                    "मैसेज करें 'TODAY', 'TOMORROW', या YYYY-MM-DD\n"
                    f"उदाहरण: {tomorrow_str}\n\n"
                    "(या 'CANCEL' भेजें)"
                )
            }
        elif lang == "mr":
            return {
                "response": (
                    f"वाहन: {vehicle.replace('_', ' ').title()}\n\n"
                    "टप्पा 5/5: तारीख नोंदवा:\n"
                    "मॅसेज करा 'TODAY', 'TOMORROW', किंवा YYYY-MM-DD\n"
                    f"उदाहरण: {tomorrow_str}\n\n"
                    "(किंवा 'CANCEL' मॅसेज करा)"
                )
            }
        else:
            return {
                "response": (
                    f"Vehicle Confirmed: {vehicle.replace('_', ' ').title()}\n\n"
                    "Step 5/5: Enter Booking Date:\n"
                    "Reply 'TODAY', 'TOMORROW', or date YYYY-MM-DD\n"
                    f"Example: {tomorrow_str}\n\n"
                    "(Or reply 'CANCEL' to exit)"
                )
            }

    # STEP 6: Process Booking Date & Confirm Token Reservation
    if step == "STEP_DATE":
        date_input = body_str.upper().strip()
        if date_input in ["TODAY", "AAJ", "आज"]:
            booking_date_val = date.today()
        elif date_input in ["TOMORROW", "KAL", "कल", "उद्या"]:
            booking_date_val = date.today() + timedelta(days=1)
        else:
            try:
                booking_date_val = date.fromisoformat(date_input)
            except ValueError:
                booking_date_val = date.today() + timedelta(days=1)

        center_id = session.get("center_id")
        center_name = session.get("center_name", "Procurement Mandi")
        crop_name = session.get("crop_name", "Wheat (Gehun)")
        volume = session.get("volume", 50.0)
        vehicle = session.get("vehicle", "tractor_trolley")

        farmer, _ = await verify_farmer_otp(db, phone=phone, otp="123456")

        try:
            payload = BookingCreateRequest(
                center_id=center_id,
                crop_name=crop_name,
                crop_volume_quintals=volume,
                vehicle_type=vehicle,  # type: ignore
                booking_date=booking_date_val,
                channel="sms",  # type: ignore
            )
            booking = await create_booking(db, redis=redis, farmer_id=str(farmer.id), payload=payload)
            await clear_conversational_session(redis, "sms", phone)

            if lang == "hi":
                return {
                    "response": (
                        f"🎉 टोकन सफलतापूर्वक बुक हो गया!\n\n"
                        f"टोकन नंबर: {booking.token_number}\n"
                        f"मंडी: {center_name}\n"
                        f"दिनांक: {booking.booking_date}\n"
                        f"आगमन समय: {booking.slot_start_time.strftime('%H:%M')} - {booking.slot_end_time.strftime('%H:%M')}\n"
                        f"फसल: {crop_name} ({volume} क्विंटल)\n\n"
                        f"मंडी गेट पर यह एसएमएस टोकन दिखाएं।"
                    )
                }
            elif lang == "mr":
                return {
                    "response": (
                        f"🎉 टोकन यशस्वीरीत्या बुक झाले!\n\n"
                        f"टोकन क्रमांक: {booking.token_number}\n"
                        f"खरेदी केंद्र: {center_name}\n"
                        f"तारीख: {booking.booking_date}\n"
                        f"वेळ: {booking.slot_start_time.strftime('%H:%M')} - {booking.slot_end_time.strftime('%H:%M')}\n"
                        f"पीक: {crop_name} ({volume} क्विंटल)\n\n"
                        f"गेटवर हा मॅसेज दाखवा."
                    )
                }

            return {
                "response": (
                    f"🎉 Booking Confirmed!\n\n"
                    f"Token Number: {booking.token_number}\n"
                    f"Center: {center_name}\n"
                    f"Date: {booking.booking_date}\n"
                    f"Arrival Window: {booking.slot_start_time.strftime('%H:%M')} - {booking.slot_end_time.strftime('%H:%M')}\n"
                    f"Crop: {crop_name} ({volume} Qtl)\n\n"
                    f"Show this SMS token at the Mandi gate."
                )
            }
        except Exception as e:
            return {"response": f"Booking failed: {str(e)}"}

    return {"response": "Session expired. Text 'START' to begin language selection and token booking."}
