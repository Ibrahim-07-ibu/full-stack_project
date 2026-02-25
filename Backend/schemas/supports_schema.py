from pydantic import BaseModel

class SupportCreate(BaseModel):
    subject: str
    message: str

class SupportResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    subject: str
    message: str

    class Config:
        from_attributes = True
