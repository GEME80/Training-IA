"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Check, Info, ShieldCheck } from "lucide-react";

interface RecalibrationNoticeBannerProps {
  athleteId?: string;
  userStorage?: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
  };
}

export const RecalibrationNoticeBanner: React.FC<RecalibrationNoticeBannerProps> = ({
  athleteId,
  userStorage,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const storageKey = `notice_v5_modernization_dismissed_${athleteId || "default"}`;

  const storage = userStorage || (typeof window !== "undefined" ? window.localStorage : undefined);

  useEffect(() => {
    if (!storage) return;
    const isDismissed = storage.getItem(storageKey) === "true";
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, [storage, storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (storage) {
      storage.setItem(storageKey, "true");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-teal-500/40 bg-gradient-to-r from-teal-500/10 via-slate-900/90 to-emerald-500/10 p-3.5 sm:p-4 shadow-lg backdrop-blur-md animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 px-2 py-0.2 text-[9px] font-black uppercase tracking-wider">
                🔄 Motor Macrociclo v5.0
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Activación: Lunes 12 Oct
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              Tus entrenamientos incorporan el nuevo mix de <strong>series de pista por distancia</strong> (200m a 2000m) y <strong>fondos por tiempo</strong>, con rotación anti-monotonía. Tu fin de semana actual permanece intacto.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex items-center space-x-1.5 rounded-xl border border-teal-500/40 bg-teal-500/20 hover:bg-teal-500/30 text-teal-800 dark:text-teal-200 px-3 py-1.5 text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Entendido</span>
          </button>
        </div>
      </div>
    </div>
  );
};
