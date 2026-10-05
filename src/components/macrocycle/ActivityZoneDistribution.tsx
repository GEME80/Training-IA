"use client";

import React, { useState, useMemo } from "react";
import { BarChart3, Activity, Zap, Timer } from "lucide-react";
import { DailyExecutedActivity } from "@/lib/intervals/types";
import { calculatePaceZones } from "@/lib/physiology/runningWorkoutAdapter";

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
  thresholdPaceSec = 270,
  maxHeartrate = 185,
  lthr = 168,
}) => {
  const isRun = discipline === "Carrera" || /run|carrera/i.test(discipline);
  const isBike = discipline === "Ciclismo" || /ride|bike|ciclismo/i.test(discipline);
  const effFtp = isRun ? (runFtp || activity?.icu_ftp || 0) : isBike ? (bikeFtp || activity?.icu_ftp || 0) : (activity?.icu_ftp || 0);

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
      (Array.isArray((activity as any)?.icu_pace_zone_times) && (activity as any)!.icu_pace_zone_times.length > 0));

  const isPaceMode = isRun && (runningTrainingMode === "PACE" || hasRunningPowerMeter === false || effFtp === 0);
  const defaultMetric = isPaceMode && hasPaceData ? "PACE" : hasWattsData ? "WATTS" : hasPaceData ? "PACE" : "HR";
  const [activeZoneType, setActiveZoneType] = useState<"PACE" | "WATTS" | "HR">(defaultMetric);

  // 1. Zonas de Potencia (Stryd CP 5 zonas para Carrera / Coggan 7 zonas para Ciclismo)
  const powerZones = useMemo<ZoneItem[]>(() => {
    if (!hasWattsData) return [];
    const counts = isRun ? [0, 0, 0, 0, 0] : [0, 0, 0, 0, 0, 0, 0];

    if (Array.isArray(activity?.icu_zone_times) && activity!.icu_zone_times.length > 0) {
      activity!.icu_zone_times.forEach((item) => {
        const idx = parseInt(item.id?.replace("Z", ""), 10) - 1;
        if (idx >= 0 && idx < counts.length) counts[idx] = item.secs || 0;
      });
    } else if (Array.isArray(rawWatts) && rawWatts.length > 0) {
      const ftp = effFtp || (isRun ? 250 : 200);
      const pcts = isRun ? [80, 90, 100, 115] : [55, 76, 91, 106, 121, 151];
      rawWatts.forEach((w: number) => {
        if (typeof w !== "number" || isNaN(w) || w <= 0) return;
        const pct = (w / ftp) * 100;
        const idx = pcts.findIndex((p) => pct < p);
        counts[idx === -1 ? pcts.length : idx]++;
      });
    }

    const total = counts.reduce((a, b) => a + b, 0) || 1;
    const ftp = effFtp;

    if (isRun) {
      return [
        { id: "Z1", name: "Fácil", color: "#38bdf8", bgClass: "bg-sky-400", seconds: counts[0], percent: Math.round((counts[0] / total) * 100), rangeLabel: ftp > 0 ? `${Math.round(ftp * 0.65)} - ${Math.round(ftp * 0.80)} W` : "65 - 80 % CP" },
        { id: "Z2", name: "Moderado", color: "#10b981", bgClass: "bg-emerald-500", seconds: counts[1], percent: Math.round((counts[1] / total) * 100), rangeLabel: ftp > 0 ? `${Math.round(ftp * 0.80)} - ${Math.round(ftp * 0.90)} W` : "80 - 90 % CP" },
        { id: "Z3", name: "Umbral", color: "#f59e0b", bgClass: "bg-amber-500", seconds: counts[2], percent: Math.round((counts[2] / total) * 100), rangeLabel: ftp > 0 ? `${Math.round(ftp * 0.90)} - ${ftp} W` : "90 - 100 % CP" },
        { id: "Z4", name: "Intervalo", color: "#f97316", bgClass: "bg-orange-500", seconds: counts[3], percent: Math.round((counts[3] / total) * 100), rangeLabel: ftp > 0 ? `${ftp} - ${Math.round(ftp * 1.15)} W` : "100 - 115 % CP" },
        { id: "Z5", name: "Repetición", color: "#ef4444", bgClass: "bg-rose-500", seconds: counts[4], percent: Math.round((counts[4] / total) * 100), rangeLabel: ftp > 0 ? `${Math.round(ftp * 1.15)}+ W` : "115 - 300 % CP" },
      ];
    }

    return [
      { id: "Z1", name: "Recuperación", color: "#94a3b8", bgClass: "bg-slate-400", seconds: counts[0], percent: Math.round((counts[0] / total) * 100), rangeLabel: ftp > 0 ? `< ${Math.round(ftp * 0.55)} W` : "< 55% FTP" },
      { id: "Z2", name: "Resistencia (Fondo)", color: "#38bdf8", bgClass: "bg-sky-500", seconds: counts[1], percent: Math.round((counts[1] / total) * 100), rangeLabel: ftp > 0 ? `${Math.round(ftp * 0.56)} - ${Math.round(ftp * 0.75)} W` : "56 - 75% FTP" },
      { id: "Z3", name: "Tempo", color: "#14b8a6", bgClass: "bg-teal-500", seconds: counts[2], percent: Math.round((counts[2] / total) * 100), rangeLabel: ftp > 0 ? `${Math.round(ftp * 0.76)} - ${Math.round(ftp * 0.90)} W` : "76 - 90% FTP" },
      { id: "Z4", name: "Umbral (FTP)", color: "#10b981", bgClass: "bg-emerald-500", seconds: counts[3], percent: Math.round((counts[3] / total) * 100), rangeLabel: ftp > 0 ? `${Math.round(ftp * 0.91)} - ${Math.round(ftp * 1.05)} W` : "91 - 105% FTP" },
      { id: "Z5", name: "VO2max", color: "#f59e0b", bgClass: "bg-amber-500", seconds: counts[4], percent: Math.round((counts[4] / total) * 100), rangeLabel: ftp > 0 ? `${Math.round(ftp * 1.06)} - ${Math.round(ftp * 1.20)} W` : "106 - 120% FTP" },
      { id: "Z6", name: "Cap. Anaeróbica", color: "#f97316", bgClass: "bg-orange-500", seconds: counts[5], percent: Math.round((counts[5] / total) * 100), rangeLabel: ftp > 0 ? `${Math.round(ftp * 1.21)} - ${Math.round(ftp * 1.50)} W` : "121 - 150% FTP" },
      { id: "Z7", name: "Neuromuscular", color: "#ef4444", bgClass: "bg-rose-600", seconds: counts[6], percent: Math.round((counts[6] / total) * 100), rangeLabel: ftp > 0 ? `> ${Math.round(ftp * 1.50)} W` : "> 150% FTP" },
    ];
  }, [hasWattsData, isRun, activity?.icu_zone_times, rawWatts, effFtp]);

  // 2. Zonas de Frecuencia Cardíaca (7 Zonas LTHR canónicas)
  const hrZones = useMemo<ZoneItem[]>(() => {
    if (!hasHrData) return [];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const lthrVal = lthr || 168;
    const maxVal = maxHeartrate || (lthrVal > 0 ? Math.round(lthrVal * 1.10) : 185);

    if (Array.isArray(activity?.icu_hr_zone_times) && activity!.icu_hr_zone_times.length > 0) {
      activity!.icu_hr_zone_times.slice(0, 7).forEach((secs, i) => { counts[i] = secs || 0; });
    } else if (Array.isArray(rawHrs) && rawHrs.length > 0) {
      const t = [0.83, 0.88, 0.92, 0.98, 1.0, 1.03].map((m) => Math.round(lthrVal * m));
      rawHrs.forEach((hr: number) => {
        if (typeof hr !== "number" || isNaN(hr) || hr < 40) return;
        const idx = t.findIndex((lim) => hr <= lim);
        counts[idx === -1 ? 6 : idx]++;
      });
    }

    const total = counts.reduce((a, b) => a + b, 0) || 1;
    const icuZ = Array.isArray(activity?.icu_hr_zones) && activity!.icu_hr_zones.length >= 7 ? activity!.icu_hr_zones : null;
    const r1 = icuZ ? `0 - ${icuZ[0]} bpm` : `0 - ${Math.round(lthrVal * 0.83)} bpm`;
    const r2 = icuZ ? `${icuZ[0] + 1} - ${icuZ[1]} bpm` : `${Math.round(lthrVal * 0.83) + 1} - ${Math.round(lthrVal * 0.88)} bpm`;
    const r3 = icuZ ? `${icuZ[1] + 1} - ${icuZ[2]} bpm` : `${Math.round(lthrVal * 0.88) + 1} - ${Math.round(lthrVal * 0.92)} bpm`;
    const r4 = icuZ ? `${icuZ[2] + 1} - ${icuZ[3]} bpm` : `${Math.round(lthrVal * 0.93)} - ${Math.round(lthrVal * 0.98)} bpm`;
    const r5 = icuZ ? `${icuZ[3] + 1} - ${icuZ[4]} bpm` : `${Math.round(lthrVal * 0.98) + 1} - ${lthrVal} bpm`;
    const r6 = icuZ ? `${icuZ[4] + 1} - ${icuZ[5]} bpm` : `${lthrVal + 1} - ${Math.round(lthrVal * 1.03)} bpm`;
    const r7 = icuZ ? `${icuZ[5] + 1} - ${icuZ[6]} bpm` : `${Math.round(lthrVal * 1.04)} - ${maxVal > 0 ? `${maxVal} bpm` : "Máx"}`;

    return [
      { id: "Z1", name: "Recovery", color: "#94a3b8", bgClass: "bg-slate-400", seconds: counts[0], percent: Math.round((counts[0] / total) * 100), rangeLabel: r1 },
      { id: "Z2", name: "Aerobic", color: "#38bdf8", bgClass: "bg-sky-500", seconds: counts[1], percent: Math.round((counts[1] / total) * 100), rangeLabel: r2 },
      { id: "Z3", name: "Tempo", color: "#14b8a6", bgClass: "bg-teal-500", seconds: counts[2], percent: Math.round((counts[2] / total) * 100), rangeLabel: r3 },
      { id: "Z4", name: "SubThreshold", color: "#10b981", bgClass: "bg-emerald-500", seconds: counts[3], percent: Math.round((counts[3] / total) * 100), rangeLabel: r4 },
      { id: "Z5", name: "SuperThreshold", color: "#f59e0b", bgClass: "bg-amber-500", seconds: counts[4], percent: Math.round((counts[4] / total) * 100), rangeLabel: r5 },
      { id: "Z6", name: "Aerobic Capacity", color: "#f97316", bgClass: "bg-orange-500", seconds: counts[5], percent: Math.round((counts[5] / total) * 100), rangeLabel: r6 },
      { id: "Z7", name: "Anaerobic", color: "#ef4444", bgClass: "bg-rose-600", seconds: counts[6], percent: Math.round((counts[6] / total) * 100), rangeLabel: r7 },
    ];
  }, [hasHrData, activity?.icu_hr_zone_times, activity?.icu_hr_zones, rawHrs, lthr, maxHeartrate]);

  // 3. Zonas de Ritmo Carrera (6 Zonas Jack Daniels canónicas)
  const paceZones = useMemo<ZoneItem[]>(() => {
    if (!hasPaceData) return [];
    const counts = [0, 0, 0, 0, 0, 0];
    const tp = thresholdPaceSec || 270;

    if (Array.isArray((activity as any)?.icu_pace_zone_times) && (activity as any)!.icu_pace_zone_times.length > 0) {
      (activity as any)!.icu_pace_zone_times.slice(0, 6).forEach((secs: number, i: number) => { counts[i] = secs || 0; });
    } else if (Array.isArray(rawVels) && rawVels.length > 0) {
      const pcts = [0.75, 0.85, 0.95, 1.05, 1.15];
      rawVels.forEach((v: number) => {
        if (typeof v !== "number" || isNaN(v) || v < 1.0) return;
        const pct = (v * tp) / 1000;
        const idx = pcts.findIndex((p) => pct < p);
        counts[idx === -1 ? pcts.length : idx]++;
      });
    }

    const total = counts.reduce((a, b) => a + b, 0) || 1;
    const profilePace = calculatePaceZones(tp);

    return [
      { id: "Z1", name: "Fácil", color: "#94a3b8", bgClass: "bg-slate-400", seconds: counts[0], percent: Math.round((counts[0] / total) * 100), rangeLabel: profilePace[0]?.range || "< 75% Pace" },
      { id: "Z2", name: "Moderado", color: "#38bdf8", bgClass: "bg-sky-500", seconds: counts[1], percent: Math.round((counts[1] / total) * 100), rangeLabel: profilePace[1]?.range || "75 - 85% Pace" },
      { id: "Z3", name: "Tempo", color: "#14b8a6", bgClass: "bg-teal-500", seconds: counts[2], percent: Math.round((counts[2] / total) * 100), rangeLabel: profilePace[2]?.range || "85 - 94% Pace" },
      { id: "Z4", name: "Umbral", color: "#10b981", bgClass: "bg-emerald-500", seconds: counts[3], percent: Math.round((counts[3] / total) * 100), rangeLabel: profilePace[3]?.range || "95 - 104% Pace" },
      { id: "Z5", name: "Intervalo", color: "#f97316", bgClass: "bg-orange-500", seconds: counts[4], percent: Math.round((counts[4] / total) * 100), rangeLabel: profilePace[4]?.range || "105 - 115% Pace" },
      { id: "Z6", name: "Repetición", color: "#ef4444", bgClass: "bg-rose-600", seconds: counts[5], percent: Math.round((counts[5] / total) * 100), rangeLabel: profilePace[5]?.range || "> 115% Pace" },
    ];
  }, [hasPaceData, rawVels, thresholdPaceSec, (activity as any)?.icu_pace_zone_times]);

  const resolvedZoneType =
    (activeZoneType === "PACE" && hasPaceData) ||
    (activeZoneType === "WATTS" && hasWattsData) ||
    (activeZoneType === "HR" && hasHrData)
      ? activeZoneType
      : defaultMetric;

  const activeZones =
    resolvedZoneType === "PACE" && paceZones.length > 0
      ? paceZones
      : resolvedZoneType === "WATTS" && powerZones.length > 0
      ? powerZones
      : hrZones;

  if (!activeZones || activeZones.length === 0) return null;
  const totalTime = activeZones.reduce((a, b) => a + b.seconds, 0);
  if (totalTime === 0) return null;

  const gridColsClass =
    activeZones.length === 7
      ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
      : activeZones.length === 6
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
      : "grid-cols-2 sm:grid-cols-5";

  return (
    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Distribución de Zonas ({resolvedZoneType === "WATTS" ? (isRun ? "Potencia Stryd" : "Potencia FTP") : resolvedZoneType === "PACE" ? "Ritmo Daniels" : "FC LTHR"})
          </span>
        </div>

        <div className="flex items-center gap-1">
          {hasPaceData && (
            <button
              type="button"
              onClick={() => setActiveZoneType("PACE")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
                resolvedZoneType === "PACE" ? "bg-cyan-500 text-slate-950 font-black shadow-xs" : "bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white"
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
                resolvedZoneType === "WATTS" ? "bg-purple-600 text-white font-black shadow-xs" : "bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white"
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
                resolvedZoneType === "HR" ? "bg-rose-600 text-white font-black shadow-xs" : "bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white"
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
            if (z.seconds <= 0) return null;
            const widthPct = (z.seconds / totalTime) * 100;
            return (
              <div
                key={z.id}
                style={{ width: `${widthPct}%` }}
                className={`h-full ${z.bgClass} first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:brightness-110`}
                title={`${z.id} (${z.name}): ${z.percent}% - ${formatZoneTime(z.seconds)} [${z.rangeLabel}]`}
              />
            );
          })}
        </div>

        {/* Desglose en tarjetas por Zona */}
        <div className={`grid ${gridColsClass} gap-2 pt-1`}>
          {activeZones.map((z) => (
            <div key={z.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded text-slate-950" style={{ backgroundColor: z.color }}>
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
