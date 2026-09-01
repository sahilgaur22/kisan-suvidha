import enum
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class ComplaintStatusEnum(str, enum.Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    farmer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("farmers.id"), nullable=False)
    center_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("centers.id"), nullable=False)
    booking_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("bookings.id"), nullable=True)
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default=ComplaintStatusEnum.OPEN.value, nullable=False
    )
    assigned_admin_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"), nullable=True)
    resolution_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    farmer: Mapped["Farmer"] = relationship("Farmer", back_populates="complaints") # type: ignore
    center: Mapped["Center"] = relationship("Center", back_populates="complaints") # type: ignore
    booking: Mapped[Optional["Booking"]] = relationship("Booking") # type: ignore
    assigned_admin: Mapped[Optional["User"]] = relationship("User") # type: ignore
