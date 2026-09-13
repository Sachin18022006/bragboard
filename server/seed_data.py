import datetime
from src.database.core import get_db, create_db_tables
from src.entities.user import User
from src.entities.todo import Shoutout, Tag, Comment
from src.auth.auth import hash_password

def seed():
    create_db_tables()
    db = next(get_db())

    print("Checking existing users...")
    # Find or create Sachin
    sachin = db.query(User).filter(User.email == "sachin12345@gmail.com").first()
    if not sachin:
        sachin = User(
            name="Sachin",
            email="sachin12345@gmail.com",
            employee_id="EMP-1001",
            password_hash=hash_password("0987654321"),
            department="Engineering",
            role="admin"
        )
        db.add(sachin)
        db.commit()
        db.refresh(sachin)
    else:
        sachin.name = "Sachin"
        sachin.role = "admin"
        sachin.department = "Engineering"
        sachin.password_hash = hash_password("0987654321")
        if not sachin.employee_id:
            sachin.employee_id = "EMP-1001"
        db.commit()

    # Find or create Adam Admin
    adam = db.query(User).filter(User.email == "Adam123@gmail.com").first()
    if not adam:
        adam = User(
            name="Adam",
            email="Adam123@gmail.com",
            employee_id="ADM-001",
            password_hash=hash_password("Adam@123"),
            department="Management",
            role="admin"
        )
        db.add(adam)
        db.commit()
        db.refresh(adam)
    else:
        adam.name = "Adam"
        adam.department = "Management"
        if not adam.employee_id:
            adam.employee_id = "ADM-001"
        db.commit()

    # Create other colleagues if they don't exist
    colleagues_data = [
        ("Priya Sharma", "priya.sharma@bragboard.io", "EMP-1002", "Engineering"),
        ("Alex Chen", "alex.chen@bragboard.io", "EMP-1003", "Product"),
        ("Sarah Jenkins", "sarah.jenkins@bragboard.io", "EMP-1004", "Design"),
        ("David Miller", "david.miller@bragboard.io", "EMP-1005", "Engineering"),
        ("Emily Watson", "emily.watson@bragboard.io", "EMP-1006", "Marketing"),
        ("Marcus Vance", "marcus.vance@bragboard.io", "EMP-1007", "Customer Success"),
        ("Elena Rostova", "elena.rostova@bragboard.io", "EMP-1008", "Data Science"),
    ]

    colleagues = {}
    for name, email, emp_id, dept in colleagues_data:
        u = db.query(User).filter(User.email == email).first()
        if not u:
            u = User(
                name=name,
                email=email,
                employee_id=emp_id,
                password_hash=hash_password("Welcome@123"),
                department=dept,
                role="user"
            )
            db.add(u)
            db.commit()
            db.refresh(u)
        colleagues[name] = u

    # Map of all active users
    all_users = [sachin, adam] + list(colleagues.values())
    user_map = {u.name: u for u in all_users}

    # Helper for tags
    tag_cache = {}
    def get_tag(tag_name):
        tag_clean = tag_name.strip().lower()
        if tag_clean in tag_cache:
            return tag_cache[tag_clean]
        t = db.query(Tag).filter(Tag.name == tag_clean).first()
        if not t:
            t = Tag(name=tag_clean)
            db.add(t)
            db.commit()
            db.refresh(t)
        tag_cache[tag_clean] = t
        return t

    # Check if shoutouts already exist
    existing_count = db.query(Shoutout).count()
    if existing_count > 0:
        print(f"Shoutouts already exist ({existing_count}). Cleaning up to seed fresh vibrant activity...")
        db.query(Comment).delete()
        db.query(Shoutout).delete()
        db.commit()

    now = datetime.datetime.utcnow()

    # Define lively, realistic shoutout posts
    shoutouts_spec = [
        # 1. Received by Sachin (from Priya)
        {
            "sender": "Priya Sharma",
            "recipients": ["Sachin"],
            "title": "Backend Performance Breakthrough ⚡",
            "message": "Massive shoutout to @Sachin for refactoring our caching layer and solving the database connection pool bottleneck during peak load! 🚀 Latency dropped by 65% and API reliability has never been better. Truly remarkable work!",
            "tags": ["problemsolver", "engineering", "speed", "highimpact"],
            "hours_ago": 2,
            "likes": ["Priya Sharma", "Alex Chen", "Sarah Jenkins", "David Miller", "Emily Watson", "Marcus Vance", "Elena Rostova"],
            "comments": [
                ("Alex Chen", "Absolute lifesaver during our load tests, Sachin! 👏", 1.8),
                ("Sarah Jenkins", "Everything loads instantaneously now! Great job Sachin! 🔥", 1.5),
                ("David Miller", "Super clean code implementation too. Inspiring stuff!", 1.1)
            ]
        },
        # 2. Received by Sachin (from Alex)
        {
            "sender": "Alex Chen",
            "recipients": ["Sachin"],
            "title": "Flawless Sprint Execution 🏆",
            "message": "Huge kudos to @Sachin for spearheading the core API implementation for our Q3 launch! Completed two days ahead of schedule with 100% test coverage. You set the gold standard for engineering excellence.",
            "tags": ["sprinthero", "leadership", "excellence"],
            "hours_ago": 5,
            "likes": ["Alex Chen", "Priya Sharma", "Sarah Jenkins", "David Miller", "Elena Rostova", "Adam"],
            "comments": [
                ("Priya Sharma", "Could not agree more! Sachin has been an absolute pillar of our sprint. 🚀", 4.5),
                ("Adam", "Outstanding dedication Sachin. The leadership team noticed this fantastic effort! 👍", 3.8)
            ]
        },
        # 3. Given by Sachin (to Priya)
        {
            "sender": "Sachin",
            "recipients": ["Priya Sharma"],
            "title": "Zero-Downtime Infrastructure Migration 🚀",
            "message": "Massive shoutout to @Priya Sharma for pulling off our production database and Kubernetes cluster migration with zero downtime! Super calm under pressure and extraordinary technical mastery.",
            "tags": ["devops", "reliability", "hero"],
            "hours_ago": 8,
            "likes": ["Sachin", "Alex Chen", "David Miller", "Adam", "Elena Rostova", "Sarah Jenkins"],
            "comments": [
                ("Priya Sharma", "Thank you Sachin! Couldn't have done it without your seamless failover scripts! 🙌", 7.2),
                ("Alex Chen", "Priya is unstoppable! 🌟", 6.5)
            ]
        },
        # 4. Received by Sachin (from Sarah Jenkins)
        {
            "sender": "Sarah Jenkins",
            "recipients": ["Sachin"],
            "title": "Pixel-Perfect Collaboration 🎨",
            "message": "Huge shoutout to @Sachin for collaborating with Design on the brand new glassmorphism and modern UI components. You took our Figma designs and made them buttery smooth and fully responsive across all screens!",
            "tags": ["collaboration", "designsystem", "frontend"],
            "hours_ago": 12,
            "likes": ["Sarah Jenkins", "Priya Sharma", "Alex Chen", "Emily Watson", "Marcus Vance"],
            "comments": [
                ("Emily Watson", "The dashboard aesthetics look breathtaking now! 🌟", 11.0),
                ("Alex Chen", "First-class visual polish, feels like a luxury web app.", 10.2)
            ]
        },
        # 5. Given by Sachin (to Alex Chen)
        {
            "sender": "Sachin",
            "recipients": ["Alex Chen"],
            "title": "Crystal-Clear Product Vision 🎯",
            "message": "Big appreciation to @Alex Chen for the thorough user journey maps and edge-case specs for the new engagement module. Made our engineering planning effortless and fun!",
            "tags": ["productvision", "teamwork", "strategy"],
            "hours_ago": 16,
            "likes": ["Sachin", "Sarah Jenkins", "David Miller", "Emily Watson", "Marcus Vance"],
            "comments": [
                ("Alex Chen", "Teamwork makes the dream work! Loving how the product is evolving. 🎉", 15.0)
            ]
        },
        # 6. Received by Sachin (from David Miller)
        {
            "sender": "David Miller",
            "recipients": ["Sachin"],
            "title": "Exceptional Mentorship & Guidance 💡",
            "message": "Grateful to @Sachin for taking the time to mentor me through complex state management and async architecture. Always patient, encouraging, and eager to share deep knowledge!",
            "tags": ["mentorship", "teamspirit", "aboveandbeyond"],
            "hours_ago": 22,
            "likes": ["David Miller", "Priya Sharma", "Elena Rostova", "Marcus Vance", "Alex Chen"],
            "comments": [
                ("Marcus Vance", "Sachin's culture of helping everyone shine is what makes this workspace special! ❤️", 20.5)
            ]
        },
        # 7. Given by Sachin (to Sarah Jenkins)
        {
            "sender": "Sachin",
            "recipients": ["Sarah Jenkins"],
            "title": "Stunning Design System & Brand Refresh 💎",
            "message": "Huge shoutout to @Sarah Jenkins for the inspiring UI tokens, glassmorphism palettes, and micro-interactions. The whole platform feels so premium and modern now!",
            "tags": ["designexcellence", "innovation", "craftsmanship"],
            "hours_ago": 26,
            "likes": ["Sachin", "Priya Sharma", "Alex Chen", "Emily Watson", "Elena Rostova", "Adam"],
            "comments": [
                ("Sarah Jenkins", "Thank you Sachin! So thrilled to see it live and running so smoothly! ✨", 24.0)
            ]
        },
        # 8. Given by Sachin (to Marcus Vance)
        {
            "sender": "Sachin",
            "recipients": ["Marcus Vance"],
            "title": "Swift Customer Resolution 🤝",
            "message": "Thank you @Marcus Vance for stepping in on the customer enterprise onboarding issue and turning around a glowing review from their leadership team within hours!",
            "tags": ["customerfirst", "highimpact", "speed"],
            "hours_ago": 30,
            "likes": ["Sachin", "Alex Chen", "Emily Watson", "Priya Sharma"],
            "comments": [
                ("Marcus Vance", "Always a pleasure collaborating with the tech team! Thank you Sachin! 🚀", 28.0)
            ]
        },
        # 9. Between Teammates: Emily to David
        {
            "sender": "Emily Watson",
            "recipients": ["David Miller"],
            "title": "Interactive Marketing Analytics Dashboard 📈",
            "message": "Kudos to @David Miller for building out real-time campaign attribution dashboards in record time. Our conversion insights are 10x clearer now!",
            "tags": ["analytics", "growth", "collaboration"],
            "hours_ago": 34,
            "likes": ["Emily Watson", "Elena Rostova", "Alex Chen", "Sachin"],
            "comments": [
                ("David Miller", "Thrilled that marketing has instant visibility on metrics now!", 32.0)
            ]
        },
        # 10. Between Teammates: Elena to Priya
        {
            "sender": "Elena Rostova",
            "recipients": ["Priya Sharma"],
            "title": "Data Pipeline Optimization 📊",
            "message": "Shoutout to @Priya Sharma for optimizing our ETL cron jobs! Pipeline execution time dropped from 45 mins to just 8 mins. Incredible efficiency boost!",
            "tags": ["dataengineering", "efficiency", "optimization"],
            "hours_ago": 40,
            "likes": ["Elena Rostova", "David Miller", "Priya Sharma", "Sachin"],
            "comments": [
                ("Priya Sharma", "Happy to help the data science team fly! 💨", 38.0)
            ]
        },
        # 11. Between Teammates: Marcus to Emily
        {
            "sender": "Marcus Vance",
            "recipients": ["Emily Watson"],
            "title": "Incredible Customer Webinar Turnout 🎉",
            "message": "High five to @Emily Watson for organizing our Q3 Customer Product Showcase webinar! Over 450 attendees and tremendous engagement from community leaders.",
            "tags": ["community", "marketing", "wins"],
            "hours_ago": 48,
            "likes": ["Marcus Vance", "Alex Chen", "Sarah Jenkins", "Sachin"],
            "comments": [
                ("Emily Watson", "Such great teamwork across the whole company! 🎈", 46.0)
            ]
        }
    ]

    for item in shoutouts_spec:
        sender_obj = user_map.get(item["sender"])
        if not sender_obj:
            continue
        created_time = now - datetime.timedelta(hours=item["hours_ago"])
        shout = Shoutout(
            sender_id=sender_obj.id,
            title=item["title"],
            message=item["message"],
            created_at=created_time
        )
        for recip_name in item["recipients"]:
            r_obj = user_map.get(recip_name)
            if r_obj:
                shout.recipients.append(r_obj)

        for tag_str in item["tags"]:
            shout.tags.append(get_tag(tag_str))

        for liker_name in item["likes"]:
            l_obj = user_map.get(liker_name)
            if l_obj and l_obj not in shout.likes:
                shout.likes.append(l_obj)

        db.add(shout)
        db.commit()
        db.refresh(shout)

        for c_author, c_text, c_hours in item["comments"]:
            ca_obj = user_map.get(c_author)
            if ca_obj:
                c_time = now - datetime.timedelta(hours=c_hours)
                comment = Comment(
                    shoutout_id=shout.id,
                    author_id=ca_obj.id,
                    content=c_text,
                    created_at=c_time
                )
                db.add(comment)

        db.commit()

    # Seed Notifications if empty
    from src.entities.notification import Notification
    if db.query(Notification).count() == 0:
        ananya = db.query(User).filter(User.email == "Ananya123@gmail.com").first()
        ananya_id = ananya.id if ananya else 2
        notifications_data = [
            Notification(
                recipient_id=sachin.id,
                sender_id=ananya_id,
                type="shoutout",
                message="Ananya recognized you: \"Full-Stack Architecture and Polish\"",
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=6)
            ),
            Notification(
                recipient_id=sachin.id,
                sender_id=adam.id,
                type="like",
                message="Adam liked your shoutout: \"High-Performance Redis Caching Layer\"",
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=24)
            ),
            Notification(
                recipient_id=sachin.id,
                sender_id=user_map.get("Priya Sharma").id if user_map.get("Priya Sharma") else 3,
                type="comment",
                message="Priya Sharma commented on \"Design System and UI Components\": \"This made our sprint delivery 2x faster! 🔥\"",
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
            ),
            Notification(
                recipient_id=sachin.id,
                sender_id=user_map.get("Alex Chen").id if user_map.get("Alex Chen") else 4,
                type="shoutout",
                message="Alex Chen recognized you: \"Rapid Bug Resolution and Mentorship\"",
                is_read=True,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            )
        ]
        db.add_all(notifications_data)
        db.commit()

    # Seed Moderation Reports if empty
    from src.entities.shoutout_report import ShoutoutReport, ReportStatus
    if db.query(ShoutoutReport).count() == 0:
        rep1 = ShoutoutReport(
            shoutout_id=1,
            reporter_id=sachin.id,
            reason="Unprofessional Tone",
            description="Language could be more constructive and aligned with community guidelines.",
            status=ReportStatus.RESOLVED,
            resolved_by=sachin.id,
            resolved_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
            resolution_notes="Addressed directly with team members in 1-on-1."
        )
        rep2 = ShoutoutReport(
            shoutout_id=11,
            reporter_id=sachin.id,
            reason="Duplicate Recognition",
            description="Cross-posted twice across department channels.",
            status=ReportStatus.DISMISSED,
            resolved_by=sachin.id,
            resolved_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
            resolution_notes="Acknowledged as harmless enthusiasm."
        )
        rep3 = ShoutoutReport(
            shoutout_id=3,
            reporter_id=adam.id,
            reason="Inappropriate Content",
            description="Needs review by department administrator.",
            status=ReportStatus.PENDING
        )
        db.add_all([rep1, rep2, rep3])
        db.commit()

    print("Successfully seeded all lively demo data!")
    print(f"Total Users: {db.query(User).count()}")
    print(f"Total Shoutouts: {db.query(Shoutout).count()}")
    print(f"Total Comments: {db.query(Comment).count()}")
    print(f"Total Notifications: {db.query(Notification).count()}")
    print(f"Total Reports: {db.query(ShoutoutReport).count()}")

if __name__ == "__main__":
    seed()
