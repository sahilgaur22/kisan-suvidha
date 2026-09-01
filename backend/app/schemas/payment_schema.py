from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PaymentResponse(BaseModel):
    id: str
    booking_id: str
    center_id: str
    amount: float
    msp_rate_applied: float
    payment_status: str
    transaction_ref: Optional[str] = None
    created_at: datetime
