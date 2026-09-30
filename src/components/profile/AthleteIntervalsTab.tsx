"use client";

import React, { useState, useEffect } from "react";
import { Radio, RefreshCw, Check, AlertCircle, Save, ExternalLink, ShieldCheck, Eye, EyeOff, KeyRound } from "lucide-react";

interface AthleteIntervalsTabProps {
  athleteId: string;
  apiKey: string;
  isLiveConnected: boolean;
  onSaveCredentials: (creds: { athleteId: string; apiKey: string }) => Promise<void>;
  onTestConnection?: (athleteId: string) => Promise<{ success: boolean; athleteName?: string; error?: string }>;
}

export const AthleteIntervalsTab: React.FC<AthleteIntervalsTabProps> = ({
  athleteId: initialAthleteId = "",
  apiKey: initialApiKey = "",
  isLiveConnected,
  onSaveCredentials,
  onTestConnection,
}) => {
  const [athleteId, setAthleteId] = useState(initialAthleteId);
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setAthleteId(initialAthleteId);
    setApiKey(initialApiKey);
  }, [initialAthleteId, initialApiKey]);

  const isConnected = !!athleteId && (isLiveConnected || !!apiKey);

  const handleTest = async () => {
    if (!athleteId) {
      setTestResult({ success: false, message: "Ingresa primero un Athlete ID válido" });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      if (onTestConnection) {
        const res = await onTestConnection(athleteId);
        if (res.success) {
          setTestResult({
            success: true,
            message: `✓ Conexión en vivo exitosa con Intervals.icu (${res.athleteName || athleteId})`,
          });
        } else {
          setTestResult({
            success: false,
            message: `✕ Error: ${res.error || "Credenciales no válidas"}`,
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
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveCredentials({ athleteId, apiKey });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono transition";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-xs">
        {/* Cabecera */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                Credenciales & Sincronización Intervals.icu
                {isConnected ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/20">
                    🟢 ACTIVA
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold border border-rose-500/20">
                    🔴 DESCONECTADO
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Punto central de telemetría: descarga de entrenamientos completados, subida de workouts y sincronización de zonas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-sky-500 ${isTesting ? "animate-spin" : ""}`} />
              <span>{isTesting ? "Verificando..." : "Verificar En Vivo"}</span>
            </button>
          </div>
        </div>

        {/* Inputs de Credenciales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-sky-500" />
              Athlete ID Intervals
            </label>
            <input
              type="text"
              required
              value={athleteId}
              onChange={(e) => setAthleteId(e.target.value)}
              className={inputClass}
              placeholder="Ej. i123456"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Identificador alfanumérico que aparece en la URL de tu perfil en Intervals.icu</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-amber-500" />
              API Key (Token de Acceso)
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={`${inputClass} pr-10`}
                placeholder="Pegar API Key"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Tu clave se encripta con AES-256 en reposo</span>
          </div>
        </div>

        {/* Mensaje de prueba */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono font-bold flex items-center space-x-2 animate-fadeIn ${
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

        {/* Footer con Botón Guardar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Conexión segura cifrada</span>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Credenciales guardadas</span>
              </div>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Guardando..." : "Guardar Credenciales"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Guía Explicativa */}
      <div className="rounded-2xl border border-sky-100 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-950/20 p-5 space-y-2">
        <h4 className="text-xs font-black text-sky-900 dark:text-sky-200 flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-sky-500" />
          ¿Cómo obtener tu Athlete ID y API Key de Intervals.icu?
        </h4>
        <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <li>Inicia sesión en tu cuenta de <a href="https://intervals.icu" target="_blank" rel="noreferrer" className="text-sky-600 dark:text-sky-400 underline font-bold">Intervals.icu</a>.</li>
          <li>Dirígete a <strong>Ajustes (Settings)</strong> en la barra lateral.</li>
          <li>En la sección <strong>Developer Settings</strong> (abajo del todo), copia tu <strong>API_KEY</strong>.</li>
          <li>Tu <strong>Athlete ID</strong> es el código que aparece en la URL de tu navegador (ej. <code className="font-mono bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">intervals.icu/athlete/i123456</code>).</li>
        </ol>
      </div>
    </div>
  );
};
