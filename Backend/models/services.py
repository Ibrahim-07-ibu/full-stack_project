from sqlalchemy import Column, Integer, String
from db.database import Base
from sqlalchemy.orm import relationship


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    price = Column(Integer)
    description = Column(String)

    bookings = relationship("Booking", back_populates="service")
    reviews = relationship("Review", back_populates="service")
    providers = relationship("Provider", back_populates="service")
