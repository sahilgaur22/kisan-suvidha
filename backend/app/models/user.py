import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, Boolean, DateTime, func, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str] = mapped_column(String(15), unique=True, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(150), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("centers.id", ondelete="CASCADE"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    deactivated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    role: Mapped["Role"] = relationship("Role", back_populates="users") # type: ignore
    center: Mapped[Optional["Center"]] = relationship("Center", back_populates="users", foreign_keys=[center_id]) # type: ignore

    __table_args__ = (
        Index("idx_users_center", "center_id"),
    )
