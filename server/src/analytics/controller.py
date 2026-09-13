from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.analytics.service import get_analytics_summary

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
def api_get_analytics_overview(db: Session = Depends(get_db)):
    return get_analytics_summary(db)
