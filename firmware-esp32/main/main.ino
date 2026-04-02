/*
 * TCC — Sistema IoT de Monitoramento de Ar-Condicionado Elgin
 * Firmware ESP32 | Stack: Arduino IDE + HTTPClient + ArduinoJson
 *
 * COMO USAR:
 *  1. Instale as bibliotecas: ArduinoJson (Benoit Blanchon)
 *  2. Edite as constantes abaixo com seus dados
 *  3. Grave no ESP32
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "wifi_manager.h"
#include "sensor_reader.h"
#include "ir_controller.h"

// ============================================================
// ⚙️  CONFIGURAÇÕES — EDITE AQUI
// ============================================================
const char* WIFI_SSID       = "SUA_REDE_WIFI";
const char* WIFI_PASSWORD   = "SUA_SENHA_WIFI";
const char* API_URL         = "http://192.168.1.100:8000/devices/esp32/report";
const char* ESP32_API_KEY   = "esp32-secret-key-tcc";
const char* QR_CODE_ID      = "ELGIN-001";   // ID gravado no QR Code físico
// ============================================================

#define INTERVALO_MS  30000   // Envia a cada 30 segundos

WifiManager  wifiMgr;
SensorReader sensor;
IRController ir;

unsigned long ultimoEnvio = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("==============================");
  Serial.println("  Sistema AR IoT — TCC ESP32  ");
  Serial.println("==============================");

  // Conecta ao Wi-Fi
  if (!wifiMgr.begin(WIFI_SSID, WIFI_PASSWORD)) {
    Serial.println("[ERRO] Sem Wi-Fi. Tentando novamente em 30s...");
  }

  // Liga o ar (simulação)
  ir.sendPowerOn();
  ir.sendTemperature(23);
}

void loop() {
  unsigned long agora = millis();

  // Aguarda o intervalo antes de enviar
  if (agora - ultimoEnvio < INTERVALO_MS) return;
  ultimoEnvio = agora;

  // Garante conexão Wi-Fi antes de enviar
  if (!wifiMgr.isConnected()) {
    wifiMgr.reconnect(WIFI_SSID, WIFI_PASSWORD);
    if (!wifiMgr.isConnected()) {
      Serial.println("[ERRO] Sem Wi-Fi. Pulando envio.");
      return;
    }
  }

  // ── Leitura dos sensores ──────────────────────────────────
  float corrente    = sensor.getCurrentMA();
  float temperatura = sensor.getTemperatureCelsius();
  bool  falha       = sensor.hasFault();
  float horas_delta = sensor.getHoursDelta();

  Serial.println("\n[SENSORES]");
  Serial.printf("  Corrente:    %.1f mA\n", corrente);
  Serial.printf("  Temperatura: %.1f °C\n", temperatura);
  Serial.printf("  Horas delta: %.2f h\n", horas_delta);
  Serial.printf("  Fault:       %s\n", falha ? "SIM" : "não");

  // ── Monta payload JSON ────────────────────────────────────
  StaticJsonDocument<256> doc;
  doc["qr_code_id"]   = QR_CODE_ID;
  doc["temperature"]  = temperatura;
  doc["current_ma"]   = corrente;
  doc["hours_delta"]  = horas_delta;
  doc["sensor_fault"] = falha;

  String payload;
  serializeJson(doc, payload);

  // ── Envia para a API ─────────────────────────────────────
  Serial.println("[HTTP] Enviando para API...");
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-ESP32-Key", ESP32_API_KEY);

  int httpCode = http.POST(payload);

  if (httpCode == 200) {
    String resposta = http.getString();
    Serial.println("[HTTP] Resposta 200 OK:");
    Serial.println(resposta);

    // Verifica se o semáforo ficou VERMELHO
    if (resposta.indexOf("VERMELHO") >= 0) {
      Serial.println("[ALERTA] Status CRITICO recebido da API!");
      // Aqui poderia acionar LED ou buzzer físico
    }
  } else if (httpCode < 0) {
    Serial.printf("[HTTP] Erro de conexão: %s\n", http.errorToString(httpCode).c_str());
  } else {
    Serial.printf("[HTTP] Código inesperado: %d\n", httpCode);
    Serial.println(http.getString());
  }

  http.end();
}
