import enum
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class RoleEnum(str, enum.Enum):
    CENTER_ADMIN = "center_admin"
    STAFF = "staff"
    FARMER = "farmer"


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)

    users: Mapped[list["User"]] = relationship("User", back_populates="role") # type: ignore
