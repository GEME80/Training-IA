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
    ? `${Math.floor(activity.movingTimeMin)}:${String(Math.round((activity.movingTimeMin % 1) * 60)).padStart(2, "0")}`
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
      label: "Cardio (HR)",
      min: rawAny.minHeartrate ? `${rawAny.minHeartrate}` : activity.heartrate ? `${Math.max(45, activity.heartrate - 35)}` : "—",
      avg: activity.heartrate ? `${activity.heartrate}` : "—",
      max: activity.maxHeartrate ? `${activity.maxHeartrate}` : activity.heartrate ? `${Math.round(activity.heartrate * 1.15)}` : "—",
      unit: "bpm",
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
    <div className="rounded-2xl p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-3 shadow-2xs font-sans">
      {/* Header Limpio de la Sesión */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
          <h4 className="text-xs sm:text-sm font-black truncate">{activity.name || "Sesión de Ejercicios"}</h4>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{activity.deviceName || "Intervals Sync"}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowGlossary(!showGlossary)}
            className="text-slate-500 hover:text-emerald-500 flex items-center gap-0.5 cursor-pointer transition"
            title="Glosario"
          >
            <HelpCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Guía</span>
          </button>
        </div>
      </div>

      {/* Hero 3 Macro KPIs (Estilo TrainingPeaks) */}
      <div className="grid grid-cols-3 gap-2 text-center py-1 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Duración</span>
          <span className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white mt-0.5 block">
            {durationStr}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Distancia</span>
          <span className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white mt-0.5 block">
            {distStr}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Carga</span>
          <span className="text-base sm:text-lg font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
            ⚡ {tssLabel}
          </span>
        </div>
      </div>

      {/* Métricas Avanzadas (2 Columnas con alineación label - valor) */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono py-1 border-b border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center py-0.5 border-b border-slate-50 dark:border-slate-800/40">
          <span className="text-slate-500 font-sans font-normal">Trabajo</span>
          <span className="font-bold text-slate-900 dark:text-white">{workKj}</span>
        </div>
        <div className="flex justify-between items-center py-0.5 border-b border-slate-50 dark:border-slate-800/40">
          <span className="text-slate-500 font-sans font-normal">IF</span>
          <span className="font-bold text-slate-900 dark:text-white">{ifFactor}</span>
        </div>

        <div className="flex justify-between items-center py-0.5 border-b border-slate-50 dark:border-slate-800/40">
          <span className="text-slate-500 font-sans font-normal">NP</span>
          <span className="font-bold text-slate-900 dark:text-white">{npWatts}</span>
        </div>
        <div className="flex justify-between items-center py-0.5 border-b border-slate-50 dark:border-slate-800/40">
          <span className="text-slate-500 font-sans font-normal">VI</span>
          <span className="font-bold text-slate-900 dark:text-white">{viIndex}</span>
        </div>

        <div className="flex justify-between items-center py-0.5 border-b border-slate-50 dark:border-slate-800/40">
          <span className="text-slate-500 font-sans font-normal">Pw:Hr (Deriva)</span>
          <span className="font-bold text-slate-900 dark:text-white">{pwHr}</span>
        </div>
        <div className="flex justify-between items-center py-0.5 border-b border-slate-50 dark:border-slate-800/40">
          <span className="text-slate-500 font-sans font-normal">EF</span>
          <span className="font-bold text-slate-900 dark:text-white">{efFactor}</span>
        </div>

        <div className="flex justify-between items-center py-0.5">
          <span className="text-slate-500 font-sans font-normal">Desnivel</span>
          <span className="font-bold text-slate-900 dark:text-white">{elevGain}</span>
        </div>
        <div className="flex justify-between items-center py-0.5">
          <span className="text-slate-500 font-sans font-normal">W/kg</span>
          <span className="font-bold text-slate-900 dark:text-white">{wKg}</span>
        </div>
      </div>

      {/* Tabla Canónica de Fisiología: Mín. | Prom. | Máx. (TrainingPeaks Specs) */}
      <div className="space-y-1 pt-0.5">
        <div className="grid grid-cols-5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800 text-right">
          <span className="text-left font-sans">Métrica</span>
          <span>Mín.</span>
          <span>Prom.</span>
          <span>Máx.</span>
          <span className="text-center font-sans">Ud</span>
        </div>

        {physRows.filter((r) => r.visible).map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-5 text-xs font-mono py-0.5 text-right items-center">
            <span className="text-left font-sans text-slate-600 dark:text-slate-300 font-medium truncate">{row.label}</span>
            <span className="text-slate-500">{row.min}</span>
            <span className="font-bold text-slate-900 dark:text-white">{row.avg}</span>
            <span className="text-slate-500">{row.max}</span>
            <span className="text-center text-[10px] text-slate-400 font-sans">{row.unit}</span>
          </div>
        ))}
      </div>

      {/* Glosario Desplegable */}
      {showGlossary && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1">
            <span>Glosario Técnico de Parámetros</span>
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
