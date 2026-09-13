from sqlalchemy.orm import Session
from sqlalchemy import func
from src.entities.todo import Shoutout, Comment, Tag
from src.entities.user import User
from collections import defaultdict

def get_analytics_summary(db: Session):
    # Total shoutouts
    total_shoutouts = db.query(Shoutout).count()
    total_comments = db.query(Comment).count()
    total_users = db.query(User).filter(User.is_active == True).count()

    shoutouts = db.query(Shoutout).all()
    total_likes = sum(len(s.likes) for s in shoutouts)
    total_reactions = total_likes + total_comments

    # Department stats
    dept_sent = defaultdict(int)
    dept_received = defaultdict(int)
    for s in shoutouts:
        if s.sender and s.sender.department:
            dept_sent[s.sender.department] += 1
        for r in s.recipients:
            if r.department:
                dept_received[r.department] += 1

    all_depts = sorted(list(set(list(dept_sent.keys()) + list(dept_received.keys()) + ["Engineering", "Product", "Design", "Marketing", "Sales", "Customer Success"])))
    department_stats = []
    for d in all_depts:
        sent = dept_sent.get(d, 0)
        received = dept_received.get(d, 0)
        department_stats.append({
            "department": d,
            "shoutouts_sent": sent,
            "shoutouts_received": received,
            "total_activity": sent + received
        })
    department_stats.sort(key=lambda x: x["total_activity"], reverse=True)

    # Core company values / tags distribution
    tag_counts = defaultdict(int)
    for s in shoutouts:
        for t in s.tags:
            tag_name = t.name.strip().title()
            tag_counts[tag_name] += 1

    # Standard values fallback if tags are few
    standard_values = ["Excellence", "Teamwork", "Innovation", "Leadership", "Mentorship", "Problem Solver"]
    for v in standard_values:
        if v not in tag_counts:
            tag_counts[v] = 0

    values_stats = [{"name": k, "count": v} for k, v in tag_counts.items()]
    values_stats.sort(key=lambda x: x["count"], reverse=True)

    # Top recognized contributors
    recipient_counts = defaultdict(lambda: {"count": 0, "name": "", "department": "", "avatar": ""})
    for s in shoutouts:
        for r in s.recipients:
            recipient_counts[r.id]["count"] += 1
            recipient_counts[r.id]["name"] = r.name
            recipient_counts[r.id]["department"] = r.department or "General"
            recipient_counts[r.id]["avatar"] = r.avatar or ""

    top_contributors = sorted(
        [{"id": k, **v} for k, v in recipient_counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )[:5]

    # Detailed shoutouts list for CSV export
    export_records = []
    for s in shoutouts:
        recipients_str = ", ".join(r.name for r in s.recipients) if s.recipients else "All Team"
        tags_str = ", ".join(t.name for t in s.tags) if s.tags else "General"
        export_records.append({
            "id": s.id,
            "title": s.title,
            "sender": s.sender.name if s.sender else "Anonymous",
            "sender_department": s.sender.department if s.sender else "General",
            "recipients": recipients_str,
            "values_tags": tags_str,
            "likes_count": len(s.likes),
            "comments_count": len(s.comments),
            "date": s.created_at.strftime("%Y-%m-%d %H:%M:%S") if s.created_at else ""
        })

    # Top department
    top_dept = department_stats[0]["department"] if department_stats else "Engineering"

    return {
        "summary": {
            "total_shoutouts": total_shoutouts,
            "total_reactions": total_reactions,
            "total_comments": total_comments,
            "total_likes": total_likes,
            "active_users": total_users,
            "top_department": top_dept,
            "participation_rate": f"{min(100, int((total_shoutouts / max(1, total_users)) * 40))}%"
        },
        "department_stats": department_stats,
        "values_stats": values_stats[:8],
        "top_contributors": top_contributors,
        "export_records": export_records
    }
