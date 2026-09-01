from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.core.security import decode_access_token

# OAuth2 bearer scheme for API token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


class CurrentUser:
    """Value object holding authenticated user identity and context claims."""
    def __init__(self, user_id: str, role: str, center_id: Optional[str] = None):
        self.user_id = user_id
        self.role = role
        self.center_id = center_id


async def get_current_user_context(token: str = Depends(oauth2_scheme)) -> CurrentUser:
    """
    Decodes JWT token and extracts current user identity, role, and center scope.
    """
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        center_id: Optional[str] = payload.get("center_id")

        if not user_id or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload claims.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return CurrentUser(user_id=user_id, role=role, center_id=center_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_scoped_db(
    user_context: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
) -> AsyncGenerator[AsyncSession, None]:
    """
    Injects PostgreSQL RLS session variables (app.current_center_id & app.current_role)
    into the active database connection. This enforces multi-tenant RLS policies.
    """
    try:
        # Inject RLS session variables
        if user_context.center_id:
            await db.execute(text(f"SET LOCAL app.current_center_id = '{user_context.center_id}';"))
        else:
            await db.execute(text("SET LOCAL app.current_center_id = '';"))

        await db.execute(text(f"SET LOCAL app.current_role = '{user_context.role}';"))
        yield db
    finally:
        await db.close()
