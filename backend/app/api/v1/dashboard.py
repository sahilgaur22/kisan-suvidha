from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.dashboard_schema import DashboardStatsResponse
from app.services.dashboard_service import get_center_dashboard_stats
from app.core.deps import get_current_user_context, CurrentUser
from app.core.rbac import verify_center_access, CENTER_ADMIN

router = APIRouter(prefix="/dashboard", tags=["Admin Dashboard"])


from datetime import date
from typing import Optional

@router.get("/stats", response_model=DashboardStatsResponse)
async def read_dashboard_statistics(
    center_id: str,
    target_date: Optional[date] = None,
    all_time: Optional[bool] = False,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """Returns aggregated center dashboard statistics (Center Admin)."""
    if current_user.role != CENTER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only Center Admins can access dashboard statistics.",
        )

    verify_center_access(
        user_role=current_user.role,
        user_center_id=current_user.center_id or "",
        target_center_id=center_id,
    )

    return await get_center_dashboard_stats(
        db, center_id=center_id, target_date=target_date, all_time=bool(all_time)
    )
