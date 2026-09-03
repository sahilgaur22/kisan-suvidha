from typing import Optional
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: Optional[str] = Field(None, description="Admin/Staff Email address")
    phone: Optional[str] = Field(None, description="Phone number identifier")
    password: str = Field(..., description="User password")
    login_context: Optional[str] = Field(
        None, description="Toggle between admin or staff context"
    )


class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="User full name")
    email: str = Field(..., description="Official Email address")
    phone: str = Field(..., min_length=10, description="Mobile number")
    password: str = Field(..., min_length=6, description="Account password")
    role: str = Field("center_admin", description="Role context (center_admin or staff)")
    center_id: Optional[str] = Field(None, description="Procurement center UUID")


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
    full_name: Optional[str] = Field(None, description="Farmer full name for registration")


class FarmerTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    farmer_id: str
    full_name: str
    phone: str
    preferred_language: str
