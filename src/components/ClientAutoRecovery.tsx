"use client";

import React, { useEffect } from "react";

const RELOAD_STORAGE_KEY = "pulse_auto_reload_ts";
const RELOAD_COOLDOWN_MS = 10000; // Máximo 1 auto-recarga cada 10 segundos

/**
 * Guardián de Resiliencia y Auto-Recuperación en el Cliente
 * Detecta desincronizaciones de chunks (ChunkLoadError, SyntaxError por HTML devuelto, desfase de HMR)
 * y recupera la sesión de forma transparente sin requerir acción manual del usuario.
 */
export const ClientAutoRecovery: React.FC = () => {
  useEffect(() => {
    // 1. Manejador de errores globales de carga de scripts y sintaxis
    const handleError = (event: ErrorEvent) => {
      const msg = event.message || "";
      const isChunkError =
        msg.includes("Loading chunk") ||
        msg.includes("ChunkLoadError") ||
        msg.includes("Unexpected token '<'") ||
        msg.includes("Invalid or unexpected token") ||
        msg.includes("Cannot find module './");

      if (isChunkError) {
        console.warn("🛡️ [ClientAutoRecovery] Desfase de chunks o sesión detectado. Auto-recuperando...", msg);
        attemptGracefulReload();
      }
    };

    // 2. Manejador de promesas rechazadas (ej. dynamic import fallido)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || String(event.reason || "");
      const isChunkError =
        reason.includes("Loading chunk") ||
        reason.includes("ChunkLoadError") ||
        reason.includes("Unexpected token '<'") ||
        reason.includes("Invalid or unexpected token") ||
        reason.includes("Cannot find module './");

      if (isChunkError) {
        console.warn("🛡️ [ClientAutoRecovery] Rechazo de módulo detectado. Auto-recuperando...", reason);
        attemptGracefulReload();
      }
    };

    // 3. Listener de retorno de conexión (Online / Offline)
    const handleOnline = () => {
      console.info("🟢 [ClientAutoRecovery] Conexión de red restablecida.");
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("online", handleOnline);

    // 4. Verificación preventiva de tamaño de cookies (evitar HTTP 400 por cabeceras gigantes)
    try {
      if (document.cookie && document.cookie.length > 6144) {
        console.warn("⚠️ [ClientAutoRecovery] Cookies excesivas detectadas (>6KB). Podría causar HTTP 400.");
      }
    } catch {}

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
};

/**
 * Ejecuta una recarga limpia protegiendo contra bucles infinitos y purgando cookies hinchadas si aplican
 */
function attemptGracefulReload() {
  if (typeof window === "undefined") return;

  const now = Date.now();
  const lastReload = Number(sessionStorage.getItem(RELOAD_STORAGE_KEY) || 0);

  if (now - lastReload > RELOAD_COOLDOWN_MS) {
    sessionStorage.setItem(RELOAD_STORAGE_KEY, String(now));

    // Si las cookies superan 4KB, purgarlas para que el reload no devuelva HTTP 400
    try {
      if (document.cookie && document.cookie.length > 4096) {
        console.warn("🧹 [ClientAutoRecovery] Purgando cookies acumuladas para evitar HTTP 400...");
        const cookies = document.cookie.split(";");
        for (const c of cookies) {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      }
    } catch {}

    const targetUrl = new URL(window.location.href);
    targetUrl.searchParams.set("_v", String(now));
    window.location.replace(targetUrl.toString());
  } else {
    console.warn("🛡️ [ClientAutoRecovery] Cooldown de auto-recarga activo. Evitando bucle.");
  }
}
