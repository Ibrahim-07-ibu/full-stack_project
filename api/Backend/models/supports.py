from sqlalchemy import Column, Integer, String, ForeignKey
from db.database import Base
from sqlalchemy.orm import relationship


class Support(Base):
    __tablename__ = "supports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    subject = Column(String)
    message = Column(String)

    user = relationship("User", back_populates="supports")
