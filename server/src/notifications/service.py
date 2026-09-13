from sqlalchemy.orm import Session
from src.entities.notification import Notification
from typing import Optional

def create_notification(
    db: Session,
    recipient_id: int,
    sender_id: Optional[int],
    type: str,
    message: str,
    target_id: Optional[int] = None
) -> Notification:
    # Don't notify oneself
    if sender_id is not None and recipient_id == sender_id:
        return None

    notification = Notification(
        recipient_id=recipient_id,
        sender_id=sender_id,
        type=type,
        message=message,
        target_id=target_id,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

def get_user_notifications(db: Session, user_id: int, limit: int = 25):
    return db.query(Notification).filter(
        Notification.recipient_id == user_id
    ).order_by(Notification.created_at.desc()).limit(limit).all()

def get_unread_count(db: Session, user_id: int) -> int:
    return db.query(Notification).filter(
        Notification.recipient_id == user_id,
        Notification.is_read == False
    ).count()

def mark_as_read(db: Session, notification_id: int, user_id: int) -> bool:
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_id == user_id
    ).first()
    if notification:
        notification.is_read = True
        db.commit()
        return True
    return False

def mark_all_read(db: Session, user_id: int) -> int:
    count = db.query(Notification).filter(
        Notification.recipient_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return count
