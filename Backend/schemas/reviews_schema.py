from pydantic import BaseModel, conint


class ReviewCreate(BaseModel):
    booking_id: int
    service_id: int
    provider_id: int
    rating: conint(ge=1, le=5)
    comment: str


class ProviderProfileUpdate(BaseModel):
    full_name: str
    email: str
    phone: str
    address: str
    specialization: str
    years_experience: int
    bio: str
    availability: str
