import enum
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, DateTime, func
from app.models.guid import GUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class ComplaintStatusEnum(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"
    ESCALATED = "escalated"


class ComplaintCategoryEnum(str, enum.Enum):
    DELAY = "delay"
    PAYMENT_DISPUTE = "payment_dispute"
    WEIGHMENT_ISSUE = "weighment_issue"
    BEHAVIOR = "behavior"
    OTHER = "other"


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    ticket_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    farmer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("farmers.id"), nullable=False)
    center_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("centers.id"), nullable=False)
    booking_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("bookings.id"), nullable=True)
    category: Mapped[str] = mapped_column(
        String(50), default=ComplaintCategoryEnum.OTHER.value, nullable=False
    )
    subject: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default=ComplaintStatusEnum.OPEN.value, nullable=False
    )
    assigned_admin_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("users.id"), nullable=True)
    resolved_by: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("users.id"), nullable=True)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    farmer: Mapped["Farmer"] = relationship("Farmer", back_populates="complaints")  # type: ignore
    center: Mapped["Center"] = relationship("Center", back_populates="complaints")  # type: ignore
    booking: Mapped[Optional["Booking"]] = relationship("Booking")  # type: ignore
    assigned_admin: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_admin_id])  # type: ignore
