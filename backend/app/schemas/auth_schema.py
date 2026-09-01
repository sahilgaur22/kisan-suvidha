from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class LoginRequest(BaseModel):
    phone: str = Field(..., description="User phone number or login identifier")
    password: str = Field(..., min_length=6, description="User password")
    requested_role: Optional[str] = Field(
        None, description="Toggle between center_admin, staff, or super_admin"
    )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user_id: str
    full_name: str
    role: str
    center_id: Optional[str] = None


class FarmerOTPRequest(BaseModel):
    phone: str = Field(..., description="Farmer 10-digit mobile number")
    full_name: Optional[str] = Field(None, description="Farmer full name for auto-registration")
    preferred_language: str = Field("hi", description="Preferred language (hi/en)")


class FarmerOTPVerifyRequest(BaseModel):
    phone: str = Field(..., description="Farmer 10-digit mobile number")
    otp: str = Field(..., min_length=4, max_length=6, description="Received OTP code")


class FarmerTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    farmer_id: str
    full_name: str
    phone: str
    preferred_language: str
