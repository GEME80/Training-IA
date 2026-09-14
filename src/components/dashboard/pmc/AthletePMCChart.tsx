"use client";

import React, { useState, useMemo, useRef } from "react";
import { Sparkles } from "lucide-react";
import { AthleteWellness } from "@/lib/intervals/types";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { generatePMCSeries, PMCTimeframe, PMCDataPoint } from "@/lib/physiology/pmcEngine";
import { AthletePMCKpiCards } from "./AthletePMCKpiCards";

interface AthletePMCChartProps {
  wellnessHistory: AthleteWellness[];
  blueprint: MacrocycleBlueprint | null;
  athleteName?: string;
}

export const AthletePMCChart: React.FC<AthletePMCChartProps> = ({
  wellnessHistory,
  blueprint,
}) => {
  const [timeframe, setTimeframe] = useState<PMCTimeframe>("6m");
  const [showProjection, setShowProjection] = useState<boolean>(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const { points, summary } = useMemo(() => {
    return generatePMCSeries(wellnessHistory, blueprint, timeframe, showProjection);
  }, [wellnessHistory, blueprint, timeframe, showProjection]);

  // Dimensiones del gráfico de 3 paneles
  const W = 1000;
  const H = 480;
  const padL = 50;
  const padR = 40;
  const p1Top = 15;
  const p1Bottom = 220; // Panel 1: CTL & ATL
  const p2Top = 235;
  const p2Bottom = 365; // Panel 2: TSB
  const p3Top = 380;
  const p3Bottom = 450; // Panel 3: Rampa
  const axisBottom = 475;

  const todayIdx = points.findIndex((p) => p.label === "Hoy");
  const splitIdx = todayIdx !== -1 ? todayIdx : points.findIndex((p) => p.isProjected) - 1;
  const activeIdx = hoveredIdx !== null ? hoveredIdx : (splitIdx >= 0 ? splitIdx : points.length - 1);
  const activePoint: PMCDataPoint | null = points[activeIdx] || null;

  // Escalas Panel 1 (CTL/ATL 0 a 120+)
  const maxLoad = useMemo(() => {
    let m = 60;
    points.forEach((p) => { m = Math.max(m, p.ctl, p.atl); });
    return Math.ceil((m + 15) / 20) * 20;
  }, [points]);

  const scaleX = (i: number) => {
    if (points.length <= 1) return padL;
    return padL + (i / (points.length - 1)) * (W - padL - padR);
  };
  const scaleP1 = (val: number) => p1Bottom - (Math.max(0, val) / maxLoad) * (p1Bottom - p1Top);

  // Escalas Panel 2 (TSB -40 a +30)
  const scaleP2 = (val: number) => {
    const minT = -40;
    const maxT = 30;
    const norm = (Math.max(minT, Math.min(maxT, val)) - minT) / (maxT - minT);
    return p2Bottom - norm * (p2Bottom - p2Top);
  };

  // Escalas Panel 3 (Rampa -8 a +8)
  const scaleP3 = (val: number) => {
    const norm = (Math.max(-8, Math.min(8, val)) - (-8)) / 16;
    return p3Bottom - norm * (p3Bottom - p3Top);
  };
  const p3ZeroY = scaleP3(0);

  // Path generators
  const pastEnd = splitIdx >= 0 ? splitIdx : points.length - 1;
  const futureStart = splitIdx >= 0 ? splitIdx : 0;

  const makeLine = (fn: (p: PMCDataPoint) => number, start: number, end: number, scaleFn: (v: number) => number) => {
    if (points.length === 0 || start < 0 || end < start) return "";
    let d = "";
    for (let i = start; i <= end && i < points.length; i++) {
      const x = scaleX(i);
      const y = scaleFn(fn(points[i]));
      d += i === start ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  };

  const makeArea = (start: number, end: number) => {
    if (points.length === 0 || start < 0 || end < start) return "";
    let d = `M ${scaleX(start).toFixed(1)} ${p1Bottom}`;
    for (let i = start; i <= end && i < points.length; i++) {
      d += ` L ${scaleX(i).toFixed(1)} ${scaleP1(points[i].ctl).toFixed(1)}`;
    }
    d += ` L ${scaleX(end).toFixed(1)} ${p1Bottom} Z`;
    return d;
  };

  // Meses en eje X
  const monthLabels = useMemo(() => {
    const res: Array<{ x: number; label: string }> = [];
    let lastM = "";
    points.forEach((p, idx) => {
      const m = p.date.substring(5, 7);
      if (m !== lastM) {
        lastM = m;
        const d = new Date(p.date + "T12:00:00");
        const name = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
        res.push({ x: scaleX(idx), label: name.charAt(0).toUpperCase() + name.slice(1) });
      }
    });
    return res;
  }, [points]);

  const handleSvgMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * W;
    const ratio = Math.max(0, Math.min(1, (clickX - padL) / (W - padL - padR)));
    const idx = Math.round(ratio * (points.length - 1));
    setHoveredIdx(idx);
  };

  return (
    <div className="space-y-4">
      {/* 4 TARJETAS KPI DE RESUMEN EJECUTIVO */}
      <AthletePMCKpiCards summary={summary} targetPoint={points[points.length - 1] || null} />

      {/* CUADRO NEGRO PERMANENTE / HUD DE TELEMETRÍA (ESTILO INTERVALS.ICU) */}
      <div className="rounded-2xl bg-slate-950 text-white p-3 sm:p-4 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 text-xs font-black uppercase tracking-wider border border-sky-500/30">
            {activePoint?.label === "Hoy" ? "HOY" : activePoint?.isProjected ? "Proyección" : "Histórico"}
          </div>
          <span className="text-sm font-black text-slate-200">
            📅 {activePoint?.date ? new Date(activePoint.date + "T12:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span className="text-slate-400">Aptitud (CTL):</span>
            <span className="text-sky-400 text-sm font-black">{activePoint?.ctl ?? "—"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-slate-400">Fatiga (ATL):</span>
            <span className="text-purple-400 text-sm font-black">{activePoint?.atl ?? "—"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">Forma (TSB):</span>
            <span className={`text-sm font-black ${(activePoint?.tsb ?? 0) >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
              {activePoint?.tsb !== undefined ? (activePoint.tsb > 0 ? `+${activePoint.tsb}` : activePoint.tsb) : "—"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400">Rampa Semanal:</span>
            <span className={`text-sm font-black ${(activePoint?.rampRate ?? 0) >= 0 ? "text-emerald-400" : "text-sky-400"}`}>
              {activePoint?.rampRate !== undefined ? (activePoint.rampRate > 0 ? `+${activePoint.rampRate}` : activePoint.rampRate) : "0"} pts/sem
            </span>
          </div>
        </div>
      </div>

      {/* CONTROLES DE RANGO */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700/50 shadow-xs">
          {(["3m", "6m", "1y"] as PMCTimeframe[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                timeframe === tf
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {tf === "3m" ? "3 Meses" : tf === "6m" ? "6 Meses (Recomendado)" : "1 Año Completo"}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showProjection}
            onChange={(e) => setShowProjection(e.target.checked)}
            className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4 border-slate-300 dark:border-slate-700"
          />
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Ver Proyección Banister a Carrera</span>
        </label>
      </div>

      {/* CONTENEDOR EXPANDIDO DEL GRÁFICO SVG NATIVO */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-[440px] sm:h-[480px] select-none cursor-crosshair"
          onMouseMove={handleSvgMove}
          onMouseLeave={() => setHoveredIdx(null)}
          onTouchMove={(e) => {
            if (e.touches[0]) handleSvgMove({ clientX: e.touches[0].clientX } as any);
          }}
        >
          <defs>
            <linearGradient id="ctlAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* PANEL 1: CARGA DE ENTRENAMIENTO (FITNESS / FATIGA) */}
          <rect x={padL} y={p1Top} width={W - padL - padR} height={p1Bottom - p1Top} fill="#f8fafc" fillOpacity="0.5" rx="4" />
          <text x={padL + 8} y={p1Top + 14} fill="#64748b" fontSize="11" fontWeight="bold">Carga de entrenamiento por día (Fitness / Fatiga)</text>
          {[0, 30, 60, 90, 120].filter(v => v <= maxLoad).map(v => (
            <g key={v}>
              <line x1={padL} y1={scaleP1(v)} x2={W - padR} y2={scaleP1(v)} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
              <text x={padL - 6} y={scaleP1(v) + 3} textAnchor="end" fill="#94a3b8" fontSize="9" fontWeight="bold">{v}</text>
            </g>
          ))}
          {/* Área azul sombreada CTL */}
          <path d={makeArea(0, pastEnd)} fill="url(#ctlAreaGrad)" />
          {/* Curvas Panel 1 */}
          <path d={makeLine(p => p.ctl, 0, pastEnd, scaleP1)} fill="none" stroke="#0284c7" strokeWidth="2.5" />
          <path d={makeLine(p => p.atl, 0, pastEnd, scaleP1)} fill="none" stroke="#9333ea" strokeWidth="1.8" />
          {showProjection && splitIdx >= 0 && (
            <>
              <path d={makeLine(p => p.ctl, futureStart, points.length - 1, scaleP1)} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeDasharray="5 4" strokeOpacity="0.8" />
              <path d={makeLine(p => p.atl, futureStart, points.length - 1, scaleP1)} fill="none" stroke="#9333ea" strokeWidth="1.8" strokeDasharray="5 4" strokeOpacity="0.8" />
            </>
          )}

          {/* PANEL 2: FORMA (TSB) CON BANDAS FRIEL */}
          <rect x={padL} y={p2Top} width={W - padL - padR} height={scaleP2(20) - p2Top} fill="#fed7aa" fillOpacity="0.25" />
          <rect x={padL} y={scaleP2(20)} width={W - padL - padR} height={scaleP2(5) - scaleP2(20)} fill="#bae6fd" fillOpacity="0.25" />
          <rect x={padL} y={scaleP2(5)} width={W - padL - padR} height={scaleP2(-10) - scaleP2(5)} fill="#f1f5f9" fillOpacity="0.3" />
          <rect x={padL} y={scaleP2(-10)} width={W - padL - padR} height={scaleP2(-30) - scaleP2(-10)} fill="#bbf7d0" fillOpacity="0.25" />
          <rect x={padL} y={scaleP2(-30)} width={W - padL - padR} height={p2Bottom - scaleP2(-30)} fill="#fecdd3" fillOpacity="0.3" />
          <text x={padL + 8} y={p2Top + 14} fill="#64748b" fontSize="11" fontWeight="bold">Forma (TSB)</text>
          {/* Etiquetas Friel derecha */}
          <text x={W - padR + 6} y={scaleP2(22)} fill="#d97706" fontSize="8" fontWeight="bold">Transición</text>
          <text x={W - padR + 6} y={scaleP2(12)} fill="#0284c7" fontSize="8" fontWeight="bold">Fresco</text>
          <text x={W - padR + 6} y={scaleP2(-2)} fill="#64748b" fontSize="8" fontWeight="bold">Zona gris</text>
          <text x={W - padR + 6} y={scaleP2(-20)} fill="#16a34a" fontSize="8" fontWeight="bold">Óptimo</text>
          <text x={W - padR + 6} y={scaleP2(-34)} fill="#dc2626" fontSize="8" fontWeight="bold">Alto Riesgo</text>
          {/* Línea 0 TSB */}
          <line x1={padL} y1={scaleP2(0)} x2={W - padR} y2={scaleP2(0)} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
          <path d={makeLine(p => p.tsb, 0, pastEnd, scaleP2)} fill="none" stroke="#10b981" strokeWidth="2" />
          {showProjection && splitIdx >= 0 && (
            <path d={makeLine(p => p.tsb, futureStart, points.length - 1, scaleP2)} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5 4" strokeOpacity="0.8" />
          )}

          {/* PANEL 3: RAMPA SEMANAL (RAMP RATE BARS) */}
          <rect x={padL} y={p3Top} width={W - padL - padR} height={p3Bottom - p3Top} fill="#f8fafc" fillOpacity="0.5" rx="3" />
          <text x={padL + 8} y={p3Top + 12} fill="#64748b" fontSize="10" fontWeight="bold">Rampa semanal (CTL / sem)</text>
          <line x1={padL} y1={p3ZeroY} x2={W - padR} y2={p3ZeroY} stroke="#94a3b8" strokeWidth="1" />
          <text x={padL - 6} y={p3ZeroY + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="bold">0</text>
          <text x={padL - 6} y={scaleP3(6) + 3} textAnchor="end" fill="#16a34a" fontSize="8" fontWeight="bold">+6</text>
          <text x={padL - 6} y={scaleP3(-6) + 3} textAnchor="end" fill="#0284c7" fontSize="8" fontWeight="bold">-6</text>

          {/* Barras de Rampa */}
          {points.map((p, idx) => {
            const x = scaleX(idx);
            const w = Math.max(1.8, (W - padL - padR) / points.length);
            const y = scaleP3(p.rampRate);
            const isPos = p.rampRate >= 0;
            const barH = Math.max(1, Math.abs(y - p3ZeroY));
            const barY = isPos ? y : p3ZeroY;
            return (
              <rect
                key={p.date}
                x={x - w / 2}
                y={barY}
                width={w}
                height={barH}
                fill={isPos ? "#4ade80" : "#38bdf8"}
                fillOpacity={p.isProjected ? 0.5 : 0.85}
              />
            );
          })}

          {/* EJE X: MESES */}
          {monthLabels.map((m, i) => (
            <text key={i} x={m.x} y={axisBottom} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">
              {m.label}
            </text>
          ))}

          {/* LÍNEA 'HOY' */}
          {splitIdx >= 0 && (
            <g>
              <line x1={scaleX(splitIdx)} y1={p1Top} x2={scaleX(splitIdx)} y2={p3Bottom} stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 3" />
              <rect x={scaleX(splitIdx) - 18} y={p1Top - 12} width="36" height="15" rx="3" fill="#0284c7" />
              <text x={scaleX(splitIdx)} y={p1Top - 1} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="900">HOY</text>
            </g>
          )}

          {/* CURSOR INTERACTIVO TRACKING */}
          {activeIdx !== null && (
            <g>
              <line x1={scaleX(activeIdx)} y1={p1Top} x2={scaleX(activeIdx)} y2={p3Bottom} stroke="#0f172a" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx={scaleX(activeIdx)} cy={scaleP1(points[activeIdx].ctl)} r="4" fill="#0284c7" stroke="#fff" strokeWidth="1.5" />
              <circle cx={scaleX(activeIdx)} cy={scaleP1(points[activeIdx].atl)} r="3.5" fill="#9333ea" stroke="#fff" strokeWidth="1.5" />
              <circle cx={scaleX(activeIdx)} cy={scaleP2(points[activeIdx].tsb)} r="3.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
