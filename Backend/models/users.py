from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)
    phone = Column(String, unique=True)
    address = Column(String)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)

    providers = relationship("Provider", back_populates="user")
    bookings = relationship("Booking", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    supports = relationship("Support", back_populates="user")
