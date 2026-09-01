"""initial schema and 3-booking-per-day trigger

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-01
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Roles Table
    op.create_table(
        'roles',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=30), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Seed default roles
    op.execute(
        "INSERT INTO roles (name) VALUES ('super_admin'), ('center_admin'), ('staff'), ('farmer')"
    )

    # 2. Centers Table
    op.create_table(
        'centers',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('code', sa.String(length=20), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('district', sa.String(length=100), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('max_daily_throughput', sa.Integer(), server_default='100', nullable=False),
        sa.Column('avg_processing_minutes', sa.Integer(), server_default='15', nullable=False),
        sa.Column('latitude', sa.Numeric(precision=9, scale=6), nullable=True),
        sa.Column('longitude', sa.Numeric(precision=9, scale=6), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )

    # 3. Users Table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('phone', sa.String(length=15), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=True),
        sa.Column('password_hash', sa.Text(), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deactivated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['center_id'], ['centers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('phone')
    )
    op.create_index('idx_users_center', 'users', ['center_id'], unique=False)

    # 4. Farmers Table
    op.create_table(
        'farmers',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('phone', sa.String(length=15), nullable=False),
        sa.Column('aadhaar_hash', sa.Text(), nullable=True),
        sa.Column('village', sa.String(length=150), nullable=True),
        sa.Column('preferred_center_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('preferred_language', sa.String(length=10), server_default='hi', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['preferred_center_id'], ['centers.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('phone')
    )

    # 5. MSP Rates Table
    op.create_table(
        'msp_rates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('crop_name', sa.String(length=100), nullable=False),
        sa.Column('rate_per_quintal', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('effective_from', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['center_id'], ['centers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('crop_name', 'center_id', 'effective_from', name='uq_msp_crop_center_date')
    )

    # 6. Bookings Table
    op.create_table(
        'bookings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('token_number', sa.String(length=20), nullable=False),
        sa.Column('farmer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('crop_name', sa.String(length=100), nullable=False),
        sa.Column('crop_volume_quintals', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('vehicle_type', sa.String(length=30), nullable=False),
        sa.Column('booking_date', sa.Date(), nullable=False),
        sa.Column('slot_start_time', sa.Time(), nullable=False),
        sa.Column('slot_end_time', sa.Time(), nullable=False),
        sa.Column('status', sa.String(length=20), server_default='scheduled', nullable=False),
        sa.Column('channel', sa.String(length=20), server_default='web', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['center_id'], ['centers.id'], ),
        sa.ForeignKeyConstraint(['farmer_id'], ['farmers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_bookings_queue_order', 'bookings', ['center_id', 'booking_date', 'slot_start_time', 'created_at'], unique=False)

    # Trigger: 3-booking-per-day limit
    op.execute("""
    CREATE OR REPLACE FUNCTION enforce_max_three_bookings_per_day()
    RETURNS TRIGGER AS $$
    DECLARE
        existing_count INT;
    BEGIN
        SELECT COUNT(*) INTO existing_count
        FROM bookings
        WHERE farmer_id = NEW.farmer_id
          AND booking_date = NEW.booking_date
          AND status NOT IN ('cancelled')
          AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000');

        IF existing_count >= 3 THEN
            RAISE EXCEPTION 'BOOKING_LIMIT_EXCEEDED: Farmer % already has % active bookings on %',
                NEW.farmer_id, existing_count, NEW.booking_date
                USING ERRCODE = 'P0001';
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_enforce_booking_limit
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION enforce_max_three_bookings_per_day();
    """)

    # 7. Payments Table
    op.create_table(
        'payments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('booking_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('msp_rate_applied', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('payment_status', sa.String(length=20), server_default='pending', nullable=False),
        sa.Column('processed_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('transaction_ref', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ),
        sa.ForeignKeyConstraint(['center_id'], ['centers.id'], ),
        sa.ForeignKeyConstraint(['processed_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # 8. Complaints Table
    op.create_table(
        'complaints',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('farmer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('booking_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('subject', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), server_default='open', nullable=False),
        sa.Column('assigned_admin_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('resolution_note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['assigned_admin_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ),
        sa.ForeignKeyConstraint(['center_id'], ['centers.id'], ),
        sa.ForeignKeyConstraint(['farmer_id'], ['farmers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('complaints')
    op.drop_table('payments')
    op.execute("DROP TRIGGER IF EXISTS trg_enforce_booking_limit ON bookings;")
    op.execute("DROP FUNCTION IF EXISTS enforce_max_three_bookings_per_day();")
    op.drop_index('idx_bookings_queue_order', table_name='bookings')
    op.drop_table('bookings')
    op.drop_table('msp_rates')
    op.drop_table('farmers')
    op.drop_index('idx_users_center', table_name='users')
    op.drop_table('users')
    op.drop_table('centers')
    op.drop_table('roles')
