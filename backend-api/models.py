from sqlalchemy import (
    Column, Integer, String, Boolean, Float, DateTime, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # 'admin', 'tecnico', 'cliente'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    devices = relationship("Device", back_populates="responsible_technician")
    maintenance_logs = relationship("MaintenanceLog", back_populates="technician")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    qr_code_id = Column(String(100), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    brand = Column(String(50), default="Elgin")
    model_name = Column(String(100), nullable=True)
    location = Column(String(200), nullable=True)
    status = Column(String(20), default="VERDE")  # 'VERDE', 'AMARELO', 'VERMELHO'
    total_hours_used = Column(Float, default=0.0)
    last_temperature = Column(Float, nullable=True)
    last_current_ma = Column(Float, nullable=True)
    sensor_fault = Column(Boolean, default=False)
    responsible_technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    responsible_technician = relationship("User", back_populates="devices")
    maintenance_logs = relationship("MaintenanceLog", back_populates="device")

    def __repr__(self):
        return f"<Device(id={self.id}, qr_code_id='{self.qr_code_id}', status='{self.status}')>"


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    log_type = Column(String(30), nullable=False)  # 'PREVENTIVO', 'CORRETIVO', 'ALERTA_AUTO', 'SENSOR_FAULT'
    status_at_creation = Column(String(20), nullable=True)
    description = Column(String(500), nullable=True)
    hours_at_log = Column(Float, nullable=True)
    alert_sent = Column(Boolean, default=False)
    alert_payload = Column(Text, nullable=True)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    device = relationship("Device", back_populates="maintenance_logs")
    technician = relationship("User", back_populates="maintenance_logs")

    def __repr__(self):
        return f"<MaintenanceLog(id={self.id}, device_id={self.device_id}, log_type='{self.log_type}')>"
