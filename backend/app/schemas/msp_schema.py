from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class MSPRateCreateRequest(BaseModel):
    crop_name: str = Field(..., description="Crop name e.g. Wheat, Paddy, Mustard")
    rate_per_quintal: float = Field(..., gt=0, description="Minimum Support Price per quintal")
    center_id: Optional[str] = Field(None, description="Center ID override (NULL for global default)")
    effective_from: Optional[date] = Field(None, description="Effective start date")


class MSPRateResponse(BaseModel):
    id: str
    crop_name: str
    rate_per_quintal: float
    center_id: Optional[str] = None
    effective_from: date
    updated_at: datetime
