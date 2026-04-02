from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


# --- AUTENTICAÇÃO ---

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int


class UserBase(BaseModel):
    username: str
    email: str
    role: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- DISPOSITIVOS ---

class DeviceBase(BaseModel):
    name: str
    brand: Optional[str] = "Elgin"
    model_name: Optional[str] = None
    location: Optional[str] = None
    qr_code_id: str


class DeviceCreate(DeviceBase):
    responsible_technician_id: Optional[int] = None


class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    total_hours_used: Optional[float] = None
    last_temperature: Optional[float] = None
    last_current_ma: Optional[float] = None
    sensor_fault: Optional[bool] = None
    responsible_technician_id: Optional[int] = None


class DeviceResponse(DeviceBase):
    id: int
    status: str
    total_hours_used: float
    last_temperature: Optional[float]
    last_current_ma: Optional[float]
    sensor_fault: bool
    responsible_technician_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- QR CODE / ESP32 ---

class QRScanResult(BaseModel):
    qr_code_id: str


class ESP32Payload(BaseModel):
    qr_code_id: str
    temperature: Optional[float] = None
    current_ma: Optional[float] = None
    hours_delta: float = 0.0
    sensor_fault: bool = False


# --- MANUTENÇÃO ---

class MaintenanceLogBase(BaseModel):
    log_type: str
    description: Optional[str] = None


class MaintenanceLogCreate(MaintenanceLogBase):
    device_id: int


class MaintenanceLogResponse(BaseModel):
    id: int
    device_id: int
    technician_id: Optional[int]
    log_type: str
    status_at_creation: Optional[str]
    description: Optional[str]
    hours_at_log: Optional[float]
    alert_sent: bool
    resolved: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DeviceStatusResponse(DeviceResponse):
    semaphore_color: str
    semaphore_reason: str
    maintenance_logs: List[MaintenanceLogResponse] = []
