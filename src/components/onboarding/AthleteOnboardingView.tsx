"use client";

import React, { useState } from "react";
import { Zap, Watch, Calendar, ArrowRight, ShieldCheck, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { PulseLogo } from "../PulseLogo";

interface AthleteOnboardingViewProps {
  uid?: string;
  athleteName?: string;
  onExploreDashboard?: () => void;
}

export const AthleteOnboardingView: React.FC<AthleteOnboardingViewProps> = ({
  uid,
  athleteName = "Atleta",
  onExploreDashboard,
}) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleStartOAuth = () => {
    setIsRedirecting(true);
    if (typeof window !== "undefined") {
      const returnTo = window.location.pathname;
      window.location.href = `/api/auth/intervals/authorize?uid=${encodeURIComponent(uid || "")}&returnTo=${encodeURIComponent(returnTo)}`;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-8 space-y-4 sm:space-y-6 animate-in fade-in text-left">
      {/* Tarjeta Hero Principal de Onboarding */}
      <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-slate-900 p-4 sm:p-8 shadow-xl space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-3 sm:pb-4">
          <div className="flex items-center space-x-2.5">
            <PulseLogo size="sm" showSubtext={false} />
            <span className="text-xs font-bold text-slate-400">✕</span>
            <span className="text-xs font-black text-rose-600 tracking-tight">Intervals.icu</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-600 text-white shadow-xs uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Paso 1 de 3
          </span>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            ¡Bienvenido a PULSE AI, {athleteName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Para activar tu Head Coach IA y periodizar tus entrenamientos, el primer paso obligatorio es vincular tu telemetría deportiva a través de <strong>Intervals.icu</strong> (lectura de Garmin, Coros, Strava y sensores).
          </p>
        </div>

        {/* Roadmap de 3 Pasos */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 p-4 space-y-3.5 text-xs">
          <div className="flex items-start gap-3 text-emerald-700 dark:text-emerald-400">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Conectar tu cuenta de Intervals.icu (En curso)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Vínculo en 1 clic para importar historial biológico, umbrales y sincronizar workouts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 opacity-60 text-slate-500">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Sincronizar Garmin u otro Reloj
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Se habilitará en popup guiado inmediatamente después de autorizar Intervals.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 opacity-60 text-slate-500">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Diseñar tu Plan con el Head Coach IA
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Generación del macrociclo inteligente hacia tu objetivo deportivo.
              </p>
            </div>
          </div>
        </div>

        {/* Caja de Ayuda para Usuarios Nuevos */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="font-bold flex items-center space-x-1.5 text-amber-700 dark:text-amber-300">
            <Sparkles className="h-4 w-4" />
            <span>¿No tienes cuenta previa en Intervals.icu?</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            No te preocupes. Al pulsar el botón serás llevado a la ventana de Intervals. Si aún no tienes cuenta, pulsa en <strong>"¿No está registrado? Haga clic para registrarse"</strong> (se crea gratis en 5 segundos con Google o correo) y autorizas la conexión al instante.
          </p>
        </div>

        {/* CTA Principal de Conexión */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleStartOAuth}
            disabled={isRedirecting}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            <span>{isRedirecting ? "Redirigiendo a Intervals..." : "Conectar o Crear Cuenta en Intervals.icu (1 Clic)"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {onExploreDashboard && (
            <button
              type="button"
              onClick={onExploreDashboard}
              className="w-full text-center py-2 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            >
              Explorar el Dashboard en modo preliminar →
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 text-center px-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Conexión oficial cifrada mediante OAuth 2.0.</span>
        </div>
        <span className="hidden sm:inline">•</span>
        <span>No almacenamos tus contraseñas.</span>
      </div>
    </div>
  );
};
