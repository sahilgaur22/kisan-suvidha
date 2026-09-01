import uuid
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Numeric, ForeignKey, Date, DateTime, func, UniqueConstraint, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class MSPRate(Base):
    __tablename__ = "msp_rates"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    crop_name: Mapped[str] = mapped_column(String(100), nullable=False)
    rate_per_quintal: Mapped[float] = mapped_column(
        Numeric(10, 2), CheckConstraint("rate_per_quintal > 0"), nullable=False
    )
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("centers.id", ondelete="CASCADE"), nullable=True
    )
    effective_from: Mapped[date] = mapped_column(
        Date, server_default=func.current_date(), nullable=False
    )
    updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    center: Mapped[Optional["Center"]] = relationship("Center", back_populates="msp_rates") # type: ignore
    updater: Mapped[Optional["User"]] = relationship("User") # type: ignore

    __table_args__ = (
        UniqueConstraint("crop_name", "center_id", "effective_from", name="uq_msp_crop_center_date"),
    )
