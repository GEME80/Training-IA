"use client";

import React, { useState, useMemo } from "react";
import { MacrocycleWeek } from "@/lib/physiology/macrocycle";

interface SeasonCurveChartProps {
  weeks: MacrocycleWeek[];
  activeWeekIndex?: number;
  showPhasesRow?: boolean;
}

export const SeasonCurveChart: React.FC<SeasonCurveChartProps> = ({
  weeks,
  activeWeekIndex,
  showPhasesRow = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!weeks || weeks.length === 0) return null;

  const totalWeeks = weeks.length;
  const maxTssValue = Math.max(380, ...weeks.map((w) => w.targetTss || 300));
  const minTssValue = 0;

  const chartWidth = 650;
  const chartHeight = 125;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 18;
  const paddingBottom = 22;

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

  const points = weeks.map((w, idx) => ({
    x: getX(idx),
    y: getY(w.targetTss || 250),
    week: w,
    index: idx,
  }));

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

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

  // Agrupación de fases continuas para el indicador inferior
  const phaseSpans = useMemo(() => {
    const spans: { phase: string; label: string; startIdx: number; endIdx: number }[] = [];
    weeks.forEach((w, idx) => {
      const last = spans[spans.length - 1];
      const pLabel = w.phaseLabel || (w.phase.includes("BASE") ? "Base" : w.phase.includes("BUILD") ? "Construcción" : w.phase.includes("PEAK") ? "Pico" : w.phase.includes("TAPER") ? "Taper" : "Carrera");
      if (!last || last.phase !== w.phase) {
        spans.push({ phase: w.phase, label: pLabel, startIdx: idx, endIdx: idx });
      } else {
        last.endIdx = idx;
      }
    });
    return spans;
  }, [weeks]);

  return (
    <div className="rounded-xl bg-slate-50/70 dark:bg-slate-950/60 p-3 border border-slate-200/80 dark:border-slate-800 space-y-1.5 font-mono">
      <div className="flex items-center justify-between text-xs pb-0.5">
        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-[11px]">
          📈 Curva de Carga Semanal (TSS)
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-sky-700 dark:text-sky-300 font-bold bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            Semana {currentPoint?.week.weekNumber || 1} de {totalWeeks}
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGradientCompact" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Eje Y Líneas Guía */}
          {[0, 150, 300].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="2 2"
                  strokeWidth="0.7"
                  className="dark:stroke-slate-800/80"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="7.5"
                  fontWeight="bold"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Área de la Curva */}
          <path d={areaD} fill="url(#areaGradientCompact)" />

          {/* Línea de la Curva */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Indicador 'Dónde vamos' */}
          {currentPoint && (
            <g className="pointer-events-none">
              <line
                x1={currentPoint.x}
                y1={paddingTop - 6}
                x2={currentPoint.x}
                y2={paddingTop + plotHeight}
                stroke="#0284c7"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                opacity="0.9"
              />
              <circle
                cx={currentPoint.x}
                cy={currentPoint.y}
                r="7"
                fill="#0284c7"
                opacity="0.2"
                className="animate-ping"
              />
            </g>
          )}

          {/* Puntos de semanas */}
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
                  r={isCurrent ? 4.5 : isRace ? 4 : isRecovery ? 3 : 2.5}
                  fill={dotColor}
                  stroke="#ffffff"
                  strokeWidth={isCurrent ? "1.8" : "1"}
                />
              </g>
            );
          })}

          {/* Eje X: Semanas */}
          {points.map((pt, i) => {
            const isLabeled = i === 0 || i === Math.floor(totalWeeks / 3) || i === Math.floor((totalWeeks * 2) / 3) || i === totalWeeks - 1 || i === currentActiveIndex;
            if (!isLabeled) return null;
            return (
              <text
                key={i}
                x={pt.x}
                y={chartHeight - 4}
                textAnchor="middle"
                fill="#64748b"
                fontSize="8"
                fontWeight={i === currentActiveIndex ? "900" : "bold"}
              >
                S{pt.week.weekNumber}
              </text>
            );
          })}
        </svg>

        {/* Tooltip Dinámico */}
        {hoveredPoint && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white border border-emerald-500/40 rounded-lg px-2.5 py-1 shadow-md text-center z-20 pointer-events-none text-[10px] animate-fadeIn backdrop-blur-xs">
            <div className="flex items-center justify-center gap-1.5 font-bold">
              <span>Sem {hoveredPoint.week.weekNumber}</span>
              <span className="text-emerald-400 font-mono">{hoveredPoint.week.targetTss} TSS</span>
            </div>
            <p className="text-[9px] text-slate-300 truncate max-w-[200px]">
              {hoveredPoint.week.phaseLabel} • {hoveredPoint.week.microcycleLabel || "Carga"}
            </p>
          </div>
        )}
      </div>

      {/* ── BANDA DE FASES INFERIOR ESTILO STRYD (Directamente bajo el eje) ── */}
      {showPhasesRow && (
        <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center gap-1 w-full">
            {phaseSpans.map((span, sIdx) => {
              const spanWeeksCount = span.endIdx - span.startIdx + 1;
              const flexWeight = spanWeeksCount / totalWeeks;
              const color = getPhaseColor(span.phase);
              return (
                <div
                  key={sIdx}
                  style={{ flex: flexWeight }}
                  className="rounded-md px-1.5 py-1 text-center truncate border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
                  title={`${span.label}: Semanas ${span.startIdx + 1} a ${span.endIdx + 1}`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[9px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {span.label}
                    </span>
                  </div>
                  <span className="text-[8px] text-slate-400 font-mono block">
                    {span.startIdx === span.endIdx ? `S${span.startIdx + 1}` : `S${span.startIdx + 1}-${span.endIdx + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
