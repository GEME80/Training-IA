"use client";

import React, { useState } from "react";
import { Check, AlertCircle, RefreshCw, Unlink, Activity, ShieldCheck, Zap } from "lucide-react";

interface AthleteIntervalsTabProps {
  athleteId: string;
  apiKey: string;
  isLiveConnected: boolean;
  onSaveCredentials: (creds: { athleteId: string; apiKey: string }) => Promise<void>;
  onTestConnection?: (athleteId: string) => Promise<{ success: boolean; athleteName?: string; error?: string }>;
}

export const AthleteIntervalsTab: React.FC<AthleteIntervalsTabProps> = ({
  athleteId,
  apiKey,
  isLiveConnected,
  onSaveCredentials,
  onTestConnection,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const isConnected = !!athleteId && (isLiveConnected || !!apiKey);

  const handleTest = async () => {
    if (!athleteId) {
      setTestResult({ success: false, message: "No hay cuenta de Intervals.icu conectada" });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      if (onTestConnection) {
        const res = await onTestConnection(athleteId);
        setTestResult(
          res.success
            ? { success: true, message: `Conexión en vivo activa (${res.athleteName || athleteId})` }
            : { success: false, message: `Error: ${res.error || "No se pudo conectar a Intervals"}` }
        );
      } else {
        const res = await fetch("/api/test-connection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ athleteId }),
        });
        const data = await res.json();
        setTestResult(
          data.success
            ? { success: true, message: `Conexión verificada (${data.athleteName || athleteId})` }
            : { success: false, message: `Error: ${data.error || "Error de conexión"}` }
        );
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Error de red: ${err.message || "Fallo al verificar"}` });
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await onSaveCredentials({ athleteId: "", apiKey: "" });
      setShowConfirmDisconnect(false);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Orígenes de Sincronización (Top Hub) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Orígenes de Sincronización
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 space-y-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Actividades</span>
            <p className="text-[11px] text-slate-500">De dónde se sincronizan tus entrenamientos.</p>
            <div className="pt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono">
                <Activity className="h-3 w-3" /> Intervals.icu
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 space-y-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Actividades virtuales</span>
            <p className="text-[11px] text-slate-500">Sincronización de Zwift, Rouvy y simuladores.</p>
            <div className="pt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono">
                <Activity className="h-3 w-3" /> Intervals.icu
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 space-y-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Datos de salud</span>
            <p className="text-[11px] text-slate-500">HRV, FC en reposo, sueño y peso corporal.</p>
            <div className="pt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono">
                <Activity className="h-3 w-3" /> Intervals.icu
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sección Principal: Integraciones */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs overflow-hidden">
        <div className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Integraciones</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conexión bidireccional con tu reloj deportivo a través de tu motor de telemetría.
            </p>
          </div>
          {isConnected && (
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-sky-500 ${isTesting ? "animate-spin" : ""}`} />
              <span>{isTesting ? "Verificando..." : "Verificar En Vivo"}</span>
            </button>
          )}
        </div>

        {/* Feedback de Test */}
        {testResult && (
          <div className={`px-5 py-3 text-xs font-mono font-bold flex items-center gap-2 ${testResult.success ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300"}`}>
            {testResult.success ? <Check className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Item 1: Intervals.icu */}
        <div className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center font-black shadow-md shadow-rose-500/20 shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Intervals.icu</h4>
                {isConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Conectado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actividades · Virtuales · Salud {athleteId && <span className="font-mono text-[11px] text-slate-400">({athleteId})</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <button
                type="button"
                onClick={() => setShowConfirmDisconnect(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/50 transition cursor-pointer flex items-center gap-1.5"
              >
                <Unlink className="h-3.5 w-3.5" />
                <span>Desconectar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const returnTo = typeof window !== "undefined" ? window.location.pathname : "/profile";
                  window.location.href = `/api/auth/intervals/authorize?returnTo=${encodeURIComponent(returnTo)}`;
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Conectar con Intervals.icu</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación para Desconectar */}
      {showConfirmDisconnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>¿Desconectar Intervals.icu?</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Al desconectar, el Head Coach IA dejará de recibir tus actividades y métricas de salud (HRV, sueño y recuperación). Podrás volver a conectarlo en cualquier momento.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDisconnect(false)}
                disabled={isDisconnecting}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                {isDisconnecting ? "Desconectando..." : "Sí, Desconectar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pie de seguridad */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>Tus datos y conexiones se autentican mediante tokens OAuth 2.0 cifrados sin almacenar tus contraseñas.</span>
      </div>
    </div>
  );
};
