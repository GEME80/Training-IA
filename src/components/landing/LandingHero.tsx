"use client";

import React from "react";
import {
  Zap,
  Activity,
  RefreshCw,
  ArrowRight,
  LayoutDashboard,
  TrendingUp,
  BatteryCharging,
  Compass,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface LandingHeroProps {
  isAuthenticated: boolean;
  onOpenAuthModal?: (tab?: "login" | "register") => void;
  onLoginWithGoogle?: () => void;
  onGoToDashboard?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  isAuthenticated,
  onOpenAuthModal,
  onLoginWithGoogle,
  onGoToDashboard,
}) => {
  return (
    <section className="relative pt-16 pb-14 sm:pt-24 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center">
      {/* Ticker de Telemetría Dinámica con Iconos Vectoriales */}
      <div className="inline-flex flex-wrap items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-cyan-200 text-xs font-mono text-cyan-950 shadow-xs mb-8 backdrop-blur-md">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-500" />
          <span>332W Stryd CP</span>
        </span>
        <span className="text-slate-300">•</span>
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-emerald-600" />
          <span>Forma Óptima</span>
        </span>
        <span className="text-slate-300">•</span>
        <span className="flex items-center gap-1">
          <BatteryCharging className="h-3 w-3 text-cyan-600" />
          <span>+12 Frescura</span>
        </span>
        <span className="text-slate-300">•</span>
        <span className="flex items-center gap-1">
          <Compass className="h-3 w-3 text-teal-600" />
          <span>Rampa Segura</span>
        </span>
      </div>

      {/* Titular Principal de Alto Impacto */}
      <h1 className="text-slate-950 font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight max-w-5xl mx-auto leading-[1.12]">
        El Primer{" "}
        <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
          Head Coach Fisiológico Autónomo
        </span>{" "}
        para Atletas de Resistencia
      </h1>

      {/* Subtítulo enfocado en beneficios claros */}
      <p className="mt-6 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
        Prescripción milimétrica por vatios, control diario de fatiga con HRV y periodización adaptativa con{" "}
        <strong className="text-slate-900 font-semibold">Google Gemini</strong>. Sin plantillas estáticas de papel. Sin sobreentrenamiento.
      </p>

      {/* CTAs con Micro-Copy de Cero Fricción */}
      <div className="mt-10 flex flex-col items-center justify-center gap-3">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={onGoToDashboard}
            className="flex items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <LayoutDashboard className="h-4 w-4 text-white" />
            <span>Ir a mi Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
            <button
              type="button"
              onClick={() => (onOpenAuthModal ? onOpenAuthModal("register") : onLoginWithGoogle?.())}
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>Registrarme como Atleta</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => (onOpenAuthModal ? onOpenAuthModal("login") : onLoginWithGoogle?.())}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 px-6 py-3.5 text-sm font-bold text-slate-800 shadow-xs hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>Iniciar Sesión</span>
            </button>
          </div>
        )}

        {/* Micro-copy de Confianza sin Fricción */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Acceso seguro con Google • Sin tarjeta de crédito requerida • Compatible con tu reloj</span>
        </div>
      </div>

      {/* Insignias de Confianza Deportiva con Iconos Vectoriales */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-xs backdrop-blur-xl">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>Potencia Stryd & Vatios FTP</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-xs backdrop-blur-xl">
          <Activity className="h-3.5 w-3.5 text-emerald-600" />
          <span>Periodización Fisiológica Adaptativa</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-xs backdrop-blur-xl">
          <RefreshCw className="h-3.5 w-3.5 text-cyan-600" />
          <span>Sincronización Automática con Reloj</span>
        </div>
      </div>
    </section>
  );
};
