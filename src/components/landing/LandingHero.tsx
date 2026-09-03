"use client";

import React from "react";
import { Zap, Activity, RefreshCw, ArrowRight, LayoutDashboard } from "lucide-react";

interface LandingHeroProps {
  isAuthenticated: boolean;
  onLoginWithGoogle: () => void;
  onGoToDashboard?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  isAuthenticated,
  onLoginWithGoogle,
  onGoToDashboard,
}) => {
  return (
    <section className="relative pt-16 pb-16 sm:pt-24 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto text-center">
      {/* Ticker de Telemetría Dinámica Superior */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-cyan-200 text-xs font-mono text-cyan-950 shadow-xs mb-8 backdrop-blur-md">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        <span>⚡ 332W Stryd CP</span>
        <span>•</span>
        <span>📈 Estado Físico Óptimo</span>
        <span>•</span>
        <span>🔋 +12 Frescura Biológica</span>
        <span>•</span>
        <span>📐 Progresión Segura</span>
      </div>

      {/* Titular Principal de Alto Impacto */}
      <h1 className="text-slate-950 font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight max-w-5xl mx-auto leading-[1.12]">
        El Primer{" "}
        <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
          Head Coach Fisiológico Autónomo
        </span>{" "}
        para Atletas de Resistencia
      </h1>

      {/* Subtítulo enfocado en beneficios y claridad */}
      <p className="mt-6 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
        Entrena con precisión científica. Un ecosistema inteligente que calcula tu fatiga en tiempo real, prescribe potencia exacta y reajusta cada sesión automáticamente con{" "}
        <strong className="text-slate-900 font-semibold">Google Gemini</strong>.
      </p>

      {/* CTA Principal Estandarizado */}
      <div className="mt-10 flex items-center justify-center">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={onGoToDashboard}
            className="flex items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <LayoutDashboard className="h-4 w-4 text-white" />
            <span>📊 Ir a mi Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onLoginWithGoogle}
            className="flex items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#ffffff"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#ffffff"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#ffffff"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#ffffff"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>✨ Iniciar con Google</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Insignias de Confianza Deportiva */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-xs backdrop-blur-xl">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>⚡ Potencia Stryd & Vatios FTP</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-xs backdrop-blur-xl">
          <Activity className="h-3.5 w-3.5 text-emerald-600" />
          <span>📈 Periodización Fisiológica Adaptativa</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-xs backdrop-blur-xl">
          <RefreshCw className="h-3.5 w-3.5 text-cyan-600" />
          <span>🔄 Sincronización Automática con tu Reloj</span>
        </div>
      </div>
    </section>
  );
};
