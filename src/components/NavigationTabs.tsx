"use client";

import React from "react";
import { Compass, Sparkles, Settings2, Calendar, Trophy, Activity } from "lucide-react";

export type NavigationTabType = "macrocycle" | "microcycle" | "settings";

interface NavigationTabsProps {
  activeTab: NavigationTabType;
  onTabChange: (tab: NavigationTabType) => void;
  primaryRaceName?: string | null;
  macrocyclePhaseLabel?: string;
  isEvaluating?: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  primaryRaceName,
  macrocyclePhaseLabel,
  isEvaluating,
}) => {
  return (
    <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-[65px] z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between overflow-x-auto py-2.5 no-scrollbar gap-3">
          {/* Tab Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* 1. Plan del Macrociclo */}
            <button
              type="button"
              onClick={() => onTabChange("macrocycle")}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition border ${
                activeTab === "macrocycle"
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10"
                  : "bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <Compass className="h-4 w-4 text-amber-400" />
              <span>1. Plan del Macrociclo</span>
              {primaryRaceName && (
                <span className="hidden sm:inline-block rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] text-amber-300 border border-amber-500/20 truncate max-w-[120px]">
                  {primaryRaceName}
                </span>
              )}
            </button>

            {/* 2. Microciclo Activo & IA */}
            <button
              type="button"
              onClick={() => onTabChange("microcycle")}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition border ${
                activeTab === "microcycle"
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                  : "bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <Sparkles className={`h-4 w-4 text-cyan-400 ${isEvaluating ? "animate-spin" : ""}`} />
              <span>2. Microciclo Activo & IA</span>
              {macrocyclePhaseLabel && (
                <span className="hidden sm:inline-block rounded bg-cyan-500/10 px-1.5 py-0.2 text-[10px] text-cyan-300 border border-cyan-500/20 truncate max-w-[140px]">
                  {macrocyclePhaseLabel}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
