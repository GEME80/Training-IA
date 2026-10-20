"use client";

import React, { useState } from "react";
import {
  Footprints, Bike, Dumbbell, Moon, Sparkles, Zap, Clock, Info, CheckCircle2, RefreshCw
} from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { WorkoutChart } from "@/components/WorkoutChart";
import { HeadCoachWorkoutBlockChart } from "./HeadCoachWorkoutBlockChart";
import { gymShortDesc, HeadCoachExpandedGym, HeadCoachExpandedAerobic } from "./headcoachCardHelpers";
import { HeadCoachSingleDiffCard } from "./HeadCoachSingleDiffCard";

interface HeadCoachMicrocycleCardProps {
  plan: PlanItem[];
  weekNumber: number;
  onApplyAndSync?: (plan: PlanItem[]) => Promise<void>;
  isApplying?: boolean;
}

const CANONICAL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export const HeadCoachMicrocycleCard: React.FC<HeadCoachMicrocycleCardProps> = ({
  plan,
  weekNumber,
  onApplyAndSync,
  isApplying = false,
}) => {
  const [expandedCardKey, setExpandedCardKey] = useState<string | null>(null);
  const [showFullWeek, setShowFullWeek] = useState(false);

  // Detección de adaptación puntual (1 o 2 sesiones modificadas en vez de la semana completa)
  const modifiedSessions = plan.filter((p) => p.action === "MODIFICAR" || p.action === "REDUCIR_INTENSIDAD");
  const isPunctualChange = modifiedSessions.length > 0 && modifiedSessions.length <= 2;

  if (isPunctualChange && !showFullWeek) {
    return (
      <HeadCoachSingleDiffCard
        plan={plan}
        modifiedSessions={modifiedSessions}
        weekNumber={weekNumber}
        onApplyAndSync={onApplyAndSync}
        isApplying={isApplying}
        onToggleFullWeek={() => setShowFullWeek(true)}
      />
    );
  }

  const totalTss = plan.reduce((acc, p) => acc + (p.tss || 0), 0);
  const totalMinutes = plan.reduce((acc, p) => acc + (p.durationMinutes || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;
  const isContinuityPlan = plan.every((p) => p.action === "MANTENER" || p.discipline === "Descanso");

  const getDisciplineIcon = (disc: string) => {
    if (disc === "Carrera") return <Footprints className="h-3.5 w-3.5 text-emerald-500" />;
    if (disc === "Ciclismo") return <Bike className="h-3.5 w-3.5 text-sky-500" />;
    if (disc === "Fuerza") return <Dumbbell className="h-3.5 w-3.5 text-purple-500" />;
    return <Moon className="h-3.5 w-3.5 text-slate-400" />;
  };

  const getActionBadge = (item: PlanItem) => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (item.justification?.includes("Historial inmutable") || (item.date && item.date < todayStr)) {
      return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shrink-0">Historial</span>;
    }
    if (item.discipline === "Descanso" || (item.tss === 0 && item.durationMinutes === 0)) {
      return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">Descanso</span>;
    }
    if (item.action === "MODIFICAR" || item.action === "REDUCIR_INTENSIDAD") {
      return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">Adaptado</span>;
    }
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">Confirmado</span>;
  };

  // Agrupamiento canónico por los 7 días de la semana con erradicación estricta de duplicados
  const daysGrouped = CANONICAL_DAYS.map((dayName) => {
    const raw = plan.filter((p) => p.day?.toLowerCase() === dayName.toLowerCase() || p.day?.toLowerCase().startsWith(dayName.slice(0, 3).toLowerCase()));
    const hasActive = raw.some((s) => s.discipline !== "Descanso" && (s.durationMinutes || 0) > 0);
    const daySessions = hasActive ? raw.filter((s) => s.discipline !== "Descanso") : (raw.length > 1 ? [raw[0]] : raw);
    const primaryDate = daySessions.find((s) => s.formattedDate)?.formattedDate || "";
    const dayTotalTss = daySessions.reduce((acc, s) => acc + (s.tss || 0), 0);
    return { dayName, shortName: dayName.slice(0, 3), formattedDate: primaryDate, sessions: daySessions, dayTotalTss };
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
          <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {totalTss} TSS
          </span>
          <span className="text-slate-400">•</span>
          <span className="font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {timeFormatted}
          </span>
        </div>
      </div>

      {/* Grid Canónico de 7 Días */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {daysGrouped.map(({ dayName, shortName, formattedDate, sessions, dayTotalTss }) => {
          return (
            <div
              key={dayName}
              className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2.5 flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-1.5">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {shortName}
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {formattedDate}
                </span>
              </div>

              {sessions.length === 0 ? (
                <div className="py-4 text-center">
                  <Moon className="h-4 w-4 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                  <span className="text-[10px] text-slate-400 font-mono">Descanso</span>
                </div>
              ) : (
                sessions.map((item, sIdx) => {
                  const isRest = item.discipline === "Descanso" || (item.tss === 0 && item.durationMinutes === 0);
                  const isGym = item.discipline === "Fuerza";
                  const cardKey = `${dayName}-${sIdx}`;
                  const isExpanded = expandedCardKey === cardKey;

                  if (isGym) {
                    const gymDesc = gymShortDesc(item.workoutDoc, item.focus);
                    return (
                      <div
                        key={sIdx}
                        onClick={() => setExpandedCardKey(isExpanded ? null : cardKey)}
                        className="w-full rounded-xl p-2.5 bg-purple-500/5 dark:bg-purple-950/20 border border-purple-300/40 dark:border-purple-800/40 space-y-2 transition-all cursor-pointer hover:border-purple-400 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center space-x-1 min-w-0">
                            {getDisciplineIcon("Fuerza")}
                            <span className="font-bold text-[11px] text-purple-900 dark:text-purple-200 truncate">
                              Fuerza
                            </span>
                          </div>
                          {getActionBadge(item)}
                        </div>

                        <div>
                          <p
                            className="text-[11px] font-bold text-purple-950 dark:text-purple-100 line-clamp-1 leading-tight"
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

                        {isExpanded && <HeadCoachExpandedGym item={item} />}
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
                      {item.workoutDoc ? (
                        <div className="w-full overflow-hidden rounded-lg">
                          <WorkoutChart workoutDoc={item.workoutDoc} discipline={item.discipline} />
                        </div>
                      ) : (
                        <HeadCoachWorkoutBlockChart
                          discipline={item.discipline}
                          durationMinutes={item.durationMinutes || 0}
                          tss={item.tss || 0}
                          intensity={item.powerTarget || item.focus}
                          workoutStructure={item.workoutStructure}
                        />
                      )}

                      {/* Detalle estructurado al expandir */}
                      {isExpanded && <HeadCoachExpandedAerobic item={item} />}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      {/* Barra de Aprobación y Sincronización Directa */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white">{totalTss} TSS</span>
          <span>•</span>
          <span>{timeFormatted} de volumen</span>
        </div>

        {onApplyAndSync && !isContinuityPlan && (
          <button
            type="button"
            onClick={() => onApplyAndSync(plan)}
            disabled={isApplying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Sincronizando con Intervals.icu...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Aprobar y Sincronizar Microciclo</span>
              </>
            )}
          </button>
        )}

        {isContinuityPlan && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Plan activo y confirmado en tu calendario</span>
          </div>
        )}
      </div>
    </div>
  );
};
