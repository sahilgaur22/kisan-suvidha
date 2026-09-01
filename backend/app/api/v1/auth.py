from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth_schema import (
    LoginRequest, TokenResponse, FarmerOTPRequest, FarmerOTPVerifyRequest, FarmerTokenResponse
)
from app.services.auth_service import authenticate_user, send_farmer_otp, verify_farmer_otp
from app.core.security import create_access_token, decode_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Unified admin/staff login route with dual context validation.
    Returns JWT access token with role and center scope claims.
    """
    user, role_name = await authenticate_user(
        db, phone=payload.phone, password=payload.password, requested_role=payload.requested_role
    )

    token = create_access_token(
        subject=str(user.id),
        role=role_name,
        center_id=str(user.center_id) if user.center_id else None
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=str(user.id),
        full_name=user.full_name,
        role=role_name,
        center_id=str(user.center_id) if user.center_id else None,
    )


@router.post("/farmer/otp/send")
async def send_otp(payload: FarmerOTPRequest, db: AsyncSession = Depends(get_db)):
    """Dispatches OTP to farmer mobile number via SMS / WhatsApp."""
    otp_code = await send_farmer_otp(db, phone=payload.phone, full_name=payload.full_name)
    return {"message": "OTP sent successfully", "phone": payload.phone, "debug_otp": otp_code}


@router.post("/farmer/otp/verify", response_model=FarmerTokenResponse)
async def verify_otp(payload: FarmerOTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verifies farmer OTP and returns farmer authentication token."""
    farmer, token = await verify_farmer_otp(db, phone=payload.phone, otp=payload.otp)

    return FarmerTokenResponse(
        access_token=token,
        token_type="bearer",
        farmer_id=str(farmer.id),
        full_name=farmer.full_name,
        phone=farmer.phone,
        preferred_language=farmer.preferred_language,
    )
