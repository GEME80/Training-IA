"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, Activity, Zap, BatteryCharging, Sparkles, ShieldAlert, Award } from "lucide-react";
import { AthleteWellness } from "@/lib/intervals/types";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { generatePMCSeries, PMCTimeframe, PMCDataPoint } from "@/lib/physiology/pmcEngine";

interface AthletePMCChartProps {
  wellnessHistory: AthleteWellness[];
  blueprint: MacrocycleBlueprint | null;
  athleteName?: string;
}

export const AthletePMCChart: React.FC<AthletePMCChartProps> = ({
  wellnessHistory,
  blueprint,
  athleteName,
}) => {
  const [timeframe, setTimeframe] = useState<PMCTimeframe>("6m");
  const [showProjection, setShowProjection] = useState<boolean>(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { points, summary } = useMemo(() => {
    return generatePMCSeries(wellnessHistory, blueprint, timeframe, showProjection);
  }, [wellnessHistory, blueprint, timeframe, showProjection]);

  // Dimensiones del gráfico SVG responsive
  const svgWidth = 900;
  const svgHeight = 280;
  const padL = 45;
  const padR = 25;
  const padT = 20;
  const padB = 30;

  // Escala Y unificada con margen para CTL, ATL y TSB
  const { minY, maxY } = useMemo(() => {
    if (points.length === 0) return { minY: -40, maxY: 100 };
    let minVal = 0;
    let maxVal = 50;
    points.forEach((p) => {
      minVal = Math.min(minVal, p.tsb, p.ctl, p.atl);
      maxVal = Math.max(maxVal, p.ctl, p.atl, p.tsb);
    });
    return {
      minY: Math.floor(Math.min(minVal - 10, -40)),
      maxY: Math.ceil(Math.max(maxVal + 15, 80)),
    };
  }, [points]);

  const scaleX = (idx: number) => {
    if (points.length <= 1) return padL;
    return padL + (idx / (points.length - 1)) * (svgWidth - padL - padR);
  };

  const scaleY = (val: number) => {
    const range = maxY - minY || 1;
    return padB + (1 - (val - minY) / range) * (svgHeight - padT - padB);
  };

  // Separar puntos en pasado y proyección
  const todayIdx = points.findIndex((p) => p.label === "Hoy");
  const splitIdx = todayIdx !== -1 ? todayIdx : points.findIndex((p) => p.isProjected) - 1;

  const makePath = (accessor: (p: PMCDataPoint) => number, start: number, end: number) => {
    if (points.length === 0 || start < 0 || end < start) return "";
    let d = "";
    for (let i = start; i <= end && i < points.length; i++) {
      const x = scaleX(i);
      const y = scaleY(accessor(points[i]));
      d += i === start ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  };

  const pastEnd = splitIdx >= 0 ? splitIdx : points.length - 1;
  const futureStart = splitIdx >= 0 ? splitIdx : 0;

  const ctlPastPath = makePath((p) => p.ctl, 0, pastEnd);
  const ctlFuturePath = makePath((p) => p.ctl, futureStart, points.length - 1);

  const atlPastPath = makePath((p) => p.atl, 0, pastEnd);
  const atlFuturePath = makePath((p) => p.atl, futureStart, points.length - 1);

  const tsbPastPath = makePath((p) => p.tsb, 0, pastEnd);
  const tsbFuturePath = makePath((p) => p.tsb, futureStart, points.length - 1);

  const zeroY = scaleY(0);
  const yMinus30 = scaleY(-30);
  const yPlus15 = scaleY(15);

  const activePoint = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : null;
  const lastPoint = points[points.length - 1];

  return (
    <div className="space-y-4">
      {/* TARJETAS KPI RESUMEN HISTÓRICO 365 DÍAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
            <span>Peak CTL (365d)</span>
            <Award className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5">
            <span>{summary.peakCtlLastYear}</span>
            <span className="text-[10px] text-slate-400 font-semibold">pts techo</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium truncate">
            Motor demostrado por el atleta
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
            <span>CTL Actual vs Meta</span>
            <Activity className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5">
            <span>{summary.lastKnownCtl}</span>
            <span className="text-xs text-slate-400 font-bold">➔</span>
            <span className="text-sky-500">{lastPoint?.ctl ?? summary.lastKnownCtl}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Proyección a día de carrera
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
            <span>Forma TSB Objetivo</span>
            <BatteryCharging className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1.5">
            <span>{lastPoint?.tsb && lastPoint.tsb > 0 ? `+${lastPoint.tsb}` : lastPoint?.tsb ?? summary.lastKnownTsb}</span>
            <span className="text-[10px] text-slate-400 font-semibold">Frescura</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Pico de supercompensación (Friel)
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
            <span>Rampa Asimilada</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5">
            <span>+{summary.avgRampRate}</span>
            <span className="text-[10px] text-slate-400 font-semibold">pts/sem</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
            Suelo seguro TSB: {summary.minTsbRecorded}
          </p>
        </div>
      </div>

      {/* CONTROLES DEL GRÁFICO (TIME-FRAME + PROYECCIÓN) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700/50">
          {(["3m", "6m", "1y"] as PMCTimeframe[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeframe === tf
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tf === "3m" ? "3 Meses" : tf === "6m" ? "6 Meses (Recomendado)" : "1 Año"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showProjection}
              onChange={(e) => setShowProjection(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 h-3.5 w-3.5 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
            />
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Ver Proyección Banister a Carrera</span>
          </label>
        </div>
      </div>

      {/* CONTENEDOR DEL GRÁFICO SVG NATIVO */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-5 shadow-xs overflow-hidden">
        {points.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
            <Activity className="h-8 w-8 animate-pulse text-sky-500" />
            <span>Cargando telemetría PMC de Intervals.icu...</span>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-64 sm:h-72 select-none"
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <defs>
                {/* Gradiente Zona Roja Sobrecarga */}
                <linearGradient id="dangerZone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.18" />
                </linearGradient>
                {/* Gradiente Zona Frescura Óptima */}
                <linearGradient id="freshZone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* FRIDA ZONES (Sombreado Fisiológico Joe Friel) */}
              {/* Zona Frescura (> +15 TSB) */}
              <rect x={padL} y={padT} width={svgWidth - padL - padR} height={Math.max(0, yPlus15 - padT)} fill="url(#freshZone)" />
              {/* Zona Sobrecarga (< -30 TSB) */}
              <rect x={padL} y={yMinus30} width={svgWidth - padL - padR} height={Math.max(0, svgHeight - padB - yMinus30)} fill="url(#dangerZone)" />

              {/* LÍNEA DE CERO TSB */}
              <line x1={padL} y1={zeroY} x2={svgWidth - padR} y2={zeroY} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" strokeOpacity="0.5" />
              <text x={padL - 6} y={zeroY + 3} textAnchor="end" fill="#94a3b8" fontSize="10" fontWeight="bold">0</text>

              {/* GUÍAS HORIZONTALES */}
              <line x1={padL} y1={yMinus30} x2={svgWidth - padR} y2={yMinus30} stroke="#ef4444" strokeDasharray="2 2" strokeWidth="0.8" strokeOpacity="0.4" />
              <text x={padL - 6} y={yMinus30 + 3} textAnchor="end" fill="#ef4444" fontSize="9" fontWeight="bold">-30</text>

              <line x1={padL} y1={yPlus15} x2={svgWidth - padR} y2={yPlus15} stroke="#10b981" strokeDasharray="2 2" strokeWidth="0.8" strokeOpacity="0.4" />
              <text x={padL - 6} y={yPlus15 + 3} textAnchor="end" fill="#10b981" fontSize="9" fontWeight="bold">+15</text>

              {/* LÍNEA VERTICAL 'HOY' */}
              {splitIdx >= 0 && (
                <g>
                  <line
                    x1={scaleX(splitIdx)}
                    y1={padT}
                    x2={scaleX(splitIdx)}
                    y2={svgHeight - padB}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={scaleX(splitIdx) - 22}
                    y={padT - 12}
                    width="44"
                    height="16"
                    rx="4"
                    fill="#0284c7"
                  />
                  <text
                    x={scaleX(splitIdx)}
                    y={padT}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="900"
                  >
                    HOY
                  </text>
                </g>
              )}

              {/* CURVAS PMC: PASADO (SÓLIDO) */}
              <path d={atlPastPath} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
              <path d={ctlPastPath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
              <path d={tsbPastPath} fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />

              {/* CURVAS PMC: FUTURO PROYECTADO (PUNTEADO BANISTER) */}
              {showProjection && splitIdx >= 0 && (
                <>
                  <path d={atlFuturePath} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 3" strokeOpacity="0.85" />
                  <path d={ctlFuturePath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="4 3" strokeOpacity="0.85" />
                  <path d={tsbFuturePath} fill="none" stroke="#10b981" strokeWidth="1.8" strokeDasharray="4 3" strokeOpacity="0.85" />
                </>
              )}

              {/* INTERACCIÓN TÁCTIL / RATÓN (HOTSPOTS) */}
              {points.map((p, idx) => (
                <rect
                  key={p.date}
                  x={scaleX(idx) - (svgWidth / points.length) / 2}
                  y={padT}
                  width={svgWidth / points.length}
                  height={svgHeight - padT - padB}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onTouchStart={() => setHoveredIdx(idx)}
                />
              ))}

              {/* MIRA INTERACTIVA AL HACER HOVER */}
              {hoveredIdx !== null && activePoint && (
                <g>
                  <line
                    x1={scaleX(hoveredIdx)}
                    y1={padT}
                    x2={scaleX(hoveredIdx)}
                    y2={svgHeight - padB}
                    stroke="#64748b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  {/* Puntos en intersección */}
                  <circle cx={scaleX(hoveredIdx)} cy={scaleY(activePoint.ctl)} r="4" fill="#0ea5e9" stroke="#fff" strokeWidth="1.5" />
                  <circle cx={scaleX(hoveredIdx)} cy={scaleY(activePoint.atl)} r="3.5" fill="#a855f7" stroke="#fff" strokeWidth="1.5" />
                  <circle cx={scaleX(hoveredIdx)} cy={scaleY(activePoint.tsb)} r="3" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                </g>
              )}
            </svg>
          </div>
        )}

        {/* TOOLTIP INTERACTIVO FLOTANTE */}
        {activePoint && hoveredIdx !== null && (
          <div
            className="absolute top-4 pointer-events-none z-20 bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md rounded-xl p-2.5 shadow-xl border border-slate-700/60 text-xs space-y-1 transition-all"
            style={{
              left: `${Math.min(Math.max(scaleX(hoveredIdx) / svgWidth * 100, 15), 80)}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-1">
              <span className="font-bold">{activePoint.date}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${activePoint.isProjected ? "bg-amber-500/20 text-amber-300" : "bg-sky-500/20 text-sky-300"}`}>
                {activePoint.isProjected ? "Proyección Banister" : "Histórico Real"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 pt-0.5 font-semibold">
              <div className="text-sky-400">CTL: <span className="font-black text-white">{activePoint.ctl}</span></div>
              <div className="text-purple-400">ATL: <span className="font-black text-white">{activePoint.atl}</span></div>
              <div className={activePoint.tsb >= 0 ? "text-emerald-400" : "text-amber-400"}>
                TSB: <span className="font-black text-white">{activePoint.tsb > 0 ? `+${activePoint.tsb}` : activePoint.tsb}</span>
              </div>
            </div>
            {activePoint.tss !== undefined && activePoint.tss > 0 && (
              <div className="text-[10px] text-slate-400">TSS diario estimado: {activePoint.tss} pts</div>
            )}
          </div>
        )}

        {/* LEYENDA DEL GRÁFICO */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
              <span className="w-3 h-1 bg-sky-500 rounded-full"></span>
              <span>Aptitud (CTL - Fitness)</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
              <span className="w-3 h-1 bg-purple-500 rounded-full"></span>
              <span>Fatiga (ATL - Fatigue)</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-3 h-1 bg-emerald-500 rounded-full"></span>
              <span>Forma (TSB - Form)</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500/40"></span> &gt;+15 Frescura
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500/40"></span> &lt;-30 Sobrecarga
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
