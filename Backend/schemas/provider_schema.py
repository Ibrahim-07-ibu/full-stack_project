from pydantic import BaseModel
from datetime import date
from typing import Optional


class ProviderCreate(BaseModel):
    full_name: str
    email: str
    password: str
    phone: str
    dob: date
    address: str
    service_id: int
    years_experience: int
    specialization: str
    bio: str
    id_proof: str
    certificate: str



class ProviderUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[date] = None
    address: Optional[str] = None
    service_id: Optional[int] = None
    years_experience: Optional[int] = None
    specialization: Optional[str] = None
    bio: Optional[str] = None
    id_proof: Optional[str] = None
    certificate: Optional[str] = None
    is_verified: Optional[bool] = None


class ProviderResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    phone: str
    dob: date
    address: str
    service_id: int
    years_experience: int
    specialization: str
    bio: str
    id_proof: str
    certificate: str
    role: str
    is_verified: bool

    class Config:
        from_attributes = True
