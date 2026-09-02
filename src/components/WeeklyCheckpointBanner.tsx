"use client";

import React from "react";
import { ArrowRight, X } from "lucide-react";
import { PhysiologicalStatus } from "@/lib/physiology/engine";

interface WeeklyCheckpointBannerProps {
  completedWeekNumber?: number;
  activeWeekNumber?: number;
  physioStatus: PhysiologicalStatus | null;
  onOpenCoachChat: () => void;
  onDismiss?: () => void;
}

export const WeeklyCheckpointBanner: React.FC<WeeklyCheckpointBannerProps> = ({
  completedWeekNumber = 1,
  activeWeekNumber = 2,
  physioStatus,
  onOpenCoachChat,
  onDismiss,
}) => {
  const atl = physioStatus?.atl ? Number(physioStatus.atl).toFixed(1) : "—";
  const tsb = physioStatus?.tsb !== undefined ? Number(physioStatus.tsb).toFixed(1) : "—";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-50 via-white to-cyan-50 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-cyan-500/15 p-4 sm:p-5 shadow-lg transition-all duration-300 animate-fadeIn">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-6 -ml-6 h-32 w-32 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Info & Icon */}
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-black text-xl shadow-md shadow-amber-500/25">
            🧠
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                Punto de Control Fisiológico
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <span>📡</span>
                <strong className="text-emerald-700 dark:text-emerald-400">Intervals.icu Sincronizado</strong>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide">
              La Semana {completedWeekNumber} ha concluido. Tu fatiga (⚡ ATL: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{atl}</span>) y forma (🔋 TSB: <span className="font-mono font-bold text-teal-700 dark:text-cyan-400">{tsb}</span>) están listas.
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              ¿Listo para el dictamen del Head Coach y la propuesta adaptativa para la <strong>Semana {activeWeekNumber}</strong>?
            </p>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-xl border border-slate-200 bg-white dark:border-slate-700/80 dark:bg-slate-800/80 p-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shadow-sm"
              title="Cerrar aviso temporalmente"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCoachChat}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-5 py-2.5 text-xs font-black text-black shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            <span className="text-sm">💬</span>
            <span>Abrir Dictamen del Head Coach</span>
            <ArrowRight className="h-4 w-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
};
