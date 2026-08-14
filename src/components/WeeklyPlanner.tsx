"use client";

import React, { useState } from "react";
import {
  Calendar,
  Dumbbell,
  Bike,
  Footprints,
  Moon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Code2,
  AlertTriangle,
} from "lucide-react";
import { PlanItem, getWeekDates } from "@/lib/gemini/engine";
import { WorkoutChart } from "./WorkoutChart";

interface WeeklyPlannerProps {
  initialPlan: PlanItem[];
  runFtp: number;
  bikeFtp: number;
  weekOffset: number;
  onWeekChange: (offset: number) => void;
  onPlanUpdate: (updatedPlan: PlanItem[]) => void;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  initialPlan,
  runFtp,
  bikeFtp,
  weekOffset,
  onWeekChange,
  onPlanUpdate,
}) => {
  const [currentPlan, setCurrentPlan] = useState<PlanItem[]>(initialPlan);
  const [expandedSyntaxIdx, setExpandedSyntaxIdx] = useState<number | null>(null);
  const [hasUserCustomized, setHasUserCustomized] = useState<boolean>(false);

  // Sincronizar estado local cuando initialPlan cambie desde el backend
  React.useEffect(() => {
    setCurrentPlan(initialPlan);
    setHasUserCustomized(false);
  }, [initialPlan]);

  const updatePlan = (newPlan: PlanItem[]) => {
    setCurrentPlan(newPlan);
    setHasUserCustomized(true);
    onPlanUpdate(newPlan);
  };

  // Manejo de cambio de semana con actualización inmediata de fechas locales
  const handleSwitchWeek = (newOffset: number) => {
    const newDates = getWeekDates(newOffset);
    const updated = currentPlan.map((item, idx) => {
      const dateInfo = newDates[idx] || { date: "", formattedDate: "" };
      return {
        ...item,
        date: dateInfo.date,
        formattedDate: dateInfo.formattedDate,
      };
    });
    setCurrentPlan(updated);
    onPlanUpdate(updated);
    onWeekChange(newOffset);
  };

  // 1. Conmutador de Descanso
  const handleToggleRest = (idx: number) => {
    const updated = [...currentPlan];
    const item = { ...updated[idx] };

    if (item.isRestDay || item.discipline === "Descanso") {
      const defaultDisciplines: Record<string, "Carrera" | "Ciclismo" | "Fuerza"> = {
        Martes: "Carrera",
        Miércoles: "Ciclismo",
        Jueves: "Fuerza",
        Viernes: "Carrera",
        Sábado: "Ciclismo",
        Domingo: "Carrera",
        Lunes: "Carrera",
      };
      const disc = defaultDisciplines[item.day] || "Carrera";
      item.discipline = disc;
      item.isRestDay = false;
      item.workoutName = disc === "Carrera" ? "Rodaje Progresivo Stryd" : disc === "Ciclismo" ? "Ciclismo Z2 Base" : "Fuerza Sóleo";
      item.action = "MODIFICAR";
      item.isCustomized = true;
      item.justification = "Reactivado manualmente por el atleta.";
      item.powerTarget = disc === "Carrera" ? `${Math.round(runFtp * 0.75)}W (75% CP)` : disc === "Ciclismo" ? `${Math.round(bikeFtp * 0.65)}W (65% FTP)` : undefined;
      item.workoutDoc = disc === "Carrera" ? `Warmup\n- 15m 70% FTP\n\nMain\n- 35m 75% FTP\n\nCooldown\n- 10m 60% FTP` : undefined;
    } else {
      item.discipline = "Descanso";
      item.isRestDay = true;
      item.workoutName = "Descanso Pasivo Total";
      item.action = "DESCANSO_ACTIVO";
      item.isCustomized = true;
      item.powerTarget = undefined;
      item.workoutDoc = undefined;
      item.justification = "Día de descanso asignado manualmente por el atleta.";
    }

    updated[idx] = item;
    updatePlan(updated);
  };

  // 2. Intercambio de Sesiones entre dos días (Swap)
  const handleSwapDays = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const updated = [...currentPlan];

    const itemA = { ...updated[fromIdx] };
    const itemB = { ...updated[toIdx] };

    const dayA = itemA.day;
    const dateA = itemA.date;
    const formattedDateA = itemA.formattedDate;

    const dayB = itemB.day;
    const dateB = itemB.date;
    const formattedDateB = itemB.formattedDate;

    updated[fromIdx] = {
      ...itemB,
      day: dayA,
      date: dateA,
      formattedDate: formattedDateA,
      isCustomized: true,
    };

    updated[toIdx] = {
      ...itemA,
      day: dayB,
      date: dateB,
      formattedDate: formattedDateB,
      isCustomized: true,
    };

    updatePlan(updated);
  };

  // 3. Restablecer al plan original del agente
  const handleResetToAgent = () => {
    setCurrentPlan(initialPlan);
    setHasUserCustomized(false);
    onPlanUpdate(initialPlan);
  };

  // 4. Validador Fisiológico en tiempo real (Protección de Impacto Articular)
  const checkConsecutiveHardRuns = () => {
    for (let i = 0; i < currentPlan.length - 1; i++) {
      const today = currentPlan[i];
      const nextDay = currentPlan[i + 1];

      const isTodayImpact = today.discipline === "Carrera" && !today.isRestDay && (today.workoutName.includes("Series") || today.workoutName.includes("Tirada Larga") || today.workoutName.includes("Umbral"));
      const isNextImpact = nextDay.discipline === "Carrera" && !nextDay.isRestDay && (nextDay.workoutName.includes("Series") || nextDay.workoutName.includes("Tirada Larga") || nextDay.workoutName.includes("Umbral"));

      if (isTodayImpact && isNextImpact) {
        return `⚠️ Alerta de Impacto: Has ubicado dos sesiones exigentes de carrera consecutivas (${today.day} y ${nextDay.day}). Te sugerimos intercalar ciclismo o descanso.`;
      }
    }
    return null;
  };

  const validationWarning = checkConsecutiveHardRuns();

  const getDisciplineIcon = (discipline: string) => {
    switch (discipline) {
      case "Carrera":
        return <Footprints className="h-4 w-4 text-emerald-400" />;
      case "Ciclismo":
        return <Bike className="h-4 w-4 text-cyan-400" />;
      case "Fuerza":
        return <Dumbbell className="h-4 w-4 text-purple-400" />;
      default:
        return <Moon className="h-4 w-4 text-slate-400" />;
    }
  };

  const startDate = currentPlan[0]?.formattedDate || "";
  const endDate = currentPlan[currentPlan.length - 1]?.formattedDate || "";

  return (
    <div className="card-gradient rounded-2xl p-5 border border-slate-800 space-y-5">
      {/* Header & Week Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Microciclo Semanal Interactivo
            </h2>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-emerald-400 border border-slate-700">
              {startDate} — {endDate}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Reorganiza sesiones, personaliza días de descanso y visualiza la gráfica de intervalos antes de sincronizar
          </p>
        </div>

        {/* Week Selector & Reset Actions */}
        <div className="flex items-center space-x-2">
          {hasUserCustomized && (
            <button
              onClick={handleResetToAgent}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-slate-700 transition"
              title="Restablecer sugerencia original del agente"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restablecer</span>
            </button>
          )}

          <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => handleSwitchWeek(weekOffset - 1)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              title="Semana anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleSwitchWeek(0)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                weekOffset === 0
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Esta Semana
            </button>

            <button
              onClick={() => handleSwitchWeek(1)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                weekOffset === 1
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Próxima Semana
            </button>

            <button
              onClick={() => handleSwitchWeek(weekOffset + 1)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              title="Semana siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Physiological Warning */}
      {validationWarning && (
        <div className="flex items-center space-x-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <span>{validationWarning}</span>
        </div>
      )}

      {/* 7-Day Interactive Matrix */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-7">
        {currentPlan.map((item, idx) => {
          const isRest = item.isRestDay || item.discipline === "Descanso";

          return (
            <div
              key={idx}
              className={`group relative flex flex-col justify-between rounded-xl p-3.5 border transition-all ${
                isRest
                  ? "border-slate-800/60 bg-slate-950/40 opacity-80 hover:opacity-100"
                  : item.isCustomized
                  ? "border-cyan-500/40 bg-cyan-950/10 shadow-md shadow-cyan-500/5"
                  : item.action === "MODIFICAR" || item.action === "REDUCIR_INTENSIDAD"
                  ? "border-amber-500/40 bg-amber-950/10"
                  : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700"
              }`}
            >
              {/* Card Header: Day & Date */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                      {item.day}
                    </span>
                    <p className="text-[11px] font-mono font-semibold text-emerald-400">
                      {item.formattedDate}
                    </p>
                  </div>

                  {item.isCustomized ? (
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                      Editado
                    </span>
                  ) : isRest ? (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-400 border border-slate-700">
                      Descanso
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                      {item.action === "MODIFICAR" ? "Ajustado" : "Nominal"}
                    </span>
                  )}
                </div>

                {/* Rest Day Toggle Checkbox */}
                <div className="mt-2.5 flex items-center justify-between rounded-lg bg-slate-950/60 px-2 py-1.5 border border-slate-800/80">
                  <label className="flex items-center space-x-2 text-[11px] font-medium text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRest}
                      onChange={() => handleToggleRest(idx)}
                      className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>{isRest ? "💤 En Descanso" : "Día Activo"}</span>
                  </label>

                  {/* Swap Selector Dropdown */}
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        const targetIdx = Number(e.target.value);
                        if (!isNaN(targetIdx)) {
                          handleSwapDays(idx, targetIdx);
                          e.target.value = "";
                        }
                      }}
                      defaultValue=""
                      className="h-6 rounded bg-slate-800 px-1 text-[10px] font-semibold text-slate-300 border border-slate-700 hover:bg-slate-700 focus:outline-none cursor-pointer"
                      title="Mover o intercambiar sesión con otro día"
                    >
                      <option value="" disabled>
                        ↔ Mover
                      </option>
                      {currentPlan.map((target, targetIdx) => {
                        if (targetIdx === idx) return null;
                        return (
                          <option key={targetIdx} value={targetIdx}>
                            A {target.day} ({target.formattedDate})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Discipline & Workout Details */}
                <div className="mt-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
                      {getDisciplineIcon(item.discipline)}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{item.discipline}</span>
                  </div>

                  <h3 className={`mt-1.5 text-xs font-bold leading-snug line-clamp-2 ${isRest ? "text-slate-400" : "text-white"}`}>
                    {item.workoutName}
                  </h3>

                  {/* Power Target */}
                  {item.powerTarget && !isRest && (
                    <div className="mt-2 rounded bg-slate-950/80 px-2 py-1 border border-slate-800">
                      <span className="text-[11px] font-mono font-bold text-emerald-400">
                        🎯 {item.powerTarget}
                      </span>
                    </div>
                  )}

                  {/* Visual Interval Stepped Profile Chart */}
                  {!isRest && item.workoutDoc && (
                    <WorkoutChart workoutDoc={item.workoutDoc} discipline={item.discipline} />
                  )}
                </div>
              </div>

              {/* Workout Syntax Inspector Toggle */}
              <div className="mt-3 border-t border-slate-800/60 pt-2 space-y-1.5">
                {item.workoutDoc && !isRest && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSyntaxIdx(expandedSyntaxIdx === idx ? null : idx)
                    }
                    className="flex w-full items-center justify-between rounded bg-slate-950/40 px-1.5 py-1 text-[10px] font-mono text-slate-400 hover:text-emerald-400 border border-slate-800"
                  >
                    <span className="flex items-center space-x-1">
                      <Code2 className="h-3 w-3" />
                      <span>Sintaxis Stryd</span>
                    </span>
                    <span>{expandedSyntaxIdx === idx ? "▲" : "▼"}</span>
                  </button>
                )}

                {expandedSyntaxIdx === idx && item.workoutDoc && (
                  <pre className="mt-1 rounded bg-black/90 p-2 text-[9px] font-mono text-emerald-300 whitespace-pre-wrap border border-emerald-500/20 max-h-32 overflow-y-auto">
                    {item.workoutDoc}
                  </pre>
                )}

                <p className="text-[10px] text-slate-400 leading-tight">
                  {item.justification}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
