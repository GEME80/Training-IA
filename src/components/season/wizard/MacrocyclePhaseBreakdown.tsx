"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Activity, ShieldCheck, Flame, Zap, Award } from "lucide-react";
import { MacrocycleWeek } from "@/lib/physiology/macrocycle";

interface MacrocyclePhaseBreakdownProps {
  weeks: MacrocycleWeek[];
  planTitle?: string;
  primaryRaceName?: string;
}

export const MacrocyclePhaseBreakdown: React.FC<MacrocyclePhaseBreakdownProps> = ({
  weeks,
  planTitle,
  primaryRaceName,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!weeks || weeks.length === 0) return null;

  const totalWeeks = weeks.length;

  // Agrupamos semanas por fase
  const phaseGroups = React.useMemo(() => {
    const groups: {
      phase: string;
      label: string;
      startWeek: number;
      endWeek: number;
      weeksCount: number;
      totalTss: number;
      avgTss: number;
      minTss: number;
      maxTss: number;
      maxLongRun: number;
      focusSummary: string;
    }[] = [];

    weeks.forEach((w) => {
      const last = groups[groups.length - 1];
      const pLabel = w.phaseLabel || (
        w.phase.includes("BASE") ? "Fase 1: Base Aeróbica" :
        w.phase.includes("BUILD") ? "Fase 2: Construcción & Umbral" :
        w.phase.includes("PEAK") ? "Fase 3: Pico & Simulación" :
        w.phase.includes("TAPER") ? "Fase 4: Tapering & Puesta a Punto" :
        "Semana de Competición"
      );

      const tss = w.targetTss || 250;
      if (!last || last.phase !== w.phase) {
        groups.push({
          phase: w.phase,
          label: pLabel,
          startWeek: w.weekNumber,
          endWeek: w.weekNumber,
          weeksCount: 1,
          totalTss: tss,
          avgTss: tss,
          minTss: tss,
          maxTss: tss,
          maxLongRun: w.maxLongRunMinutes || 0,
          focusSummary: w.focusDescription || "Desarrollo de resistencia específica y adaptaciones fisiológicas.",
        });
      } else {
        last.endWeek = w.weekNumber;
        last.weeksCount += 1;
        last.totalTss = (last.totalTss || last.avgTss * (last.weeksCount - 1)) + tss;
        last.avgTss = Math.round(last.totalTss / last.weeksCount);
        if (tss < (last.minTss ?? tss)) last.minTss = tss;
        if (tss > (last.maxTss ?? tss)) last.maxTss = tss;
        if ((w.maxLongRunMinutes || 0) > last.maxLongRun) last.maxLongRun = w.maxLongRunMinutes || 0;
      }
    });

    return groups;
  }, [weeks]);

  const getPhaseIcon = (phase: string) => {
    if (phase.includes("BASE")) return ShieldCheck;
    if (phase.includes("BUILD")) return Zap;
    if (phase.includes("PEAK")) return Flame;
    if (phase.includes("TAPER")) return Activity;
    return Award;
  };

  const getPhaseColorClass = (phase: string) => {
    if (phase.includes("BASE")) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
    if (phase.includes("BUILD")) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
    if (phase.includes("PEAK")) return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800";
    if (phase.includes("TAPER")) return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800";
    return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800";
  };

  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              Estructura y Descripción por Fases ({phaseGroups.length} Fases · {totalWeeks} Semanas)
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Objetivos fisiológicos, progresiones de volumen y asimilación de carga estilo Palladino
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
          <span>{isExpanded ? "Ocultar" : "Ver Fases"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3.5 pb-3.5 space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3 animate-fadeIn">
          {phaseGroups.map((grp, idx) => {
            const Icon = getPhaseIcon(grp.phase);
            const colorClass = getPhaseColorClass(grp.phase);

            return (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${colorClass}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white">
                        {grp.label}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Semanas {grp.startWeek} a {grp.endWeek} ({grp.weeksCount} {grp.weeksCount === 1 ? "semana" : "semanas"})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold" title="Carga promedio semanal de la fase">
                      Media: ~{grp.avgTss} TSS
                    </span>
                    {grp.maxTss > grp.avgTss && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/25" title="Semana con carga cumbre en esta fase">
                        Pico: {grp.maxTss} TSS
                      </span>
                    )}
                    {grp.maxLongRun > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                        Fondo: {grp.maxLongRun} min
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans pl-8">
                  {grp.focusSummary}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
