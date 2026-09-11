from datetime import date
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking, BookingStatusEnum
from app.models.payment import Payment
from app.models.complaint import Complaint, ComplaintStatusEnum
from app.schemas.dashboard_schema import DashboardStatsResponse
from app.services.msp_service import parse_uuid_or_none


from typing import Optional

async def get_center_dashboard_stats(
    db: AsyncSession, center_id: str, target_date: Optional[date] = None, all_time: bool = False
) -> DashboardStatsResponse:
    """Computes aggregated statistics for a procurement center for today, a specific date, or all time."""
    center_uuid = parse_uuid_or_none(center_id)

    # 1. Booking counts query
    b_stmt = (
        select(Booking.status, func.count(Booking.id), func.sum(Booking.crop_volume_quintals))
        .where(Booking.center_id == center_uuid)
    )
    if not all_time:
        effective_date = target_date or date.today()
        b_stmt = b_stmt.where(Booking.booking_date == effective_date)

    b_stmt = b_stmt.group_by(Booking.status)
    b_res = await db.execute(b_stmt)
    booking_rows = b_res.all()

    total_today = sum(row[1] for row in booking_rows)
    checked_in = sum(row[1] for row in booking_rows if row[0] == BookingStatusEnum.CHECKED_IN.value)
    completed = sum(row[1] for row in booking_rows if row[0] == BookingStatusEnum.COMPLETED.value)
    no_shows = sum(row[1] for row in booking_rows if row[0] == BookingStatusEnum.NO_SHOW.value)
    crop_sum = sum(float(row[2] or 0) for row in booking_rows if row[0] == BookingStatusEnum.COMPLETED.value)

    # 2. Payment disbursements total
    p_stmt = select(func.sum(Payment.amount)).where(Payment.center_id == center_uuid)
    p_res = await db.execute(p_stmt)
    pay_sum = float(p_res.scalar() or 0.0)

    # 3. Open complaints count
    c_stmt = select(func.count(Complaint.id)).where(
        Complaint.center_id == center_uuid,
        Complaint.status == ComplaintStatusEnum.OPEN.value,
    )
    c_res = await db.execute(c_stmt)
    open_complaints = c_res.scalar() or 0

    return DashboardStatsResponse(
        center_id=center_id,
        total_bookings_today=total_today,
        checked_in_today=checked_in,
        completed_today=completed,
        no_shows_today=no_shows,
        total_crop_procured_quintals=crop_sum,
        total_payments_disbursed_inr=pay_sum,
        open_complaints_count=open_complaints,
    )
