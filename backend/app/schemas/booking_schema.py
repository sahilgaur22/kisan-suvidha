from datetime import date, time, datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.booking import VehicleTypeEnum, BookingStatusEnum, BookingChannelEnum


class BookingCreateRequest(BaseModel):
    center_id: str = Field(..., description="UUID of target procurement center")
    crop_name: str = Field(..., description="Crop name e.g. Wheat, Paddy, Mustard")
    crop_volume_quintals: float = Field(..., gt=0, description="Crop weight in quintals")
    vehicle_type: VehicleTypeEnum = Field(
        VehicleTypeEnum.TRACTOR_TROLLEY, description="Vehicle unloading type"
    )
    booking_date: date = Field(..., description="Date of physical visit YYYY-MM-DD")
    channel: BookingChannelEnum = Field(BookingChannelEnum.WEB, description="Booking channel")


class BookingResponse(BaseModel):
    id: str
    token_number: str
    farmer_id: str
    center_id: str
    crop_name: str
    crop_volume_quintals: float
    vehicle_type: str
    booking_date: date
    slot_start_time: time
    slot_end_time: time
    status: str
    channel: str
    created_at: datetime


class BookingStatusUpdateRequest(BaseModel):
    status: BookingStatusEnum = Field(..., description="New booking status")
