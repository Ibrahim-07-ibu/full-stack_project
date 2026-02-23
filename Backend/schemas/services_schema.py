from pydantic import BaseModel


class ServiceCreate(BaseModel):
    name: str
    price: int
    description: str


class ServiceResponse(BaseModel):
    id: int
    name: str
    price: int
    description: str

    class Config:
        from_attributes = True
