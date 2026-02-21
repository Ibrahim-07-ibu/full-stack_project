from pydantic import BaseModel

class SupportCreate(BaseModel):
    User_id: int
    subject: str
    message: str
