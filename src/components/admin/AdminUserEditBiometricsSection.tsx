"use client";

import React from "react";
import { Zap } from "lucide-react";

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
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
        <Zap className="h-4 w-4 text-amber-600" />
        <span>Calibración Fisiológica & Biometría</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-amber-900 mb-1">Stryd CP (W)</label>
          <input
            type="number"
            value={runFtp}
            onChange={(e) => setRunFtp(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
          />
        </div>

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
            onChange={(e) => setLthr(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="168 ppm"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">FC Máxima (ppm)</label>
          <input
            type="number"
            value={maxHR}
            onChange={(e) => setMaxHR(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="185 ppm"
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
    </div>
  );
};
