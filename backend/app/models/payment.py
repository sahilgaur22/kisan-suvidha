import enum
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Numeric, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class PaymentStatusEnum(str, enum.Enum):
    PENDING = "pending"
    PROCESSED = "processed"
    FAILED = "failed"
    REVERSED = "reversed"


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    booking_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("bookings.id"), nullable=False)
    center_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("centers.id"), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    msp_rate_applied: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    payment_status: Mapped[str] = mapped_column(
        String(20), default=PaymentStatusEnum.PENDING.value, nullable=False
    )
    processed_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"), nullable=True)
    transaction_ref: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    booking: Mapped["Booking"] = relationship("Booking", back_populates="payment") # type: ignore
    center: Mapped["Center"] = relationship("Center", back_populates="payments") # type: ignore
    processor: Mapped[Optional["User"]] = relationship("User") # type: ignore
