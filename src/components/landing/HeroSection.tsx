"use client";

import React from "react";
import { ArrowRight, LayoutDashboard, Sparkles, CheckCircle2 } from "lucide-react";

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
    <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
      {/* Insignia Sutil de Posicionamiento */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-[11px] font-mono font-bold text-emerald-800 mb-6 backdrop-blur-sm shadow-2xs">
        <Sparkles className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
        <span>Entrenamiento Fisiológico Adaptativo con Google Gemini</span>
      </div>

      {/* Titular Principal */}
      <h1 className="text-slate-950 font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12] max-w-4xl mx-auto">
        El Primer{" "}
        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Head Coach Fisiológico Autónomo
        </span>{" "}
        para Atletas de Resistencia
      </h1>

      {/* Subtítulo Claro y Fisiológico */}
      <p className="mt-6 text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
        Prescribe vatios exactos, evalúa tu fatiga matutina (HRV/TSB) y reajusta cada microciclo automáticamente en 0.2s. Sin planes rígidos de papel. Sin sobreentrenamiento.
      </p>

      {/* Micro-propuestas de valor */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
          Sincronización con Garmin & Coros
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
          Cap Biomecánico de 3h para Maratón
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
          Potencia Stryd y FTP Coggan
        </span>
      </div>

      {/* Acceso al Dashboard o Registro para Atletas */}
      {isAuthenticated && onGoToDashboard ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onGoToDashboard}
            className="w-full sm:w-auto h-12 min-h-[48px] inline-flex items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 px-8 text-sm font-black text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <LayoutDashboard className="h-4 w-4 text-white" strokeWidth={1.75} />
            <span>Ir a mi Dashboard</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={() => (onOpenAuthModal ? onOpenAuthModal("register") : onLoginWithGoogle?.())}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>Probar Gratis (7 Días)</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => (onOpenAuthModal ? onOpenAuthModal("login") : onLoginWithGoogle?.())}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-2xs hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>Iniciar Sesión</span>
          </button>
        </div>
      )}
    </section>
  );
};
