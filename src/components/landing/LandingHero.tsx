"use client";

import React from "react";
import { ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";

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
    <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
      {/* Insignia Sutil de Posicionamiento */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50/80 border border-cyan-200/80 text-[11px] font-mono font-bold text-cyan-800 mb-6 backdrop-blur-sm">
        <Sparkles className="h-3 w-3 text-cyan-600" />
        <span>Entrenamiento de Resistencia Adaptativo con Google Gemini</span>
      </div>

      {/* Titular Principal Minimalista que Respira */}
      <h1 className="text-slate-950 font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12] max-w-4xl mx-auto">
        El Primer{" "}
        <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
          Head Coach Fisiológico Autónomo
        </span>{" "}
        para Atletas de Resistencia
      </h1>

      {/* Subtítulo Ágil y Claro */}
      <p className="mt-6 text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
        Prescribe vatios exactos, calcula tu fatiga real cada mañana con tu variabilidad cardíaca (HRV) y reajusta cada microciclo automáticamente. Sin planes rígidos de papel. Sin sobreentrenamiento.
      </p>

      {/* Acceso exclusivo al Dashboard si el atleta ya está autenticado */}
      {isAuthenticated && onGoToDashboard && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onGoToDashboard}
            className="w-full sm:w-auto h-12 min-h-[48px] inline-flex items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 px-8 text-sm font-black text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <LayoutDashboard className="h-4 w-4 text-white" />
            <span>Ir a mi Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
};
