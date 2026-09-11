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
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    center_id: str
    center_name: Optional[str] = None
    center_address: Optional[str] = None
    center_district: Optional[str] = None
    center_state: Optional[str] = None
    crop_name: str
    crop_volume_quintals: float
    actual_weight_quintals: Optional[float] = None
    moisture_content_percent: Optional[float] = None
    adjusted_weight_quintals: Optional[float] = None
    vehicle_type: str
    booking_date: date
    slot_start_time: time
    slot_end_time: time
    status: str
    channel: str
    payment_amount: Optional[float] = None
    msp_rate_applied: Optional[float] = None
    transaction_ref: Optional[str] = None
    payment_status: Optional[str] = None
    created_at: datetime


class BookingStatusUpdateRequest(BaseModel):
    status: BookingStatusEnum = Field(..., description="New booking status")
    actual_weight_quintals: Optional[float] = Field(
        None, gt=0, description="Measured weighbridge crop weight in quintals"
    )
    moisture_content_percent: Optional[float] = Field(
        None, ge=0, le=100, description="Measured seed moisture content percentage %"
    )
