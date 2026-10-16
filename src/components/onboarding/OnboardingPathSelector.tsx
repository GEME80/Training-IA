"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface OnboardingPathSelectorProps {
  onSelectPath?: (path: "new" | "existing") => void;
  onStartOAuth?: () => void;
  isConnectingOAuth?: boolean;
}

export const OnboardingPathSelector: React.FC<OnboardingPathSelectorProps> = ({
  onStartOAuth,
  isConnectingOAuth = false,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in text-left">
      <div className="text-center space-y-1 pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Conecta tu Telemetría y Reloj Deportivo
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          PULSE AI se sincroniza con <strong>Intervals.icu</strong> para leer los entrenamientos de tu reloj (Garmin, Coros, Polar, Strava) y enviarte tus sesiones prescritas.
        </p>
      </div>

      {/* Opción Única: Conexión OAuth 1-Clic Oficial */}
      <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-b from-emerald-50/70 to-white dark:from-emerald-950/20 dark:to-slate-900 shadow-md space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Zap className="h-5 w-5" />
          </div>
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Conexión Oficial • 1 Clic
          </span>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Conexión Oficial con Intervals.icu
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            Sin claves raras ni IDs técnicos. Autorización directa en 1 clic para leer tu reloj deportivo y sincronizar entrenamientos.
          </p>
        </div>

        <div className="rounded-xl p-3 bg-amber-500/10 border border-amber-500/20 text-left space-y-1">
          <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <span>💡 ¿No tienes cuenta en Intervals todavía?</span>
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-200/90 leading-relaxed">
            Al pulsar el botón serás llevado a Intervals. Si aún no tienes cuenta, haz clic en <strong>"¿No está registrado? Haga clic para registrarse"</strong> (toma 5 segundos con Google) y autorizas la conexión de inmediato.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartOAuth}
          disabled={isConnectingOAuth}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          <span>{isConnectingOAuth ? "Conectando con Intervals..." : "Conectar o Crear Cuenta en Intervals.icu"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span>Credenciales protegidas con cifrado simétrico militar AES-256-GCM.</span>
      </div>
    </div>
  );
};
