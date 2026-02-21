from sqlalchemy import Column, Integer, String, ForeignKey, DATE, TIME
from db.database import Base
from sqlalchemy.orm import relationship


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), index=True)
    service_id = Column(Integer, ForeignKey("services.id"), index=True)
    address = Column(String)
    city = Column(String)
    pincode = Column(String)
    date = Column(DATE)
    time = Column(TIME)
    instructions = Column(String)
    status = Column(String, default="pending")

    user = relationship("User", back_populates="bookings")
    provider = relationship("Provider", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False)
