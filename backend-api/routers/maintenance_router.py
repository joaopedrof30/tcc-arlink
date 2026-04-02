from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas import MaintenanceLogCreate, MaintenanceLogResponse
from auth import require_tecnico_or_admin, get_current_user
from models import MaintenanceLog
import crud

router = APIRouter()


@router.get("/device/{device_id}", response_model=List[MaintenanceLogResponse])
def get_logs(device_id: int, db: Session = Depends(get_db), _=Depends(require_tecnico_or_admin)):
    return crud.get_logs_by_device(db, device_id)


@router.post("", response_model=MaintenanceLogResponse)
def create_log(data: MaintenanceLogCreate, db: Session = Depends(get_db), current_user=Depends(require_tecnico_or_admin)):
    return crud.create_maintenance_log(db, data, technician_id=current_user.id)


@router.put("/{log_id}/resolve", response_model=MaintenanceLogResponse)
def resolve_log(log_id: int, db: Session = Depends(get_db), _=Depends(require_tecnico_or_admin)):
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log não encontrado")
    log.resolved = True
    log.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(log)
    return log
