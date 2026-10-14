"use client";

import React from "react";
import { ArrowRight, LayoutDashboard, CheckCircle2, Rocket, ShieldCheck } from "lucide-react";
import { HeroAthleteTelemetryCard } from "./HeroAthleteTelemetryCard";

interface HeroSectionProps {
  isAuthenticated: boolean;
  onOpenAuthModal?: (tab?: "login" | "register") => void;
  onLoginWithGoogle?: () => void;
  onGoToDashboard?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isAuthenticated,
  onOpenAuthModal,
  onLoginWithGoogle,
  onGoToDashboard,
}) => {
  return (
    <section className="relative py-10 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Columna A: Mensaje, Autoridad y Conversión (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Badge de Marca PULSE AI */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs">
            <div className="w-5 h-5 rounded-lg overflow-hidden shrink-0 border border-emerald-500/30">
              <img src="/pulse-icon.jpg" alt="PULSE AI" className="w-full h-full object-cover" />
            </div>
            <span>PULSE AI™ · Tu Entrenador Personal con Inteligencia Artificial (Google Gemini)</span>
          </div>

          {/* Titular Principal H1 (Claro, Humano y Enfocado) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
            Tu Head Coach Inteligente que{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Adapta tu Entrenamiento.
            </span>
          </h1>

          {/* Subtítulo Empático y Accesible para Cualquier Deportista */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl">
            Entrena según tu vida real, sin sentirte culpable. Prescribe ritmos y vatios exactos para tu nivel, calcula tu recuperación al despertar por HRV (Variabilidad de la Frecuencia Cardíaca) y envía las series directo a tu reloj deportivo (Garmin, Coros o Apple Watch). Sin hojas de cálculo. Sin sobreentrenamiento.
          </p>

          {/* Checks Rápidos de Validación con Explicación de Siglas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
              <span>Sincronizado a Garmin, Coros & Strava</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
              <span>Ajuste diario según tu recuperación (HRV)</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
              <span>Ritmos personalizados (Fórmula VDOT)</span>
            </span>
          </div>

          {/* Llamado a la Acción (CTA Dinámico) */}
          <div className="pt-2">
            {isAuthenticated && onGoToDashboard ? (
              <button
                type="button"
                onClick={onGoToDashboard}
                className="w-full sm:w-auto h-12 inline-flex items-center justify-center space-x-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-8 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
                <span>Ir a mi Dashboard</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => (onOpenAuthModal ? onOpenAuthModal("register") : onLoginWithGoogle?.())}
                    className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Rocket className="w-4 h-4" strokeWidth={1.75} />
                    <span>Diseñar Mi Plan Adaptativo Gratis (7 Días)</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>

                  <button
                    type="button"
                    onClick={() => (onOpenAuthModal ? onOpenAuthModal("login") : onLoginWithGoogle?.())}
                    className="px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-800 dark:text-slate-100 font-semibold text-sm transition-all cursor-pointer text-center"
                  >
                    Iniciar Sesión
                  </button>
                </div>

                {/* Micro-copy de Reducción de Riesgo (Risk Reversal) */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
                    Sin tarjeta de crédito requerida
                  </span>
                  <span>•</span>
                  <span>Sincroniza en 60 segundos con tu reloj</span>
                  <span>•</span>
                  <span>Cancela cuando quieras en 1 clic</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna B: Video Deportivo con Telemetría HUD (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <HeroAthleteTelemetryCard />
        </div>
      </div>
    </section>
  );
};
