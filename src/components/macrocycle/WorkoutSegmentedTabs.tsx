"use client";

import React from "react";
import { TrendingUp, BarChart2, FileText } from "lucide-react";

export type WorkoutModalTab = "TELEMETRY" | "METRICS" | "PLAN";

interface WorkoutSegmentedTabsProps {
  activeTab: WorkoutModalTab;
  onTabChange: (tab: WorkoutModalTab) => void;
}

export const WorkoutSegmentedTabs: React.FC<WorkoutSegmentedTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="px-3.5 sm:px-5 pt-2 pb-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl text-center text-xs font-bold">
        <button
          type="button"
          onClick={() => onTabChange("TELEMETRY")}
          className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "TELEMETRY"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5 text-cyan-500" />
          <span>Telemetría</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("METRICS")}
          className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "METRICS"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <BarChart2 className="h-3.5 w-3.5 text-purple-500" />
          <span>Fisiología</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("PLAN")}
          className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "PLAN"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-amber-500" />
          <span>Plan</span>
        </button>
      </div>
    </div>
  );
};
