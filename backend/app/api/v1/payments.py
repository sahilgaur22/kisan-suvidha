from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.payment_schema import PaymentResponse
from app.services.payment_service import get_payment_audit_trail
from app.core.deps import get_current_user_context, CurrentUser
from app.core.rbac import verify_center_access, CENTER_ADMIN

router = APIRouter(prefix="/payments", tags=["Payment Audit Trail"])


@router.get("/audit", response_model=List[PaymentResponse])
async def read_payment_audit_trail(
    center_id: str,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves immutable payment audit records for a center (Center Admin)."""
    if current_user.role != CENTER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only Center Admins can view payment audit trails.",
        )

    verify_center_access(
        user_role=current_user.role,
        user_center_id=current_user.center_id or "",
        target_center_id=center_id,
    )

    payments = await get_payment_audit_trail(
        db, center_id=center_id, from_date=from_date, to_date=to_date
    )

    return [
        PaymentResponse(
            id=str(p.id),
            booking_id=str(p.booking_id),
            center_id=str(p.center_id),
            amount=float(p.amount),
            msp_rate_applied=float(p.msp_rate_applied),
            payment_status=p.payment_status,
            transaction_ref=p.transaction_ref,
            created_at=p.created_at,
        )
        for p in payments
    ]
