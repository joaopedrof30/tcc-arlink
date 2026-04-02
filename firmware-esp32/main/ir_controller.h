#ifndef IR_CONTROLLER_H
#define IR_CONTROLLER_H

#include <Arduino.h>

// Simulação do controle IR — sem biblioteca externa
// Em produção: substituir pelos comandos reais do protocolo Elgin
class IRController {
public:
  void sendPowerOn() {
    Serial.println("[IR] Enviando comando LIGAR para AR Elgin");
  }

  void sendPowerOff() {
    Serial.println("[IR] Enviando comando DESLIGAR para AR Elgin");
  }

  void sendTemperature(int temp) {
    Serial.print("[IR] Ajustando temperatura para: ");
    Serial.print(temp);
    Serial.println("°C");
  }
};

#endif
