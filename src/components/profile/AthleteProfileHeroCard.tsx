"use client";

import React from "react";
import { Footprints, Bike, HeartPulse, Moon, Edit3, Timer } from "lucide-react";
import { RunningTrainingMode } from "@/lib/db/types";
import { resolveRunningMode, formatPace, parsePaceToSeconds } from "@/lib/physiology/runningWorkoutAdapter";

interface AthleteProfileHeroCardProps {
  athleteName: string;
  email?: string;
  calculatedAge?: number;
  birthDate?: string;
  gender?: "M" | "F" | "OTHER";
  weightKg?: number;
  heightCm?: number;
  runFtp?: number;
  bikeFtp?: number;
  lthr?: number;
  restingHR?: number;
  maxHR?: number;
  runningTrainingMode?: RunningTrainingMode;
  hasRunningPowerMeter?: boolean;
  runThresholdPaceSecPerKm?: number;
  runThresholdPaceStr?: string;
  onOpenEditModal: () => void;
  onToggleMode?: (newMode: RunningTrainingMode) => void;
  onEditThreshold?: (metric: "RUN_FTP" | "RUN_PACE" | "BIKE_FTP" | "LTHR") => void;
}

export const AthleteProfileHeroCard: React.FC<AthleteProfileHeroCardProps> = ({
  athleteName,
  email = "",
  calculatedAge,
  birthDate,
  gender,
  weightKg,
  heightCm,
  runFtp = 0,
  bikeFtp = 0,
  lthr,
  restingHR,
  maxHR,
  runningTrainingMode,
  hasRunningPowerMeter,
  runThresholdPaceSecPerKm,
  runThresholdPaceStr,
  onOpenEditModal,
  onToggleMode,
  onEditThreshold,
}) => {
  const activeMode = resolveRunningMode({
    hasRunningPowerMeter,
    runningTrainingMode,
    runFtp,
  });

  const effPaceSec = runThresholdPaceSecPerKm || parsePaceToSeconds(runThresholdPaceStr);
  const displayPace = runThresholdPaceStr || (effPaceSec > 0 ? `${formatPace(effPaceSec)}/km` : "— /km");

  const relativeRunPower = weightKg && weightKg > 0 && runFtp && runFtp > 0 ? (runFtp / weightKg).toFixed(2) : "—";
  const relativeBikePower = weightKg && weightKg > 0 && bikeFtp && bikeFtp > 0 ? (bikeFtp / weightKg).toFixed(2) : "—";
  const bmi = weightKg && weightKg > 0 && heightCm && heightCm > 0 ? (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1) : "—";
  const genderLabel = gender === "F" ? "Mujer" : gender === "M" ? "Hombre" : "Atleta";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs relative overflow-hidden">
      {/* Glow de Fondo Sutil */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-500/5 blur-2xl pointer-events-none" />

      {/* Cabecera del Atleta & Datos Demográficos */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
            {(athleteName || "AT").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {athleteName || "Atleta"}
              </h3>
              {activeMode === "POWER" ? (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold border border-amber-500/20">
                  ⚡ STRYD POWER ({runFtp > 0 ? `${runFtp}W` : "Sin CP"})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/20">
                  ⏱️❤️ HÍBRIDO (Pace {displayPace} • {lthr ? `${lthr} bpm` : "Sin LTHR"})
                </span>
              )}
              {email && (
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  • {email}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 pt-0.5">
              <span>{calculatedAge && calculatedAge > 0 ? `${calculatedAge} años` : "Edad sin configurar"} {gender ? `(${genderLabel})` : ""}</span>
              <span>•</span>
              <span>{weightKg && weightKg > 0 ? `${weightKg} kg` : "— kg"}</span>
              <span>•</span>
              <span>{heightCm && heightCm > 0 ? `${heightCm} cm` : "— cm"}</span>
              <span>•</span>
              <span className="text-slate-400">IMC {bmi}</span>
            </div>
          </div>
        </div>

        {/* Acciones: Selector Rápido de Modelo + Botón Editar */}
        <div className="flex flex-wrap items-center gap-2">
          {onToggleMode && (
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => onToggleMode("POWER")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeMode === "POWER"
                    ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Footprints className="h-3.5 w-3.5" />
                <span>⚡ Potencia Stryd</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleMode("HYBRID")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeMode === "HYBRID"
                    ? "bg-emerald-500 text-white font-black shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Timer className="h-3.5 w-3.5" />
                <span>⏱️❤️ Híbrido</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenEditModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer shadow-xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Editar Perfil</span>
          </button>
        </div>
      </div>

      {/* KPI Strip: 5 Umbrales Fisiológicos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
        {/* 1. Stryd CP */}
        <div
          onClick={() => onEditThreshold?.("RUN_FTP")}
          role="button"
          tabIndex={0}
          title="Haz clic para editar la Potencia Stryd (CP)"
          className={`rounded-xl border ${
            activeMode === "POWER"
              ? "border-2 border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20"
              : "border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
          } p-3 flex flex-col justify-between cursor-pointer group hover:border-amber-400 hover:ring-2 hover:ring-amber-400/20 hover:scale-[1.01] transition-all select-none`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Footprints className="h-3.5 w-3.5 text-amber-500" />
              Stryd CP (Run)
              <Edit3 className="h-2.5 w-2.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-amber-500 transition" />
            </span>
            <span className="text-[10px] font-mono text-amber-600 font-bold">⚡ {relativeRunPower} W/kg</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {runFtp && runFtp > 0 ? (
                <>
                  {runFtp} <span className="text-xs text-slate-400 font-sans">W</span>
                </>
              ) : (
                <span className="text-slate-400 font-medium text-base">— W</span>
              )}
            </span>
            <span
              className={`text-[9px] font-mono font-bold ${
                activeMode === "POWER"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-400"
              }`}
            >
              {activeMode === "POWER" ? "Modo Activo" : "Referencia"}
            </span>
          </div>
        </div>

        {/* 2. Ritmo Umbral (Pace) */}
        <div
          onClick={() => onEditThreshold?.("RUN_PACE")}
          role="button"
          tabIndex={0}
          title="Haz clic para editar el Ritmo Umbral de Carrera"
          className={`rounded-xl border ${
            activeMode === "HYBRID"
              ? "border-2 border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20"
              : "border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
          } p-3 flex flex-col justify-between cursor-pointer group hover:border-emerald-400 hover:ring-2 hover:ring-emerald-400/20 hover:scale-[1.01] transition-all select-none`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5 text-emerald-500" />
              Ritmo Umbral
              <Edit3 className="h-2.5 w-2.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-emerald-500 transition" />
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">
              {activeMode === "HYBRID" ? "Pace Calidad" : "Daniels"}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {displayPace}
            </span>
            <span
              className={`text-[9px] font-mono font-bold ${
                activeMode === "HYBRID"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400"
              }`}
            >
              {activeMode === "HYBRID" ? "Híbrido Activo" : "Referencia"}
            </span>
          </div>
        </div>

        {/* 3. Bike FTP */}
        <div
          onClick={() => onEditThreshold?.("BIKE_FTP")}
          role="button"
          tabIndex={0}
          title="Haz clic para editar el FTP de Ciclismo"
          className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 flex flex-col justify-between cursor-pointer group hover:border-sky-400 hover:ring-2 hover:ring-sky-400/20 hover:scale-[1.01] transition-all select-none"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Bike className="h-3.5 w-3.5 text-sky-500" />
              Ciclismo FTP
              <Edit3 className="h-2.5 w-2.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-sky-500 transition" />
            </span>
            <span className="text-[10px] font-mono text-sky-600 font-bold">⚡ {relativeBikePower} W/kg</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {bikeFtp && bikeFtp > 0 ? (
                <>
                  {bikeFtp} <span className="text-xs text-slate-400 font-sans">W</span>
                </>
              ) : (
                <span className="text-slate-400 font-medium text-base">— W</span>
              )}
            </span>
            <span className="text-[9px] font-mono text-slate-400">Umbral Funcional</span>
          </div>
        </div>

        {/* 4. LTHR FC Umbral */}
        <div
          onClick={() => onEditThreshold?.("LTHR")}
          role="button"
          tabIndex={0}
          title="Haz clic para editar la FC Umbral (LTHR)"
          className={`rounded-xl border ${activeMode === "HYBRID" ? "border-2 border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20" : "border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"} p-3 flex flex-col justify-between cursor-pointer group hover:border-rose-400 hover:ring-2 hover:ring-rose-400/20 hover:scale-[1.01] transition-all select-none`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
              FC Umbral (LTHR)
              <Edit3 className="h-2.5 w-2.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-rose-500 transition" />
            </span>
            <span className="text-[10px] font-mono text-rose-600 font-bold">{maxHR && maxHR > 0 ? `Máx ${maxHR}` : "Sin Máx"}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {lthr && lthr > 0 ? (
                <>
                  {lthr} <span className="text-xs text-slate-400 font-sans">bpm</span>
                </>
              ) : (
                <span className="text-slate-400 font-medium text-base">— bpm</span>
              )}
            </span>
            <span className="text-[9px] font-mono text-slate-400">{activeMode === "HYBRID" ? "Fondos & Suaves" : "Lactato Z4"}</span>
          </div>
        </div>

        {/* 4. FC Reposo */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              FC Reposo (RHR)
            </span>
            <span className="text-[10px] font-mono text-indigo-600 font-bold">Matutino</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {restingHR && restingHR > 0 ? (
                <>
                  {restingHR} <span className="text-xs text-slate-400 font-sans">bpm</span>
                </>
              ) : (
                <span className="text-slate-400 font-medium text-base">— bpm</span>
              )}
            </span>
            <span className="text-[9px] font-mono text-slate-400">Recuperación</span>
          </div>
        </div>
      </div>
    </div>
  );
};
