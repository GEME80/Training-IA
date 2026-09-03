"use client";

import React from "react";
import { ArrowRight, LayoutDashboard } from "lucide-react";

interface LandingCtaSectionProps {
  isAuthenticated: boolean;
  onOpenAuthModal?: (tab?: "login" | "register") => void;
  onLoginWithGoogle?: () => void;
  onGoToDashboard?: () => void;
}

export const LandingCtaSection: React.FC<LandingCtaSectionProps> = ({
  isAuthenticated,
  onOpenAuthModal,
  onLoginWithGoogle,
  onGoToDashboard,
}) => {
  return (
    <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto text-center w-full">
      <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-cyan-50/90 via-white to-emerald-50/90 border border-cyan-200/90 shadow-xl shadow-cyan-500/5 space-y-6 backdrop-blur-xl">
        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Eleva tu Rendimiento con Inteligencia Fisiológica
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Únete a la plataforma de entrenamiento adaptativo que combina la ciencia deportiva de élite con el poder de razonamiento de <strong className="text-slate-900 font-semibold">Google Gemini</strong>.
        </p>
        <div className="pt-3 flex items-center justify-center">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={onGoToDashboard}
              className="inline-flex items-center space-x-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4 text-white" />
              <span>📊 Ir a mi Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (onOpenAuthModal ? onOpenAuthModal("register") : onLoginWithGoogle?.())}
              className="inline-flex items-center space-x-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>Comenzar Ahora • Solicitar Acceso</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
