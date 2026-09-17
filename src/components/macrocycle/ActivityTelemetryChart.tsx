"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Heart, Zap, Activity, Mountain, Loader2, Sparkles } from "lucide-react";
import {
  buildSampledData,
  buildContinuousSegments,
  createScaleHelpers,
  formatSec,
} from "./telemetryChartHelpers";

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
  onMetricsDiscovered?: (metrics: { avgWatts?: number }) => void;
}

export const ActivityTelemetryChart: React.FC<ActivityTelemetryChartProps> = ({
  activityId,
  athleteId,
  apiKey,
  uid,
  email,
  summaryStats,
  onMetricsDiscovered,
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
        if (isMounted) setError(err instanceof Error ? err.message : "Error al conectar con la telemetría");
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

  const validHrs = useMemo(() => hrArray.filter((h) => typeof h === "number" && !isNaN(h) && h >= 40), [hrArray]);
  const minHr = useMemo(() => (validHrs.length ? Math.min(...validHrs) : 60), [validHrs]);
  const maxHr = useMemo(() => (validHrs.length ? Math.max(...validHrs) : 180), [validHrs]);

  const validWatts = useMemo(() => wattsArray.filter((w) => typeof w === "number" && !isNaN(w) && w > 0), [wattsArray]);
  const streamAvgWatts = useMemo(() => {
    if (!validWatts.length) return undefined;
    return Math.round(validWatts.reduce((a, b) => a + b, 0) / validWatts.length);
  }, [validWatts]);

  useEffect(() => {
    if (streamAvgWatts && onMetricsDiscovered) {
      onMetricsDiscovered({ avgWatts: streamAvgWatts });
    }
  }, [streamAvgWatts, onMetricsDiscovered]);

  const validAlts = useMemo(() => altArray.filter((a) => typeof a === "number" && !isNaN(a)), [altArray]);
  const minAlt = useMemo(() => (validAlts.length ? Math.min(...validAlts) : 0), [validAlts]);
  const maxAlt = useMemo(() => (validAlts.length ? Math.max(...validAlts) : 100), [validAlts]);
  const maxWatts = useMemo(() => (validWatts.length ? Math.max(...validWatts, 300) : 400), [validWatts]);

  const sampledData = useMemo(() => buildSampledData(timeArray, hrArray, wattsArray, altArray, 200), [timeArray, hrArray, wattsArray, altArray]);

  const chartWidth = 600;
  const chartHeight = 220;
  const padding = { left: 35, right: 15, top: 20, bottom: 30 };
  const { plotW, plotH, getX, getHrY, getWattsY, getAltY } = useMemo(
    () => createScaleHelpers({ totalSamples: sampledData.length, chartWidth, chartHeight, padding, minHr, maxHr, minAlt, maxAlt, maxWatts }),
    [sampledData.length, minHr, maxHr, minAlt, maxAlt, maxWatts]
  );

  const hrSegments = useMemo(() => buildContinuousSegments(sampledData, "hr"), [sampledData]);
  const wattsSegments = useMemo(() => buildContinuousSegments(sampledData, "watts"), [sampledData]);

  const altPoints = useMemo(() => sampledData.filter((d) => d.alt !== undefined), [sampledData]);
  const altPath = useMemo(() => altPoints.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.sampleIdx)} ${getAltY(d.alt)}`).join(" "), [altPoints, getX, getAltY]);
  const altArea = useMemo(() => {
    return altPoints.length ? `${altPath} L ${getX(altPoints[altPoints.length - 1].sampleIdx)} ${padding.top + plotH} L ${getX(altPoints[0].sampleIdx)} ${padding.top + plotH} Z` : "";
  }, [altPath, altPoints, getX, padding.top, plotH]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || sampledData.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = chartWidth / rect.width;
    const relativeX = Math.max(0, Math.min(plotW, (e.clientX - rect.left) * scale - padding.left));
    const idx = Math.round((relativeX / plotW) * (sampledData.length - 1));
    setHoverIndex(idx >= 0 && idx < sampledData.length ? idx : null);
  };

  const hoveredData = hoverIndex !== null ? sampledData[hoverIndex] : null;

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
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{error || "Series detalladas no disponibles para esta sesión."}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 text-white space-y-3 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
            Cronología de Telemetría ({formatSec(timeArray[timeArray.length - 1] || 0)})
          </span>
        </div>

        <div className="flex items-center gap-1">
          {(["ALL", "HEARTRATE", "WATTS", "ALTITUDE"] as const).map((m) => {
            const labels = { ALL: "Todas", HEARTRATE: "FC", WATTS: "Potencia", ALTITUDE: "Altitud" };
            return (
              <button
                key={m}
                type="button"
                onClick={() => setActiveMetric(m)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
                  activeMetric === m ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {labels[m]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tooltip Dinámico Superior */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
        <span className="text-slate-400 font-bold">⏱️ {hoveredData ? formatSec(hoveredData.timeSec) : "Pasa el cursor..."}</span>
        <span className="text-rose-400 font-bold flex items-center gap-1">
          <Heart className="h-3 w-3" />{" "}
          {hoveredData ? (hoveredData.hr !== undefined ? `${hoveredData.hr} bpm` : "Sin señal (sensor desconectado)") : (summaryStats?.heartrate ? `Media: ${summaryStats.heartrate} bpm` : "—")}
        </span>
        <span className="text-purple-400 font-bold flex items-center gap-1">
          <Zap className="h-3 w-3" />{" "}
          {hoveredData?.watts !== undefined ? `${hoveredData.watts} W` : summaryStats?.watts ? `Media: ${summaryStats.watts}W` : streamAvgWatts ? `Media: ${streamAvgWatts}W` : (summaryStats?.weightedWatts ? `NP: ${summaryStats.weightedWatts}W` : "—")}
        </span>
        <span className="text-slate-400 flex items-center gap-1">
          <Mountain className="h-3 w-3" />{" "}
          {hoveredData?.alt !== undefined ? `${Math.round(hoveredData.alt)} m` : (summaryStats?.elevationGainM ? `+${summaryStats.elevationGainM}m` : "—")}
        </span>
      </div>

      {/* SVG Canvas Gráfico */}
      <div className="relative w-full overflow-hidden">
        <svg ref={svgRef} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto cursor-crosshair select-none" onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIndex(null)}>
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

          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
            <line key={i} x1={padding.left} y1={padding.top + pct * plotH} x2={chartWidth - padding.right} y2={padding.top + pct * plotH} stroke="#334155" strokeDasharray="3,3" strokeWidth="0.8" />
          ))}

          {(activeMetric === "ALL" || activeMetric === "ALTITUDE") && altPoints.length > 0 && (
            <>
              {altArea && <path d={altArea} fill="url(#altGrad)" />}
              <path d={altPath} fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeOpacity="0.8" />
            </>
          )}

          {(activeMetric === "ALL" || activeMetric === "HEARTRATE") && hrSegments.length > 0 && (
            <>
              {hrSegments.map((seg, sIdx) => {
                if (sIdx === hrSegments.length - 1) return null;
                const nextSeg = hrSegments[sIdx + 1];
                return (
                  <line
                    key={`hr-gap-${sIdx}`}
                    x1={getX(seg[seg.length - 1].sampleIdx)}
                    y1={getHrY(seg[seg.length - 1].val)}
                    x2={getX(nextSeg[0].sampleIdx)}
                    y2={getHrY(nextSeg[0].val)}
                    stroke="#f43f5e"
                    strokeWidth="1.2"
                    strokeDasharray="3,3"
                    strokeOpacity="0.5"
                  />
                );
              })}
              {hrSegments.map((seg, sIdx) => {
                const pD = seg.map((pt, j) => `${j === 0 ? "M" : "L"} ${getX(pt.sampleIdx)} ${getHrY(pt.val)}`).join(" ");
                const aD = seg.length > 1 ? `${pD} L ${getX(seg[seg.length - 1].sampleIdx)} ${padding.top + plotH} L ${getX(seg[0].sampleIdx)} ${padding.top + plotH} Z` : "";
                return (
                  <React.Fragment key={`hr-seg-${sIdx}`}>
                    {aD && <path d={aD} fill="url(#hrGrad)" />}
                    <path d={pD} fill="none" stroke="#f43f5e" strokeWidth="1.8" />
                  </React.Fragment>
                );
              })}
            </>
          )}

          {(activeMetric === "ALL" || activeMetric === "WATTS") &&
            wattsSegments.map((seg, sIdx) => {
              const pD = seg.map((pt, j) => `${j === 0 ? "M" : "L"} ${getX(pt.sampleIdx)} ${getWattsY(pt.val)}`).join(" ");
              return <path key={`w-seg-${sIdx}`} d={pD} fill="none" stroke="#c084fc" strokeWidth="1.6" />;
            })}

          {hoverIndex !== null && (
            <>
              <line x1={getX(hoverIndex)} y1={padding.top} x2={getX(hoverIndex)} y2={padding.top + plotH} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2,2" />
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
