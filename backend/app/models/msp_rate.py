import uuid
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Numeric, ForeignKey, Date, DateTime, func, UniqueConstraint, CheckConstraint
from app.models.guid import GUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class MSPRate(Base):
    __tablename__ = "msp_rates"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    crop_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    rate_per_quintal: Mapped[float] = mapped_column(
        Numeric(10, 2), CheckConstraint("rate_per_quintal > 0"), nullable=False
    )
    permitted_moisture_percent: Mapped[float] = mapped_column(
        Numeric(5, 2), default=14.0, nullable=False
    )
    max_rejection_moisture_percent: Mapped[float] = mapped_column(
        Numeric(5, 2), default=16.0, nullable=False
    )
    effective_from: Mapped[date] = mapped_column(
        Date, server_default=func.current_date(), nullable=False
    )
    updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(), ForeignKey("users.id"), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    updater: Mapped[Optional["User"]] = relationship("User") # type: ignore
