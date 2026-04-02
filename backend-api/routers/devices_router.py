import os
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from schemas import (
    DeviceCreate, DeviceUpdate, DeviceResponse,
    DeviceStatusResponse, QRScanResult, ESP32Payload,
    MaintenanceLogResponse
)
from auth import require_admin, require_tecnico_or_admin, require_any_role, get_current_user
from services.semaphore_service import calculate_semaphore
from services.alert_service import dispatch_alert
import crud

router = APIRouter()


@router.get("", response_model=List[DeviceResponse])
def list_devices(db: Session = Depends(get_db), _=Depends(require_tecnico_or_admin)):
    return crud.get_all_devices(db)


@router.post("", response_model=DeviceResponse)
def create_device(data: DeviceCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud.create_device(db, data)


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(device_id: int, db: Session = Depends(get_db), _=Depends(require_any_role)):
    device = crud.get_device_by_id(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo não encontrado")
    return device


@router.put("/{device_id}", response_model=DeviceResponse)
def update_device(device_id: int, data: DeviceUpdate, db: Session = Depends(get_db), _=Depends(require_tecnico_or_admin)):
    device = crud.update_device(db, device_id, data)
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo não encontrado")
    return device


@router.delete("/{device_id}")
def delete_device(device_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    device = crud.get_device_by_id(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo não encontrado")
    db.delete(device)
    db.commit()
    return {"detail": "Dispositivo removido"}


@router.post("/scan", response_model=DeviceStatusResponse)
def scan_qr(data: QRScanResult, db: Session = Depends(get_db), current_user=Depends(require_any_role)):
    device = crud.get_device_by_qr(db, data.qr_code_id)
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo não encontrado")
    semaphore = calculate_semaphore(device)
    logs = []
    if current_user.role in ("tecnico", "admin"):
        raw_logs = crud.get_logs_by_device(db, device.id, limit=5)
        logs = [MaintenanceLogResponse.model_validate(l) for l in raw_logs]
    return DeviceStatusResponse(
        **DeviceResponse.model_validate(device).model_dump(),
        semaphore_color=semaphore["color"],
        semaphore_reason=semaphore["reason"],
        maintenance_logs=logs
    )


@router.post("/esp32/report")
def esp32_report(
    payload: ESP32Payload,
    db: Session = Depends(get_db),
    x_esp32_key: Optional[str] = Header(None)
):
    expected_key = os.getenv("ESP32_API_KEY", "esp32-secret-key-tcc")
    if x_esp32_key != expected_key:
        raise HTTPException(status_code=401, detail="Chave ESP32 inválida")
    device = crud.update_device_from_esp32(db, payload)
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo não encontrado")
    semaphore = calculate_semaphore(device)
    device.status = semaphore["color"]
    db.commit()
    db.refresh(device)
    if semaphore["color"] == "VERMELHO":
        dispatch_alert(device, db)
    return {
        "device_id": device.id,
        "qr_code_id": device.qr_code_id,
        "status": device.status,
        "semaphore_color": semaphore["color"],
        "semaphore_reason": semaphore["reason"],
        "total_hours_used": device.total_hours_used,
        "last_temperature": device.last_temperature,
        "last_current_ma": device.last_current_ma,
        "sensor_fault": device.sensor_fault,
    }
