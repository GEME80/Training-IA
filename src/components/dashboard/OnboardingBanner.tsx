"use client";

import React from "react";
import { Zap } from "lucide-react";

interface OnboardingBannerProps {
  onOpenOnboarding: () => void;
}

export const OnboardingBanner: React.FC<OnboardingBannerProps> = ({ onOpenOnboarding }) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-cyan-50/80 border border-cyan-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
      <div className="flex items-center space-x-3.5">
        <div className="h-10 w-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 font-bold">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Conecta tu cuenta de Intervals.icu (Modalidad B)
          </h2>
          <p className="text-xs text-slate-600">
            Vincula tu Athlete ID y tu clave API para sincronizar tu telemetría biológica y cargar tus planes de entrenamiento.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenOnboarding}
        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm shrink-0 cursor-pointer"
      >
        Conectar Ahora (Paso a Paso)
      </button>
    </div>
  );
};
