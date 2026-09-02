"use client";

import React from "react";
import { Zap, CheckCircle2, AlertCircle } from "lucide-react";

export interface OnboardingTestResult {
  success: boolean;
  message: string;
  athleteName?: string;
  athleteId?: string;
  city?: string;
  runFtp?: number;
  bikeFtp?: number;
  restingHR?: number;
  maxHR?: number;
  lthr?: number;
  weight?: number;
}

interface OnboardingStepVerifyProps {
  athleteId: string;
  apiKey: string;
  isValidating: boolean;
  testResult: OnboardingTestResult | null;
  onVerify: () => void;
}

export const OnboardingStepVerify: React.FC<OnboardingStepVerifyProps> = ({
  athleteId,
  apiKey,
  isValidating,
  testResult,
  onVerify,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center space-x-2">
        <div className="h-7 w-7 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
          3
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Verificación de Conexión & Sincronización en Vivo
        </h3>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Vamos a comprobar la autenticación con tu cuenta de Intervals.icu para leer tus vatios de umbral, Stryd CP, FTP de ciclismo y frecuencias cardíacas.
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Athlete ID</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{athleteId || "No ingresado"}</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Clave API</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{apiKey ? "••••••••••••••••" : "No ingresada"}</span>
          </div>
        </div>

        {/* Botón de Test */}
        <button
          type="button"
          onClick={onVerify}
          disabled={isValidating || !athleteId || !apiKey}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
        >
          <Zap className={`h-4 w-4 text-cyan-400 dark:text-cyan-600 ${isValidating ? "animate-spin" : ""}`} />
          <span>{isValidating ? "Verificando con Intervals.icu..." : "Probar y Vincular Cuenta"}</span>
        </button>
      </div>

      {/* Resultado del Test */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border transition-all animate-in fade-in ${
            testResult.success
              ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300"
              : "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300"
          }`}
        >
          <div className="flex items-start space-x-3">
            {testResult.success ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-2 text-xs flex-1">
              <p className="font-semibold">{testResult.message}</p>

              {testResult.success && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/70 dark:border-emerald-800/60 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase">Atleta</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{testResult.athleteName}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase">⚡ Stryd CP</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{testResult.runFtp ? `${testResult.runFtp} W` : "Detectando..."}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase">🚴 Bike FTP</span>
                    <strong className="text-cyan-700 dark:text-cyan-400 font-bold">{testResult.bikeFtp ? `${testResult.bikeFtp} W` : "Detectando..."}</strong>
                  </div>
                  {testResult.restingHR && (
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800">
                      <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase">❤️ FC Reposo</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">{testResult.restingHR} bpm</strong>
                    </div>
                  )}
                  {testResult.weight && (
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800">
                      <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase">⚖️ Peso</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">{testResult.weight} kg</strong>
                    </div>
                  )}
                  {testResult.city && (
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800">
                      <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase">📍 Ubicación</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">{testResult.city}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
