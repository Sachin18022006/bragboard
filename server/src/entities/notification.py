from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from src.database.core import Base
from src.entities.user import User

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    type = Column(String(50), nullable=False)  # 'shoutout', 'like', 'comment', 'system'
    message = Column(Text, nullable=False)
    target_id = Column(Integer, nullable=True)  # shoutout_id
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    recipient = relationship("User", foreign_keys=[recipient_id], backref="notifications")
    sender = relationship("User", foreign_keys=[sender_id])
