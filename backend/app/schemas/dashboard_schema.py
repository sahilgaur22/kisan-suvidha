from typing import Optional
from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    center_id: str
    total_bookings_today: int
    checked_in_today: int
    completed_today: int
    no_shows_today: int
    total_crop_procured_quintals: float
    total_payments_disbursed_inr: float
    open_complaints_count: int
