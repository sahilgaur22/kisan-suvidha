import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Text, Integer, Numeric, Boolean, DateTime, func
from app.models.guid import GUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Center(Base):
    __tablename__ = "centers"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    max_daily_throughput: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    avg_processing_minutes: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    latitude: Mapped[Optional[float]] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Numeric(9, 6), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    users: Mapped[List["User"]] = relationship("User", back_populates="center", foreign_keys="User.center_id") # type: ignore
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="center") # type: ignore
    payments: Mapped[List["Payment"]] = relationship("Payment", back_populates="center") # type: ignore
    complaints: Mapped[List["Complaint"]] = relationship("Complaint", back_populates="center") # type: ignore
