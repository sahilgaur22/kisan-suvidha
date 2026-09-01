import pytest
from fastapi import HTTPException
from app.core.rbac import RoleChecker, verify_center_access, SUPER_ADMIN, CENTER_ADMIN, STAFF, FARMER
from app.core.deps import CurrentUser, get_current_user_context
from app.core.security import create_access_token


def test_role_checker_allowed_roles():
    """Verify RoleChecker permits valid roles and rejects unauthorized roles."""
    checker = RoleChecker([CENTER_ADMIN, STAFF])

    assert checker(CENTER_ADMIN) is True
    assert checker(STAFF) is True

    with pytest.raises(HTTPException) as exc_info:
        checker(FARMER)
    assert exc_info.value.status_code == 403


def test_verify_center_access_isolation():
    """Verify center access checks permit super_admin and own-center access, but block cross-center access."""
    center_a = "11111111-1111-1111-1111-111111111111"
    center_b = "22222222-2222-2222-2222-222222222222"

    # Super Admin can access any center
    verify_center_access(SUPER_ADMIN, user_center_id="", target_center_id=center_a)

    # Center Admin can access own center
    verify_center_access(CENTER_ADMIN, user_center_id=center_a, target_center_id=center_a)

    # Center Admin cannot access foreign center B
    with pytest.raises(HTTPException) as exc_info:
        verify_center_access(CENTER_ADMIN, user_center_id=center_a, target_center_id=center_b)
    assert exc_info.value.status_code == 403


@pytest.mark.asyncio
async def test_get_current_user_context_valid_jwt():
    """Verify JWT token payload is parsed correctly into CurrentUser context."""
    token = create_access_token(
        subject="user-uuid-123",
        role="center_admin",
        center_id="center-uuid-456"
    )

    user_context = await get_current_user_context(token=token)
    assert isinstance(user_context, CurrentUser)
    assert user_context.user_id == "user-uuid-123"
    assert user_context.role == "center_admin"
    assert user_context.center_id == "center-uuid-456"
