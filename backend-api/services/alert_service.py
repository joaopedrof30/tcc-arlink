import json
import logging
from datetime import datetime
from sqlalchemy.orm import Session

from models import Device, MaintenanceLog
from services.semaphore_service import calculate_semaphore

logger = logging.getLogger(__name__)


def dispatch_alert(device: Device, db: Session):
    semaphore = calculate_semaphore(device)

    if semaphore["color"] != "VERMELHO":
        return None

    payload = {
        "alert_type": "CRITICAL_FAILURE",
        "device_id": device.id,
        "device_name": device.name,
        "location": device.location,
        "semaphore_color": "VERMELHO",
        "reason": semaphore["reason"],
        "technician_id": device.responsible_technician_id,
        "timestamp": datetime.utcnow().isoformat(),
        "action_required": "Inspeção imediata necessária."
    }

    payload_json = json.dumps(payload, ensure_ascii=False)
    print(f"[ALERTA AUTOMÁTICO] {payload_json}")
    logger.warning(f"ALERTA CRÍTICO DISPARADO: {payload_json}")

    log_type = "SENSOR_FAULT" if device.sensor_fault else "ALERTA_AUTO"

    log = MaintenanceLog(
        device_id=device.id,
        technician_id=device.responsible_technician_id,
        log_type=log_type,
        status_at_creation="VERMELHO",
        description=semaphore["reason"],
        hours_at_log=device.total_hours_used,
        alert_sent=True,
        alert_payload=payload_json,
        resolved=False
    )

    db.add(log)
    db.commit()
    db.refresh(log)
    return log
