from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class StaffCreateRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="Staff full name")
    phone: str = Field(..., min_length=10, max_length=10, description="10-digit mobile number")
    password: str = Field(..., min_length=6, description="Initial staff account password")
    center_id: Optional[str] = Field(None, description="Assigned procurement center UUID")


class StaffResponse(BaseModel):
    id: str
    full_name: str
    phone: str
    role: str
    center_id: Optional[str] = None
    is_active: bool
    created_at: datetime


class StaffUpdateRequest(BaseModel):
    is_active: bool = Field(..., description="Active status toggle")
