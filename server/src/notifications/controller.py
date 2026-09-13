from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.notifications.models import NotificationListResponse, NotificationRead
from src.notifications.service import (
    get_user_notifications,
    get_unread_count,
    mark_as_read,
    mark_all_read
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=NotificationListResponse)
def api_get_notifications(
    user_id: int = Query(..., description="ID of the user to fetch notifications for"),
    db: Session = Depends(get_db)
):
    notifications = get_user_notifications(db, user_id=user_id)
    unread_count = get_unread_count(db, user_id=user_id)
    return {
        "unread_count": unread_count,
        "notifications": notifications
    }

@router.put("/{notification_id}/read")
def api_mark_as_read(
    notification_id: int,
    user_id: int = Query(..., description="Current user ID"),
    db: Session = Depends(get_db)
):
    success = mark_as_read(db, notification_id=notification_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@router.put("/read-all")
def api_mark_all_read(
    user_id: int = Query(..., description="Current user ID"),
    db: Session = Depends(get_db)
):
    count = mark_all_read(db, user_id=user_id)
    return {"message": f"{count} notifications marked as read"}
