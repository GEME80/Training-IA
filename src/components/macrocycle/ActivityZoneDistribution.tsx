"use client";

import React, { useState, useMemo } from "react";
import { BarChart3, Activity, Zap, Timer } from "lucide-react";
import { DailyExecutedActivity } from "@/lib/intervals/types";
import { formatPaceSec } from "./telemetryChartHelpers";

interface ActivityZoneDistributionProps {
  activity?: DailyExecutedActivity | null;
  streams?: Record<string, any> | null;
  discipline: string;
  runningTrainingMode?: "POWER" | "PACE" | "HYBRID";
  hasRunningPowerMeter?: boolean;
  runFtp?: number;
  bikeFtp?: number;
  thresholdPaceSec?: number;
  thresholdPaceStr?: string;
  maxHeartrate?: number;
  lthr?: number;
}

interface ZoneItem {
  id: string;
  name: string;
  color: string;
  bgClass: string;
  seconds: number;
  percent: number;
  rangeLabel: string;
}

function formatZoneTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  if (m === 0 && s === 0) return "0s";
  if (m === 0) return `${s}s`;
  return `${m}m ${s > 0 ? `${s}s` : ""}`.trim();
}

export const ActivityZoneDistribution: React.FC<ActivityZoneDistributionProps> = ({
  activity,
  streams,
  discipline,
  runningTrainingMode,
  hasRunningPowerMeter,
  runFtp = 0,
  bikeFtp = 0,
  thresholdPaceSec = 285,
  maxHeartrate = 185,
  lthr = 165,
}) => {
  const isRun = discipline === "Carrera";
  const isBike = discipline === "Ciclismo";
  const isPaceMode = isRun && (runningTrainingMode === "PACE" || hasRunningPowerMeter === false || runFtp === 0);
  const effFtp = isRun ? runFtp : isBike ? bikeFtp : 0;

  const rawHrs = streams?.heartrate || streams?.raw_heartrate || [];
  const rawWatts = streams?.watts || [];
  const rawVels = streams?.velocity_smooth || [];

  const hasWattsData =
    (Array.isArray(activity?.icu_zone_times) && activity!.icu_zone_times.length > 0) ||
    (Array.isArray(rawWatts) && rawWatts.length > 10 && effFtp > 0);

  const hasHrData =
    (Array.isArray(activity?.icu_hr_zone_times) && activity!.icu_hr_zone_times.length > 0) ||
    (Array.isArray(rawHrs) && rawHrs.length > 10);

  const hasPaceData =
    isRun &&
    ((Array.isArray(rawVels) && rawVels.length > 10) ||
      (Array.isArray(activity?.icu_pace_zones) && activity!.icu_pace_zones.length > 0));

  const defaultMetric = isPaceMode && hasPaceData ? "PACE" : hasWattsData ? "WATTS" : hasPaceData ? "PACE" : "HR";
  const [activeZoneType, setActiveZoneType] = useState<"PACE" | "WATTS" | "HR">(defaultMetric);

  // 1. Zonas de Potencia (Stryd CP / Bici FTP)
  const powerZones = useMemo<ZoneItem[]>(() => {
    if (!hasWattsData) return [];
    const counts = [0, 0, 0, 0, 0];
    const ftp = effFtp || 250;

    // A. Lectura de tiempos reales en segundos desde Intervals.icu (icu_zone_times)
    if (Array.isArray(activity?.icu_zone_times) && activity!.icu_zone_times.length > 0) {
      activity!.icu_zone_times.forEach((item) => {
        if (item.id === "Z1") counts[0] = item.secs || 0;
        else if (item.id === "Z2") counts[1] = item.secs || 0;
        else if (item.id === "Z3") counts[2] = item.secs || 0;
        else if (item.id === "Z4") counts[3] = item.secs || 0;
        else if (item.id === "Z5") counts[4] = item.secs || 0;
      });
    } else if (Array.isArray(rawWatts) && rawWatts.length > 0) {
      // Fallback: conteo segundo a segundo de telemetría de potencia
      const pcts = isRun ? [80, 90, 100, 115] : [55, 75, 90, 105];
      rawWatts.forEach((w: number) => {
        if (typeof w !== "number" || isNaN(w) || w <= 0) return;
        const pct = (w / ftp) * 100;
        if (pct < pcts[0]) counts[0]++;
        else if (pct < pcts[1]) counts[1]++;
        else if (pct < pcts[2]) counts[2]++;
        else if (pct < pcts[3]) counts[3]++;
        else counts[4]++;
      });
    }

    const total = counts.reduce((a, b) => a + b, 0) || 1;

    // Rangos de vatios calibrados según perfil Stryd (Running) o Coggan (Bici)
    const pcts = isRun && Array.isArray(activity?.icu_power_zones) && activity!.icu_power_zones.length >= 4
      ? activity!.icu_power_zones
      : isRun ? [80, 90, 100, 115] : [55, 75, 90, 105];

    const wZ1 = Math.round(ftp * (pcts[0] / 100));
    const wZ2 = Math.round(ftp * (pcts[1] / 100));
    const wZ3 = Math.round(ftp * (pcts[2] / 100));
    const wZ4 = Math.round(ftp * (pcts[3] / 100));

    return [
      { id: "Z1", name: "Recuperación Activa", color: "#38bdf8", bgClass: "bg-sky-500", seconds: counts[0], percent: Math.round((counts[0] / total) * 100), rangeLabel: `< ${wZ1}W` },
      { id: "Z2", name: "Resistencia Base", color: "#10b981", bgClass: "bg-emerald-500", seconds: counts[1], percent: Math.round((counts[1] / total) * 100), rangeLabel: `${wZ1}-${wZ2}W` },
      { id: "Z3", name: "Tempo / Ritmo", color: "#f59e0b", bgClass: "bg-amber-500", seconds: counts[2], percent: Math.round((counts[2] / total) * 100), rangeLabel: `${wZ2}-${wZ3}W` },
      { id: "Z4", name: "Umbral Funcional", color: "#f97316", bgClass: "bg-orange-500", seconds: counts[3], percent: Math.round((counts[3] / total) * 100), rangeLabel: `${wZ3}-${wZ4}W` },
      { id: "Z5", name: "Anaeróbico / VO2", color: "#ef4444", bgClass: "bg-rose-500", seconds: counts[4], percent: Math.round((counts[4] / total) * 100), rangeLabel: `> ${wZ4}W` },
    ];
  }, [hasWattsData, activity?.icu_zone_times, activity?.icu_power_zones, rawWatts, effFtp, isRun]);

  // 2. Zonas de Frecuencia Cardíaca (HR)
  const hrZones = useMemo<ZoneItem[]>(() => {
    if (!hasHrData) return [];
    const counts = [0, 0, 0, 0, 0];
    const lthrVal = lthr || 165;

    // A. Lectura de tiempos reales en segundos desde Intervals.icu (icu_hr_zone_times)
    if (Array.isArray(activity?.icu_hr_zone_times) && activity!.icu_hr_zone_times.length >= 5) {
      for (let i = 0; i < 5; i++) {
        counts[i] = activity!.icu_hr_zone_times[i] || 0;
      }
    } else if (Array.isArray(rawHrs) && rawHrs.length > 0) {
      rawHrs.forEach((hr: number) => {
        if (typeof hr !== "number" || isNaN(hr) || hr < 40) return;
        const pctLthr = (hr / lthrVal) * 100;
        if (pctLthr < 68) counts[0]++;
        else if (pctLthr < 84) counts[1]++;
        else if (pctLthr < 95) counts[2]++;
        else if (pctLthr < 105) counts[3]++;
        else counts[4]++;
      });
    }

    const total = counts.reduce((a, b) => a + b, 0) || 1;

    // Umbrales bpm reales de la actividad
    const hrBpm = Array.isArray(activity?.icu_hr_zones) && activity!.icu_hr_zones.length >= 5
      ? activity!.icu_hr_zones
      : [Math.round(lthrVal * 0.68), Math.round(lthrVal * 0.83), Math.round(lthrVal * 0.94), Math.round(lthrVal * 1.05)];

    return [
      { id: "Z1", name: "Recuperación", color: "#38bdf8", bgClass: "bg-sky-500", seconds: counts[0], percent: Math.round((counts[0] / total) * 100), rangeLabel: `< ${hrBpm[0]} bpm` },
      { id: "Z2", name: "Aeróbico / Base", color: "#10b981", bgClass: "bg-emerald-500", seconds: counts[1], percent: Math.round((counts[1] / total) * 100), rangeLabel: `${hrBpm[0]}-${hrBpm[1]} bpm` },
      { id: "Z3", name: "Tempo Moderado", color: "#f59e0b", bgClass: "bg-amber-500", seconds: counts[2], percent: Math.round((counts[2] / total) * 100), rangeLabel: `${hrBpm[1]}-${hrBpm[2]} bpm` },
      { id: "Z4", name: "Umbral Anaeróbico", color: "#f97316", bgClass: "bg-orange-500", seconds: counts[3], percent: Math.round((counts[3] / total) * 100), rangeLabel: `${hrBpm[2]}-${hrBpm[3]} bpm` },
      { id: "Z5", name: "Máximo Cardíaco", color: "#ef4444", bgClass: "bg-rose-500", seconds: counts[4], percent: Math.round((counts[4] / total) * 100), rangeLabel: `> ${hrBpm[3]} bpm` },
    ];
  }, [hasHrData, activity?.icu_hr_zone_times, activity?.icu_hr_zones, rawHrs, lthr]);

  // 3. Zonas de Ritmo (Pace)
  const paceZones = useMemo<ZoneItem[]>(() => {
    if (!hasPaceData) return [];
    const counts = [0, 0, 0, 0, 0];
    const tp = thresholdPaceSec || 285;

    if (Array.isArray(rawVels) && rawVels.length > 0) {
      rawVels.forEach((v: number) => {
        if (typeof v !== "number" || isNaN(v) || v < 1.0) return;
        const pSec = 1000 / v;
        if (pSec > tp * 1.24) counts[0]++;
        else if (pSec >= tp * 1.12) counts[1]++;
        else if (pSec >= tp * 1.03) counts[2]++;
        else if (pSec >= tp * 0.95) counts[3]++;
        else counts[4]++;
      });
    }

    const total = counts.reduce((a, b) => a + b, 0) || 1;
    return [
      { id: "Z1", name: "Recuperación", color: "#38bdf8", bgClass: "bg-sky-500", seconds: counts[0], percent: Math.round((counts[0] / total) * 100), rangeLabel: `> ${formatPaceSec(Math.round(tp * 1.24))}` },
      { id: "Z2", name: "Base Aeróbica", color: "#10b981", bgClass: "bg-emerald-500", seconds: counts[1], percent: Math.round((counts[1] / total) * 100), rangeLabel: `${formatPaceSec(Math.round(tp * 1.24))} - ${formatPaceSec(Math.round(tp * 1.12))}` },
      { id: "Z3", name: "Tempo", color: "#f59e0b", bgClass: "bg-amber-500", seconds: counts[2], percent: Math.round((counts[2] / total) * 100), rangeLabel: `${formatPaceSec(Math.round(tp * 1.12))} - ${formatPaceSec(Math.round(tp * 1.03))}` },
      { id: "Z4", name: "Umbral Lactato", color: "#f97316", bgClass: "bg-orange-500", seconds: counts[3], percent: Math.round((counts[3] / total) * 100), rangeLabel: `${formatPaceSec(Math.round(tp * 1.03))} - ${formatPaceSec(Math.round(tp * 0.95))}` },
      { id: "Z5", name: "VO2 Máx / Sprint", color: "#ef4444", bgClass: "bg-rose-500", seconds: counts[4], percent: Math.round((counts[4] / total) * 100), rangeLabel: `< ${formatPaceSec(Math.round(tp * 0.95))}` },
    ];
  }, [hasPaceData, rawVels, thresholdPaceSec]);

  const activeZones = activeZoneType === "PACE" ? paceZones : activeZoneType === "WATTS" ? powerZones : hrZones;
  if (!activeZones || activeZones.length === 0) return null;

  const totalTime = activeZones.reduce((a, b) => a + b.seconds, 0);
  if (totalTime === 0) return null;

  return (
    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Distribución de Zonas del Entrenamiento
          </span>
        </div>

        <div className="flex items-center gap-1">
          {hasPaceData && (
            <button
              type="button"
              onClick={() => setActiveZoneType("PACE")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
                activeZoneType === "PACE" ? "bg-cyan-500 text-slate-950 font-black shadow-xs" : "bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <Timer className="h-3 w-3" /> Ritmo
            </button>
          )}
          {hasWattsData && (
            <button
              type="button"
              onClick={() => setActiveZoneType("WATTS")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
                activeZoneType === "WATTS" ? "bg-purple-600 text-white font-black shadow-xs" : "bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <Zap className="h-3 w-3" /> Potencia
            </button>
          )}
          {hasHrData && (
            <button
              type="button"
              onClick={() => setActiveZoneType("HR")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
                activeZoneType === "HR" ? "bg-rose-600 text-white font-black shadow-xs" : "bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <Activity className="h-3 w-3" /> FC
            </button>
          )}
        </div>
      </div>

      {/* Barra Horizontal Apilada de Zonas */}
      <div className="space-y-1.5">
        <div className="w-full h-4.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-0.5 shadow-inner">
          {activeZones.map((z) => {
            if (z.percent <= 0) return null;
            return (
              <div
                key={z.id}
                style={{ width: `${z.percent}%` }}
                className={`h-full ${z.bgClass} first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:brightness-110`}
                title={`${z.id} (${z.name}): ${z.percent}% - ${formatZoneTime(z.seconds)}`}
              />
            );
          })}
        </div>

        {/* Desglose en tarjetas por Zona */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {activeZones.map((z) => (
            <div key={z.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded text-slate-900" style={{ backgroundColor: z.color }}>
                  {z.id}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{z.percent}%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate block">{z.name}</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block mt-0.5">{formatZoneTime(z.seconds)}</span>
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block truncate mt-0.5">{z.rangeLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
