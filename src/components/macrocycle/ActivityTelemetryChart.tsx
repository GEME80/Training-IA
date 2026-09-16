"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Heart, Zap, Activity, Mountain, Loader2, Sparkles } from "lucide-react";

interface ActivityTelemetryChartProps {
  activityId: string;
  athleteId?: string;
  apiKey?: string;
  uid?: string;
  email?: string;
  summaryStats?: {
    heartrate?: number;
    maxHeartrate?: number;
    watts?: number;
    weightedWatts?: number;
    distanceKm?: number;
    movingTimeMin?: number;
    paceStr?: string;
    elevationGainM?: number;
  };
}

export const ActivityTelemetryChart: React.FC<ActivityTelemetryChartProps> = ({
  activityId,
  athleteId,
  apiKey,
  uid,
  email,
  summaryStats,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [streams, setStreams] = useState<Record<string, number[]> | null>(null);
  const [activeMetric, setActiveMetric] = useState<"ALL" | "HEARTRATE" | "WATTS" | "ALTITUDE">("ALL");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStreams() {
      if (!activityId) return;
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (athleteId) query.set("athleteId", athleteId);
        if (apiKey) query.set("apiKey", apiKey);
        if (uid) query.set("uid", uid);
        if (email) query.set("email", email);

        const res = await fetch(`/api/activities/${encodeURIComponent(activityId)}/streams?${query.toString()}`);
        if (!res.ok) throw new Error("No se pudieron cargar las series temporales");
        const data = await res.json();
        if (isMounted) {
          if (data.success && data.streams && Object.keys(data.streams).length > 0) {
            setStreams(data.streams);
          } else {
            setError("Esta actividad no tiene series de telemetría detalladas.");
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Error al conectar con la telemetría");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStreams();
    return () => { isMounted = false; };
  }, [activityId, athleteId, apiKey, uid, email]);

  const timeArray = streams?.time || [];
  const hrArray = streams?.heartrate || [];
  const wattsArray = streams?.watts || [];
  const altArray = streams?.altitude || [];
  const totalPoints = timeArray.length;

  const sampledData = useMemo(() => {
    if (totalPoints === 0) return [];
    const maxSamples = 200;
    const step = Math.max(1, Math.floor(totalPoints / maxSamples));
    const result: Array<{ idx: number; timeSec: number; hr?: number; watts?: number; alt?: number }> = [];

    for (let i = 0; i < totalPoints; i += step) {
      result.push({
        idx: i,
        timeSec: timeArray[i] ?? i,
        hr: hrArray[i],
        watts: wattsArray[i],
        alt: altArray[i],
      });
    }
    return result;
  }, [totalPoints, timeArray, hrArray, wattsArray, altArray]);

  const minAlt = useMemo(() => altArray.length ? Math.min(...altArray) : 0, [altArray]);
  const maxAlt = useMemo(() => altArray.length ? Math.max(...altArray) : 100, [altArray]);
  const minHr = useMemo(() => hrArray.length ? Math.min(...hrArray) : 60, [hrArray]);
  const maxHr = useMemo(() => hrArray.length ? Math.max(...hrArray) : 180, [hrArray]);
  const maxWatts = useMemo(() => wattsArray.length ? Math.max(...wattsArray, 300) : 400, [wattsArray]);

  const chartWidth = 600;
  const chartHeight = 220;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;
  const plotW = chartWidth - paddingLeft - paddingRight;
  const plotH = chartHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (sampledData.length <= 1) return paddingLeft;
    return paddingLeft + (index / (sampledData.length - 1)) * plotW;
  };

  const getHrY = (val?: number) => {
    if (val === undefined) return paddingTop + plotH;
    const norm = (val - minHr) / (maxHr - minHr || 1);
    return paddingTop + plotH - norm * (plotH * 0.75);
  };

  const getWattsY = (val?: number) => {
    if (val === undefined) return paddingTop + plotH;
    const norm = val / (maxWatts || 1);
    return paddingTop + plotH - norm * (plotH * 0.85);
  };

  const getAltY = (val?: number) => {
    if (val === undefined) return paddingTop + plotH;
    const norm = (val - minAlt) / (maxAlt - minAlt || 1);
    return paddingTop + plotH - norm * (plotH * 0.4);
  };

  const hrPoints = sampledData.filter((d) => d.hr !== undefined);
  const hrPath = hrPoints.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getHrY(d.hr)}`).join(" ");
  const hrArea = hrPoints.length
    ? `${hrPath} L ${getX(hrPoints.length - 1)} ${paddingTop + plotH} L ${getX(0)} ${paddingTop + plotH} Z`
    : "";

  const wattsPoints = sampledData.filter((d) => d.watts !== undefined);
  const wattsPath = wattsPoints.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getWattsY(d.watts)}`).join(" ");

  const altPoints = sampledData.filter((d) => d.alt !== undefined);
  const altPath = altPoints.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getAltY(d.alt)}`).join(" ");
  const altArea = altPoints.length
    ? `${altPath} L ${getX(altPoints.length - 1)} ${paddingTop + plotH} L ${getX(0)} ${paddingTop + plotH} Z`
    : "";

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || sampledData.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scale = chartWidth / rect.width;
    const svgX = clientX * scale;
    const relativeX = Math.max(0, Math.min(plotW, svgX - paddingLeft));
    const ratio = relativeX / plotW;
    const idx = Math.round(ratio * (sampledData.length - 1));
    setHoverIndex(idx >= 0 && idx < sampledData.length ? idx : null);
  };

  const hoveredData = hoverIndex !== null ? sampledData[hoverIndex] : null;

  const formatSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
        <span className="text-xs font-mono text-slate-500">Cargando series de telemetría de Intervals.icu...</span>
      </div>
    );
  }

  if (error || sampledData.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
        <div className="inline-flex items-center gap-1 text-xs font-black text-slate-600 dark:text-slate-400">
          <Activity className="h-4 w-4 text-cyan-500" />
          <span>Resumen de Telemetría Ejecutada</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {error || "Series detalladas no disponibles para esta sesión."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 text-white space-y-3 shadow-lg">
      {/* Selector de Filtros y Métricas */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
            Cronología de Telemetría ({formatSec(timeArray[timeArray.length - 1] || 0)})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveMetric("ALL")}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
              activeMetric === "ALL" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("HEARTRATE")}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
              activeMetric === "HEARTRATE" ? "bg-rose-500/30 text-rose-300 border border-rose-500/40" : "text-slate-400 hover:text-rose-400"
            }`}
          >
            <Heart className="h-3 w-3" /> FC
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("WATTS")}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
              activeMetric === "WATTS" ? "bg-purple-500/30 text-purple-300 border border-purple-500/40" : "text-slate-400 hover:text-purple-400"
            }`}
          >
            <Zap className="h-3 w-3" /> Potencia
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("ALTITUDE")}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
              activeMetric === "ALTITUDE" ? "bg-slate-700 text-slate-200" : "text-slate-400 hover:text-white"
            }`}
          >
            <Mountain className="h-3 w-3" /> Altitud
          </button>
        </div>
      </div>

      {/* Tooltip Dinámico Superior */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
        <span className="text-slate-400 font-bold">
          ⏱️ {hoveredData ? formatSec(hoveredData.timeSec) : "Pasa el cursor..."}
        </span>
        <span className="text-rose-400 font-bold flex items-center gap-1">
          <Heart className="h-3 w-3" /> {hoveredData?.hr ? `${hoveredData.hr} bpm` : (summaryStats?.heartrate ? `Media: ${summaryStats.heartrate} bpm` : "—")}
        </span>
        <span className="text-purple-400 font-bold flex items-center gap-1">
          <Zap className="h-3 w-3" /> {hoveredData?.watts !== undefined ? `${hoveredData.watts} W` : (summaryStats?.weightedWatts ? `NP: ${summaryStats.weightedWatts}W` : "—")}
        </span>
        <span className="text-slate-400 flex items-center gap-1">
          <Mountain className="h-3 w-3" /> {hoveredData?.alt !== undefined ? `${Math.round(hoveredData.alt)} m` : (summaryStats?.elevationGainM ? `+${summaryStats.elevationGainM}m` : "—")}
        </span>
      </div>

      {/* SVG Canvas Gráfico */}
      <div className="relative w-full overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Líneas de Grilla */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingTop + pct * plotH;
            return (
              <line key={i} x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#334155" strokeDasharray="3,3" strokeWidth="0.8" />
            );
          })}

          {/* Curva de Altitud (Fondo) */}
          {(activeMetric === "ALL" || activeMetric === "ALTITUDE") && altPoints.length > 0 && (
            <>
              <path d={altArea} fill="url(#altGrad)" />
              <path d={altPath} fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeOpacity="0.8" />
            </>
          )}

          {/* Curva de Frecuencia Cardíaca */}
          {(activeMetric === "ALL" || activeMetric === "HEARTRATE") && hrPoints.length > 0 && (
            <>
              <path d={hrArea} fill="url(#hrGrad)" />
              <path d={hrPath} fill="none" stroke="#f43f5e" strokeWidth="1.8" />
            </>
          )}

          {/* Curva de Potencia Stryd */}
          {(activeMetric === "ALL" || activeMetric === "WATTS") && wattsPoints.length > 0 && (
            <path d={wattsPath} fill="none" stroke="#c084fc" strokeWidth="1.6" />
          )}

          {/* Línea Vertical del Cursor Hover */}
          {hoverIndex !== null && (
            <>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={paddingTop + plotH}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
              {hoveredData?.hr !== undefined && (activeMetric === "ALL" || activeMetric === "HEARTRATE") && (
                <circle cx={getX(hoverIndex)} cy={getHrY(hoveredData.hr)} r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
              )}
              {hoveredData?.watts !== undefined && (activeMetric === "ALL" || activeMetric === "WATTS") && (
                <circle cx={getX(hoverIndex)} cy={getWattsY(hoveredData.watts)} r="4" fill="#c084fc" stroke="#ffffff" strokeWidth="1.5" />
              )}
            </>
          )}
        </svg>
      </div>
    </div>
  );
};
