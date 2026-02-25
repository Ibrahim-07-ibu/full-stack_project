from db.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime


class Support(Base):
    __tablename__ = "supports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    subject = Column(String)
    message = Column(String)
    status = Column(String, default="Open")
    created_at = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    user = relationship("User", back_populates="supports")
