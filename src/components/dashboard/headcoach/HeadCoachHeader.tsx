"use client";

import React from "react";
import { Activity } from "lucide-react";
import { AthleteProfile } from "@/lib/intervals/types";
import { PhysiologicalStatus } from "@/lib/physiology/engine";

interface HeadCoachHeaderProps {
  physioStatus: PhysiologicalStatus | null;
  profile: AthleteProfile;
}

export const HeadCoachHeader: React.FC<HeadCoachHeaderProps> = ({
  physioStatus,
  profile,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-xs border border-emerald-400/40">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Head Coach Fisiológico
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              EN VIVO
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Especialista en modulación adaptativa de microciclos, fatiga y asimilación biológica.
          </p>
        </div>
      </div>

      {/* Mini-Cinta de Telemetría PMC */}
      <div className="flex items-center gap-1.5 text-xs font-mono overflow-x-auto no-scrollbar">
        <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 font-bold shrink-0">
          📈 CTL: {physioStatus?.ctl?.toFixed(1) ?? profile.ctl ?? 0}
        </span>
        <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 font-bold shrink-0">
          ⚡ ATL: {physioStatus?.atl?.toFixed(1) ?? profile.atl ?? 0}
        </span>
        <span
          className={`px-2.5 py-1 rounded-xl font-bold border shrink-0 ${
            (physioStatus?.tsb ?? 0) >= 5
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
              : (physioStatus?.tsb ?? 0) < -20
              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300"
              : "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300"
          }`}
        >
          🔋 TSB:{" "}
          {physioStatus?.tsb !== undefined
            ? physioStatus.tsb >= 0
              ? `+${physioStatus.tsb.toFixed(1)}`
              : physioStatus.tsb.toFixed(1)
            : 0}
        </span>
      </div>
    </div>
  );
};
