"use client";

import React from "react";
import { TrendingUp, Flame, Zap, Heart, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PhysiologicalStatus } from "@/lib/physiology/engine";

interface PhysiologicalCardsProps {
  status: PhysiologicalStatus | null;
  runFtp: number;
  bikeFtp: number;
}

export const PhysiologicalCards: React.FC<PhysiologicalCardsProps> = ({
  status,
  runFtp,
  bikeFtp,
}) => {
  if (!status) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-800/40 border border-slate-800" />
        ))}
      </div>
    );
  }

  const getTsbColor = (tsb: number) => {
    if (tsb > 5) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (tsb >= -15) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    if (tsb >= -25) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-red-400 bg-red-500/10 border-red-500/30";
  };

  const getHrvColor = (zScore: number | null) => {
    if (zScore === null) return "text-slate-400";
    if (zScore >= -0.5) return "text-emerald-400";
    if (zScore >= -1.5) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Alert if Fatigue Detected */}
      {status.status === "OVERTRAINING_RISK" && (
        <div className="flex items-center space-x-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <div>
            <span className="font-bold text-red-400">Riesgo de Sobreentrenamiento: </span>
            TSB en zona crítica ({status.tsb}) o caída de HRV vagal. Se recomienda priorizar descanso pasivo.
          </div>
        </div>
      )}

      {status.status === "OPTIMAL" && (
        <div className="flex items-center space-x-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
          <div>
            <span className="font-semibold text-emerald-300">Adaptación Biológica Óptima: </span>
            El atleta asimila la carga de entrenamiento en la zona neutra-progresiva del modelo Banister.
          </div>
        </div>
      )}

      {/* Grid of 6 Core Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* CTL Card */}
        <div className="card-gradient rounded-xl p-3.5 border border-slate-800 transition hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>CTL (Fitness)</span>
            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {Math.round(status.ctl * 10) / 10}
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Carga Crónica (42d)</p>
        </div>

        {/* ATL Card */}
        <div className="card-gradient rounded-xl p-3.5 border border-slate-800 transition hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>ATL (Fatiga)</span>
            <Flame className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {Math.round(status.atl * 10) / 10}
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Fatiga Aguda (7d)</p>
        </div>

        {/* TSB Card */}
        <div className="card-gradient rounded-xl p-3.5 border border-slate-800 transition hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>TSB (Forma)</span>
            <Zap className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className={`text-2xl font-black font-mono ${getTsbColor(status.tsb).split(" ")[0]}`}>
              {status.tsb > 0 ? `+${Math.round(status.tsb)}` : Math.round(status.tsb)}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Balance de Estrés</p>
        </div>

        {/* Rolling HRV Z-Score */}
        <div className="card-gradient rounded-xl p-3.5 border border-slate-800 transition hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>HRV Z-Score</span>
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono">
            <span className={getHrvColor(status.hrvZScore)}>
              {status.hrvZScore !== null ? (status.hrvZScore > 0 ? `+${status.hrvZScore}` : status.hrvZScore) : "N/D"}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            {status.currentHrv ? `${status.currentHrv} ms (Base: ${status.baselineHrvMean})` : "Rolling 30d"}
          </p>
        </div>

        {/* Ramp Rate */}
        <div className="card-gradient rounded-xl p-3.5 border border-slate-800 transition hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Ramp Rate</span>
            <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {status.rampRate > 0 ? `+${status.rampRate}` : status.rampRate}
          </div>
          <p className="mt-1 text-[10px] text-slate-400">ΔCTL / semana</p>
        </div>

        {/* Power Thresholds (Stryd & Bike) */}
        <div className="card-gradient rounded-xl p-3.5 border border-slate-800 transition hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Umbrales (W)</span>
            <Heart className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="mt-2 flex flex-col space-y-0.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">Stryd CP:</span>
              <span className="text-white font-bold">{runFtp}W</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold">Bike FTP:</span>
              <span className="text-white font-bold">{bikeFtp}W</span>
            </div>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Potencia de Referencia</p>
        </div>
      </div>
    </div>
  );
};
