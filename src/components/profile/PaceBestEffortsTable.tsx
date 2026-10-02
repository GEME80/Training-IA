"use client";

import React from "react";
import { Timer, Zap, Milestone } from "lucide-react";
import { PaceCurveDataSet } from "@/lib/intervals/curvesTypes";

interface PaceBestEffortsTableProps {
  recent42d?: PaceCurveDataSet;
  season?: PaceCurveDataSet;
  thresholdPaceSec?: number;
  thresholdPaceStr?: string;
}

const DISTANCES = [
  { meters: 400, label: "400m" },
  { meters: 1000, label: "1 km" },
  { meters: 2000, label: "2 km" },
  { meters: 5000, label: "5 km" },
  { meters: 10000, label: "10 km" },
  { meters: 21097, label: "21.1 km", milestone: "Media" },
  { meters: 42195, label: "42.2 km", milestone: "Maratón" },
];

export const PaceBestEffortsTable: React.FC<PaceBestEffortsTableProps> = ({
  recent42d,
  season,
  thresholdPaceStr = "4:45/km",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Timer className="h-4 w-4 text-emerald-500" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white font-mono">
            Mejores Esfuerzos (Ritmo)
          </h4>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono font-bold">
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            42 días
          </span>
          <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            Esta temporada
          </span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-xs font-mono min-w-[280px]">
          <thead>
            <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800/80">
              <th className="text-left py-1 font-semibold">Distancia</th>
              <th className="text-right py-1 font-semibold text-indigo-600 dark:text-indigo-400">42d (Tiempo)</th>
              <th className="text-right py-1 font-semibold text-indigo-500/70 hidden sm:table-cell">Ritmo</th>
              <th className="text-right py-1 font-semibold text-pink-600 dark:text-pink-400">Temp (Tiempo)</th>
              <th className="text-right py-1 font-semibold text-pink-500/70 hidden sm:table-cell">Ritmo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {DISTANCES.map((d) => {
              const rec42 = recent42d?.records.find((r) => Math.abs(r.distanceMeters - d.meters) <= d.meters * 0.2);
              const recSea = season?.records.find((r) => Math.abs(r.distanceMeters - d.meters) <= d.meters * 0.2);

              return (
                <tr key={d.label} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Milestone className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{d.label}</span>
                      {d.milestone && (
                        <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {d.milestone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-1.5 text-right font-black text-indigo-700 dark:text-indigo-300">
                    {rec42 ? rec42.timeFormatted : "—"}
                  </td>
                  <td className="py-1.5 text-right text-slate-500 text-[11px] hidden sm:table-cell">
                    {rec42 ? rec42.paceFormatted : "—"}
                  </td>
                  <td className="py-1.5 text-right font-black text-pink-700 dark:text-pink-300">
                    {recSea ? recSea.timeFormatted : "—"}
                  </td>
                  <td className="py-1.5 text-right text-slate-500 text-[11px] hidden sm:table-cell">
                    {recSea ? recSea.paceFormatted : "—"}
                  </td>
                </tr>
              );
            })}

            {/* Fila Informativa de Ritmo Umbral Daniels */}
            <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
              <td className="py-1.5 font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Zap className="h-3 w-3 text-emerald-500" />
                <span>Ritmo Umbral</span>
              </td>
              <td colSpan={4} className="py-1.5 text-right font-mono font-black text-emerald-700 dark:text-emerald-300">
                {thresholdPaceStr.replace("/km", "")} /km (Base Daniels)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
