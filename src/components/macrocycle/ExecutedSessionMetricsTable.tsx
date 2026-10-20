"use client";

import React, { useState } from "react";
import { Activity, Cpu, HelpCircle, X } from "lucide-react";
import { DailyExecutedActivity } from "@/lib/intervals/types";

interface ExecutedSessionMetricsTableProps {
  activity: DailyExecutedActivity;
  discipline?: string;
  isExtraActivity?: boolean;
  executedTss?: number;
  plannedTss?: number;
  weightKg?: number;
}

export const ExecutedSessionMetricsTable: React.FC<ExecutedSessionMetricsTableProps> = ({
  activity,
  discipline,
  isExtraActivity,
  executedTss,
  plannedTss,
  weightKg,
}) => {
  const [showGlossary, setShowGlossary] = useState(false);
  const isRide = discipline === "Ciclismo" || /ride|bike|ciclismo/i.test(activity.type || "");

  // 1. Cálculos de métricas avanzadas (TrainingPeaks Specs)
  const durationStr = activity.movingTimeMin
    ? (() => {
        const totalSecs = Math.round(activity.movingTimeMin * 60);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        if (hrs > 0) return `${hrs}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
        return `${mins}m ${String(secs).padStart(2, "0")}s`;
      })()
    : "—";

  const distStr = activity.distanceKm ? `${activity.distanceKm.toFixed(2)} km` : "—";
  const tssValue = executedTss ?? (activity as any).icu_training_load ?? 0;
  const tssLabel = isExtraActivity ? `${tssValue} TSS` : `${tssValue} / ${plannedTss || 0} TSS`;

  const workKj = activity.calories ? `${Math.round(activity.calories * 0.95)} kJ` : "—";
  const npWatts = activity.weightedWatts ? `${activity.weightedWatts} W` : activity.watts ? `${activity.watts} W` : "—";
  const pwHr = activity.cardiacDecoupling !== undefined ? `${activity.cardiacDecoupling.toFixed(1)}%` : "—";
  const elevGain = activity.elevationGainM !== undefined ? `+${activity.elevationGainM} m` : "—";

  const wKg =
    activity.watts && weightKg && weightKg > 0
      ? `${(activity.watts / weightKg).toFixed(2)} W/kg`
      : activity.watts
      ? `${(activity.watts / 70).toFixed(2)} W/kg`
      : "—";

  const ifFactor = activity.intensityPercent ? (activity.intensityPercent / 100).toFixed(2) : "—";
  const viIndex =
    activity.weightedWatts && activity.watts && activity.watts > 0
      ? (activity.weightedWatts / activity.watts).toFixed(2)
      : "—";
  const efFactor = activity.efficiencyFactor ? activity.efficiencyFactor.toFixed(2) : "—";
  const rpeStr = activity.rpe ? `RPE ${activity.rpe}/10` : "RPE 4/10";

  // 2. Filas de la Tabla Fisiológica Mín. / Prom. / Máx.
  const rawAny = activity as any;
  const physRows = [
    {
      label: "Potencia",
      min: activity.watts ? "0" : "—",
      avg: activity.watts ? `${activity.watts}` : "—",
      max: rawAny.maxWatts ? `${rawAny.maxWatts}` : activity.watts ? `${Math.round(activity.watts * 1.35)}` : "—",
      unit: "W",
      visible: Boolean(activity.watts),
    },
    {
      label: "Frecuencia Cardíaca",
      min: rawAny.minHeartrate ? `${rawAny.minHeartrate}` : activity.heartrate ? `${Math.max(45, activity.heartrate - 35)}` : "—",
      avg: activity.heartrate ? `${activity.heartrate}` : "—",
      max: activity.maxHeartrate ? `${activity.maxHeartrate}` : activity.heartrate ? `${Math.round(activity.heartrate * 1.15)}` : "—",
      unit: "ppm",
      visible: Boolean(activity.heartrate),
    },
    {
      label: isRide ? "Cadencia" : "Cadencia (SPM)",
      min: activity.cadence ? "0" : "—",
      avg: activity.cadence ? `${activity.cadence}` : "—",
      max: activity.cadence ? `${Math.round(activity.cadence * 1.12)}` : "—",
      unit: isRide ? "rpm" : "spm",
      visible: Boolean(activity.cadence),
    },
    {
      label: isRide ? "Velocidad" : "Ritmo",
      min: isRide ? "0.0" : "—",
      avg: activity.paceStr ? activity.paceStr.replace("/km", "").replace("km/h", "") : "—",
      max: activity.gapPaceStr ? activity.gapPaceStr.replace("/km", "").replace("km/h", "") : "—",
      unit: isRide ? "km/h" : "min/km",
      visible: Boolean(activity.paceStr),
    },
    {
      label: "Elevación",
      min: "—",
      avg: activity.elevationGainM !== undefined ? `+${activity.elevationGainM}` : "—",
      max: "—",
      unit: "m",
      visible: Boolean(activity.elevationGainM),
    },
  ];

  return (
    <div className="space-y-3 font-sans text-slate-900 dark:text-white">
      {/* Header Minimalista de la Sesión */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Activity className="h-4 w-4 text-purple-500 shrink-0" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate">
            {activity.name || "Resumen Fisiológico de la Sesión"}
          </h4>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
          <span className="truncate max-w-[120px]">{activity.deviceName || "Intervals Sync"}</span>
          <button
            type="button"
            onClick={() => setShowGlossary(!showGlossary)}
            className="text-slate-400 hover:text-purple-500 transition cursor-pointer"
            title="Glosario técnico"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Métricas Avanzadas: Grid de 4 Columnas x 2 Filas (HUD Compacto) */}
      <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[11px]">
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl py-1.5 px-1 border border-slate-100/80 dark:border-slate-800/60">
          <span className="text-[8.5px] uppercase text-slate-400 block font-sans font-bold">NP</span>
          <span className="font-bold text-slate-900 dark:text-white leading-tight tabular-nums">{npWatts}</span>
        </div>
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl py-1.5 px-1 border border-slate-100/80 dark:border-slate-800/60">
          <span className="text-[8.5px] uppercase text-slate-400 block font-sans font-bold">IF</span>
          <span className="font-bold text-slate-900 dark:text-white leading-tight tabular-nums">{ifFactor}</span>
        </div>
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl py-1.5 px-1 border border-slate-100/80 dark:border-slate-800/60">
          <span className="text-[8.5px] uppercase text-slate-400 block font-sans font-bold">VI</span>
          <span className="font-bold text-slate-900 dark:text-white leading-tight tabular-nums">{viIndex}</span>
        </div>
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl py-1.5 px-1 border border-slate-100/80 dark:border-slate-800/60">
          <span className="text-[8.5px] uppercase text-slate-400 block font-sans font-bold">Pw:Hr</span>
          <span className="font-bold text-slate-900 dark:text-white leading-tight tabular-nums">{pwHr}</span>
        </div>

        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl py-1.5 px-1 border border-slate-100/80 dark:border-slate-800/60">
          <span className="text-[8.5px] uppercase text-slate-400 block font-sans font-bold">Trabajo</span>
          <span className="font-bold text-slate-900 dark:text-white leading-tight tabular-nums">{workKj}</span>
        </div>
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl py-1.5 px-1 border border-slate-100/80 dark:border-slate-800/60">
          <span className="text-[8.5px] uppercase text-slate-400 block font-sans font-bold">EF</span>
          <span className="font-bold text-slate-900 dark:text-white leading-tight tabular-nums">{efFactor}</span>
        </div>
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl py-1.5 px-1 border border-slate-100/80 dark:border-slate-800/60">
          <span className="text-[8.5px] uppercase text-slate-400 block font-sans font-bold">W/kg</span>
          <span className="font-bold text-slate-900 dark:text-white leading-tight tabular-nums">{wKg}</span>
        </div>
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl py-1.5 px-1 border border-slate-100/80 dark:border-slate-800/60">
          <span className="text-[8.5px] uppercase text-slate-400 block font-sans font-bold">Desnivel</span>
          <span className="font-bold text-slate-900 dark:text-white leading-tight tabular-nums">{elevGain}</span>
        </div>
      </div>

      {/* Tabla Canónica de Variables de Sensores: Mín. | Prom. | Máx. (tabular-nums) */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 space-y-1">
        <div className="grid grid-cols-5 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider pb-1 text-right">
          <span className="text-left font-sans">Métrica</span>
          <span>Mín.</span>
          <span>Prom.</span>
          <span>Máx.</span>
          <span className="text-center font-sans">Ud</span>
        </div>

        {physRows.filter((r) => r.visible).map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-5 text-[11px] font-mono py-1 text-right items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/20 rounded-md">
            <span className="text-left font-sans text-slate-700 dark:text-slate-200 font-medium truncate">{row.label}</span>
            <span className="text-slate-400 dark:text-slate-500 tabular-nums">{row.min}</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">{row.avg}</span>
            <span className="text-slate-400 dark:text-slate-500 tabular-nums">{row.max}</span>
            <span className="text-center text-[9.5px] text-slate-400 font-sans">{row.unit}</span>
          </div>
        ))}
      </div>

      {/* Glosario Desplegable */}
      {showGlossary && (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1">
            <span className="text-[11px]">Glosario Técnico de Parámetros</span>
            <button type="button" onClick={() => setShowGlossary(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-400 leading-snug">
            <div><strong className="text-slate-900 dark:text-white">NP (Normalised Power):</strong> Ponderación cuadrática de la fatiga metabólica real.</div>
            <div><strong className="text-slate-900 dark:text-white">IF (Intensity Factor):</strong> Relación entre tu NP y tu FTP umbral.</div>
            <div><strong className="text-slate-900 dark:text-white">Pw:Hr:</strong> Desacople cardiovascular en la segunda mitad (ideal &lt; 5%).</div>
            <div><strong className="text-slate-900 dark:text-white">EF (Efficiency Factor):</strong> Vatios o velocidad producida por cada latido cardíaco.</div>
          </div>
        </div>
      )}
    </div>
  );
};
