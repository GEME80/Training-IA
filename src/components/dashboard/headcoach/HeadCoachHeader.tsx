"use client";

import React from "react";
import { Activity } from "lucide-react";
import { AthleteProfile } from "@/lib/intervals/types";
import { PhysiologicalStatus } from "@/lib/physiology/engine";

interface HeadCoachHeaderProps {
  physioStatus?: PhysiologicalStatus | null;
  profile?: AthleteProfile;
}

export const HeadCoachHeader: React.FC<HeadCoachHeaderProps> = () => {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2.5 shrink-0">
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-xs border border-emerald-400/40 shrink-0">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              Head Coach Fisiológico
            </h2>
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              EN VIVO
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 sm:line-clamp-none">
            Especialista en modulación adaptativa de microciclos, fatiga y asimilación biológica.
          </p>
        </div>
      </div>
    </div>
  );
};
