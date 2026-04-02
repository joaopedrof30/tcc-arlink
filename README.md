# Sistema IoT — Monitoramento de Ar-Condicionado Elgin (TCC)

Stack: **FastAPI + SQLAlchemy + React Native Expo + ESP32**

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Python | 3.11+ |
| Node.js | 20+ |
| Expo CLI | `npm install -g expo-cli` |
| Arduino IDE | 2.x com board ESP32 instalada |

---

## 🚀 Como Rodar — Passo a Passo

### 1. Backend (API)

Abra um terminal na pasta `backend-api`:

```bash
# Windows (CMD — não PowerShell)
cd backend-api
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

```bash
# Linux / Mac
cd backend-api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Acesse **http://localhost:8000/docs** para ver o Swagger UI.

---

### 2. Descobrir seu IP local

**Windows:**
```
ipconfig
```
Procure `Endereço IPv4` — ex: `192.168.1.105`

**Linux/Mac:**
```
ifconfig | grep inet
```

---

### 3. Configurar IP no App Mobile

Abra `mobile-app/services/api.ts` e troque:
```typescript
export const API_URL = 'http://192.168.1.100:8000';
//                              ↑ coloque SEU IP aqui
```

---

### 4. App Mobile

```bash
cd mobile-app
npm install
npx expo start
```

Escaneie o QR Code com o app **Expo Go** (Android/iOS).

---

### 5. Firmware ESP32

1. Abra `firmware-esp32/main/main.ino` no Arduino IDE
2. Instale a biblioteca **ArduinoJson** (Benoit Blanchon) pelo Library Manager
3. Edite as constantes no topo do arquivo:
   ```cpp
   const char* WIFI_SSID     = "SUA_REDE_WIFI";
   const char* WIFI_PASSWORD = "SUA_SENHA_WIFI";
   const char* API_URL       = "http://SEU_IP:8000/devices/esp32/report";
   ```
4. Selecione a placa `ESP32 Dev Module` e grave

---

## 👥 Usuários de Teste

| Usuário | Senha | Role | O que abre |
|---|---|---|---|
| `admin` | `admin123` | admin | Dashboard com resumo geral |
| `tecnico1` | `tec123` | tecnico | Lista de dispositivos + logs |
| `cliente1` | `cli123` | cliente | Scanner de QR Code |

---

## 📱 QR Codes para Teste

Escaneie com o app ou use no Swagger (`/devices/scan`):

- `ELGIN-001` — Ar Sala de Reunião (480h — status AMARELO)
- `ELGIN-002` — Ar Laboratório IoT (520h — status AMARELO)

---

## 🚦 Lógica do Semáforo

| Cor | Condição |
|---|---|
| 🔴 VERMELHO | Falha de sensor OU corrente < 50mA ou > 2000mA |
| 🟡 AMARELO | Total de horas ≥ 500h OU temperatura > 35°C |
| 🟢 VERDE | Tudo normal |

---

## 📋 Fluxo do Sistema

```
ESP32 lê sensores (30s)
    → POST /devices/esp32/report
        → Backend calcula semáforo
            → Se VERMELHO: cria log ALERTA_AUTO automaticamente
App mobile escaneia QR Code
    → POST /devices/scan
        → Retorna status + semáforo + logs (técnico/admin)
```

---

## ⚡ Solução de Problemas Comuns

**PowerShell bloqueia o venv:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Ou use o CMD em vez do PowerShell.

**App não conecta na API:**
- Verifique se o celular e o PC estão na mesma rede Wi-Fi
- Confirme o IP em `services/api.ts`
- Confirme que o servidor está rodando (`uvicorn`)

**338 erros no VS Code (TypeScript):**
- São erros de "módulos não encontrados" que somem após `npm install`
- Rode `npm install` dentro de `mobile-app/`
