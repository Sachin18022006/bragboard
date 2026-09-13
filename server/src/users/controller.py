from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.users import service
from src.users.models import UserRead, AvatarUpdate

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=list[UserRead])
def get_users(db: Session = Depends(get_db)):
    return service.list_users(db)

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    return service.get_leaderboard(db)

@router.get("/top-tagged")
def get_top_tagged(db: Session = Depends(get_db)):
    return service.get_top_tagged(db)

@router.put("/{user_id}/avatar", response_model=UserRead)
@router.post("/{user_id}/avatar", response_model=UserRead)
def update_avatar(user_id: int, payload: AvatarUpdate, db: Session = Depends(get_db)):
    user = service.update_user_avatar(db, user_id, payload.avatar)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}/avatar", status_code=status.HTTP_200_OK)
def delete_avatar(user_id: int, db: Session = Depends(get_db)):
    user = service.delete_user_avatar(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Avatar deleted successfully"}
