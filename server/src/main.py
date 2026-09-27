from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.auth.routes import router as auth_router
from src.users.controller import router as users_router
from src.todos.controller import router as shoutouts_router
from src.shoutout_reports.controller import router as reports_router
from src.admin.controller import router as admin_router
from src.notifications.controller import router as notifications_router
from src.analytics.controller import router as analytics_router
from src.database.core import engine, Base

# Import all entities to ensure they are registered with Base.metadata
from src.entities.user import User
from src.entities.todo import Shoutout, Comment, Tag
from src.entities.shoutout_report import ShoutoutReport
from src.entities.notification import Notification

app = FastAPI(title="BragBoard API", version="1.0.0")

@app.on_event("startup")
def startup_db_seed():
    try:
        from src.database.core import create_db_tables
        create_db_tables()
        print("Database tables initialized successfully.")
    except Exception as e:
        print("Warning: Database table creation issue at startup:", e)

    try:
        from seed_data import seed
        seed()
    except Exception as e:
        print("Startup seed check:", e)

@app.get("/")
def read_root():
    return {"status": "ok", "service": "BragBoard API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

import os

# Explicit Allowed Origins
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://bragboard-phi.vercel.app",
]

# Allow custom origins via environment variable (comma-separated)
env_origins = os.getenv("CORS_ORIGINS", "")
if env_origins:
    for origin in env_origins.split(","):
        origin_clean = origin.strip()
        if origin_clean and origin_clean not in allowed_origins:
            allowed_origins.append(origin_clean)

# Match all Vercel preview and production subdomains
origin_regex = r"^https:\/\/([a-zA-Z0-9_-]+\.)?vercel\.app$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

app.include_router(auth_router, prefix="/auth")
app.include_router(users_router) # Prefix is defined in controller
app.include_router(shoutouts_router) # Prefix is defined in controller
app.include_router(reports_router)
app.include_router(admin_router)
app.include_router(notifications_router)
app.include_router(analytics_router)
