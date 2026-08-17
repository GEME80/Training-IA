"use client";

import React, { useState } from "react";
import {
  Calendar,
  Zap,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  Code2,
  Footprints,
  Bike,
  Dumbbell,
  Moon,
  Sparkles,
  Award,
} from "lucide-react";
import { MacrocycleBlueprint, MacrocycleWeek } from "@/lib/physiology/macrocycle";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY } from "@/lib/gemini/engine";
import { MacrocycleDistanceType } from "@/lib/physiology/macrocycleLibrary";
import { WorkoutChart } from "./WorkoutChart";

interface MacrocyclePreviewTimelineProps {
  blueprint: MacrocycleBlueprint;
  runFtp?: number;
  bikeFtp?: number;
  weeklyAvailability?: WeeklyAvailabilityMap;
  distanceType?: MacrocycleDistanceType;
  onSelectWeek?: (weekIndex: number) => void;
  selectedWeekIndex?: number;
  isCompact?: boolean;
}

export const MacrocyclePreviewTimeline: React.FC<MacrocyclePreviewTimelineProps> = ({
  blueprint,
  runFtp = 285,
  bikeFtp = 260,
  weeklyAvailability = DEFAULT_WEEKLY_AVAILABILITY,
  distanceType,
  onSelectWeek,
  selectedWeekIndex: externalSelectedIndex,
  isCompact = false,
}) => {
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number>(blueprint.currentWeekIndex || 0);
  const [expandedDaySyntax, setExpandedDaySyntax] = useState<number | null>(null);

  const selectedIndex = externalSelectedIndex !== undefined ? externalSelectedIndex : internalSelectedIndex;
  const handleSelectWeek = (idx: number) => {
    setInternalSelectedIndex(idx);
    if (onSelectWeek) onSelectWeek(idx);
  };

  const weeks = blueprint.weeks || [];
  const selectedWeek: MacrocycleWeek = weeks[selectedIndex] || weeks[0];
  const selectedWeekPlan = selectedWeek
    ? generateWeekTemplate(selectedWeek, runFtp, bikeFtp, weeklyAvailability, distanceType)
    : [];

  const maxTssInCycle = Math.max(...weeks.map((w) => w.targetTss || 300), 500);

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

  if (!weeks.length) return null;

  return (
    <div className="space-y-6">
      {/* 1. Resumen de Fases / Bloques del Ciclo (Interactivos y Dinámicos) */}
      {blueprint.mode === "PRE_SEASON_MAINTENANCE" || blueprint.mode === "GENERAL_MAINTENANCE" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* BLOQUE 1: CONSISTENCIA & TEST STRYD */}
          {(() => {
            const b1Weeks = weeks.slice(0, 4);
            const isActive = selectedIndex < 4;
            return (
              <button
                type="button"
                onClick={() => handleSelectWeek(0)}
                className={`text-left rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                  isActive
                    ? "bg-teal-500/15 border-teal-500/60 ring-2 ring-teal-500/40 shadow-lg shadow-teal-500/10"
                    : "bg-slate-900/80 border-slate-800 hover:border-teal-500/40 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">1. Consistencia & Calibración</span>
                  {isActive && <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />}
                </div>
                <p className="text-sm font-black text-white mt-1">
                  {b1Weeks.length} Semanas (S1 - S4)
                </p>
                <span className="text-[10px] text-amber-300 font-semibold mt-0.5">🎯 Incluye Test Stryd CP en S4 ➔</span>
              </button>
            );
          })()}

          {/* BLOQUE 2: CAPACIDAD AERÓBICA & TEST FTP */}
          {(() => {
            const b2Weeks = weeks.slice(4, 8);
            const isActive = selectedIndex >= 4 && selectedIndex < 8;
            return (
              <button
                type="button"
                onClick={() => weeks.length > 4 && handleSelectWeek(4)}
                className={`text-left rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                  isActive
                    ? "bg-yellow-500/15 border-yellow-500/60 ring-2 ring-yellow-500/40 shadow-lg shadow-yellow-500/10"
                    : "bg-slate-900/80 border-slate-800 hover:border-yellow-500/40 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">2. Capacidad & Ciclismo</span>
                  {isActive && <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />}
                </div>
                <p className="text-sm font-black text-white mt-1">
                  {b2Weeks.length} Semanas (S5 - S8)
                </p>
                <span className="text-[10px] text-cyan-300 font-semibold mt-0.5">🚴 Incluye Test Bike FTP en S8 ➔</span>
              </button>
            );
          })()}

          {/* BLOQUE 3: CONSOLIDACIÓN & TRANSICIÓN */}
          {(() => {
            const b3Weeks = weeks.slice(8);
            const isActive = selectedIndex >= 8;
            return (
              <button
                type="button"
                onClick={() => weeks.length > 8 && handleSelectWeek(8)}
                className={`text-left rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                  isActive
                    ? "bg-purple-500/15 border-purple-500/60 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/10"
                    : "bg-slate-900/80 border-slate-800 hover:border-purple-500/40 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">3. Consolidación & Transición</span>
                  {isActive && <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />}
                </div>
                <p className="text-sm font-black text-white mt-1">
                  {b3Weeks.length > 0 ? `${b3Weeks.length} Semanas (S9 - S${weeks.length})` : "Consolidación"}
                </p>
                <span className="text-[10px] text-purple-300 font-semibold mt-0.5">🚀 Víspera del Kickoff de Maratón ➔</span>
              </button>
            );
          })()}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* FASE BASE */}
          {(() => {
            const baseWeeks = weeks.filter((w) => w.phase === "BASE_1" || w.phase === "BASE_2");
            const firstBaseIdx = weeks.findIndex((w) => w.phase === "BASE_1" || w.phase === "BASE_2");
            const isActivePhase = selectedWeek.phase === "BASE_1" || selectedWeek.phase === "BASE_2";

            return (
              <button
                type="button"
                onClick={() => firstBaseIdx !== -1 && handleSelectWeek(firstBaseIdx)}
                className={`text-left rounded-xl p-3 border transition-all flex flex-col justify-between ${
                  isActivePhase
                    ? "bg-teal-500/15 border-teal-500/60 ring-2 ring-teal-500/40 shadow-lg shadow-teal-500/10"
                    : "bg-slate-900/80 border-slate-800 hover:border-teal-500/40 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">1. Fase Base (GPP)</span>
                  {isActivePhase && <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />}
                </div>
                <p className="text-base font-black text-white mt-1">
                  {baseWeeks.length} Semanas
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5">Capilarización & Sóleo ➔</span>
              </button>
            );
          })()}

          {/* FASE BUILD */}
          {(() => {
            const buildWeeks = weeks.filter((w) => w.phase === "BUILD");
            const firstBuildIdx = weeks.findIndex((w) => w.phase === "BUILD");
            const isActivePhase = selectedWeek.phase === "BUILD";

            return (
              <button
                type="button"
                onClick={() => firstBuildIdx !== -1 && handleSelectWeek(firstBuildIdx)}
                className={`text-left rounded-xl p-3 border transition-all flex flex-col justify-between ${
                  isActivePhase
                    ? "bg-yellow-500/15 border-yellow-500/60 ring-2 ring-yellow-500/40 shadow-lg shadow-yellow-500/10"
                    : "bg-slate-900/80 border-slate-800 hover:border-yellow-500/40 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">2. Fase Build / Umbral</span>
                  {isActivePhase && <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />}
                </div>
                <p className="text-base font-black text-white mt-1">
                  {buildWeeks.length} Semanas
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5">Series Z4 (% CP Umbral) ➔</span>
              </button>
            );
          })()}

          {/* FASE PEAK */}
          {(() => {
            const peakWeeks = weeks.filter((w) => w.phase === "PEAK");
            const firstPeakIdx = weeks.findIndex((w) => w.phase === "PEAK");
            const isActivePhase = selectedWeek.phase === "PEAK";

            return (
              <button
                type="button"
                onClick={() => firstPeakIdx !== -1 && handleSelectWeek(firstPeakIdx)}
                className={`text-left rounded-xl p-3 border transition-all flex flex-col justify-between ${
                  isActivePhase
                    ? "bg-orange-500/15 border-orange-500/60 ring-2 ring-orange-500/40 shadow-lg shadow-orange-500/10"
                    : "bg-slate-900/80 border-slate-800 hover:border-orange-500/40 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">3. Fase Pico / Choque</span>
                  {isActivePhase && <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />}
                </div>
                <p className="text-base font-black text-white mt-1">
                  {peakWeeks.length} Semanas
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5">Fondos Clave 28-34km ➔</span>
              </button>
            );
          })()}

          {/* FASE TAPER */}
          {(() => {
            const taperWeeks = weeks.filter((w) => w.phase === "TAPER" || w.phase === "RACE_WEEK");
            const firstTaperIdx = weeks.findIndex((w) => w.phase === "TAPER" || w.phase === "RACE_WEEK");
            const isActivePhase = selectedWeek.phase === "TAPER" || selectedWeek.phase === "RACE_WEEK";

            return (
              <button
                type="button"
                onClick={() => firstTaperIdx !== -1 && handleSelectWeek(firstTaperIdx)}
                className={`text-left rounded-xl p-3 border transition-all flex flex-col justify-between ${
                  isActivePhase
                    ? "bg-rose-500/15 border-rose-500/60 ring-2 ring-rose-500/40 shadow-lg shadow-rose-500/10"
                    : "bg-slate-900/80 border-slate-800 hover:border-rose-500/40 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">4. Taper & Carrera</span>
                  {isActivePhase && <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />}
                </div>
                <p className="text-base font-black text-white mt-1">
                  {taperWeeks.length} Semanas
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5">Supercompensación TSB ➔</span>
              </button>
            );
          })()}
        </div>
      )}

      {/* 2. Timeline Interactivo Semana a Semana */}
      <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800/90 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Cronograma de Carga & Periodización 3:1 ({weeks.length} Semanas)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Haz clic en una semana para previsualizar sus 7 entrenamientos
          </span>
        </div>

        {/* Barra Visual de Cargas TSS */}
        <div className="flex items-end gap-1.5 pt-4 pb-2 px-1 overflow-x-auto">
          {weeks.map((w, idx) => {
            const isSelected = idx === selectedIndex;
            const isRecovery = w.microcycleType === "DESCARGA_ASIMILACION";
            const isRace = w.microcycleType === "COMPETICION";
            const isPeak = w.microcycleType === "IMPACTO_CHOQUE";
            const heightPercent = Math.max(25, Math.round((w.targetTss / maxTssInCycle) * 100));

            return (
              <button
                key={w.weekNumber}
                type="button"
                onClick={() => handleSelectWeek(idx)}
                className={`flex-1 min-w-[38px] group flex flex-col items-center gap-1 transition-all rounded-lg p-1.5 ${
                  isSelected
                    ? "bg-amber-500/20 ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/10"
                    : "hover:bg-slate-800/60"
                }`}
              >
                {/* Altura de barra proporcional a TSS */}
                <div className="w-full flex items-end justify-center h-20">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t transition-all ${
                      isSelected
                        ? "bg-gradient-to-t from-amber-500 to-yellow-400 shadow-md"
                        : isRace
                        ? "bg-amber-400/80"
                        : isPeak
                        ? "bg-orange-500/80"
                        : isRecovery
                        ? "bg-blue-500/60"
                        : "bg-teal-500/60"
                    }`}
                  />
                </div>

                {/* Número de Semana */}
                <span
                  className={`text-[11px] font-black ${
                    isSelected ? "text-amber-300" : "text-slate-400 group-hover:text-white"
                  }`}
                >
                  S{w.weekNumber}
                </span>

                {/* TSS Target */}
                <span className="text-[9px] font-mono text-slate-500">{w.targetTss}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detalle de la Semana Seleccionada */}
      {selectedWeek && (
        <div className="card-gradient rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Semana {selectedWeek.weekNumber} de {weeks.length}
                </span>
                <span className="text-xs text-slate-400 font-mono">({selectedWeek.formattedRange})</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
                {selectedWeek.phaseLabel} — {selectedWeek.microcycleLabel}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold border ${selectedWeek.microcycleBadgeColor}`}
              >
                {selectedWeek.targetTss} TSS
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300 border border-slate-700 flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-400" />
                Fondo máx: {selectedWeek.maxLongRunMinutes} min
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            💡 <strong className="text-white">Objetivo Fisiológico:</strong> {selectedWeek.focusDescription}
          </p>

          {/* Grid de los 7 Días de la Semana */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-teal-400" />
              Plan Diario de la Semana (Lunes a Domingo):
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {selectedWeekPlan.map((planItem, dayIdx) => {
                const isExpanded = expandedDaySyntax === dayIdx;
                const isRest = planItem.isRestDay;

                return (
                  <div
                    key={planItem.day}
                    className={`rounded-xl p-3 border flex flex-col justify-between transition-all ${
                      isRest
                        ? "bg-slate-950/40 border-slate-900 text-slate-500"
                        : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      {/* Cabecera Día */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                        <span className="text-xs font-bold text-slate-300">{planItem.day}</span>
                        {getDisciplineIcon(planItem.discipline)}
                      </div>

                      {/* Nombre Sesión */}
                      <p className={`text-xs font-semibold mt-1.5 line-clamp-2 ${isRest ? "text-slate-500" : "text-white"}`}>
                        {planItem.workoutName}
                      </p>

                      {/* Potencia Objetivo */}
                      {planItem.powerTarget && (
                        <span className="inline-block mt-1 text-[10px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          ⚡ {planItem.powerTarget}
                        </span>
                      )}

                      {/* Justificación */}
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {planItem.justification}
                      </p>
                    </div>

                    {/* Gráfica Visual de Intervalos / Perfil del Entrenamiento */}
                    {!isRest && planItem.workoutDoc && (
                      <div className="mt-2">
                        <WorkoutChart workoutDoc={planItem.workoutDoc} discipline={planItem.discipline} />
                      </div>
                    )}

                    {/* Botón Ver Detalle del Plan */}
                    {planItem.workoutDoc && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => setExpandedDaySyntax(isExpanded ? null : dayIdx)}
                          className="w-full text-[10px] font-medium text-teal-400 hover:text-teal-300 flex items-center justify-center gap-1 rounded bg-slate-950/60 py-1 border border-slate-800/80 hover:bg-slate-800/60 transition"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>{isExpanded ? "Ocultar Detalle" : "📋 Detalle del Plan"}</span>
                          {isExpanded ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-1.5 p-2 rounded-lg bg-slate-950 text-[10px] text-slate-200 border border-slate-800 space-y-1.5 animate-fadeIn">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                              Estructura de Bloques:
                            </div>
                            <pre className="font-mono text-[9px] text-emerald-400 whitespace-pre-wrap overflow-x-auto max-h-32">
                              {planItem.workoutDoc}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
