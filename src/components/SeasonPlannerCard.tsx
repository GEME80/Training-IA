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
} from "lucide-react";
import { MacrocyclePhaseInfo, TargetRace } from "@/lib/physiology/macrocycle";

interface SeasonPlannerCardProps {
  phaseInfo: MacrocyclePhaseInfo | null;
  races: TargetRace[];
  onOpenRaceSettings: () => void;
}

export const SeasonPlannerCard: React.FC<SeasonPlannerCardProps> = ({
  phaseInfo,
  races,
  onOpenRaceSettings,
}) => {
  const [showFullTimeline, setShowFullTimeline] = useState(false);
  const primaryRace = phaseInfo?.primaryRace;
  const blueprint = phaseInfo?.blueprint;
  const currentWeek = blueprint?.currentWeek;

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

  return (
    <div className="card-gradient rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-bold shadow-md shadow-amber-500/20">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Macrociclo & Cronograma de Temporada
            </h2>
            <p className="text-[11px] text-slate-400">
              Periodización biológica 3:1 (Carga vs Asimilación) adaptada a tus competiciones
            </p>
          </div>
        </div>

        {/* Phase Badge & Manage Button */}
        <div className="flex items-center space-x-2">
          {phaseInfo && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${phaseInfo.badgeColor}`}
            >
              {phaseInfo.phaseLabel}
            </span>
          )}

          <button
            onClick={onOpenRaceSettings}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <Settings2 className="h-3.5 w-3.5 text-amber-400" />
            <span>Gestionar Carreras</span>
          </button>
        </div>
      </div>

      {/* Primary Race A Focus Banner */}
      {primaryRace ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Main Race Details */}
            <div className="md:col-span-2 rounded-xl bg-slate-950/80 p-4 border border-slate-800/80 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    <Flag className="h-3 w-3" />
                    OBJETIVO PRINCIPAL (PRIORIDAD A)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    📅 {primaryRace.date}
                  </span>
                </div>

                <h3 className="mt-2 text-base font-black text-white">
                  {primaryRace.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {getDistanceLabel(primaryRace.distance)}
                  {primaryRace.goalTarget && ` • Meta: ${primaryRace.goalTarget}`}
                </p>
              </div>

              {/* Start Date & Current Week Status */}
              {blueprint && (
                <div className="rounded-lg bg-slate-900/90 p-2.5 border border-slate-800 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-400">Inicio del Macrociclo: </span>
                    <strong className="text-white font-mono">{blueprint.startDate}</strong>
                    <span className="text-slate-500"> ({blueprint.totalWeeks} semanas de preparación)</span>
                  </div>
                  {currentWeek && (
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-bold text-cyan-300 border border-cyan-500/30">
                      📍 Semana {currentWeek.weekNumber} de {blueprint.totalWeeks}: {currentWeek.microcycleLabel}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Countdown & Focus Widget */}
            <div className="rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 p-4 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Cuenta Regresiva
                </span>
                <div className="mt-1">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-black font-mono text-amber-400">
                      {phaseInfo?.weeksRemaining ?? 0}
                    </span>
                    <span className="text-xs font-bold text-slate-300">semanas</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">
                    {phaseInfo?.daysRemaining ?? 0} días restantes
                  </p>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-800 pt-2 text-[11px]">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tirada Dominical Límite:</span>
                <p className="text-xs font-bold text-amber-300 mt-0.5">
                  ⏱️ Máx {phaseInfo?.maxLongRunMinutes ?? 55} min ({phaseInfo?.weeklyTssTarget})
                </p>
              </div>
            </div>
          </div>

          {/* Expandable 16-Week Macrocycle Timeline */}
          {blueprint && blueprint.weeks.length > 0 && (
            <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Compass className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">
                    Cronograma del Macrociclo ({blueprint.totalWeeks} Semanas)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Estructura 3:1 de Carga y Asimilación
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFullTimeline(!showFullTimeline)}
                  className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <span>{showFullTimeline ? "Ocultar Semanas" : "Ver Todas las Semanas"}</span>
                  {showFullTimeline ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Collapsed view: Show current week + 2 next weeks / Expanded: Show all */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-1">
                {(showFullTimeline ? blueprint.weeks : blueprint.weeks.slice(0, 8)).map((w) => (
                  <div
                    key={w.weekNumber}
                    className={`rounded-lg p-2 text-xs border transition ${
                      w.isCurrentWeek
                        ? "bg-cyan-950/60 border-cyan-500/60 shadow-sm shadow-cyan-500/20"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`font-mono font-bold ${w.isCurrentWeek ? "text-cyan-300" : "text-slate-400"}`}>
                        Sem {w.weekNumber}
                      </span>
                      {w.isCurrentWeek && (
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{w.formattedRange}</p>
                    <span
                      className={`mt-1.5 block rounded px-1 py-0.5 text-[9px] font-bold text-center border truncate ${w.microcycleBadgeColor}`}
                      title={w.microcycleLabel}
                    >
                      {w.microcycleLabel.split(" ")[0]}
                    </span>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 text-center font-semibold">
                      {w.targetTss} TSS
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State / Maintenance Mode */
        <div className="rounded-xl bg-slate-950/60 p-5 border border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-300">
            Actualmente te encuentras en <strong>Mantenimiento General Adaptativo</strong>.
          </p>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
            Agrega tu próxima competición objetivo (ej. Maratón de Valencia en Dic 2026) para que el agente calcule automáticamente la fecha de inicio del ciclo de 16 semanas y programe las semanas de carga y descarga 3:1.
          </p>
          <button
            onClick={onOpenRaceSettings}
            className="mt-1 inline-flex items-center space-x-1.5 rounded-xl bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition"
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Configurar Carreras de Temporada</span>
          </button>
        </div>
      )}
    </div>
  );
};
