from models import Device


def calculate_semaphore(device: Device) -> dict:
    # 1. VERMELHO — falha de sensor
    if device.sensor_fault:
        return {
            "color": "VERMELHO",
            "reason": "Falha crítica detectada pelo sensor do ESP32."
        }

    # 2. VERMELHO — corrente anormal
    if device.last_current_ma is not None:
        if device.last_current_ma < 50 or device.last_current_ma > 2000:
            return {
                "color": "VERMELHO",
                "reason": f"Corrente elétrica anormal: {device.last_current_ma}mA. Verifique o compressor."
            }

    # 3. AMARELO — horas de uso
    if device.total_hours_used >= 500:
        return {
            "color": "AMARELO",
            "reason": f"Equipamento com {device.total_hours_used:.0f}h de uso. Limpeza e revisão preventiva recomendada."
        }

    # 4. AMARELO — temperatura elevada
    if device.last_temperature is not None and device.last_temperature > 35:
        return {
            "color": "AMARELO",
            "reason": f"Temperatura elevada: {device.last_temperature:.1f}°C. Possível obstrução no filtro."
        }

    # 5. VERDE — tudo normal
    return {
        "color": "VERDE",
        "reason": "Operando normalmente."
    }
