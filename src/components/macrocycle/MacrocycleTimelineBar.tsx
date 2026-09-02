"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Check,
  RefreshCw,
  ChevronUp,
} from "lucide-react";
import { MacrocycleBlueprint, MacrocycleWeek } from "@/lib/physiology/macrocycle";

import { getMondayOfWeekStr } from "@/lib/dateUtils";

interface MacrocycleTimelineBarProps {
  blueprint: MacrocycleBlueprint;
  selectedIndex: number;
  onSelectWeek: (idx: number) => void;
  onSyncFullMacrocycle?: () => Promise<void>;
}

export const MacrocycleTimelineBar: React.FC<MacrocycleTimelineBarProps> = ({
  blueprint,
  selectedIndex,
  onSelectWeek,
  onSyncFullMacrocycle,
}) => {
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState<boolean>(false);
  const [isSyncingFull, setIsSyncingFull] = useState<boolean>(false);

  const weeks = blueprint.weeks || [];
  const maxTssInCycle = Math.max(...weeks.map((w) => w.targetTss || 300), 500);

  const todayFormatted = React.useMemo(() => {
    const d = new Date();
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  }, []);

  const currentMonStr = React.useMemo(() => getMondayOfWeekStr(), []);

  const getPhaseBadge = (phase: string, isRecoveryWeek?: boolean) => {
    if (isRecoveryWeek) {
      return {
        label: "Descarga 3:1",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
      };
    }
    switch (phase) {
      case "BASE_1":
      case "BASE_2":
        return { label: "Base Aeróbica", color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30" };
      case "BUILD":
        return { label: "Construcción", color: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30" };
      case "PEAK":
        return { label: "Pico de Forma", color: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30" };
      case "TAPER":
        return { label: "Taper (Puesta a Punto)", color: "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-500/15 dark:text-teal-400 dark:border-teal-500/30" };
      case "RACE_WEEK":
        return { label: "Competición", color: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30" };
      default:
        return { label: "Mantenimiento", color: "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/30" };
    }
  };

  if (!weeks.length) return null;

  return (
    <div className="card-gradient rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg">🎯</span>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide">
            Línea de Tiempo del Macrociclo ({weeks.length} Semanas)
          </h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Hoy: {todayFormatted}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-3 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              🟢 En curso
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              ⚪ Completada
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              ⏳ Pendiente
            </span>
          </div>

          {onSyncFullMacrocycle && (
            <button
              type="button"
              disabled={isSyncingFull}
              onClick={async () => {
                setIsSyncingFull(true);
                try {
                  await onSyncFullMacrocycle();
                } finally {
                  setIsSyncingFull(false);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-bold shadow-sm hover:shadow transition cursor-pointer disabled:opacity-50"
              title="Sincroniza todo el plan rector (las semanas del macrociclo) a tu calendario de Intervals.icu respetando tu configuración de días de entrenamiento y descanso."
            >
              {isSyncingFull ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Sincronizando Macrociclo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 dark:text-cyan-600" />
                  <span>Sincronizar Macrociclo Completo ({weeks.length} Sem)</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer border border-slate-200/80 dark:border-slate-700/80 hover:scale-105 active:scale-95 shadow-sm"
            title={isTimelineCollapsed ? "Maximizar Línea de Tiempo del Macrociclo" : "Minimizar Línea de Tiempo del Macrociclo"}
            aria-label={isTimelineCollapsed ? "Maximizar" : "Minimizar"}
          >
            <ChevronUp className={`h-4 w-4 transition-transform duration-200 ${isTimelineCollapsed ? "rotate-180 text-amber-500" : "text-slate-600 dark:text-slate-300"}`} />
          </button>
        </div>
      </div>

      {!isTimelineCollapsed && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 animate-fadeIn">
          {weeks.map((w, idx) => {
            const isSelected = selectedIndex === idx;
            const phaseBadge = getPhaseBadge(w.phase, w.isRecoveryWeek);

            const isCurrentWeek = w.startDate === currentMonStr || (blueprint.currentWeekIndex !== undefined && idx === blueprint.currentWeekIndex);
            const isPastWeek = w.startDate < currentMonStr && !isCurrentWeek;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectWeek(idx)}
                className={`relative rounded-xl p-2.5 border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-1.5 group shadow-sm ${
                  isSelected
                    ? "ring-2 ring-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-500/15 shadow-md scale-[1.02]"
                    : isCurrentWeek
                    ? "border-emerald-400 dark:border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500"
                    : isPastWeek
                    ? "border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 opacity-80 hover:opacity-100 hover:border-slate-300"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Sem {w.weekNumber}</span>
                  {isCurrentWeek ? (
                    <span className="flex h-2.5 w-2.5 relative" title="Semana Actual en Curso">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                  ) : isPastWeek ? (
                    <span className="flex items-center gap-0.5 text-slate-500" title="Semana Completada">
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 font-bold" />
                    </span>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-500/80" title="Semana Pendiente" />
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 block">
                    {w.targetTss ? `${w.targetTss} TSS` : "TSS N/A"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${w.isRecoveryWeek ? "bg-emerald-500" : isPastWeek ? "bg-slate-400" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(100, Math.max(15, ((w.targetTss || 200) / maxTssInCycle) * 100))}%` }}
                    />
                  </div>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold border truncate max-w-full ${phaseBadge.color}`}>
                    {phaseBadge.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
