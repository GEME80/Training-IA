"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Activity, ShieldCheck, Flame, Zap, Award } from "lucide-react";
import { MacrocycleWeek } from "@/lib/physiology/macrocycle";
import { sanitizePhaseDescription, formatLongRunDuration } from "@/lib/utils/phaseFormattingUtils";

interface MacrocyclePhaseBreakdownProps {
  weeks: MacrocycleWeek[];
  planTitle?: string;
  primaryRaceName?: string;
  activeWeekNumber?: number;
}

export const MacrocyclePhaseBreakdown: React.FC<MacrocyclePhaseBreakdownProps> = ({
  weeks,
  activeWeekNumber,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [expandedSecondaryPhases, setExpandedSecondaryPhases] = useState<Record<string, boolean>>({});

  if (!weeks || weeks.length === 0) return null;

  const totalWeeks = weeks.length;
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Determinación defensiva de la semana activa en curso (prop o fecha actual)
  const currentWeekNumber = useMemo(() => {
    if (typeof activeWeekNumber === "number" && activeWeekNumber > 0) {
      return activeWeekNumber;
    }
    const matched = weeks.find((w) => todayStr >= w.startDate && todayStr <= w.endDate);
    if (matched) return matched.weekNumber;
    if (weeks[0] && todayStr < weeks[0].startDate) return weeks[0].weekNumber;
    return weeks[weeks.length - 1]?.weekNumber || 1;
  }, [weeks, activeWeekNumber, todayStr]);

  // Agrupación de semanas consecutivas por fase fisiológica
  const phaseGroups = useMemo(() => {
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

  const toggleSecondaryPhase = (phaseKey: string) => {
    setExpandedSecondaryPhases((prev) => ({
      ...prev,
      [phaseKey]: !prev[phaseKey],
    }));
  };

  const getPhaseIcon = (phase: string) => {
    if (phase.includes("BASE")) return ShieldCheck;
    if (phase.includes("BUILD")) return Zap;
    if (phase.includes("PEAK")) return Flame;
    if (phase.includes("TAPER")) return Activity;
    return Award;
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
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                Estructura y Descripción por Fases ({phaseGroups.length} Fases · {totalWeeks} Semanas)
              </h4>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                Semana {currentWeekNumber} Activa
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Objetivos fisiológicos, progresión atlética y asimilación de carga
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
          <span>{isExpanded ? "Ocultar" : "Ver Fases"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-2.5 animate-fadeIn">
          {phaseGroups.map((grp, idx) => {
            const Icon = getPhaseIcon(grp.phase);
            const isCurrentPhase = currentWeekNumber >= grp.startWeek && currentWeekNumber <= grp.endWeek;
            const phaseKey = `${grp.phase}-${idx}`;
            const isSecondaryOpen = !!expandedSecondaryPhases[phaseKey];
            const cleanDescription = sanitizePhaseDescription(grp.label, grp.focusSummary);

            if (isCurrentPhase) {
              return (
                <div
                  key={phaseKey}
                  className="p-3 sm:p-3.5 rounded-xl border border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20 shadow-xs space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">
                            {grp.label}
                          </h5>
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[9px] font-black uppercase tracking-wider">
                            📍 En Curso
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                          Semanas {grp.startWeek} a {grp.endWeek} ({grp.weeksCount} {grp.weeksCount === 1 ? "semana" : "semanas"})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono tabular-nums">
                      <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-500/20 text-slate-700 dark:text-slate-200 font-bold">
                        Media: ~{grp.avgTss} TSS
                      </span>
                      {grp.maxTss > grp.avgTss && (
                        <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                          Pico: {grp.maxTss} TSS
                        </span>
                      )}
                      {grp.maxLongRun > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black shadow-xs">
                          Fondo: {formatLongRunDuration(grp.maxLongRun)}
                        </span>
                      )}
                    </div>
                  </div>

                  {cleanDescription && (
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans pl-8 sm:pl-9 border-l-2 border-emerald-500/40 ml-1">
                      {cleanDescription}
                    </p>
                  )}
                </div>
              );
            }

            return (
              <div
                key={phaseKey}
                className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/30 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleSecondaryPhase(phaseKey)}
                  className="w-full flex flex-wrap items-center justify-between p-2.5 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition cursor-pointer text-left gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {grp.label}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Semanas {grp.startWeek} a {grp.endWeek} ({grp.weeksCount} sem)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      <span className="hidden sm:inline font-bold">~{grp.avgTss} TSS</span>
                      {grp.maxLongRun > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/60 dark:border-slate-700">
                          Fondo: {formatLongRunDuration(grp.maxLongRun)}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 dark:text-slate-500">
                      {isSecondaryOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </button>

                {isSecondaryOpen && cleanDescription && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/60 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      <span>Carga media: ~{grp.avgTss} TSS</span>
                      {grp.maxTss > grp.avgTss && <span>· Pico: {grp.maxTss} TSS</span>}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans pl-2 border-l border-slate-200 dark:border-slate-700">
                      {cleanDescription}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
