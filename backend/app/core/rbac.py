from typing import List
from fastapi import HTTPException, status
from app.models.role import RoleEnum

SUPER_ADMIN = "super_admin"
CENTER_ADMIN = RoleEnum.CENTER_ADMIN.value
STAFF = RoleEnum.STAFF.value
FARMER = RoleEnum.FARMER.value


class RoleChecker:
    """FastAPI Dependency for Role-Based Access Control (RBAC)."""

    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user_role: str) -> bool:
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required role: {self.allowed_roles}, provided: {user_role}",
            )
        return True


def require_roles(*roles: str):
    """Dependency helper enforcing role permissions."""
    return RoleChecker(list(roles))


def verify_center_access(user_role: str, user_center_id: str, target_center_id: str) -> None:
    """
    Enforces center scoping for multi-tenant isolation.
    Center Admins and Ground Staff can strictly only access their assigned center resource.
    """
    if str(user_center_id) != str(target_center_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden. Access restricted to assigned center resource.",
        )
