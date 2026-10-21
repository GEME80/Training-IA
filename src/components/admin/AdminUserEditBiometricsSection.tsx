"use client";

import React from "react";
import { Zap, Timer, Activity } from "lucide-react";
import { RunningTrainingMode } from "@/lib/db/types";

interface AdminUserEditBiometricsSectionProps {
  runFtp: number;
  setRunFtp: (v: number) => void;
  bikeFtp: number;
  setBikeFtp: (v: number) => void;
  weightKg: number | "";
  setWeightKg: (v: number | "") => void;
  lthr: number | "";
  setLthr: (v: number | "") => void;
  maxHR: number | "";
  setMaxHR: (v: number | "") => void;
  restingHR: number | "";
  setRestingHR: (v: number | "") => void;
  runningTrainingMode: RunningTrainingMode;
  setRunningTrainingMode: (v: RunningTrainingMode) => void;
  runThresholdPaceStr: string;
  setRunThresholdPaceStr: (v: string) => void;
}

export const AdminUserEditBiometricsSection: React.FC<AdminUserEditBiometricsSectionProps> = ({
  runFtp,
  setRunFtp,
  bikeFtp,
  setBikeFtp,
  weightKg,
  setWeightKg,
  lthr,
  setLthr,
  maxHR,
  setMaxHR,
  restingHR,
  setRestingHR,
  runningTrainingMode,
  setRunningTrainingMode,
  runThresholdPaceStr,
  setRunThresholdPaceStr,
}) => {
  const isPace = runningTrainingMode === "PACE";
  const safeMaxHrFloor = lthr !== "" ? Math.round(Number(lthr) * 1.10) : null;

  return (
    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
          <Zap className="h-4 w-4 text-amber-600" />
          <span>Calibración Fisiológica & Biometría</span>
        </div>

        {/* Selector de Modalidad de Carrera: Ritmo vs Potencia */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => {
              setRunningTrainingMode("PACE");
              if (!runThresholdPaceStr) setRunThresholdPaceStr("4:18");
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
              isPace ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Timer className="h-3 w-3" />
            <span>Ritmo (/km)</span>
          </button>
          <button
            type="button"
            onClick={() => setRunningTrainingMode("POWER")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
              !isPace ? "bg-white text-amber-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Activity className="h-3 w-3" />
            <span>Potencia (Stryd)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Carrera: Ritmo Umbral o Potencia según la modalidad */}
        {isPace ? (
          <div>
            <label className="block text-[11px] font-bold text-emerald-900 mb-1">
              Ritmo Umbral Carrera
            </label>
            <input
              type="text"
              value={runThresholdPaceStr}
              onChange={(e) => setRunThresholdPaceStr(e.target.value)}
              placeholder="4:18"
              className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50/40 text-xs font-mono font-bold text-emerald-950 focus:outline-none focus:border-emerald-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-bold text-amber-900 mb-1">
              Stryd CP (W)
            </label>
            <input
              type="number"
              value={runFtp}
              onChange={(e) => setRunFtp(Number(e.target.value))}
              placeholder="280"
              className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/40 text-xs font-mono font-bold text-amber-950 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-cyan-900 mb-1">Ciclismo FTP (W)</label>
          <input
            type="number"
            value={bikeFtp}
            onChange={(e) => setBikeFtp(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Peso (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Ej. 68.5"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">FC Umbral (LTHR)</label>
          <input
            type="number"
            value={lthr}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              setLthr(val);
              if (val !== "" && (!maxHR || Number(maxHR) < Math.round(Number(val) * 1.10))) {
                setMaxHR(Math.round(Number(val) * 1.10));
              }
            }}
            placeholder="158 ppm"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-slate-700">FC Máxima (ppm)</label>
            {safeMaxHrFloor && (
              <span className="text-[9px] font-mono text-purple-600 font-bold">
                ≥{safeMaxHrFloor}
              </span>
            )}
          </div>
          <input
            type="number"
            value={maxHR}
            onChange={(e) => setMaxHR(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="174 ppm"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">FC Reposo (ppm)</label>
          <input
            type="number"
            value={restingHR}
            onChange={(e) => setRestingHR(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="48 ppm"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {isPace && (
        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
          <span>⚡</span>
          <span>
            <strong>Modalidad por Ritmo activa:</strong> Se sincronizará con Intervals.icu la prioridad <strong>Ritmo &gt; FC &gt; Potencia</strong> para calcular rTSS exacto y evitar que la potencia de muñeca de Garmin infle el CTL/ATL.
          </span>
        </div>
      )}

      {lthr !== "" && maxHR !== "" && Number(lthr) > Number(maxHR) && (
        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
          <span>⚠️</span>
          <span>
            <strong>Inversión detectada:</strong> La FC Umbral ({lthr} ppm) supera a la FC Máxima ({maxHR} ppm). Se normalizará automáticamente para preservar la coherencia fisiológica.
          </span>
        </div>
      )}
    </div>
  );
};
