"use client";

import React, { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isChunkError, setIsChunkError] = useState<boolean>(false);

  useEffect(() => {
    console.error("Global Error Boundary:", error);
    const msg = error?.message || "";
    const name = error?.name || "";
    const detectedChunkMismatch =
      msg.includes("Loading chunk") ||
      msg.includes("ChunkLoadError") ||
      msg.includes("Unexpected token '<'") ||
      msg.includes("Invalid or unexpected token") ||
      name === "ChunkLoadError";

    if (detectedChunkMismatch) {
      setIsChunkError(true);
      const now = Date.now();
      const last = Number(sessionStorage.getItem("pulse_chunk_error_reload") || 0);
      if (now - last > 3000) {
        sessionStorage.setItem("pulse_chunk_error_reload", String(now));
        const target = new URL(window.location.href);
        target.searchParams.set("_v", String(now));
        window.location.replace(target.toString());
      }
    }
  }, [error]);

  const handleManualSync = () => {
    try {
      sessionStorage.clear();
    } catch {}
    window.location.replace(window.location.origin + window.location.pathname + "?_t=" + Date.now());
  };

  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-xl border border-slate-200 space-y-4">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold ${
            isChunkError ? "bg-emerald-100 text-emerald-600 animate-spin" : "bg-rose-100 text-rose-600"
          }`}>
            {isChunkError ? "↻" : "!"}
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {isChunkError ? "Sincronizando con el Servidor" : "Error Crítico Global"}
          </h2>
          <p className="text-xs text-slate-600 font-mono bg-slate-100 p-3 rounded-lg text-left break-words">
            {isChunkError
              ? "Se detectó una actualización o reinicio del servidor. Sincronizando scripts..."
              : error?.message || "Ocurrió un error inesperado"}
          </p>
          <button
            type="button"
            onClick={isChunkError ? handleManualSync : () => reset()}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow cursor-pointer"
          >
            {isChunkError ? "Actualizar Ahora" : "Reintentar"}
          </button>
        </div>
      </body>
    </html>
  );
}
