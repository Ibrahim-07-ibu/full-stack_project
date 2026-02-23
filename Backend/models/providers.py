from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    dob = Column(Date, nullable=False)
    address = Column(String, nullable=False)

    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    years_experience = Column(Integer, nullable=False)
    specialization = Column(String, nullable=False)
    bio = Column(String, nullable=False)
    availability = Column(
        String, nullable=True, default="Monday - Saturday, 8 AM - 8 PM"
    )

    id_proof = Column(String, nullable=False)
    certificate = Column(String, nullable=False)

    role = Column(String, default="provider")
    is_verified = Column(Boolean, default=False)

    user = relationship("User", back_populates="providers")
    service = relationship("Service", back_populates="providers")
    bookings = relationship("Booking", back_populates="provider")
    reviews = relationship("Review", back_populates="provider")
