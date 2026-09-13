from sqlalchemy.orm import Session, joinedload
from .models import ShoutoutCreate
from src.entities.todo import Shoutout, Tag, Comment
from src.entities.user import User

def create_shoutout(db: Session, payload: ShoutoutCreate):
    recipient = db.get(User, payload.recipient_id)
    shout = Shoutout(
        title=payload.title.strip(),
        message=payload.message,
        sender_id=payload.sender_id,
    )
    if recipient:
        shout.recipients.append(recipient)
    tags = [get_or_create_tag(db, t) for t in (payload.tags or []) if t and t.strip()]
    shout.tags = tags
    db.add(shout)
    db.commit()
    db.refresh(shout)
    # Eagerly load sender for response model serialization
    db.refresh(shout, ['sender'])

    # Create notification for recipient
    if recipient and recipient.id != payload.sender_id:
        try:
            from src.notifications.service import create_notification
            sender_name = shout.sender.name if shout.sender else "A teammate"
            create_notification(
                db,
                recipient_id=recipient.id,
                sender_id=payload.sender_id,
                type="shoutout",
                message=f"{sender_name} recognized you: \"{shout.title}\"",
                target_id=shout.id
            )
        except Exception as e:
            print(f"Error creating shoutout notification: {e}")

    return shout

def get_or_create_tag(db: Session, tag_name: str):
    tag_name = tag_name.strip().lower()
    tag = db.query(Tag).filter(Tag.name == tag_name).first()
    if not tag:
        tag = Tag(name=tag_name)
        db.add(tag)
        db.commit()
        db.refresh(tag)
    return tag

def list_shoutouts(db: Session):
    return db.query(Shoutout).options(
        joinedload(Shoutout.sender),
        joinedload(Shoutout.recipients),
        joinedload(Shoutout.likes),
        joinedload(Shoutout.comments).joinedload(Comment.author)
    ).order_by(Shoutout.created_at.desc()).all()

def get_shoutout(db: Session, shoutout_id: int):
    return db.get(Shoutout, shoutout_id)

def update_shoutout(db: Session, shoutout_id: int, payload):
    shout = db.get(Shoutout, shoutout_id)
    if payload.title:
        shout.title = payload.title
    if payload.message:
        shout.message = payload.message
    db.commit()
    db.refresh(shout)
    return shout

def delete_shoutout(db: Session, shoutout_id: int):
    shout = db.get(Shoutout, shoutout_id)
    if shout:
        shout.recipients.clear()
        shout.tags.clear()
        shout.likes.clear()
        db.delete(shout)
        db.commit()
    return True

def toggle_like(db: Session, shoutout_id: int, user_id: int):
    shout = db.get(Shoutout, shoutout_id)
    if not shout:
        return None
    user = db.get(User, user_id)
    if not user:
        return None
        
    is_liking = user not in shout.likes
    if not is_liking:
        shout.likes.remove(user)
    else:
        shout.likes.append(user)
    
    db.commit()
    db.refresh(shout)

    if is_liking and shout.sender_id and shout.sender_id != user_id:
        try:
            from src.notifications.service import create_notification
            create_notification(
                db,
                recipient_id=shout.sender_id,
                sender_id=user_id,
                type="like",
                message=f"{user.name} liked your recognition: \"{shout.title}\"",
                target_id=shout.id
            )
        except Exception as e:
            print(f"Error creating like notification: {e}")

    return shout

def add_comment(db: Session, shoutout_id: int, user_id: int, content: str):
    shout = db.get(Shoutout, shoutout_id)
    if not shout:
        return None
    
    comment = Comment(
        shoutout_id=shoutout_id,
        author_id=user_id, 
        content=content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    if shout.sender_id and shout.sender_id != user_id:
        try:
            from src.notifications.service import create_notification
            user = db.get(User, user_id)
            user_name = user.name if user else "A teammate"
            snippet = content[:45] + ("..." if len(content) > 45 else "")
            create_notification(
                db,
                recipient_id=shout.sender_id,
                sender_id=user_id,
                type="comment",
                message=f"{user_name} commented on \"{shout.title}\": \"{snippet}\"",
                target_id=shout.id
            )
        except Exception as e:
            print(f"Error creating comment notification: {e}")

    return comment

def get_recent_reactions(db: Session, limit: int = 5):
    return db.query(Comment).options(joinedload(Comment.author)).order_by(Comment.created_at.desc()).limit(limit).all()
