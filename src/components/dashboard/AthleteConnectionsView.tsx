"use client";

import React, { useState } from "react";
import { Radio, Key, Save, RefreshCw, ExternalLink, Check, AlertCircle, Eye, EyeOff } from "lucide-react";

interface AthleteConnectionsViewProps {
  athleteId: string;
  apiKey: string;
  onSaveConnections: (data: {
    athleteId: string;
    apiKey: string;
  }) => Promise<void>;
  onTestIntervalsConnection?: (athleteId: string, apiKey: string) => Promise<{ success: boolean; athleteName?: string; error?: string }>;
}

export const AthleteConnectionsView: React.FC<AthleteConnectionsViewProps> = ({
  athleteId: initialAthleteId,
  apiKey: initialApiKey,
  onSaveConnections,
  onTestIntervalsConnection,
}) => {
  const [athleteId, setAthleteId] = useState<string>(initialAthleteId || "");
  const [apiKey, setApiKey] = useState<string>(initialApiKey || "");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  React.useEffect(() => {
    if (initialAthleteId) {
      setAthleteId(initialAthleteId);
    }
  }, [initialAthleteId]);

  React.useEffect(() => {
    if (initialApiKey) {
      setApiKey(initialApiKey);
    }
  }, [initialApiKey]);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionTestResult(null);
    try {
      if (onTestIntervalsConnection) {
        const res = await onTestIntervalsConnection(athleteId, apiKey);
        if (res.success) {
          setConnectionTestResult({
            success: true,
            message: `✓ Conexión en vivo exitosa con Intervals.icu. Atleta: ${res.athleteName || athleteId}`,
          });
        } else {
          setConnectionTestResult({
            success: false,
            message: `✕ Error de conexión: ${res.error || "Credenciales rechazadas"}`,
          });
        }
      } else {
        const res = await fetch("/api/test-connection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ athleteId, apiKey }),
        });
        const data = await res.json();
        if (data.success) {
          setConnectionTestResult({
            success: true,
            message: `✓ Conexión exitosa con Intervals.icu. Atleta: ${data.athleteName || athleteId}`,
          });
        } else {
          setConnectionTestResult({
            success: false,
            message: `✕ Error: ${data.error || "No se pudo conectar a Intervals"}`,
          });
        }
      }
    } catch (err: any) {
      setConnectionTestResult({
        success: false,
        message: `✕ Error al verificar conexión: ${err.message || "Fallo de red"}`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveConnections({
        athleteId: athleteId.trim(),
        apiKey: apiKey.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card-gradient rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-teal-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30 shadow-inner text-lg">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Conexión con Intervals.icu</span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold">
                TELEMETRÍA EN VIVO
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sincroniza tus métricas fisiológicas (Fitness CTL, Fatigue ATL, Form TSB) y envía tus entrenamientos diarios.
            </p>
          </div>
        </div>
      </div>

      {/* FORMULARIO DE CREDENCIALES INTERVALS.ICU */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Credenciales de Acceso
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            ● Cifrado AES-256-GCM
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Athlete ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Athlete ID (ej: i123456)
            </label>
            <input
              type="text"
              value={athleteId}
              onChange={(e) => setAthleteId(e.target.value)}
              placeholder="iXXXXXX"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400">
              Tu identificador de atleta en la URL de Intervals.icu.
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              API Key Privada
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="48eje8t1wnj9..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 px-3.5 py-2.5 pr-10 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Generada en Intervals.icu › Settings › API Access.
            </p>
          </div>
        </div>

        {/* Acciones de Test y Enlace */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <a
            href="https://intervals.icu/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-bold"
          >
            <span>Obtener credenciales en Intervals.icu</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection || !athleteId || !apiKey}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer disabled:opacity-40"
          >
            {testingConnection ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 text-emerald-500" />
                <span>Probar Conexión en Vivo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* NOTIFICACIÓN DE RESULTADO DE TEST */}
      {connectionTestResult && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold transition animate-fadeIn flex items-center gap-2.5 ${
            connectionTestResult.success
              ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          {connectionTestResult.success ? (
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{connectionTestResult.message}</span>
        </div>
      )}

      {/* BOTÓN DE GUARDADO PRINCIPAL */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {saveSuccess ? (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              ✓ Credenciales guardadas y sincronizadas con Intervals.icu.
            </span>
          ) : (
            <span>Tus claves se cifran con AES-256-GCM y nunca se exponen al cliente.</span>
          )}
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !athleteId || !apiKey}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-black shadow-md hover:scale-[1.02] active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 text-emerald-400" />
              <span>Guardar Credenciales</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
