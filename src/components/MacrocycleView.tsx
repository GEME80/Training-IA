"use client";

import React, { useState } from "react";
import {
  Trophy,
  Calendar,
  Flag,
  Settings2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  Compass,
  ArrowRight,
  Code2,
  Footprints,
  Bike,
  Dumbbell,
  Moon,
} from "lucide-react";
import { MacrocyclePhaseInfo, TargetRace, MacrocycleWeek } from "@/lib/physiology/macrocycle";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, PlanItem } from "@/lib/gemini/engine";
import { WorkoutChart } from "./WorkoutChart";

interface MacrocycleViewProps {
  phaseInfo: MacrocyclePhaseInfo | null;
  races: TargetRace[];
  runFtp: number;
  bikeFtp: number;
  weeklyAvailability?: WeeklyAvailabilityMap;
  onOpenRaceSettings: () => void;
  onJumpToMicrocycleWithAI: (weekOffset: number, plan: PlanItem[]) => void;
}

export const MacrocycleView: React.FC<MacrocycleViewProps> = ({
  phaseInfo,
  races,
  runFtp,
  bikeFtp,
  weeklyAvailability = DEFAULT_WEEKLY_AVAILABILITY,
  onOpenRaceSettings,
  onJumpToMicrocycleWithAI,
}) => {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);
  const [expandedSyntaxIdx, setExpandedSyntaxIdx] = useState<number | null>(null);

  const blueprint = phaseInfo?.blueprint;
  const primaryRace = phaseInfo?.primaryRace;
  const weeks = blueprint?.weeks || [];
  const currentWeek = blueprint?.currentWeek || weeks[0];
  const selectedWeek: MacrocycleWeek = weeks[selectedWeekIndex] || currentWeek;

  // Genera el plan específico para la semana seleccionada
  const selectedWeekPlan = selectedWeek
    ? generateWeekTemplate(selectedWeek, runFtp, bikeFtp, weeklyAvailability)
    : [];

  const getDistanceLabel = (dist?: string) => {
    switch (dist) {
      case "42k":
        return "Maratón (42.195 km)";
      case "21k":
        return "Media Maratón (21.097 km)";
      case "10k":
        return "10K Ruta";
      case "5k":
        return "5K Ruta / Pista";
      case "cycling_fondo":
        return "Gran Fondo Ciclismo";
      case "triathlon_703":
        return "Triatlón Media Distancia (70.3)";
      case "triathlon_1406":
        return "Triatlón Larga Distancia (140.6)";
      default:
        return "Competición Objetivo";
    }
  };

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

  const getOffsetForWeek = (w: MacrocycleWeek): number => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const todayMonday = new Date(now.setDate(diff));
    todayMonday.setHours(0, 0, 0, 0);

    const weekMon = new Date(w.startDate + "T00:00:00");
    const diffTime = weekMon.getTime() - todayMonday.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="card-gradient rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-black shadow-lg shadow-amber-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                Plan del Macrociclo & Periodización de Temporada
              </h1>
              <p className="text-xs text-slate-400">
                Estructura de bloques progresivos (Base, Construcción, Pico, Taper) y periodización 3:1
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {phaseInfo && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold border tracking-wide shadow-sm ${
                  phaseInfo.cycleBadgeColor || phaseInfo.badgeColor
                }`}
              >
                {phaseInfo.cycleBadgeLabel || phaseInfo.phaseLabel}
              </span>
            )}

            <button
              onClick={onOpenRaceSettings}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <Settings2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Configurar Carreras</span>
            </button>
          </div>
        </div>

        {/* Primary Race Card & Countdown */}
        {primaryRace ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-xl bg-slate-950/80 p-4 border border-slate-800/80 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                    <Flag className="h-3.5 w-3.5" />
                    OBJETIVO PRINCIPAL (PRIORIDAD A)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    📅 {primaryRace.date}
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-black text-white tracking-wide">
                  {primaryRace.name}
                </h2>
                <p className="text-xs text-slate-400">
                  {getDistanceLabel(primaryRace.distance)}
                  {primaryRace.goalTarget && ` • Meta: ${primaryRace.goalTarget}`}
                </p>
              </div>

              {blueprint && (
                <div className="rounded-lg bg-slate-900/90 p-3 border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-400">Inicio del Plan Específico: </span>
                    <strong className="text-white font-mono">{blueprint.startDate}</strong>
                    <span className="text-slate-500"> ({blueprint.totalWeeks} semanas de preparación)</span>
                  </div>
                  {currentWeek && (
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-300 border border-emerald-500/30">
                      📍 Semana {currentWeek.weekNumber} de {blueprint.totalWeeks}: {currentWeek.microcycleLabel}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Countdown Widget */}
            <div className="rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 p-4 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Cuenta Regresiva
                </span>
                <div className="mt-1">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-4xl font-black font-mono text-amber-400">
                      {phaseInfo?.weeksRemaining ?? 0}
                    </span>
                    <span className="text-xs font-bold text-slate-300">semanas</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">
                    {phaseInfo?.daysRemaining ?? 0} días restantes
                  </p>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-800 pt-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Potencia de Referencia:</span>
                <p className="font-mono text-xs font-bold text-emerald-400 mt-0.5">
                  🏃 {runFtp}W Stryd CP • 🚴 {bikeFtp}W FTP
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800 text-center">
            <p className="text-xs text-slate-300">
              Actualmente en <strong>Mantenimiento General Adaptativo</strong> (sin carrera próxima).
            </p>
          </div>
        )}
      </div>

      {/* 16-Week Interactive Timeline Selector */}
      {weeks.length > 0 && (
        <div className="card-gradient rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="h-5 w-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Cronograma de Semanas ({weeks.length} Semanas)
              </h3>
              <span className="text-[11px] text-slate-400">
                — Selecciona cualquier semana para ver su plantilla diaria
              </span>
            </div>

            <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-cyan-300 border border-slate-700">
              Viendo: Semana {selectedWeek.weekNumber} ({selectedWeek.formattedRange})
            </span>
          </div>

          {/* Grid of 16 weeks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-1">
            {weeks.map((w, idx) => {
              const isSelected = selectedWeekIndex === idx;

              return (
                <button
                  type="button"
                  key={w.weekNumber}
                  onClick={() => setSelectedWeekIndex(idx)}
                  className={`text-left rounded-xl p-2.5 text-xs border transition cursor-pointer group ${
                    isSelected
                      ? "bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20"
                      : w.isCurrentWeek
                      ? "bg-slate-900/90 border-emerald-500/60 hover:border-emerald-400"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className={`font-mono font-bold ${
                        isSelected
                          ? "text-cyan-300"
                          : w.isCurrentWeek
                          ? "text-emerald-400"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      Sem {w.weekNumber}
                    </span>
                    {isSelected ? (
                      <span className="rounded-full bg-cyan-400 px-1 py-0.2 text-[8px] font-bold text-black uppercase">
                        Activa
                      </span>
                    ) : w.isCurrentWeek ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ) : null}
                  </div>

                  <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{w.formattedRange}</p>

                  <span
                    className={`mt-1.5 block rounded px-1 py-0.5 text-[9px] font-bold text-center border truncate ${w.microcycleBadgeColor}`}
                    title={w.microcycleLabel}
                  >
                    {w.microcycleLabel.split(" ")[0]}
                  </span>

                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="font-semibold">{w.targetTss} TSS</span>
                    <span className="text-[9px] text-slate-500">⏱️{w.maxLongRunMinutes}m</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Week's Daily Workouts Template */}
      {selectedWeek && (
        <div className="card-gradient rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
          {/* Week Detail Header & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Plantilla Diaria: Semana {selectedWeek.weekNumber} ({selectedWeek.phaseLabel})
                </h3>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold border ${selectedWeek.microcycleBadgeColor}`}>
                  {selectedWeek.microcycleLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedWeek.focusDescription} • <strong>Objetivo de Carga: {selectedWeek.targetTss} TSS</strong>
              </p>
            </div>

            {/* Jump to AI Optimizer button */}
            <button
              type="button"
              onClick={() => onJumpToMicrocycleWithAI(getOffsetForWeek(selectedWeek), selectedWeekPlan)}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-4 py-2 text-xs font-extrabold text-black shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-black" />
              <span>Evaluar con IA & Sincronizar</span>
            </button>
          </div>

          {/* 7-Day Grid for Selected Week */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {selectedWeekPlan.map((item, idx) => {
              const isRest = item.isRestDay || item.discipline === "Descanso";
              const isExpanded = expandedSyntaxIdx === idx;

              return (
                <div
                  key={`${item.day}-${idx}`}
                  className={`group flex flex-col justify-between rounded-xl p-3 transition border ${
                    isRest
                      ? "border-slate-800 bg-slate-950/40 opacity-75"
                      : "border-slate-800 bg-slate-950/80 shadow-md hover:border-slate-700"
                  }`}
                >
                  <div>
                    {/* Day Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-white">
                          {item.day}
                        </span>
                        <span className="block text-[10px] font-mono text-emerald-400">
                          {item.formattedDate}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {isRest ? "💤" : getDisciplineIcon(item.discipline)}
                      </span>
                    </div>

                    {/* Discipline & Title */}
                    <div className="mt-2.5">
                      <span className="text-[10px] font-semibold text-slate-400 block">
                        {item.discipline}
                      </span>
                      <h4 className="mt-0.5 text-xs font-bold text-white line-clamp-2 min-h-[32px]">
                        {item.workoutName}
                      </h4>
                      {item.powerTarget && (
                        <p className="text-[11px] font-mono font-bold text-amber-300 mt-1">
                          ⚡ {item.powerTarget}
                        </p>
                      )}
                    </div>

                    {/* Visual Interval Chart */}
                    {!isRest && item.workoutDoc && (
                      <div className="mt-2">
                        <WorkoutChart workoutDoc={item.workoutDoc} discipline={item.discipline} />
                      </div>
                    )}
                  </div>

                  {/* Justification & Syntax */}
                  <div className="mt-3 border-t border-slate-800/80 pt-2 text-[10px] text-slate-400 space-y-1.5">
                    {item.workoutDoc && !isRest && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setExpandedSyntaxIdx(isExpanded ? null : idx)}
                          className="flex w-full items-center justify-between rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-mono text-cyan-400 border border-slate-800 hover:bg-slate-800 transition"
                        >
                          <span className="flex items-center gap-1">
                            <Code2 className="h-3 w-3" />
                            Sintaxis
                          </span>
                          <span>{isExpanded ? "▲" : "▼"}</span>
                        </button>
                        {isExpanded && (
                          <pre className="mt-1 max-h-28 overflow-x-auto rounded bg-slate-950 p-2 font-mono text-[9px] text-slate-300 border border-slate-800 whitespace-pre-wrap">
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
      )}
    </div>
  );
};
