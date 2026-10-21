"use client";

import React, { useState } from "react";
import { Zap, ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";

interface OnboardingBannerProps {
  uid?: string;
  onOpenOnboarding?: () => void;
}

export const OnboardingBanner: React.FC<OnboardingBannerProps> = ({ uid, onOpenOnboarding }) => {
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const handleConnect = () => {
    setIsRedirecting(true);
    if (typeof window !== "undefined") {
      const returnTo = window.location.pathname;
      window.location.href = `/api/auth/intervals/authorize?uid=${encodeURIComponent(uid || "")}&returnTo=${encodeURIComponent(returnTo)}`;
    } else if (onOpenOnboarding) {
      onOpenOnboarding();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-50/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900/40 px-4 py-2.5 sm:py-3 shadow-xs backdrop-blur-xs animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Lado Izquierdo: Mensaje conciso y badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                1er Paso
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                Conecta tu reloj deportivo con Intervals.icu
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
              Sincroniza Garmin Connect en 1 solo clic para activar tu telemetría biológica y prescripción inteligente.
            </p>
          </div>
        </div>

        {/* Lado Derecho: Botón directo de 1 Clic */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end md:justify-center">
          <button
            type="button"
            onClick={handleConnect}
            disabled={isRedirecting}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{isRedirecting ? "Conectando..." : "Conectar en 1 Clic"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
