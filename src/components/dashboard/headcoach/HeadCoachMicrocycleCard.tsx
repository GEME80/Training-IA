"use client";

import React, { useState } from "react";
import {
  Footprints,
  Bike,
  Dumbbell,
  Moon,
  Sparkles,
  Zap,
  Clock,
  Info,
} from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { HeadCoachWorkoutBlockChart } from "./HeadCoachWorkoutBlockChart";

interface HeadCoachMicrocycleCardProps {
  plan: PlanItem[];
  weekNumber: number;
  onApplyAndSync?: (plan: PlanItem[]) => Promise<void>;
  isApplying?: boolean;
}

const CANONICAL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function gymShortDesc(workoutDoc?: string, focus?: string): string {
  if (focus && focus.length > 3) return focus;
  if (!workoutDoc) return "Fortalecimiento neuromuscular";
  const lines = workoutDoc.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#") && !l.startsWith("---"));
  const first = lines[0] || "";
  return first.length > 50 ? first.slice(0, 47) + "…" : first;
}

export const HeadCoachMicrocycleCard: React.FC<HeadCoachMicrocycleCardProps> = ({
  plan,
  weekNumber,
}) => {
  const [expandedCardKey, setExpandedCardKey] = useState<string | null>(null);

  const totalTss = plan.reduce((acc, p) => acc + (p.tss || 0), 0);
  const totalMinutes = plan.reduce((acc, p) => acc + (p.durationMinutes || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;
  const isContinuityPlan = plan.every((p) => p.action === "MANTENER" || p.discipline === "Descanso");

  const getDisciplineIcon = (disc: string) => {
    switch (disc) {
      case "Carrera":
        return <Footprints className="h-3.5 w-3.5 text-emerald-500" />;
      case "Ciclismo":
        return <Bike className="h-3.5 w-3.5 text-sky-500" />;
      case "Fuerza":
        return <Dumbbell className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <Moon className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const getActionBadge = (item: PlanItem) => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (item.justification?.includes("Historial inmutable") || (item.date && item.date < todayStr)) {
      return (
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shrink-0 truncate max-w-[65px]"
          title="Historial inmutable"
        >
          Historial
        </span>
      );
    }
    if (item.discipline === "Descanso" || (item.tss === 0 && item.durationMinutes === 0)) {
      return (
        <span
          className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0 truncate max-w-[65px]"
          title="Descanso"
        >
          Descanso
        </span>
      );
    }
    if (item.action === "MODIFICAR" || item.action === "REDUCIR_INTENSIDAD") {
      return (
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0 truncate max-w-[65px]"
          title="Modificado"
        >
          Adaptado
        </span>
      );
    }
    return (
      <span
        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0 truncate max-w-[65px]"
        title="En Plan"
      >
        Confirmado
      </span>
    );
  };

  // Agrupamiento canónico por los 7 días de la semana
  const daysGrouped = CANONICAL_DAYS.map((dayName) => {
    const daySessions = plan.filter(
      (p) => p.day?.toLowerCase() === dayName.toLowerCase() ||
             p.day?.toLowerCase().startsWith(dayName.slice(0, 3).toLowerCase())
    );
    const primaryDate = daySessions.find((s) => s.formattedDate)?.formattedDate || "";
    const dayTotalTss = daySessions.reduce((acc, s) => acc + (s.tss || 0), 0);
    return {
      dayName,
      shortName: dayName.slice(0, 3),
      formattedDate: primaryDate,
      sessions: daySessions,
      dayTotalTss,
    };
  });

  return (
    <div className="my-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-white via-emerald-50/15 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 shadow-md p-3.5 sm:p-5 space-y-4">
      {/* Cabecera de la Tarjeta del Microciclo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
              <span>Propuesta de Microciclo: Semana {weekNumber}</span>
              <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                isContinuityPlan
                  ? "text-teal-700 dark:text-teal-300 bg-teal-500/10 border-teal-500/20"
                  : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              }`}>
                {isContinuityPlan ? "Plan Confirmado" : "Adaptación Activa"}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              7 días estructurados con vatios a % FTP/CP listos para el calendario.
            </p>
          </div>
        </div>

        {/* Resumen Métrico de la Semana */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            {totalTss} TSS
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            {timeFormatted}
          </span>
        </div>
      </div>

      {/* Indicador de Visualización & Guía */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-0.5">
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-emerald-500" />
          <span className="hidden lg:inline">Semana completa visible (7 días fijos de Lunes a Domingo)</span>
          <span className="lg:hidden">Desliza o toca cada día</span>
        </span>
        <span>Toca cualquier sesión para expandir</span>
      </div>

      {/* Rejilla Canónica de 7 Días (Sesiones dobles apiladas limpiamente dentro de su columna) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pb-2 pt-1 px-0.5 items-start">
        {daysGrouped.map((dayGroup, dayIdx) => {
          const hasSessions = dayGroup.sessions.length > 0;

          return (
            <div
              key={dayIdx}
              className="flex flex-col gap-2 rounded-xl p-2 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 min-h-[140px]"
            >
              {/* Cabecera de Columna de Día */}
              <div className="flex items-center justify-between px-1 pb-1.5 border-b border-slate-200/70 dark:border-slate-800/80">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-black text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    {dayGroup.shortName}
                  </span>
                  {dayGroup.formattedDate && (
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      • {dayGroup.formattedDate}
                    </span>
                  )}
                </div>
                {dayGroup.dayTotalTss > 0 ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {dayGroup.dayTotalTss} TSS
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                    0 TSS
                  </span>
                )}
              </div>

              {/* Sesiones del Día */}
              {!hasSessions ? (
                <div className="flex-1 rounded-lg p-3 bg-white/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-1 text-slate-400 py-6">
                  <Moon className="h-4 w-4 text-slate-400/80" />
                  <span className="text-[10px] font-medium">Descanso</span>
                </div>
              ) : (
                dayGroup.sessions.map((item, sIdx) => {
                  const cardKey = `${dayGroup.dayName}-${sIdx}`;
                  const isExpanded = expandedCardKey === cardKey;
                  const isGym = item.discipline === "Fuerza";
                  const isRest = item.discipline === "Descanso" || (item.tss === 0 && item.durationMinutes === 0);

                  // ── TARJETA ESPECIALIZADA DE FUERZA (ESTILO GYM PURPLE) ──
                  if (isGym) {
                    const gymDesc = gymShortDesc(item.workoutDoc, item.powerTarget || item.focus);
                    return (
                      <div
                        key={sIdx}
                        onClick={() => setExpandedCardKey(isExpanded ? null : cardKey)}
                        className="w-full rounded-xl border border-purple-200/90 dark:border-purple-800/80 bg-purple-50/30 dark:bg-purple-950/20 hover:border-purple-400 shadow-2xs overflow-hidden flex flex-col justify-between transition-all cursor-pointer p-2.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs font-bold font-mono bg-purple-100/90 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-b border-purple-200/90 dark:border-purple-800/70 -mx-2.5 -mt-2.5 px-2.5 py-1.5 mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <Dumbbell className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                            <span>{item.durationMinutes || 35}m</span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-200/70 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                            Gym
                          </span>
                        </div>

                        <div>
                          <p
                            className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 min-h-[26px] leading-tight"
                            title={item.workoutName || "Fortalecimiento"}
                          >
                            {item.workoutName || "Fortalecimiento"}
                          </p>
                          {gymDesc && (
                            <p className="text-[10px] text-purple-700 dark:text-purple-300 font-mono leading-snug line-clamp-2 opacity-90 mt-1">
                              {gymDesc}
                            </p>
                          )}
                        </div>

                        <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono font-bold border-t border-purple-200/60 dark:border-purple-900/60 text-slate-600 dark:text-slate-400 gap-1 mt-auto">
                          <span className="truncate">
                            {item.tss || 25} TSS{item.powerTarget ? ` · ⚡${item.powerTarget.split("•")[0].trim()}` : ""}
                          </span>
                        </div>

                        {isExpanded && item.justification && (
                          <div className="pt-1.5 border-t border-purple-200/50 dark:border-purple-900/50 text-[10px] text-slate-600 dark:text-slate-300 leading-snug">
                            <p className="italic flex items-start gap-1">
                              <Info className="h-3 w-3 text-purple-500 shrink-0 mt-0.5" />
                              <span>{item.justification}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ── TARJETA AERÓBICA (CARRERA / CICLISMO) O DESCANSO ──
                  return (
                    <div
                      key={sIdx}
                      onClick={() => setExpandedCardKey(isExpanded ? null : cardKey)}
                      className={`w-full rounded-xl p-2.5 transition-all cursor-pointer border flex flex-col justify-between overflow-hidden ${
                        isRest
                          ? "bg-white/70 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/80 opacity-85"
                          : "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-2xs hover:border-emerald-500/40"
                      } space-y-2`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center space-x-1 min-w-0">
                          {getDisciplineIcon(item.discipline)}
                          <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate">
                            {item.discipline}
                          </span>
                        </div>
                        {getActionBadge(item)}
                      </div>

                      <div>
                        <p
                          className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-2 min-h-[26px] leading-tight"
                          title={item.workoutName || item.title || "Entrenamiento"}
                        >
                          {item.workoutName || item.title || "Entrenamiento"}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-slate-400 dark:text-slate-500">
                          <span>{item.durationMinutes ? `${item.durationMinutes}m` : "0m"}</span>
                          <span>{item.tss ? `${item.tss} TSS` : ""}</span>
                        </div>
                      </div>

                      {/* Gráfica de Bloques de Potencia */}
                      <HeadCoachWorkoutBlockChart
                        discipline={item.discipline}
                        durationMinutes={item.durationMinutes || 0}
                        tss={item.tss || 0}
                        intensity={item.powerTarget || item.focus}
                        workoutStructure={item.workoutStructure}
                      />

                      {isExpanded && item.justification && (
                        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/80 text-[10px] text-slate-600 dark:text-slate-300 leading-snug">
                          <p className="italic flex items-start gap-1">
                            <Info className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item.justification}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
