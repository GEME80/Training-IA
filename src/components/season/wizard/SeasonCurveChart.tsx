"use client";

import React, { useState, useMemo } from "react";
import { MacrocycleWeek } from "@/lib/physiology/macrocycle";

interface SeasonCurveChartProps {
  weeks: MacrocycleWeek[];
  activeWeekIndex?: number;
}

export const SeasonCurveChart: React.FC<SeasonCurveChartProps> = ({ weeks, activeWeekIndex }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!weeks || weeks.length === 0) return null;

  const totalWeeks = weeks.length;
  const maxTssValue = Math.max(400, ...weeks.map((w) => w.targetTss || 300));
  const minTssValue = 0;

  const chartWidth = 700;
  const chartHeight = 185;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 28;
  const paddingBottom = 30;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (totalWeeks <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (totalWeeks - 1)) * plotWidth;
  };

  const getY = (tss: number) => {
    const clamped = Math.max(minTssValue, Math.min(maxTssValue, tss));
    const ratio = clamped / maxTssValue;
    return paddingTop + plotHeight - ratio * plotHeight;
  };

  // Puntos para la línea SVG y área
  const points = weeks.map((w, idx) => ({
    x: getX(idx),
    y: getY(w.targetTss || 250),
    week: w,
    index: idx,
  }));

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Calcular semana actual ("Dónde vamos")
  const currentActiveIndex = useMemo(() => {
    if (typeof activeWeekIndex === "number" && activeWeekIndex >= 0 && activeWeekIndex < weeks.length) {
      return activeWeekIndex;
    }
    const matchedIdx = weeks.findIndex(
      (w) => todayStr >= w.startDate && todayStr <= w.endDate
    );
    if (matchedIdx !== -1) return matchedIdx;
    if (weeks[0] && todayStr < weeks[0].startDate) return 0;
    if (weeks[weeks.length - 1] && todayStr > weeks[weeks.length - 1].endDate) {
      return weeks.length - 1;
    }
    return 0;
  }, [weeks, todayStr, activeWeekIndex]);

  const currentPoint = points[currentActiveIndex];

  const pathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    return `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x || 0} ${paddingTop + plotHeight} L ${points[0]?.x || 0} ${paddingTop + plotHeight} Z`;

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  const getPhaseColor = (phase: string) => {
    if (phase.includes("BASE")) return "#10b981"; // Emerald
    if (phase.includes("BUILD") || phase.includes("Construcción")) return "#f59e0b"; // Amber
    if (phase.includes("PEAK") || phase.includes("Pico")) return "#ef4444"; // Red
    if (phase.includes("TAPER") || phase.includes("Puesta")) return "#8b5cf6"; // Purple
    if (phase.includes("RACE") || phase.includes("Competición")) return "#eab308"; // Gold
    return "#06b6d4"; // Cyan
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-2 font-mono shadow-xs">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          📈 Curva de Periodización y Carga (TSS)
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-sky-700 dark:text-sky-300 font-bold bg-sky-50 dark:bg-sky-950/40 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            Vas en: Sem {currentPoint?.week.weekNumber || 1}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            {totalWeeks} Semanas
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGradientLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Eje Y Líneas Guía */}
          {[0, 100, 200, 300, 400].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                  className="dark:stroke-slate-800"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Área de la Curva */}
          <path d={areaD} fill="url(#areaGradientLight)" />

          {/* Línea de la Curva */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Indicador 'Dónde vamos' (Línea Vertical y Badge Luminoso) */}
          {currentPoint && (
            <g className="pointer-events-none">
              <line
                x1={currentPoint.x}
                y1={paddingTop - 12}
                x2={currentPoint.x}
                y2={paddingTop + plotHeight}
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.85"
              />
              <circle
                cx={currentPoint.x}
                cy={currentPoint.y}
                r="10"
                fill="#0284c7"
                opacity="0.2"
                className="animate-ping"
              />
              <rect
                x={currentPoint.x - 30}
                y={paddingTop - 20}
                width="60"
                height="15"
                rx="7.5"
                fill="#0284c7"
                className="shadow-xs"
              />
              <text
                x={currentPoint.x}
                y={paddingTop - 9}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="7.5"
                fontWeight="900"
              >
                📍 HOY (SEM {currentPoint.week.weekNumber})
              </text>
            </g>
          )}

          {/* Puntos y Valles de Descarga */}
          {points.map((pt, idx) => {
            const isRecovery = pt.week.microcycleType === "DESCARGA_ASIMILACION";
            const isRace = pt.week.phase === "RACE_WEEK" || idx === totalWeeks - 1;
            const isCurrent = idx === currentActiveIndex;
            const dotColor = isCurrent
              ? "#0284c7"
              : isRace
              ? "#eab308"
              : isRecovery
              ? "#38bdf8"
              : getPhaseColor(pt.week.phase);

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isCurrent ? 6 : isRace ? 5 : isRecovery ? 4 : 3.5}
                  fill={dotColor}
                  stroke="#ffffff"
                  strokeWidth={isCurrent ? "2" : "1.5"}
                />
              </g>
            );
          })}

          {/* Eje X Etiquetas de Semanas Clave */}
          {points
            .filter((_, idx) => idx === 0 || idx === Math.floor(totalWeeks / 3) || idx === Math.floor((totalWeeks * 2) / 3) || idx === totalWeeks - 1)
            .map((pt, i) => (
              <text
                key={i}
                x={pt.x}
                y={chartHeight - 6}
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
                fontWeight="bold"
              >
                Sem {pt.week.weekNumber}
              </text>
            ))}
        </svg>

        {/* Tooltip Dinámico Luminoso */}
        {hoveredPoint && (
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-900/95 border border-emerald-400 dark:border-emerald-600 rounded-xl px-3 py-1.5 shadow-lg text-center z-20 pointer-events-none text-xs animate-fadeIn backdrop-blur-xs"
          >
            <div className="flex items-center justify-center gap-2 font-bold">
              <span className="text-slate-900 dark:text-white">Semana {hoveredPoint.week.weekNumber}</span>
              <span className="text-emerald-600 dark:text-emerald-400">({hoveredPoint.week.formattedRange})</span>
              <span className="text-amber-600 dark:text-amber-400 font-black">{hoveredPoint.week.targetTss} TSS</span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-300">
              {hoveredPoint.week.phaseLabel} • {hoveredPoint.week.microcycleLabel || "Carga"}
            </p>
          </div>
        )}
      </div>

      {/* Leyenda de Fases Luminosa */}
      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1 font-bold text-sky-700 dark:text-sky-400">
          <span className="h-2 w-2 rounded-full bg-sky-600 inline-block" /> Vas en Sem {currentPoint?.week.weekNumber || 1}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Base
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> Construcción
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" /> Pico
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-purple-500 inline-block" /> Tapering
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-yellow-400 inline-block" /> Carrera
        </span>
      </div>
    </div>
  );
};
