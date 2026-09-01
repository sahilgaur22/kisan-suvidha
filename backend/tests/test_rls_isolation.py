from datetime import date, time
from unittest.mock import AsyncMock, MagicMock
import pytest
from app.core.rbac import verify_center_access, RoleChecker, CENTER_ADMIN, STAFF, SUPER_ADMIN
from fastapi import HTTPException


def test_rls_multi_tenant_isolation_center_admin():
    """
    Critical Multi-Tenant RLS Test:
    Verifies Center Admin of Center A cannot read or modify resources of Center B.
    """
    center_a = "11111111-1111-1111-1111-111111111111"
    center_b = "22222222-2222-2222-2222-222222222222"

    # Center Admin accessing own center -> Allowed
    verify_center_access(
        user_role=CENTER_ADMIN, user_center_id=center_a, target_center_id=center_a
    )

    # Center Admin attempting cross-center access to Center B -> Rejected (403 Forbidden)
    with pytest.raises(HTTPException) as exc_info:
        verify_center_access(
            user_role=CENTER_ADMIN, user_center_id=center_a, target_center_id=center_b
        )

    assert exc_info.value.status_code == 403
    assert "Access restricted" in exc_info.value.detail


def test_rls_multi_tenant_isolation_super_admin():
    """
    Super Admin Access Test:
    Verifies Super Admin can access any procurement center (Center A or Center B).
    """
    center_a = "11111111-1111-1111-1111-111111111111"
    center_b = "22222222-2222-2222-2222-222222222222"

    # Super Admin accessing Center A -> Allowed
    verify_center_access(
        user_role=SUPER_ADMIN, user_center_id="", target_center_id=center_a
    )

    # Super Admin accessing Center B -> Allowed
    verify_center_access(
        user_role=SUPER_ADMIN, user_center_id="", target_center_id=center_b
    )
