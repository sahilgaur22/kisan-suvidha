from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class MSPRateCreateRequest(BaseModel):
    crop_name: str = Field(..., description="Crop name e.g. Paddy (Dhan), Wheat (Gehu)")
    rate_per_quintal: float = Field(..., gt=0, description="Minimum Support Price per quintal")
    permitted_moisture_percent: Optional[float] = Field(14.0, description="Permitted FAQ moisture limit %")
    max_rejection_moisture_percent: Optional[float] = Field(16.0, description="Maximum rejection moisture limit %")
    effective_from: Optional[date] = Field(None, description="Effective start date")


class MSPRateResponse(BaseModel):
    id: str
    crop_name: str
    rate_per_quintal: float
    permitted_moisture_percent: float
    max_rejection_moisture_percent: float
    effective_from: date
    updated_at: datetime
