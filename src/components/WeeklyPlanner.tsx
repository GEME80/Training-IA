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
  Send,
  RefreshCw,
  CheckCircle2,
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
  onSyncIntervals?: () => Promise<void>;
  isSyncing?: boolean;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  initialPlan,
  runFtp,
  bikeFtp,
  weekOffset,
  onWeekChange,
  onPlanUpdate,
  onSyncIntervals,
  isSyncing = false,
}) => {
  const [currentPlan, setCurrentPlan] = useState<PlanItem[]>(initialPlan);
  const [expandedSyntaxIdx, setExpandedSyntaxIdx] = useState<number | null>(null);
  const [hasUserCustomized, setHasUserCustomized] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

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
    onWeekChange(newOffset);
  };

  // 1. Alternar Día de Descanso (Toggle Rest Day)
  const handleToggleRestDay = (idx: number) => {
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

  // 4. Sincronización con Intervals
  const handleSync = async () => {
    if (!onSyncIntervals) return;
    setSyncSuccessMsg(null);
    try {
      await onSyncIntervals();
      setSyncSuccessMsg("¡Microciclo publicado en Intervals.icu!");
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    } catch {
      // Error manejado en parent
    }
  };

  // 5. Validador Fisiológico en tiempo real (Protección de Impacto Articular)
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
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

        {/* Week Selector, Reset Actions & Sync to Intervals */}
        <div className="flex flex-wrap items-center gap-2">
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

          {/* Week Navigation */}
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

          {/* Sincronizar con Intervals (Ubicado estratégicamente al lado del calendario) */}
          {onSyncIntervals && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-extrabold text-black shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
              title="Publicar este microciclo en el calendario de Intervals.icu"
            >
              {isSyncing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-black" />
              ) : (
                <Send className="h-3.5 w-3.5 text-black" />
              )}
              <span>{isSyncing ? "Sincronizando..." : "Sincronizar con Intervals"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync Success Feedback */}
      {syncSuccessMsg && (
        <div className="flex items-center space-x-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Impact Warning Banner */}
      {validationWarning && (
        <div className="flex items-center space-x-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 animate-fadeIn">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{validationWarning}</span>
        </div>
      )}

      {/* 7-Day Responsive Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {currentPlan.map((item, idx) => {
          const isRest = item.isRestDay || item.discipline === "Descanso";
          const isExpanded = expandedSyntaxIdx === idx;

          return (
            <div
              key={`${item.day}-${idx}`}
              className={`group flex flex-col justify-between rounded-xl p-3 transition border ${
                isRest
                  ? "border-slate-800 bg-slate-950/40 opacity-75 hover:opacity-100"
                  : "border-slate-800 bg-slate-950/80 shadow-md hover:border-slate-700"
              }`}
            >
              {/* Card Top: Day Header & Controls */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      {item.day}
                    </span>
                    <span className="block text-[10px] font-mono text-emerald-400">
                      {item.formattedDate}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      isRest
                        ? "bg-slate-800 text-slate-400"
                        : item.isCustomized
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : item.action === "MODIFICAR" || item.action === "REDUCIR_INTENSIDAD"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {isRest ? "Descanso" : item.isCustomized ? "Editado" : item.action === "MODIFICAR" ? "Ajustado IA" : "Nominal"}
                  </span>
                </div>

                {/* Day Manipulation Toolbar */}
                <div className="mt-2 flex items-center justify-between gap-1">
                  {/* Rest Checkbox */}
                  <label className="flex items-center space-x-1 cursor-pointer min-w-0">
                    <input
                      type="checkbox"
                      checked={!isRest}
                      onChange={() => handleToggleRestDay(idx)}
                      className="h-3 w-3 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 select-none truncate">
                      {isRest ? "💤 D..." : "Activo"}
                    </span>
                  </label>

                  {/* Swap Selector */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <select
                      value={idx}
                      onChange={(e) => handleSwapDays(idx, Number(e.target.value))}
                      className="h-5 rounded border border-slate-800 bg-slate-900 px-1 text-[10px] text-slate-300 hover:border-slate-700 cursor-pointer min-w-0 max-w-[62px] truncate"
                      title="Mover o intercambiar este entrenamiento a otro día"
                    >
                      <option value={idx}>↔ M...</option>
                      {currentPlan.map((d, targetIdx) => (
                        <option key={targetIdx} value={targetIdx} disabled={targetIdx === idx}>
                          {d.day.slice(0, 3)} ({d.formattedDate})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Workout Title & Discipline */}
                <div className="mt-2.5">
                  <div className="flex items-center space-x-1.5">
                    {getDisciplineIcon(item.discipline)}
                    <span className="text-[11px] font-semibold text-slate-300">
                      {item.discipline}
                    </span>
                  </div>

                  <h4 className="mt-1 text-xs font-bold text-white line-clamp-2 min-h-[32px]">
                    {item.workoutName}
                  </h4>
                </div>

                {/* Stepped Visual Interval Chart */}
                {!isRest && item.workoutDoc && (
                  <div className="mt-2">
                    <WorkoutChart workoutDoc={item.workoutDoc} discipline={item.discipline} />
                  </div>
                )}
              </div>

              {/* Card Footer: Justification & Structured Syntax Dropdown */}
              <div className="mt-3 border-t border-slate-800/80 pt-2 text-[10px] text-slate-400">
                {item.workoutDoc && !isRest && (
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => setExpandedSyntaxIdx(isExpanded ? null : idx)}
                      className="flex w-full items-center justify-between rounded-lg bg-slate-900/90 px-2 py-1 text-[10px] font-mono text-cyan-400 border border-slate-800 hover:bg-slate-800 transition"
                    >
                      <span className="flex items-center gap-1">
                        <Code2 className="h-3 w-3" />
                        Sintaxis Stryd
                      </span>
                      <span>{isExpanded ? "▲" : "▼"}</span>
                    </button>

                    {isExpanded && (
                      <pre className="mt-1.5 max-h-32 overflow-x-auto rounded-lg bg-slate-950 p-2 font-mono text-[9px] text-slate-300 border border-slate-800 whitespace-pre-wrap animate-fadeIn">
                        {item.workoutDoc}
                      </pre>
                    )}
                  </div>
                )}

                <p className="line-clamp-3 leading-relaxed">
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
