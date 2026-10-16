"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { OnboardingPathSelector } from "./onboarding/OnboardingPathSelector";

interface IntervalsOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAthleteId?: string;
  onSuccess?: (data: any) => void;
}

export const IntervalsOnboardingModal: React.FC<IntervalsOnboardingModalProps> = ({
  isOpen,
  onClose,
  initialAthleteId = "",
}) => {
  const [isConnectingOAuth, setIsConnectingOAuth] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartOAuth = () => {
    setIsConnectingOAuth(true);
    const returnTo = typeof window !== "undefined" ? window.location.pathname : "/";
    window.location.href = `/api/auth/intervals/authorize?uid=${encodeURIComponent(initialAthleteId || "")}&returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bienvenido a PULSE AI PRO
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Conexión directa en 1 clic con Intervals.icu
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contenido Limpio: Selector OAuth Oficial */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <OnboardingPathSelector
            onStartOAuth={handleStartOAuth}
            isConnectingOAuth={isConnectingOAuth}
          />
        </div>
      </div>
    </div>
  );
};
