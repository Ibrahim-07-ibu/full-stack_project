from pydantic import BaseModel, constr


class UserRegister(BaseModel):
    name: str
    email: str
    password: constr(min_length=6, max_length=72)
    phone: str
    address: str


class UserLogin(BaseModel):
    email: str
    password: constr(min_length=6, max_length=72)

class UserProfileUpdate(BaseModel):
    name: str
    email: str
    phone: str
    address: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    address: str
    role: str

    class Config:
        from_attributes = True
