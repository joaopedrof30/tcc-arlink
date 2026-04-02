from sqlalchemy.orm import Session
from models import User, Device, MaintenanceLog
from schemas import UserCreate, DeviceCreate, DeviceUpdate, ESP32Payload, MaintenanceLogCreate
from auth import hash_password


# --- USERS ---

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserCreate) -> User:
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_all_users(db: Session):
    return db.query(User).all()


# --- DEVICES ---

def get_device_by_qr(db: Session, qr_code_id: str):
    return db.query(Device).filter(Device.qr_code_id == qr_code_id).first()


def get_device_by_id(db: Session, device_id: int):
    return db.query(Device).filter(Device.id == device_id).first()


def get_all_devices(db: Session):
    return db.query(Device).all()


def create_device(db: Session, device: DeviceCreate) -> Device:
    db_device = Device(
        qr_code_id=device.qr_code_id,
        name=device.name,
        brand=device.brand,
        model_name=device.model_name,
        location=device.location,
        responsible_technician_id=device.responsible_technician_id,
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device


def update_device(db: Session, device_id: int, data: DeviceUpdate):
    device = get_device_by_id(db, device_id)
    if not device:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(device, field, value)
    db.commit()
    db.refresh(device)
    return device


def update_device_from_esp32(db: Session, payload: ESP32Payload):
    device = get_device_by_qr(db, payload.qr_code_id)
    if not device:
        return None
    device.total_hours_used += payload.hours_delta
    if payload.temperature is not None:
        device.last_temperature = payload.temperature
    if payload.current_ma is not None:
        device.last_current_ma = payload.current_ma
    device.sensor_fault = payload.sensor_fault
    db.commit()
    db.refresh(device)
    return device


# --- MAINTENANCE LOGS ---

def create_maintenance_log(db: Session, log: MaintenanceLogCreate, technician_id: int = None) -> MaintenanceLog:
    device = get_device_by_id(db, log.device_id)
    db_log = MaintenanceLog(
        device_id=log.device_id,
        technician_id=technician_id,
        log_type=log.log_type,
        status_at_creation=device.status if device else None,
        description=log.description,
        hours_at_log=device.total_hours_used if device else None,
        alert_sent=False,
        resolved=False,
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def get_logs_by_device(db: Session, device_id: int, limit: int = 20):
    return (
        db.query(MaintenanceLog)
        .filter(MaintenanceLog.device_id == device_id)
        .order_by(MaintenanceLog.created_at.desc())
        .limit(limit)
        .all()
    )
