"use client";

import React from "react";
import { Footprints, Bike, HeartPulse, Moon, Timer, Zap, Waves, Edit3 } from "lucide-react";
import { RunningTrainingMode } from "@/lib/db/types";
import { resolveRunningMode, formatPace, parsePaceToSeconds, formatSwimPace, parseSwimPaceToSeconds } from "@/lib/physiology/runningWorkoutAdapter";

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
  swimCssSecPer100m?: number;
  swimCssStr?: string;
  onToggleMode?: (newMode: RunningTrainingMode) => void;
  onEditThreshold?: (metric: "RUN_FTP" | "RUN_PACE" | "BIKE_FTP" | "LTHR" | "SWIM_CSS") => void;
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
  swimCssSecPer100m,
  swimCssStr,
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

  const effSwimCssSec = swimCssSecPer100m || parseSwimPaceToSeconds(swimCssStr);
  const displaySwimCss = swimCssStr || (effSwimCssSec > 0 ? `${formatSwimPace(effSwimCssSec)}/100m` : "— /100m");

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
                  POTENCIA CARRERA ({runFtp > 0 ? `${runFtp}W` : "Sin CP"})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/20">
                  RITMO (PACE) (Ritmo {displayPace})
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

        {/* Acciones: Selector Rápido de Modelo */}
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
                <Zap className="h-3.5 w-3.5" />
                <span>Potencia Carrera</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleMode("PACE")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeMode !== "POWER"
                    ? "bg-emerald-500 text-white font-black shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Timer className="h-3.5 w-3.5" />
                <span>Ritmo (Pace)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Strip: Umbrales Fisiológicos Multideporte */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {/* 1. Potencia Carrera (CP) */}
        <div
          onClick={() => onEditThreshold?.("RUN_FTP")}
          role="button"
          tabIndex={0}
          title="Haz clic para ajustar la Potencia de Carrera (CP)"
          className={`rounded-xl border ${
            activeMode === "POWER"
              ? "border-2 border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20"
              : "border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 opacity-60"
          } p-3 flex flex-col justify-between cursor-pointer group hover:border-amber-400 hover:ring-2 hover:ring-amber-400/20 hover:scale-[1.01] transition-all select-none`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Footprints className="h-3.5 w-3.5 text-amber-500" />
              Potencia Run
            </span>
            <span className="text-[10px] font-mono text-amber-600 font-bold">{activeMode === "POWER" ? `⚡ ${relativeRunPower} W/kg` : "Inactivo"}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-black font-mono text-slate-900 dark:text-white">
              {activeMode === "POWER" && runFtp && runFtp > 0 ? (
                <>
                  {runFtp} <span className="text-xs text-slate-400 font-sans">W</span>
                </>
              ) : (
                <span className="text-slate-400 font-medium text-base">— W</span>
              )}
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition flex items-center gap-1">
              <Edit3 className="h-2.5 w-2.5" />
              <span>Ajustar</span>
            </span>
          </div>
        </div>

        {/* 2. Ritmo Umbral (Pace) */}
        <div
          onClick={() => onEditThreshold?.("RUN_PACE")}
          role="button"
          tabIndex={0}
          title="Haz clic para ajustar el Ritmo Umbral de Carrera"
          className={`rounded-xl border ${
            activeMode === "PACE" || activeMode === "HYBRID"
              ? "border-2 border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20"
              : "border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
          } p-3 flex flex-col justify-between cursor-pointer group hover:border-emerald-400 hover:ring-2 hover:ring-emerald-400/20 hover:scale-[1.01] transition-all select-none`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5 text-emerald-500" />
              Ritmo Umbral
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">
              {activeMode === "PACE" ? "Activo" : activeMode === "HYBRID" ? "Pace Run" : "Daniels"}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-black font-mono text-slate-900 dark:text-white">
              {displayPace}
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition flex items-center gap-1">
              <Edit3 className="h-2.5 w-2.5" />
              <span>Ajustar</span>
            </span>
          </div>
        </div>

        {/* 3. Bike FTP */}
        <div
          onClick={() => onEditThreshold?.("BIKE_FTP")}
          role="button"
          tabIndex={0}
          title="Haz clic para ajustar el FTP de Ciclismo"
          className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 flex flex-col justify-between cursor-pointer group hover:border-sky-400 hover:ring-2 hover:ring-sky-400/20 hover:scale-[1.01] transition-all select-none"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Bike className="h-3.5 w-3.5 text-sky-500" />
              Ciclismo FTP
            </span>
            <span className="text-[10px] font-mono text-sky-600 font-bold">⚡ {relativeBikePower} W/kg</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-black font-mono text-slate-900 dark:text-white">
              {bikeFtp && bikeFtp > 0 ? (
                <>
                  {bikeFtp} <span className="text-xs text-slate-400 font-sans">W</span>
                </>
              ) : (
                <span className="text-slate-400 font-medium text-base">— W</span>
              )}
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 group-hover:bg-sky-500 group-hover:text-white transition flex items-center gap-1">
              <Edit3 className="h-2.5 w-2.5" />
              <span>Ajustar</span>
            </span>
          </div>
        </div>

        {/* 4. Natación CSS */}
        <div
          onClick={() => onEditThreshold?.("SWIM_CSS")}
          role="button"
          tabIndex={0}
          title="Haz clic para ajustar el Ritmo CSS de Natación"
          className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-950/20 p-3 flex flex-col justify-between cursor-pointer group hover:border-cyan-400 hover:ring-2 hover:ring-cyan-400/20 hover:scale-[1.01] transition-all select-none"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Waves className="h-3.5 w-3.5 text-cyan-500" />
              Natación CSS
            </span>
            <span className="text-[10px] font-mono text-cyan-600 font-bold">100m</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-black font-mono text-slate-900 dark:text-white">
              {displaySwimCss}
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white transition flex items-center gap-1">
              <Edit3 className="h-2.5 w-2.5" />
              <span>Ajustar</span>
            </span>
          </div>
        </div>

        {/* 5. LTHR FC Umbral */}
        <div
          onClick={() => onEditThreshold?.("LTHR")}
          role="button"
          tabIndex={0}
          title="Haz clic para ajustar la FC Umbral (LTHR)"
          className={`rounded-xl border ${activeMode === "HYBRID" ? "border-2 border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20" : "border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"} p-3 flex flex-col justify-between cursor-pointer group hover:border-rose-400 hover:ring-2 hover:ring-rose-400/20 hover:scale-[1.01] transition-all select-none`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
              FC Umbral
            </span>
            <span className="text-[10px] font-mono text-rose-600 font-bold">{maxHR && maxHR > 0 ? `Máx ${maxHR}` : "Sin Máx"}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-black font-mono text-slate-900 dark:text-white">
              {lthr && lthr > 0 ? (
                <>
                  {lthr} <span className="text-xs text-slate-400 font-sans">bpm</span>
                </>
              ) : (
                <span className="text-slate-400 font-medium text-base">— bpm</span>
              )}
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition flex items-center gap-1">
              <Edit3 className="h-2.5 w-2.5" />
              <span>Ajustar</span>
            </span>
          </div>
        </div>

        {/* 6. FC Reposo */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              FC Reposo
            </span>
            <span className="text-[10px] font-mono text-indigo-600 font-bold">Matutino</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-black font-mono text-slate-900 dark:text-white">
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
