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
    <div className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 sm:p-4 lg:p-5 space-y-2 sm:space-y-3.5 shadow-xs relative overflow-hidden">
      {/* Glow de Fondo Sutil */}
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-500/5 blur-2xl pointer-events-none" />

      {/* Cabecera del Atleta & Acciones (Fila Única Ultra-Compacta) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-xs shrink-0">
            {(athleteName || "AT").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white truncate">
                {athleteName || "Atleta"}
              </h3>
              {activeMode === "POWER" ? (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono text-[9px] font-bold border border-amber-500/20 shrink-0">
                  {runFtp > 0 ? `${runFtp}W` : "Sin CP"}
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/20 shrink-0">
                  {displayPace}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
              <span>{calculatedAge && calculatedAge > 0 ? `${calculatedAge}a` : ""} {gender ? `(${genderLabel})` : ""}</span>
              <span>•</span>
              <span>{weightKg && weightKg > 0 ? `${weightKg}kg` : ""}</span>
              <span>•</span>
              <span>{heightCm && heightCm > 0 ? `${heightCm}cm` : ""}</span>
              <span>•</span>
              <span className="text-slate-400">IMC {bmi}</span>
            </div>
          </div>
        </div>

        {/* Selector de Modo (Segmented Control Inline) */}
        {onToggleMode && (
          <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-[10px] sm:text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => onToggleMode("POWER")}
              className={`flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition cursor-pointer ${
                activeMode === "POWER"
                  ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Zap className="h-3 w-3" />
              <span>Potencia</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleMode("PACE")}
              className={`flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition cursor-pointer ${
                activeMode !== "POWER"
                  ? "bg-emerald-500 text-white font-black shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Timer className="h-3 w-3" />
              <span>Ritmo</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Strip: 6 Umbrales en 3 Columnas x 2 Filas en Móvil (Ultra-Compacto) */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2">
        {/* 1. Potencia Carrera (CP) */}
        <div
          onClick={() => onEditThreshold?.("RUN_FTP")}
          role="button"
          tabIndex={0}
          title="Toca para ajustar CP"
          className={`rounded-xl border ${
            activeMode === "POWER"
              ? "border-amber-500/50 bg-amber-500/10 dark:bg-amber-950/30"
              : "border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 opacity-60"
          } p-1.5 sm:p-2 flex flex-col justify-between cursor-pointer group hover:border-amber-400 transition-all select-none`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 gap-0.5">
            <span className="flex items-center gap-1 truncate">
              <Footprints className="h-3 w-3 text-amber-500 shrink-0" />
              <span className="truncate">Potencia</span>
            </span>
            <Edit3 className="h-2.5 w-2.5 text-slate-400 group-hover:text-amber-500 shrink-0" />
          </div>
          <div className="mt-0.5 flex items-baseline justify-between gap-0.5">
            <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white truncate">
              {activeMode === "POWER" && runFtp && runFtp > 0 ? `${runFtp}W` : "— W"}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-amber-600 font-bold shrink-0">
              {activeMode === "POWER" ? `${relativeRunPower}W/kg` : "Off"}
            </span>
          </div>
        </div>

        {/* 2. Ritmo Umbral (Pace) */}
        <div
          onClick={() => onEditThreshold?.("RUN_PACE")}
          role="button"
          tabIndex={0}
          title="Toca para ajustar Ritmo Umbral"
          className={`rounded-xl border ${
            activeMode === "PACE" || activeMode === "HYBRID"
              ? "border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-950/30"
              : "border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
          } p-1.5 sm:p-2 flex flex-col justify-between cursor-pointer group hover:border-emerald-400 transition-all select-none`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 gap-0.5">
            <span className="flex items-center gap-1 truncate">
              <Timer className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="truncate">Ritmo</span>
            </span>
            <Edit3 className="h-2.5 w-2.5 text-slate-400 group-hover:text-emerald-500 shrink-0" />
          </div>
          <div className="mt-0.5 flex items-baseline justify-between gap-0.5">
            <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white truncate">
              {displayPace.replace("/km", "")}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-emerald-600 font-bold shrink-0">
              {activeMode === "PACE" ? "Activo" : "Daniels"}
            </span>
          </div>
        </div>

        {/* 3. Bike FTP */}
        <div
          onClick={() => onEditThreshold?.("BIKE_FTP")}
          role="button"
          tabIndex={0}
          title="Toca para ajustar FTP Bici"
          className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-1.5 sm:p-2 flex flex-col justify-between cursor-pointer group hover:border-sky-400 transition-all select-none"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 gap-0.5">
            <span className="flex items-center gap-1 truncate">
              <Bike className="h-3 w-3 text-sky-500 shrink-0" />
              <span className="truncate">Bici FTP</span>
            </span>
            <Edit3 className="h-2.5 w-2.5 text-slate-400 group-hover:text-sky-500 shrink-0" />
          </div>
          <div className="mt-0.5 flex items-baseline justify-between gap-0.5">
            <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white truncate">
              {bikeFtp && bikeFtp > 0 ? `${bikeFtp}W` : "— W"}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-sky-600 font-bold shrink-0">
              {relativeBikePower}W/kg
            </span>
          </div>
        </div>

        {/* 4. Natación CSS */}
        <div
          onClick={() => onEditThreshold?.("SWIM_CSS")}
          role="button"
          tabIndex={0}
          title="Toca para ajustar CSS Natación"
          className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-950/30 p-1.5 sm:p-2 flex flex-col justify-between cursor-pointer group hover:border-cyan-400 transition-all select-none"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 gap-0.5">
            <span className="flex items-center gap-1 truncate">
              <Waves className="h-3 w-3 text-cyan-500 shrink-0" />
              <span className="truncate">Swim CSS</span>
            </span>
            <Edit3 className="h-2.5 w-2.5 text-slate-400 group-hover:text-cyan-500 shrink-0" />
          </div>
          <div className="mt-0.5 flex items-baseline justify-between gap-0.5">
            <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white truncate">
              {displaySwimCss.replace("/100m", "")}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-cyan-600 font-bold shrink-0">
              /100m
            </span>
          </div>
        </div>

        {/* 5. LTHR FC Umbral */}
        <div
          onClick={() => onEditThreshold?.("LTHR")}
          role="button"
          tabIndex={0}
          title="Toca para ajustar FC Umbral"
          className={`rounded-xl border ${activeMode === "HYBRID" ? "border-rose-500/40 bg-rose-500/10 dark:bg-rose-950/30" : "border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"} p-1.5 sm:p-2 flex flex-col justify-between cursor-pointer group hover:border-rose-400 transition-all select-none`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 gap-0.5">
            <span className="flex items-center gap-1 truncate">
              <HeartPulse className="h-3 w-3 text-rose-500 shrink-0" />
              <span className="truncate">FC Umbral</span>
            </span>
            <Edit3 className="h-2.5 w-2.5 text-slate-400 group-hover:text-rose-500 shrink-0" />
          </div>
          <div className="mt-0.5 flex items-baseline justify-between gap-0.5">
            <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white truncate">
              {lthr && lthr > 0 ? `${lthr}` : "—"}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-rose-600 font-bold shrink-0">
              {maxHR && maxHR > 0 ? `Máx ${maxHR}` : "bpm"}
            </span>
          </div>
        </div>

        {/* 6. FC Reposo */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-1.5 sm:p-2 flex flex-col justify-between select-none">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 gap-0.5">
            <span className="flex items-center gap-1 truncate">
              <Moon className="h-3 w-3 text-indigo-500 shrink-0" />
              <span className="truncate">FC Reposo</span>
            </span>
            <span className="text-[8px] font-mono text-indigo-600 font-bold">Mat</span>
          </div>
          <div className="mt-0.5 flex items-baseline justify-between gap-0.5">
            <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white truncate">
              {restingHR && restingHR > 0 ? `${restingHR}` : "—"}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 shrink-0">
              bpm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
