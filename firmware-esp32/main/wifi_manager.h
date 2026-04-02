#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>

class WifiManager {
public:
  // Conecta ao Wi-Fi com timeout de 10 segundos
  bool begin(const char* ssid, const char* password) {
    Serial.print("[WiFi] Conectando a ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);

    int tentativas = 0;
    while (WiFi.status() != WL_CONNECTED && tentativas < 20) {
      delay(500);
      Serial.print(".");
      tentativas++;
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("[WiFi] Conectado! IP: ");
      Serial.println(WiFi.localIP());
      return true;
    } else {
      Serial.println("[WiFi] FALHA na conexão!");
      return false;
    }
  }

  bool isConnected() {
    return WiFi.status() == WL_CONNECTED;
  }

  void reconnect(const char* ssid, const char* password) {
    Serial.println("[WiFi] Tentando reconectar...");
    WiFi.disconnect();
    delay(1000);
    begin(ssid, password);
  }
};

#endif
