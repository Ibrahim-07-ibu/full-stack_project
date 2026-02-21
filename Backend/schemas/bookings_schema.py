from pydantic import BaseModel
from datetime import date, time
from typing import Optional


class BookingCreate(BaseModel):
    service_id: int
    address: str
    city: str
    pincode: str
    date: date
    time: time
    instructions: Optional[str] = None


class BookingUpdate(BaseModel):
    address: str
    city: str
    pincode: str
    date: date
    time: time
    instructions: Optional[str] = None
