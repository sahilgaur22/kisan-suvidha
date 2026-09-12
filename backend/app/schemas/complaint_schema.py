from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.complaint import ComplaintCategoryEnum, ComplaintStatusEnum


class ComplaintCreateRequest(BaseModel):
    center_id: str = Field(..., description="Target center UUID")
    booking_id: Optional[str] = Field(None, description="Optional associated booking token UUID")
    category: ComplaintCategoryEnum = Field(..., description="Complaint category")
    subject: Optional[str] = Field(None, description="Complaint subject")
    description: str = Field(..., min_length=10, description="Detailed grievance description")


class ComplaintResponse(BaseModel):
    id: str
    ticket_number: str
    farmer_id: str
    center_id: str
    booking_id: Optional[str] = None
    category: str
    subject: Optional[str] = None
    description: str
    status: str
    resolution_notes: Optional[str] = None
    resolved_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ComplaintResolveRequest(BaseModel):
    status: ComplaintStatusEnum = Field(..., description="New complaint status")
    resolution_notes: str = Field(..., min_length=5, description="Resolution notes")
