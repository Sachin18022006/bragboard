from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class NotificationSender(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    avatar: Optional[str] = None

class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    recipient_id: int
    sender_id: Optional[int] = None
    sender: Optional[NotificationSender] = None
    type: str
    message: str
    target_id: Optional[int] = None
    is_read: bool
    created_at: datetime

class NotificationListResponse(BaseModel):
    unread_count: int
    notifications: List[NotificationRead]
