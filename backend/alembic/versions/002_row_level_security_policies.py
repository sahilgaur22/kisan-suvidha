"""implement row-level security policies for multi-tenant isolation

Revision ID: 002_row_level_security
Revises: 001_initial_schema
Create Date: 2026-09-01
"""
from typing import Sequence, Union
from alembic import op

revision: str = '002_row_level_security'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable RLS on all tenant-scoped tables
    op.execute("ALTER TABLE users ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE payments ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE msp_rates ENABLE ROW LEVEL SECURITY;")

    # 2. Users RLS Policies
    op.execute("""
    CREATE POLICY users_center_isolation ON users
        USING (
            current_setting('app.current_role', true) = 'super_admin'
            OR center_id = current_setting('app.current_center_id', true)::uuid
        );

    CREATE POLICY users_write_own_center ON users
        FOR UPDATE USING (
            current_setting('app.current_role', true) = 'super_admin'
            OR (
                current_setting('app.current_role', true) = 'center_admin'
                AND center_id = current_setting('app.current_center_id', true)::uuid
            )
        );
    """)

    # 3. Bookings RLS Policies
    op.execute("""
    CREATE POLICY bookings_center_isolation ON bookings
        USING (
            current_setting('app.current_role', true) = 'super_admin'
            OR center_id = current_setting('app.current_center_id', true)::uuid
        );

    CREATE POLICY bookings_insert_own_center ON bookings
        FOR INSERT WITH CHECK (
            current_setting('app.current_role', true) = 'super_admin'
            OR center_id = current_setting('app.current_center_id', true)::uuid
        );
    """)

    # 4. Payments RLS Policies
    op.execute("""
    CREATE POLICY payments_center_isolation ON payments
        USING (
            current_setting('app.current_role', true) = 'super_admin'
            OR center_id = current_setting('app.current_center_id', true)::uuid
        );
    """)

    # 5. Complaints RLS Policies
    op.execute("""
    CREATE POLICY complaints_center_isolation ON complaints
        USING (
            current_setting('app.current_role', true) = 'super_admin'
            OR center_id = current_setting('app.current_center_id', true)::uuid
        );
    """)

    # 6. MSP Rates RLS Policies
    op.execute("""
    CREATE POLICY msp_rates_visibility ON msp_rates
        USING (
            center_id IS NULL
            OR current_setting('app.current_role', true) = 'super_admin'
            OR center_id = current_setting('app.current_center_id', true)::uuid
        );
    """)


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS msp_rates_visibility ON msp_rates;")
    op.execute("DROP POLICY IF EXISTS complaints_center_isolation ON complaints;")
    op.execute("DROP POLICY IF EXISTS payments_center_isolation ON payments;")
    op.execute("DROP POLICY IF EXISTS bookings_insert_own_center ON bookings;")
    op.execute("DROP POLICY IF EXISTS bookings_center_isolation ON bookings;")
    op.execute("DROP POLICY IF EXISTS users_write_own_center ON users;")
    op.execute("DROP POLICY IF EXISTS users_center_isolation ON users;")

    op.execute("ALTER TABLE msp_rates DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE payments DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE users DISABLE ROW LEVEL SECURITY;")
