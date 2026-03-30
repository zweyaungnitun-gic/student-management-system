from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Any, Dict
from app.database import get_db
from app.services.dashboard_service import DashboardService
from app.dependencies import get_current_active_admin

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/", response_model=Dict[str, Any])
def get_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    return DashboardService.get_dashboard_data(db)
