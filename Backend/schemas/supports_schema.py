from pydantic import BaseModel

class SupportCreate(BaseModel):
    subject: str
    message: str
