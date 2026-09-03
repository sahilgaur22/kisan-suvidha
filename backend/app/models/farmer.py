import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey, DateTime, func
from app.models.guid import GUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str] = mapped_column(String(15), unique=True, nullable=False)
    aadhaar_hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    village: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    preferred_center_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(), ForeignKey("centers.id"), nullable=True
    )
    preferred_language: Mapped[str] = mapped_column(String(10), default="hi", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    preferred_center: Mapped[Optional["Center"]] = relationship("Center") # type: ignore
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="farmer") # type: ignore
    complaints: Mapped[List["Complaint"]] = relationship("Complaint", back_populates="farmer") # type: ignore
