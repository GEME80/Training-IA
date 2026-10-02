"use client";

import React from "react";
import { Award, Zap, Activity } from "lucide-react";
import { BestEffortRow, PowerCurveDataSet } from "@/lib/intervals/curvesTypes";

interface SportBestEffortsTableProps {
  bestEfforts?: BestEffortRow[];
  recent42d?: PowerCurveDataSet;
  season?: PowerCurveDataSet;
  weightKg?: number;
  sportTitle?: string;
}

export const SportBestEffortsTable: React.FC<SportBestEffortsTableProps> = ({
  bestEfforts = [],
  recent42d,
  season,
  weightKg = 82,
  sportTitle = "Ciclismo",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Award className="h-4 w-4 text-amber-500" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white font-mono">
            Mejores Esfuerzos ({sportTitle})
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
              <th className="text-left py-1 font-semibold">Duración</th>
              <th className="text-right py-1 font-semibold text-indigo-600 dark:text-indigo-400">42d (W)</th>
              <th className="text-right py-1 font-semibold text-indigo-500/70 hidden sm:table-cell">W/kg</th>
              <th className="text-right py-1 font-semibold text-pink-600 dark:text-pink-400">Temp (W)</th>
              <th className="text-right py-1 font-semibold text-pink-500/70 hidden sm:table-cell">W/kg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {/* Esfuerzos por tiempo */}
            {bestEfforts
              .filter((r) => r.sec > 0)
              .map((row) => (
                <tr key={row.durationLabel} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-1.5 font-bold text-slate-700 dark:text-slate-300">{row.durationLabel}</td>
                  <td className="py-1.5 text-right font-black text-indigo-700 dark:text-indigo-300">
                    {row.val42d ? `${row.val42d}` : "—"}
                  </td>
                  <td className="py-1.5 text-right text-slate-500 text-[11px] hidden sm:table-cell">
                    {row.val42dWkg ? `${row.val42dWkg.toFixed(2)}` : "—"}
                  </td>
                  <td className="py-1.5 text-right font-black text-pink-700 dark:text-pink-300">
                    {row.valSeason ? `${row.valSeason}` : "—"}
                  </td>
                  <td className="py-1.5 text-right text-slate-500 text-[11px] hidden sm:table-cell">
                    {row.valSeasonWkg ? `${row.valSeasonWkg.toFixed(2)}` : "—"}
                  </td>
                </tr>
              ))}

            {/* Métricas modeladas de curva (eFTP, W', VO2max, CS5m) */}
            <tr className="bg-slate-50/70 dark:bg-slate-800/40">
              <td className="py-1.5 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                <span>eFTP</span>
              </td>
              <td className="py-1.5 text-right font-black text-indigo-700 dark:text-indigo-300">
                {recent42d?.eftp ? `${recent42d.eftp} W` : "—"}
              </td>
              <td className="py-1.5 text-right text-slate-500 text-[11px] hidden sm:table-cell">
                {recent42d?.eftp && weightKg ? `${(recent42d.eftp / weightKg).toFixed(2)}` : "—"}
              </td>
              <td className="py-1.5 text-right font-black text-pink-700 dark:text-pink-300">
                {season?.eftp ? `${season.eftp} W` : "—"}
              </td>
              <td className="py-1.5 text-right text-slate-500 text-[11px] hidden sm:table-cell">
                {season?.eftp && weightKg ? `${(season.eftp / weightKg).toFixed(2)}` : "—"}
              </td>
            </tr>

            <tr>
              <td className="py-1.5 font-bold text-slate-700 dark:text-slate-300">W&apos; (Reserva)</td>
              <td className="py-1.5 text-right font-mono text-indigo-600 dark:text-indigo-400">
                {recent42d?.wPrime ? `${Math.round(recent42d.wPrime / 1000)} kJ` : "—"}
              </td>
              <td className="py-1.5 text-right text-slate-400 hidden sm:table-cell">—</td>
              <td className="py-1.5 text-right font-mono text-pink-600 dark:text-pink-400">
                {season?.wPrime ? `${Math.round(season.wPrime / 1000)} kJ` : "—"}
              </td>
              <td className="py-1.5 text-right text-slate-400 hidden sm:table-cell">—</td>
            </tr>

            <tr>
              <td className="py-1.5 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Activity className="h-3 w-3 text-emerald-500" />
                <span>VO2max 5m</span>
              </td>
              <td className="py-1.5 text-right font-mono text-indigo-600 dark:text-indigo-400">
                {recent42d?.vo2max ? `${recent42d.vo2max}` : "—"}
              </td>
              <td className="py-1.5 text-right text-slate-400 hidden sm:table-cell">—</td>
              <td className="py-1.5 text-right font-mono text-pink-600 dark:text-pink-400">
                {season?.vo2max ? `${season.vo2max}` : "—"}
              </td>
              <td className="py-1.5 text-right text-slate-400 hidden sm:table-cell">—</td>
            </tr>

            <tr>
              <td className="py-1.5 font-bold text-slate-700 dark:text-slate-300">Compound Score</td>
              <td className="py-1.5 text-right font-mono text-indigo-600 dark:text-indigo-400">
                {recent42d?.cs5m ? `${recent42d.cs5m}` : "—"}
              </td>
              <td className="py-1.5 text-right text-slate-400 hidden sm:table-cell">—</td>
              <td className="py-1.5 text-right font-mono text-pink-600 dark:text-pink-400">
                {season?.cs5m ? `${season.cs5m}` : "—"}
              </td>
              <td className="py-1.5 text-right text-slate-400 hidden sm:table-cell">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
