from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas import MaintenanceLogResponse
from auth import require_tecnico_or_admin
from models import MaintenanceLog

router = APIRouter()


@router.get("/pending", response_model=List[MaintenanceLogResponse])
def get_pending_alerts(db: Session = Depends(get_db), _=Depends(require_tecnico_or_admin)):
    return (
        db.query(MaintenanceLog)
        .filter(MaintenanceLog.alert_sent == True, MaintenanceLog.resolved == False)
        .order_by(MaintenanceLog.created_at.desc())
        .all()
    )
