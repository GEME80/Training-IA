"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Heart, Zap, Activity, Mountain, Loader2, Sparkles, Timer } from "lucide-react";
import {
  buildSampledData,
  buildContinuousSegments,
  createScaleHelpers,
  formatSec,
  TargetWorkRange,
  computeTargetBandY,
  TargetWorkZoneOverlay,
  XAxisMode,
  getXAxisTicks,
  XAxisMarkers,
} from "./telemetryChartHelpers";

export type { TargetWorkRange };

interface ActivityTelemetryChartProps {
  activityId: string;
  athleteId?: string;
  apiKey?: string;
  uid?: string;
  email?: string;
  summaryStats?: {
    heartrate?: number; maxHeartrate?: number; watts?: number; weightedWatts?: number;
    distanceKm?: number; movingTimeMin?: number; paceStr?: string; elevationGainM?: number;
  };
  targetRange?: TargetWorkRange;
  onMetricsDiscovered?: (metrics: { avgWatts?: number }) => void;
}

export const ActivityTelemetryChart: React.FC<ActivityTelemetryChartProps> = ({
  activityId, athleteId, apiKey, uid, email, summaryStats, targetRange, onMetricsDiscovered,
}) => {
  const [loading, setLoading] = useState<boolean>(true), [error, setError] = useState<string | null>(null);
  const [streams, setStreams] = useState<Record<string, any> | null>(null);
  const [activeMetric, setActiveMetric] = useState<"ALL" | "PACE" | "HEARTRATE" | "WATTS" | "ALTITUDE">("ALL");
  const [xAxisMode, setXAxisMode] = useState<XAxisMode>("TIME"), [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStreams() {
      if (!activityId) return;
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams();
        if (athleteId) q.set("athleteId", athleteId); if (apiKey) q.set("apiKey", apiKey);
        if (uid) q.set("uid", uid); if (email) q.set("email", email);
        const res = await fetch(`/api/activities/${encodeURIComponent(activityId)}/streams?${q.toString()}`);
        if (!res.ok) throw new Error("No se pudieron cargar las series temporales");
        const data = await res.json();
        if (isMounted) {
          if (data.success && data.streams && Object.keys(data.streams).length > 0) setStreams(data.streams);
          else setError("Esta actividad no tiene series de telemetría detalladas.");
        }
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : "Error al conectar con la telemetría");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStreams();
    return () => { isMounted = false; };
  }, [activityId, athleteId, apiKey, uid, email]);

  const timeArray = streams?.time || [], hrArray = streams?.raw_heartrate || streams?.heartrate || [];
  const wattsArray = streams?.watts || [], altArray = streams?.altitude || [], velocityArray = streams?.velocity_smooth || [];
  const distanceArray = streams?.distance || [];

  const sampledData = useMemo(
    () => buildSampledData(timeArray, hrArray, wattsArray, altArray, velocityArray, distanceArray, summaryStats?.distanceKm, 200),
    [timeArray, hrArray, wattsArray, altArray, velocityArray, distanceArray, summaryStats?.distanceKm]
  );

  const bounds = useMemo(() => {
    const vHrs = hrArray.filter((h: number) => typeof h === "number" && !isNaN(h) && h >= 40);
    const vWatts = wattsArray.filter((w: number) => typeof w === "number" && !isNaN(w) && w > 0);
    const vAlts = altArray.filter((a: number) => typeof a === "number" && !isNaN(a));
    const vPaces = sampledData.map((d) => d.paceSec).filter((p): p is number => typeof p === "number" && p > 0);
    const avgW = vWatts.length ? Math.round(vWatts.reduce((a: number, b: number) => a + b, 0) / vWatts.length) : undefined;
    return {
      minHr: vHrs.length ? Math.min(...vHrs) : 60,
      maxHr: vHrs.length ? Math.max(...vHrs) : 180,
      maxWatts: vWatts.length ? Math.max(...vWatts, 300) : 400,
      streamAvgWatts: avgW,
      minAlt: vAlts.length ? Math.min(...vAlts) : 0,
      maxAlt: vAlts.length ? Math.max(...vAlts) : 100,
      minPaceSec: vPaces.length ? Math.min(...vPaces) : 210,
      maxPaceSec: vPaces.length ? Math.max(...vPaces) : 420,
      hasPace: vPaces.length > 5,
      hasWatts: vWatts.length > 5,
      hasHr: vHrs.length > 5,
      hasAlt: vAlts.length > 5,
    };
  }, [hrArray, wattsArray, altArray, sampledData]);

  useEffect(() => {
    if (bounds.streamAvgWatts && onMetricsDiscovered) onMetricsDiscovered({ avgWatts: bounds.streamAvgWatts });
  }, [bounds.streamAvgWatts, onMetricsDiscovered]);

  const chartWidth = 600, chartHeight = 240;
  const padding = { left: 35, right: 15, top: 16, bottom: 28 };
  const { plotW, plotH, getX, getHrY, getWattsY, getAltY, getPaceY } = useMemo(
    () => createScaleHelpers({
      totalSamples: sampledData.length, chartWidth, chartHeight, padding,
      minHr: bounds.minHr, maxHr: bounds.maxHr, minAlt: bounds.minAlt, maxAlt: bounds.maxAlt,
      maxWatts: bounds.maxWatts, minPaceSec: bounds.minPaceSec, maxPaceSec: bounds.maxPaceSec
    }),
    [sampledData.length, bounds]
  );

  const hrSegments = useMemo(() => buildContinuousSegments(sampledData, "hr"), [sampledData]);
  const wattsSegments = useMemo(() => buildContinuousSegments(sampledData, "watts"), [sampledData]);
  const paceSegments = useMemo(() => buildContinuousSegments(sampledData, "paceSec"), [sampledData]);

  const altPoints = useMemo(() => sampledData.filter((d) => d.alt !== undefined), [sampledData]);
  const altPath = useMemo(() => altPoints.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.sampleIdx)} ${getAltY(d.alt)}`).join(" "), [altPoints, getX, getAltY]);
  const altArea = useMemo(() => {
    return altPoints.length ? `${altPath} L ${getX(altPoints[altPoints.length - 1].sampleIdx)} ${padding.top + plotH} L ${getX(altPoints[0].sampleIdx)} ${padding.top + plotH} Z` : "";
  }, [altPath, altPoints, getX, padding.top, plotH]);

  const targetBandY = useMemo(
    () => computeTargetBandY(targetRange, activeMetric, getWattsY, getPaceY, getHrY),
    [targetRange, activeMetric, getWattsY, getPaceY, getHrY]
  );

  const xTicks = useMemo(() => getXAxisTicks(sampledData, xAxisMode, getX), [sampledData, xAxisMode, getX]);

  const updateHoverFromClientX = (clientX: number) => {
    if (!svgRef.current || sampledData.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = chartWidth / rect.width;
    const relativeX = Math.max(0, Math.min(plotW, (clientX - rect.left) * scale - padding.left));
    const idx = Math.round((relativeX / plotW) * (sampledData.length - 1));
    setHoverIndex(idx >= 0 && idx < sampledData.length ? idx : null);
  };

  const hoveredData = hoverIndex !== null ? sampledData[hoverIndex] : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Cargando series de telemetría desde Intervals.icu...</span>
      </div>
    );
  }

  if (error || sampledData.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
        <div className="inline-flex items-center gap-1 text-xs font-black text-slate-600 dark:text-slate-400">
          <Activity className="h-4 w-4 text-cyan-500" />
          <span>Resumen de la Sesión</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{error || "Gráfica detallada no disponible para esta sesión."}</p>
      </div>
    );
  }

  const { hasPace, hasWatts, hasHr, hasAlt, streamAvgWatts } = bounds;

  const metricTabs = [
    { id: "ALL", label: "Todas", visible: true },
    { id: "PACE", label: "Ritmo", visible: hasPace },
    { id: "HEARTRATE", label: "FC", visible: hasHr },
    { id: "WATTS", label: "Potencia", visible: hasWatts },
    { id: "ALTITUDE", label: "Altitud", visible: hasAlt },
  ].filter((t) => t.visible);

  return (
    <div className="space-y-2.5 font-sans text-slate-900 dark:text-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Telemetría ({xAxisMode === "DISTANCE" && summaryStats?.distanceKm ? `${summaryStats.distanceKm.toFixed(1)} km` : formatSec(timeArray[timeArray.length - 1] || 0)})
          </span>
          {targetRange && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
              🎯 Objetivo: {targetRange.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Selector de Dominio de Eje X (Tiempo vs Distancia) */}
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800/90 p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setXAxisMode("TIME")}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                xAxisMode === "TIME" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              ⏱️ Tiempo
            </button>
            <button
              type="button"
              onClick={() => setXAxisMode("DISTANCE")}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                xAxisMode === "DISTANCE" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              📍 Distancia
            </button>
          </div>

          <div className="flex items-center gap-1">
            {metricTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveMetric(t.id as any)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
                  activeMetric === t.id
                    ? "bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip Dinámico Superior (Scrubber HUD) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-950/80 p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[38px]">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
          <span>⏱️ {hoveredData ? formatSec(hoveredData.timeSec) : "00:00"}</span>
          {hoveredData?.distanceKm !== undefined && <span className="text-slate-500 dark:text-slate-400">· 📍 {hoveredData.distanceKm.toFixed(1)} km</span>}
          {!hoveredData && <span className="text-[10px] font-sans font-normal text-slate-400 hidden sm:inline">(Arrastra sobre la gráfica)</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {hasPace && (
            <span className="text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {hoveredData?.paceStr || (summaryStats?.paceStr ? `Prom: ${summaryStats.paceStr}` : "—")}
            </span>
          )}
          <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {hoveredData ? (hoveredData.hr !== undefined ? `${hoveredData.hr} bpm` : "—") : (summaryStats?.heartrate ? `Prom: ${summaryStats.heartrate} bpm` : "—")}
          </span>
          {hasWatts && (
            <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {hoveredData?.watts !== undefined ? `${hoveredData.watts} W` : summaryStats?.watts ? `Prom: ${summaryStats.watts}W` : streamAvgWatts ? `Prom: ${streamAvgWatts}W` : (summaryStats?.weightedWatts ? `NP: ${summaryStats.weightedWatts}W` : "—")}
            </span>
          )}
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Mountain className="h-3 w-3" />
            {hoveredData?.alt !== undefined ? `${Math.round(hoveredData.alt)} m` : (summaryStats?.elevationGainM ? `+${summaryStats.elevationGainM}m` : "—")}
          </span>
        </div>
      </div>

      {/* SVG Canvas Gráfico con marcas de Eje X explícitas y touch nativo */}
      <div className="relative w-full overflow-hidden touch-none select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={(e) => updateHoverFromClientX(e.clientX)}
          onMouseLeave={() => setHoverIndex(null)}
          onTouchStart={(e) => e.touches?.[0] && updateHoverFromClientX(e.touches[0].clientX)}
          onTouchMove={(e) => e.touches?.[0] && updateHoverFromClientX(e.touches[0].clientX)}
          onTouchEnd={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
            <line key={i} x1={padding.left} y1={padding.top + pct * plotH} x2={chartWidth - padding.right} y2={padding.top + pct * plotH} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3,3" strokeWidth="0.8" />
          ))}

          {targetBandY && <TargetWorkZoneOverlay targetBandY={targetBandY} padding={padding} plotW={plotW} chartWidth={chartWidth} />}

          {(activeMetric === "ALL" || activeMetric === "ALTITUDE") && altPoints.length > 0 && (
            <>
              {altArea && <path d={altArea} fill="url(#altGrad)" />}
              <path d={altPath} fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeOpacity="0.7" />
            </>
          )}

          {(activeMetric === "ALL" || activeMetric === "PACE") &&
            paceSegments.map((seg, sIdx) => (
              <path key={`p-${sIdx}`} d={seg.map((pt, j) => `${j === 0 ? "M" : "L"} ${getX(pt.sampleIdx)} ${getPaceY(pt.val)}`).join(" ")} fill="none" stroke="#06b6d4" strokeWidth="2.0" />
            ))}

          {(activeMetric === "ALL" || activeMetric === "HEARTRATE") && hrSegments.length > 0 && (
            <>
              {hrSegments.map((seg, sIdx) => {
                if (sIdx === hrSegments.length - 1) return null;
                const nextSeg = hrSegments[sIdx + 1];
                return <line key={`hr-g-${sIdx}`} x1={getX(seg[seg.length - 1].sampleIdx)} y1={getHrY(seg[seg.length - 1].val)} x2={getX(nextSeg[0].sampleIdx)} y2={getHrY(nextSeg[0].val)} stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="3,3" strokeOpacity="0.5" />;
              })}
              {hrSegments.map((seg, sIdx) => {
                const pD = seg.map((pt, j) => `${j === 0 ? "M" : "L"} ${getX(pt.sampleIdx)} ${getHrY(pt.val)}`).join(" ");
                const aD = seg.length > 1 ? `${pD} L ${getX(seg[seg.length - 1].sampleIdx)} ${padding.top + plotH} L ${getX(seg[0].sampleIdx)} ${padding.top + plotH} Z` : "";
                return (
                  <React.Fragment key={`hr-s-${sIdx}`}>
                    {aD && <path d={aD} fill="url(#hrGrad)" />}
                    <path d={pD} fill="none" stroke="#f43f5e" strokeWidth="1.8" />
                  </React.Fragment>
                );
              })}
            </>
          )}

          {(activeMetric === "ALL" || activeMetric === "WATTS") &&
            wattsSegments.map((seg, sIdx) => (
              <path key={`w-${sIdx}`} d={seg.map((pt, j) => `${j === 0 ? "M" : "L"} ${getX(pt.sampleIdx)} ${getWattsY(pt.val)}`).join(" ")} fill="none" stroke="#a855f7" strokeWidth="1.8" />
            ))}

          {/* Marcas de Tiempo / Distancia explícitas en el Eje X */}
          <XAxisMarkers ticks={xTicks} y={padding.top + plotH + 16} />

          {hoverIndex !== null && (
            <>
              <line x1={getX(hoverIndex)} y1={padding.top} x2={getX(hoverIndex)} y2={padding.top + plotH} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2,2" />
              {hoveredData?.paceSec !== undefined && (activeMetric === "ALL" || activeMetric === "PACE") && (
                <circle cx={getX(hoverIndex)} cy={getPaceY(hoveredData.paceSec)} r="4.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
              )}
              {hoveredData?.hr !== undefined && (activeMetric === "ALL" || activeMetric === "HEARTRATE") && (
                <circle cx={getX(hoverIndex)} cy={getHrY(hoveredData.hr)} r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
              )}
              {hoveredData?.watts !== undefined && (activeMetric === "ALL" || activeMetric === "WATTS") && (
                <circle cx={getX(hoverIndex)} cy={getWattsY(hoveredData.watts)} r="4" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
              )}
            </>
          )}
        </svg>
      </div>
    </div>
  );
};
