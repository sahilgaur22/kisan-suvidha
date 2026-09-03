import enum
import uuid
from datetime import datetime, date, time
from typing import Optional
from sqlalchemy import String, Numeric, ForeignKey, Date, Time, DateTime, func, Index, CheckConstraint
from app.models.guid import GUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class VehicleTypeEnum(str, enum.Enum):
    TRACTOR_TROLLEY = "tractor_trolley"
    PICKUP = "pickup"
    TRUCK = "truck"
    BULLOCK_CART = "bullock_cart"
    OTHER = "other"


class BookingStatusEnum(str, enum.Enum):
    SCHEDULED = "scheduled"
    CHECKED_IN = "checked_in"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"
    REJECTED = "rejected"


class BookingChannelEnum(str, enum.Enum):
    WEB = "web"
    WHATSAPP = "whatsapp"
    SMS = "sms"
    IVR = "ivr"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    token_number: Mapped[str] = mapped_column(String(20), nullable=False)
    farmer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("farmers.id"), nullable=False)
    center_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("centers.id"), nullable=False)
    crop_name: Mapped[str] = mapped_column(String(100), nullable=False)
    crop_volume_quintals: Mapped[float] = mapped_column(
        Numeric(8, 2), CheckConstraint("crop_volume_quintals > 0"), nullable=False
    )
    actual_weight_quintals: Mapped[Optional[float]] = mapped_column(Numeric(8, 2), nullable=True)
    moisture_content_percent: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    adjusted_weight_quintals: Mapped[Optional[float]] = mapped_column(Numeric(8, 2), nullable=True)
    vehicle_type: Mapped[str] = mapped_column(String(30), nullable=False)
    booking_date: Mapped[date] = mapped_column(Date, nullable=False)
    slot_start_time: Mapped[time] = mapped_column(Time, nullable=False)
    slot_end_time: Mapped[time] = mapped_column(Time, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default=BookingStatusEnum.SCHEDULED.value, nullable=False)
    channel: Mapped[str] = mapped_column(String(20), default=BookingChannelEnum.WEB.value, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    farmer: Mapped["Farmer"] = relationship("Farmer", back_populates="bookings") # type: ignore
    center: Mapped["Center"] = relationship("Center", back_populates="bookings") # type: ignore
    payment: Mapped[Optional["Payment"]] = relationship("Payment", back_populates="booking", uselist=False) # type: ignore

    __table_args__ = (
        Index("idx_bookings_queue_order", "center_id", "booking_date", "slot_start_time", "created_at"),
    )
