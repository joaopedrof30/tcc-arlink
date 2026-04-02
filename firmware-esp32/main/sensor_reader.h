#ifndef SENSOR_READER_H
#define SENSOR_READER_H

#include <Arduino.h>

#define PINO_CORRENTE   34
#define PINO_TEMP       35

class SensorReader {
private:
  int leituras_zero = 0;

public:
  // Corrente: ADC 0-4095 mapeado para 0-2000 mA
  float getCurrentMA() {
    int raw = analogRead(PINO_CORRENTE);
    if (raw == 0) leituras_zero++;
    else leituras_zero = 0;
    return map(raw, 0, 4095, 0, 2000);
  }

  // Temperatura: ADC 0-4095 mapeado para 10-50°C
  float getTemperatureCelsius() {
    int raw = analogRead(PINO_TEMP);
    return 10.0 + ((float)raw / 4095.0) * 40.0;
  }

  // Fault: sensor desconectado = 3 leituras consecutivas de 0
  bool hasFault() {
    getCurrentMA(); // atualiza leituras_zero
    return leituras_zero >= 3;
  }

  // Simula 0.1h de uso por ciclo (chamado a cada 30s = ~120 ciclos/hora)
  float getHoursDelta() {
    return 0.1;
  }
};

#endif
