"use client";

import React, { useState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { AthleteWellness, DailyExecutedMap } from "@/lib/intervals/types";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { generatePMCSeries, PMCTimeframe, PMCDataPoint } from "@/lib/physiology/pmcEngine";
import { WeeklyAvailabilityMap } from "@/lib/gemini/engine";
import { AthletePMCKpiCards } from "./AthletePMCKpiCards";
import { AthletePMCSVG } from "./AthletePMCSVG";
import { PlannedVsActualProgress } from "./PlannedVsActualProgress";
import { PMCInsightFooter } from "./PMCInsightFooter";

interface AthletePMCChartProps {
  wellnessHistory: AthleteWellness[];
  blueprint: MacrocycleBlueprint | null;
  athleteName?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  weeklyExecutedTss?: number;
  dailyExecutedActivities?: DailyExecutedMap;
  weeklyAvailability?: WeeklyAvailabilityMap;
}

function formatPmcHeaderDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
  const day = d.getDate();
  const month = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  return `${weekday} ${day} ${month}`;
}

export const AthletePMCChart: React.FC<AthletePMCChartProps> = ({
  wellnessHistory,
  blueprint,
  weeklyExecutedTss,
  dailyExecutedActivities,
  weeklyAvailability,
}) => {
  const [timeframe, setTimeframe] = useState<PMCTimeframe>("1y");
  const [showProjection, setShowProjection] = useState<boolean>(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { points, summary } = useMemo(() => {
    return generatePMCSeries(wellnessHistory, blueprint, timeframe, showProjection);
  }, [wellnessHistory, blueprint, timeframe, showProjection]);

  const todayIdx = points.findIndex((p) => p.label === "Hoy");
  const splitIdx = todayIdx !== -1 ? todayIdx : points.findIndex((p) => p.isProjected) - 1;
  const activeIdx = hoveredIdx !== null ? hoveredIdx : (splitIdx >= 0 ? splitIdx : points.length - 1);
  const activePoint: PMCDataPoint | null = points[activeIdx] || null;

  const weeksCount = Math.round(points.length / 7);
  const daysCount = points.length;

  // Cálculo de Carga y Volumen para PlannedVsActualProgress
  const { actualTss, plannedTss, actualHours, plannedHours } = useMemo(() => {
    let actTss = weeklyExecutedTss || 0;
    let actMin = 0;
    if (dailyExecutedActivities) {
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split("T")[0];
        const dayData = dailyExecutedActivities[dStr];
        if (dayData) {
          if (!weeklyExecutedTss) actTss += dayData.totalTss || 0;
          if (dayData.activities) {
            dayData.activities.forEach((act) => {
              actMin += (act.movingTimeMin || act.elapsedTimeMin || 0);
            });
          }
        }
      }
    }
    const actHrs = actMin > 0 ? actMin / 60 : (actTss > 0 ? actTss / 55 : 0);

    let planTss = 0;
    if (summary.plannedCtlToday) {
      planTss = Math.round(summary.plannedCtlToday * 7);
    } else if (blueprint?.weeks && blueprint.weeks.length > 0) {
      planTss = blueprint.weeks[0]?.targetTss || 350;
    }

    let planHrs = 0;
    if (weeklyAvailability) {
      Object.values(weeklyAvailability).forEach((dayAvail) => {
        if (typeof dayAvail === "number") planHrs += dayAvail;
        else if (dayAvail && typeof (dayAvail as any).durationMinutes === "number") {
          planHrs += (dayAvail as any).durationMinutes / 60;
        }
      });
    }
    if (planHrs === 0) {
      planHrs = planTss > 0 ? planTss / 55 : (actHrs > 0 ? actHrs : 5.0);
    }
    if (planTss === 0 && actTss > 0) {
      planTss = Math.round(actTss * 1.05);
    }

    return { actualTss: actTss, plannedTss: planTss, actualHours: actHrs, plannedHours: planHrs };
  }, [weeklyExecutedTss, dailyExecutedActivities, weeklyAvailability, summary.plannedCtlToday, blueprint]);

  return (
    <div className="space-y-3 sm:space-y-4 animate-fadeIn select-none">
      {/* ── CABECERA: DESKTOP (4 TARJETAS GRANDES) vs MÓVIL (ACTUAL VS PLAN COMPACTO) ── */}
      <div className="hidden md:grid">
        <AthletePMCKpiCards summary={summary} targetPoint={points[points.length - 1] || null} />
      </div>

      <div className="block md:hidden">
        <PlannedVsActualProgress
          actualTss={actualTss}
          plannedTss={plannedTss}
          actualHours={actualHours}
          plannedHours={plannedHours}
        />
      </div>

      {/* ── CONTENEDOR PRINCIPAL PMC ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-6 shadow-sm space-y-3 sm:space-y-4 pb-20 md:pb-6">
        {/* DESKTOP: Barra superior de pestañas y HUD extendido */}
        <div className="hidden md:flex md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-6">
            <span className="pb-2 border-b-2 border-sky-500 text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              FORMA Y EVOLUCIÓN
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs font-bold bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-600 dark:text-slate-300 font-black">
              {formatPmcHeaderDate(activePoint?.date)}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Forma:</span>
              <span className="text-sky-500 font-black">{activePoint?.ctl ?? "—"}</span>
              {activePoint?.plannedCtl !== undefined && (
                <span className="text-amber-500 text-[11px] font-bold">
                  (Plan: {activePoint.plannedCtl})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Fatiga:</span>
              <span className="text-purple-500 font-black">{activePoint?.atl ?? "—"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Frescura:</span>
              <span className={`font-black ${(activePoint?.tsb ?? 0) >= 0 ? "text-emerald-500" : "text-amber-500"}`}>
                {activePoint?.tsb !== undefined ? (activePoint.tsb > 0 ? `+${activePoint.tsb}` : activePoint.tsb) : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Progresión:</span>
              <span className={`font-black ${(activePoint?.rampRate ?? 0) >= 0 ? "text-emerald-500" : "text-sky-500"}`}>
                {activePoint?.rampRate !== undefined ? (activePoint.rampRate > 0 ? `+${activePoint.rampRate}` : activePoint.rampRate) : "0"}
              </span>
            </div>
          </div>
        </div>

        {/* DESKTOP: Selector de horizontes y checkbox proyección */}
        <div className="hidden md:flex items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-400 font-semibold">
            <strong className="text-slate-700 dark:text-slate-200 font-black">{weeksCount} Semanas</strong> {daysCount} días
          </span>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700/50">
              {(["3m", "6m", "1y"] as PMCTimeframe[]).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    timeframe === tf || (timeframe === "90d" && tf === "3m")
                      ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {tf === "3m" ? "3 Meses" : tf === "6m" ? "6 Meses" : "1 Año (365d)"}
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
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Proyección a Carrera</span>
            </label>
          </div>
        </div>

        {/* MÓVIL: Selector de Rango Horizontal Segmentado [ 30D | 90D | 6M | 1 Año ] */}
        <div className="flex md:hidden items-center justify-between gap-2">
          <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-wider">
            Rango Temporal
          </span>
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/80 dark:border-slate-700/60 h-[32px] items-center">
            {[
              { id: "30d" as PMCTimeframe, label: "30D" },
              { id: "90d" as PMCTimeframe, label: "90D" },
              { id: "6m" as PMCTimeframe, label: "6M" },
              { id: "1y" as PMCTimeframe, label: "1 Año" },
            ].map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setTimeframe(tf.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  timeframe === tf.id || (timeframe === "3m" && tf.id === "90d")
                    ? "bg-purple-600 text-white font-black shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* MÓVIL: Scrubber HUD Reactivo en una sola fila plana */}
        <div className="flex md:hidden items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 font-mono text-[11px] tabular-nums select-none">
          <div className="font-bold text-slate-700 dark:text-slate-300 text-[10px] shrink-0">
            {formatPmcHeaderDate(activePoint?.date)}
          </div>
          <div className="flex items-center gap-2.5 text-[10.5px]">
            <span className="text-slate-500 font-medium">
              CTL: <strong className="text-sky-500 font-black">{activePoint?.ctl ?? "—"}</strong>
            </span>
            <span className="text-slate-500 font-medium">
              ATL: <strong className="text-purple-600 dark:text-purple-400 font-black">{activePoint?.atl ?? "—"}</strong>
            </span>
            <span className="text-slate-500 font-medium">
              TSB: <strong className={`font-black ${(activePoint?.tsb ?? 0) >= 0 ? "text-emerald-500" : (activePoint?.tsb ?? 0) >= -30 ? "text-amber-500" : "text-rose-500"}`}>
                {activePoint?.tsb !== undefined ? (activePoint.tsb > 0 ? `+${activePoint.tsb}` : activePoint.tsb) : "—"}
              </strong>
            </span>
          </div>
        </div>

        {/* RENDERIZADOR SVG DE 3 PANELES INDEPENDIENTES (CANVAS INTACTO) */}
        <AthletePMCSVG
          points={points}
          activeIdx={activeIdx}
          onHoverIdx={setHoveredIdx}
          showProjection={showProjection}
        />

        {/* EN MOBILE (< 768px): Footer Ligero Desencajonado (Hero Chip + Rampa + Acordeón) */}
        <div className="block md:hidden">
          <PMCInsightFooter activePoint={activePoint} />
        </div>

        {/* EN DESKTOP (>= 768px): Texto explicativo fisiológico oficial de Intervals.icu */}
        <div className="hidden md:block pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 space-y-1">
          <p>
            <strong className="text-sky-500 font-bold">La línea azul muestra la aptitud (CTL).</strong> Esta es una media móvil ponderada exponencialmente de 42 días de su carga de entrenamiento.{" "}
            <strong className="text-purple-500 font-bold">La línea morada muestra la fatiga (ATL).</strong> Se trata de una media móvil ponderada exponencialmente de 7 días. Para ponerse en forma, necesita crear estrés aumentando la carga, manteniendo la línea violeta por encima de la azul.
          </p>
          <p>
            <strong className="text-emerald-500 font-bold">Tu forma (TSB) es tu aptitud menos fatiga.</strong> Cuando tu forma está en la{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">zona de entrenamiento óptima (-10 a -30)</span>, estás ganando forma. Cuando tu forma sea{" "}
            <span className="text-sky-500 font-bold">fresco (+5 a +20)</span> y estés en forma, estás listo para competir. Evite permanecer en la{" "}
            <span className="text-red-500 font-bold">zona de alto riesgo (&lt; -30)</span> durante mucho tiempo para prevenir sobreentrenamiento. Referencias: <em>Monitoring your training load by Science2Sport</em> y <em>Managing Training Using TSB by Joe Friel</em>.
          </p>
        </div>
      </div>
    </div>
  );
};
