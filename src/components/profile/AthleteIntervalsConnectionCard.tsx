"use client";

import React, { useState } from "react";
import { Radio, RefreshCw, Check, AlertCircle, Edit3, ExternalLink, ShieldCheck } from "lucide-react";

interface AthleteIntervalsConnectionCardProps {
  athleteId: string;
  hasApiKey: boolean;
  onOpenEditModal: () => void;
  onTestConnection?: (athleteId: string) => Promise<{ success: boolean; athleteName?: string; error?: string }>;
}

export const AthleteIntervalsConnectionCard: React.FC<AthleteIntervalsConnectionCardProps> = ({
  athleteId,
  hasApiKey,
  onOpenEditModal,
  onTestConnection,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const isConnected = !!athleteId && hasApiKey;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      if (onTestConnection) {
        const res = await onTestConnection(athleteId);
        if (res.success) {
          setTestResult({
            success: true,
            message: `✓ Conexión en vivo verificada con Intervals.icu (${res.athleteName || athleteId})`,
          });
        } else {
          setTestResult({
            success: false,
            message: `✕ Error: ${res.error || "Credenciales rechazadas"}`,
          });
        }
      } else {
        const res = await fetch("/api/test-connection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ athleteId }),
        });
        const data = await res.json();
        if (data.success) {
          setTestResult({
            success: true,
            message: `✓ Conexión verificada con Intervals.icu (${data.athleteName || athleteId})`,
          });
        } else {
          setTestResult({
            success: false,
            message: `✕ Error: ${data.error || "No se pudo conectar a Intervals"}`,
          });
        }
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `✕ Error al verificar conexión: ${err.message || "Fallo de red"}`,
      });
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-500 text-white shadow-xs">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              Sincronización Cloud con Intervals.icu
              {isConnected ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/20">
                  🟢 ACTIVA
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold border border-rose-500/20">
                  🔴 DESCONECTADO
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Telemetría continua de potencia, pulso, entrenamientos y asimilación biológica.
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sky-500 ${isTesting ? "animate-spin" : ""}`} />
            <span>{isTesting ? "Probando..." : "Verificar En Vivo"}</span>
          </button>

          <button
            type="button"
            onClick={onOpenEditModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-bold hover:bg-slate-800 transition cursor-pointer shadow-xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Editar Credenciales</span>
          </button>
        </div>
      </div>

      {/* Detalles de la cuenta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">Athlete ID Intervals:</span>
          <strong className="text-slate-900 dark:text-white font-bold">{athleteId || "No configurado"}</strong>
        </div>

        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">API Key Segura (AES-256):</span>
          <strong className="text-slate-900 dark:text-white">{hasApiKey ? "••••••••••••••••" : "Sin Clave"}</strong>
        </div>
      </div>

      {/* Resultado de prueba */}
      {testResult && (
        <div
          className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-2 animate-fadeIn ${
            testResult.success
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          {testResult.success ? (
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}
    </div>
  );
};
