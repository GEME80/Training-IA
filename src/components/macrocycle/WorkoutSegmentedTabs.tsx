"use client";

import React from "react";
import { BarChart3, TrendingUp, TableProperties } from "lucide-react";

export type WorkoutModalTab = "RESUMEN" | "EVOLUCION" | "DETALLE";

interface WorkoutSegmentedTabsProps {
  activeTab: WorkoutModalTab;
  onTabChange: (tab: WorkoutModalTab) => void;
}

export const WorkoutSegmentedTabs: React.FC<WorkoutSegmentedTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="px-3.5 sm:px-5 pt-2 pb-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 select-none">
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl text-center text-xs font-bold">
        {/* Tab 1: Resumen (Top métricas / Zonas con fondo de escala) */}
        <button
          type="button"
          onClick={() => onTabChange("RESUMEN")}
          className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "RESUMEN"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5 text-purple-500" />
          <span>Resumen</span>
        </button>

        {/* Tab 2: Evolución (Telemetría / Dinámica de series) */}
        <button
          type="button"
          onClick={() => onTabChange("EVOLUCION")}
          className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "EVOLUCION"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5 text-cyan-500" />
          <span>Evolución</span>
        </button>

        {/* Tab 3: Detalle (Fisiología completa & Plan) */}
        <button
          type="button"
          onClick={() => onTabChange("DETALLE")}
          className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "DETALLE"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <TableProperties className="h-3.5 w-3.5 text-amber-500" />
          <span>Detalle</span>
        </button>
      </div>
    </div>
  );
};
