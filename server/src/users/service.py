from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from src.entities.user import User
from src.entities.todo import shoutout_recipient_table
from src.auth.schemas import UserCreate
from src.auth.auth import hash_password

def get_user_by_email(db: Session, email: str):
    if not email:
        return None
    return db.query(User).filter(func.lower(User.email) == func.lower(email.strip())).first()

def create_user(db: Session, user: UserCreate):
    hashed_pwd = hash_password(user.password)
    db_user = User(
        email=user.email,
        employee_id=user.employee_id,
        name=user.full_name or user.email.split('@')[0],
        password_hash=hashed_pwd,
        role=user.role,
        department=user.department or "General"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def list_users(db: Session):
    return db.query(User).all()

def get_leaderboard(db: Session, limit: int = 25):
    """
    Returns users ordered by number of shoutouts received.
    """
    # Join User with shoutout_recipient_table and count
    results = db.query(
        User,
        func.count(shoutout_recipient_table.c.shoutout_id).label("score")
    ).outerjoin(
        shoutout_recipient_table, User.id == shoutout_recipient_table.c.recipient_id
    ).group_by(
        User.id
    ).order_by(
        desc("score")
    ).limit(limit).all()
    
    # Format for frontend: { name, score, department, ... }
    return [
        {
            "name": user.name,
            "score": score,
            "avatar": user.avatar or "",
            "id": user.id,
            "department": user.department or "General"
        } 
        for user, score in results
        if score > 0
    ]

def get_top_tagged(db: Session, limit: int = 5):
    """
    Returns users ordered by number of shoutouts received.
    """
    return get_leaderboard(db, limit)

def update_user_avatar(db: Session, user_id: int, avatar_data: str):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user.avatar = avatar_data
    db.commit()
    db.refresh(user)
    return user

def delete_user_avatar(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user.avatar = None
    db.commit()
    db.refresh(user)
    return user
