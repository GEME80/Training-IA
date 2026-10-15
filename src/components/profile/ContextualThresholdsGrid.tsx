"use client";

import React, { useState } from "react";
import { Zap, Timer, Bike, Waves, HeartPulse, Moon, ChevronDown, Edit3, Footprints } from "lucide-react";
import { SportContextType } from "./SportContextSelector";

interface ContextualThresholdsGridProps {
  selectedSport: SportContextType;
  weightKg?: number;
  runFtp: number;
  bikeFtp: number;
  lthr?: number;
  maxHR?: number;
  restingHR?: number;
  runThresholdPaceStr?: string;
  swimCssStr?: string;
  runTelemetryMode: "POWER" | "PACE";
  onToggleRunMode: (mode: "POWER" | "PACE") => void;
  bikeTelemetryMode: "POWER" | "HR";
  onToggleBikeMode: (mode: "POWER" | "HR") => void;
  onEditThreshold?: (metric: "RUN_FTP" | "RUN_PACE" | "BIKE_FTP" | "LTHR" | "SWIM_CSS" | "RESTING_HR" | "MAX_HR") => void;
}

export const ContextualThresholdsGrid: React.FC<ContextualThresholdsGridProps> = ({
  selectedSport,
  weightKg,
  runFtp,
  bikeFtp,
  lthr,
  maxHR,
  restingHR,
  runThresholdPaceStr = "4:23",
  swimCssStr = "2:10",
  runTelemetryMode,
  onToggleRunMode,
  bikeTelemetryMode,
  onToggleBikeMode,
  onEditThreshold,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Cálculos de vatios por kilo
  const runWkg = weightKg && weightKg > 0 && runFtp > 0 ? (runFtp / weightKg).toFixed(2) : "4.10";
  const bikeWkg = weightKg && weightKg > 0 && bikeFtp > 0 ? (bikeFtp / weightKg).toFixed(2) : "2.76";

  const sportName =
    selectedSport === "RUN" ? "Carrera" : selectedSport === "BIKE" ? "Ciclismo" : "Natación";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 space-y-3 shadow-xs select-none">
      {/* Cabecera con Acordeón y Switch Contextual Interno */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 hover:text-emerald-600 transition cursor-pointer"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
            <span>Umbrales de {sportName}</span>
          </button>

          {onEditThreshold && (
            <button
              type="button"
              onClick={() => {
                if (selectedSport === "RUN") onEditThreshold(runTelemetryMode === "POWER" ? "RUN_FTP" : "RUN_PACE");
                else if (selectedSport === "BIKE") onEditThreshold("BIKE_FTP");
                else onEditThreshold("SWIM_CSS");
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition cursor-pointer"
            >
              <Edit3 className="h-3 w-3" />
              <span>Editar</span>
            </button>
          )}
        </div>

        {/* Switch Contextual Interno dependiente del deporte */}
        {selectedSport === "RUN" && (
          <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-[10px] sm:text-xs font-bold">
            <button
              type="button"
              onClick={() => onToggleRunMode("POWER")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                runTelemetryMode === "POWER"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 font-black shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Zap className="h-3 w-3" />
              <span>Potencia (W)</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleRunMode("PACE")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                runTelemetryMode === "PACE"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 font-black shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Timer className="h-3 w-3" />
              <span>Ritmo (/km)</span>
            </button>
          </div>
        )}

        {selectedSport === "BIKE" && (
          <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-[10px] sm:text-xs font-bold">
            <button
              type="button"
              onClick={() => onToggleBikeMode("POWER")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                bikeTelemetryMode === "POWER"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 font-black shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Zap className="h-3 w-3" />
              <span>Potencia (W)</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleBikeMode("HR")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                bikeTelemetryMode === "HR"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 font-black shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <HeartPulse className="h-3 w-3" />
              <span>Frecuencia Cardíaca</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid de Micro-Cards Contextuales */}
      {!isCollapsed && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 animate-fadeIn">
          {/* ── CASO A: CARRERA (4 TARJETAS) ── */}
          {selectedSport === "RUN" && (
            <>
              {/* Tarjeta 1: Potencia Run */}
              <div
                onClick={() => onEditThreshold?.("RUN_FTP")}
                className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Footprints className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    Potencia Run
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">{runWkg} W/kg</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  {runFtp > 0 ? `${runFtp}W` : "336W"}
                </div>
              </div>

              {/* Tarjeta 2: Ritmo Daniels VDOT */}
              <div
                onClick={() => onEditThreshold?.("RUN_PACE")}
                className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3 text-sky-500" />
                    Ritmo Daniels
                  </span>
                  <span className="font-mono text-sky-600 dark:text-sky-400 font-black">Umbral T</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  {runThresholdPaceStr || "4:23"}{" "}
                  <span className="text-[10px] font-sans font-normal text-slate-400">/km</span>
                </div>
              </div>

              {/* Tarjeta 3: FC Umbral / Máx */}
              <div
                onClick={() => onEditThreshold?.("LTHR")}
                className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <HeartPulse className="h-3 w-3 text-rose-500" />
                    FC Umbral / Máx
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">Cardio</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  {lthr || 178}{" "}
                  <span className="text-slate-400 font-normal text-xs">/ {maxHR || 185}</span>{" "}
                  <span className="text-[10px] font-sans font-normal text-slate-400">bpm</span>
                </div>
              </div>

              {/* Tarjeta 4: FC Reposo */}
              <div
                onClick={() => onEditThreshold?.("RESTING_HR")}
                className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Moon className="h-3 w-3 text-indigo-400" />
                    FC Reposo
                  </span>
                  <span className="text-[9px] text-indigo-500 font-sans font-bold">Basal ✎</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  {restingHR || 54}{" "}
                  <span className="text-[10px] font-sans font-normal text-slate-400">bpm</span>
                </div>
              </div>
            </>
          )}

          {/* ── CASO B: CICLISMO (3 TARJETAS) ── */}
          {selectedSport === "BIKE" && (
            <>
              {/* Tarjeta 1: FTP Ciclismo */}
              <div
                onClick={() => onEditThreshold?.("BIKE_FTP")}
                className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Bike className="h-3 w-3 text-sky-500" />
                    FTP Ciclismo
                  </span>
                  <span className="font-mono text-sky-600 dark:text-sky-400 font-black">{bikeWkg} W/kg</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  {bikeFtp > 0 ? `${bikeFtp}W` : "226W"}
                </div>
              </div>

              {/* Tarjeta 2: FC Umbral */}
              <div
                onClick={() => onEditThreshold?.("LTHR")}
                className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <HeartPulse className="h-3 w-3 text-rose-500" />
                    FC Umbral Ciclismo
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">Cardio</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  {lthr || 178}{" "}
                  <span className="text-[10px] font-sans font-normal text-slate-400">bpm</span>
                </div>
              </div>

              {/* Tarjeta 3: FC Reposo */}
              <div
                onClick={() => onEditThreshold?.("RESTING_HR")}
                className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Moon className="h-3 w-3 text-indigo-400" />
                    FC Reposo
                  </span>
                  <span className="text-[9px] text-indigo-500 font-sans font-bold">Basal ✎</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  {restingHR || 54}{" "}
                  <span className="text-[10px] font-sans font-normal text-slate-400">bpm</span>
                </div>
              </div>
            </>
          )}

          {/* ── CASO C: NATACIÓN (3 TARJETAS) ── */}
          {selectedSport === "SWIM" && (
            <>
              {/* Tarjeta 1: Ritmo CSS */}
              <div
                onClick={() => onEditThreshold?.("SWIM_CSS")}
                className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Waves className="h-3 w-3 text-cyan-500" />
                    Ritmo CSS
                  </span>
                  <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">Vel. Crítica</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  {swimCssStr || "2:10"}{" "}
                  <span className="text-[10px] font-sans font-normal text-slate-400">/100m</span>
                </div>
              </div>

              {/* Tarjeta 2: FC Umbral / Esfuerzo */}
              <div
                onClick={() => onEditThreshold?.("LTHR")}
                className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <HeartPulse className="h-3 w-3 text-rose-500" />
                    FC Umbral / Esfuerzo
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">Cardio</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  {lthr || 178}{" "}
                  <span className="text-[10px] font-sans font-normal text-slate-400">bpm</span>
                </div>
              </div>

              {/* Tarjeta 3: FC Reposo */}
              <div
                onClick={() => onEditThreshold?.("RESTING_HR")}
                className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Moon className="h-3 w-3 text-indigo-400" />
                    FC Reposo
                  </span>
                  <span className="text-[9px] text-indigo-500 font-sans font-bold">Basal ✎</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  {restingHR || 54}{" "}
                  <span className="text-[10px] font-sans font-normal text-slate-400">bpm</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
