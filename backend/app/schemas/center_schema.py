from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CenterCreateRequest(BaseModel):
    name: str = Field(..., description="Center name e.g. Sehore Mandi Procurement Center")
    code: str = Field(..., description="Unique center code e.g. MP-CTR-014")
    state: str = Field(..., description="State name e.g. Madhya Pradesh")
    district: str = Field(..., description="District name e.g. Sehore")
    address: Optional[str] = Field(None, description="Physical address")
    max_daily_throughput: int = Field(100, gt=0, description="Max daily vehicle processing capacity")
    avg_processing_minutes: int = Field(15, gt=0, description="Average handling minutes per load")
    latitude: Optional[float] = Field(None, description="GPS Latitude")
    longitude: Optional[float] = Field(None, description="GPS Longitude")


class CenterResponse(BaseModel):
    id: str
    name: str
    code: str
    state: str
    district: str
    address: Optional[str] = None
    max_daily_throughput: int
    avg_processing_minutes: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool
    created_at: datetime
