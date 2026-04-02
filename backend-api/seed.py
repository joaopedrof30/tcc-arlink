from database import init_db, SessionLocal
from models import User, Device
from auth import hash_password

def seed():
    init_db()
    db = SessionLocal()

    try:
        # --- USUÁRIOS ---
        users_data = [
            {"username": "admin",    "email": "admin@tcc.com",    "password": "admin123", "role": "admin"},
            {"username": "tecnico1", "email": "tecnico@tcc.com",  "password": "tec123",   "role": "tecnico"},
            {"username": "cliente1", "email": "cliente@tcc.com",  "password": "cli123",   "role": "cliente"},
        ]
        created_users = {}
        for u in users_data:
            existing = db.query(User).filter(User.username == u["username"]).first()
            if not existing:
                user = User(
                    username=u["username"],
                    email=u["email"],
                    hashed_password=hash_password(u["password"]),
                    role=u["role"],
                    is_active=True,
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                created_users[u["username"]] = user
                print(f"  ✅ Usuário criado: {u['username']} ({u['role']})")
            else:
                created_users[u["username"]] = existing
                print(f"  ⏭️  Usuário já existe: {u['username']}")

        tecnico = created_users.get("tecnico1")

        # --- DISPOSITIVOS ---
        devices_data = [
            {
                "qr_code_id": "ELGIN-001",
                "name": "Ar Sala de Reunião",
                "location": "Bloco A - Sala 101",
                "brand": "Elgin",
                "model_name": "Hi Wall Eco 12000 BTU",
                "total_hours_used": 480.0,
                "responsible_technician_id": tecnico.id if tecnico else None,
            },
            {
                "qr_code_id": "ELGIN-002",
                "name": "Ar Laboratório IoT",
                "location": "Bloco B - Lab 205",
                "brand": "Elgin",
                "model_name": "Split Inverter 9000 BTU",
                "total_hours_used": 520.0,
                "sensor_fault": False,
            },
        ]
        for d in devices_data:
            existing = db.query(Device).filter(Device.qr_code_id == d["qr_code_id"]).first()
            if not existing:
                device = Device(**d)
                db.add(device)
                db.commit()
                db.refresh(device)
                print(f"  ✅ Dispositivo criado: {d['name']} ({d['qr_code_id']})")
            else:
                print(f"  ⏭️  Dispositivo já existe: {d['qr_code_id']}")

        print("\n✅ Seed concluído. Banco populado com dados de teste.")
        print("\n📋 Credenciais de acesso:")
        print("  admin    / admin123  → role: admin")
        print("  tecnico1 / tec123    → role: tecnico")
        print("  cliente1 / cli123    → role: cliente")
        print("\n📱 QR Codes para teste: ELGIN-001 e ELGIN-002")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
