import pytest
from app.models import (
    Base, Role, Center, User, Farmer, MSPRate, Booking, Payment, Complaint,
    RoleEnum, VehicleTypeEnum, BookingStatusEnum, BookingChannelEnum, PaymentStatusEnum, ComplaintStatusEnum
)


def test_models_metadata_registration():
    """Verify all ORM models are registered under SQLAlchemy Base metadata."""
    registered_tables = Base.metadata.tables.keys()
    expected_tables = ["roles", "centers", "users", "farmers", "msp_rates", "bookings", "payments", "complaints"]
    for table in expected_tables:
        assert table in registered_tables, f"Table {table} missing from Base metadata"


def test_model_enums():
    """Verify enum choices match design specifications."""
    assert RoleEnum.SUPER_ADMIN.value == "super_admin"
    assert VehicleTypeEnum.TRACTOR_TROLLEY.value == "tractor_trolley"
    assert BookingStatusEnum.SCHEDULED.value == "scheduled"
    assert BookingChannelEnum.WEB.value == "web"
    assert PaymentStatusEnum.PENDING.value == "pending"
    assert ComplaintStatusEnum.OPEN.value == "open"
