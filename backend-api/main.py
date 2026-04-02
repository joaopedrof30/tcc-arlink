from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import auth_router, devices_router, maintenance_router, alerts_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Sistema IoT - Monitoramento AR Condicionado",
    description=(
        "API para monitoramento inteligente de ar-condicionados Elgin via IoT. "
        "Desenvolvido como TCC — Stack: FastAPI + SQLAlchemy + React Native Expo + ESP32."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/auth", tags=["Autenticação"])
app.include_router(devices_router.router, prefix="/devices", tags=["Dispositivos"])
app.include_router(maintenance_router.router, prefix="/maintenance", tags=["Manutenção"])
app.include_router(alerts_router.router, prefix="/alerts", tags=["Alertas"])


@app.get("/")
def root():
    return {
        "message": "API Sistema AR-Condicionado IoT",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs"
    }
