#!/usr/bin/env node

/**
 * PULSE AI PRO - Watchdog de Salud del Servidor
 * Monitorea periódicamente que http://localhost:3000 devuelva HTTP 200
 * y que las cabeceras no provoquen 400 Bad Request.
 */

const http = require("http");

const CHECK_INTERVAL_MS = 15000; // Cada 15 segundos
const HEALTH_URL = "http://localhost:3000";

function pingHealth() {
  const req = http.get(HEALTH_URL, (res) => {
    if (res.statusCode === 200) {
      // Servidor saludable
    } else if (res.statusCode === 400) {
      console.error(
        `🚨 [Pulse Watchdog] ALERTA: Servidor devolvió HTTP 400 Bad Request! Encabezados HTTP excedidos.`
      );
    } else {
      console.warn(`⚠️ [Pulse Watchdog] Respuesta inesperada: HTTP ${res.statusCode}`);
    }
  });

  req.on("error", (err) => {
    // Si el servidor está arrancando o se reinició
    console.log(`ℹ️ [Pulse Watchdog] Esperando respuesta del servidor (${err.code})...`);
  });

  req.setTimeout(5000, () => {
    req.destroy();
  });
}

console.log("🛡️ [Pulse Watchdog] Vigilante de salud iniciado para " + HEALTH_URL);
setInterval(pingHealth, CHECK_INTERVAL_MS);
pingHealth();
