from datetime import date
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Payment
from app.services.msp_service import parse_uuid_or_none


async def get_payment_audit_trail(
    db: AsyncSession,
    center_id: str,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
) -> List[Payment]:
    """Queries payment audit trail for a center within date range."""
    center_uuid = parse_uuid_or_none(center_id)
    stmt = select(Payment).where(Payment.center_id == center_uuid)

    if from_date:
        stmt = stmt.where(Payment.created_at >= from_date)
    if to_date:
        stmt = stmt.where(Payment.created_at <= to_date)

    stmt = stmt.order_by(Payment.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())
