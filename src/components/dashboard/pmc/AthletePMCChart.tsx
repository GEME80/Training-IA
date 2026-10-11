"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Activity } from "lucide-react";
import { AthleteWellness, DailyExecutedMap } from "@/lib/intervals/types";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { generatePMCSeries, PMCTimeframe, PMCDataPoint } from "@/lib/physiology/pmcEngine";
import { WeeklyAvailabilityMap } from "@/lib/gemini/engine";
import { AthletePMCSVG, VisibleCurvesState } from "./AthletePMCSVG";
import { PMCComplianceHeader } from "./PMCComplianceHeader";
import { PMCInsightReport } from "./PMCInsightReport";

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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [visibleCurves, setVisibleCurves] = useState<VisibleCurvesState>({
    ctl: true,
    atl: true,
    tsb: true,
    projection: true,
  });

  const { points, summary } = useMemo(() => {
    return generatePMCSeries(wellnessHistory, blueprint, timeframe, visibleCurves.projection ?? true);
  }, [wellnessHistory, blueprint, timeframe, visibleCurves.projection]);

  const todayIdx = points.findIndex((p) => p.label === "Hoy");
  const splitIdx = todayIdx !== -1 ? todayIdx : points.findIndex((p) => p.isProjected) - 1;
  const activeIdx = hoveredIdx !== null ? hoveredIdx : (splitIdx >= 0 ? splitIdx : points.length - 1);
  const activePoint: PMCDataPoint | null = points[activeIdx] || null;

  const weeksCount = Math.round(points.length / 7);
  const daysCount = points.length;

  // Actividades del día activo bajo el crosshair
  const activeDayActivities = useMemo(() => {
    if (!activePoint?.date || !dailyExecutedActivities) return null;
    return dailyExecutedActivities[activePoint.date] || null;
  }, [activePoint?.date, dailyExecutedActivities]);

  // Cálculo de Carga (TSS) y Volumen (Horas) de la semana
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

  const toggleCurve = (curve: keyof VisibleCurvesState) => {
    setVisibleCurves((prev) => ({ ...prev, [curve]: prev[curve] === false }));
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-fadeIn select-none">
      {/* ── CABECERA UNIFICADA DE CUMPLIMIENTO (MOBILE 2x2 & DESKTOP 4 CARDS) ── */}
      <PMCComplianceHeader
        summary={summary}
        blueprint={blueprint}
        actualTss={actualTss}
        plannedTss={plannedTss}
        actualHours={actualHours}
        plannedHours={plannedHours}
        activeRampRate={activePoint?.rampRate}
      />

      {/* ── CONTENEDOR PRINCIPAL PMC ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-6 shadow-sm space-y-3 sm:space-y-4 pb-20 md:pb-6">
        {/* DESKTOP: Barra superior con HUD extendido y sesiones del día */}
        <div className="hidden md:flex md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              TELEMETRÍA DE CARGA & FORMA
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({weeksCount} Sem · {daysCount} d)
            </span>
          </div>

          {/* HUD reactivo al crosshair */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-700 dark:text-slate-200 font-black">
              {formatPmcHeaderDate(activePoint?.date)}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Aptitud:</span>
              <span className="text-sky-500 font-black">{activePoint?.ctl ?? "—"}</span>
              {activePoint?.plannedCtl !== undefined && (
                <span className="text-amber-500 text-[11px] font-bold">
                  (Plan: {activePoint.plannedCtl})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Fatiga:</span>
              <span className="text-purple-500 font-black">{activePoint?.atl ?? "—"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Frescura:</span>
              <span className={`font-black ${(activePoint?.tsb ?? 0) >= 0 ? "text-emerald-500" : (activePoint?.tsb ?? 0) >= -30 ? "text-amber-500" : "text-rose-500"}`}>
                {activePoint?.tsb !== undefined ? (activePoint.tsb > 0 ? `+${activePoint.tsb}` : activePoint.tsb) : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Rampa:</span>
              <span className={`font-black ${(activePoint?.rampRate ?? 0) >= 0 ? "text-emerald-500" : "text-sky-500"}`}>
                {activePoint?.rampRate !== undefined ? (activePoint.rampRate > 0 ? `+${activePoint.rampRate}` : activePoint.rampRate) : "0"}
              </span>
            </div>
            {activeDayActivities && activeDayActivities.totalTss > 0 && (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 font-black">
                <Activity className="w-3 h-3" />
                <span>{activeDayActivities.totalTss} TSS ({activeDayActivities.activities.length} ses)</span>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP: Leyenda Interactiva (Switches sin checkboxes) + Selector de Rango */}
        <div className="hidden md:flex items-center justify-between gap-3 pt-1">
          {/* Switches interactivos tipo pill */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleCurve("ctl")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                visibleCurves.ctl !== false
                  ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                  : "bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${visibleCurves.ctl !== false ? "bg-sky-500" : "bg-slate-300"}`} />
              <span>Aptitud (CTL)</span>
            </button>

            <button
              type="button"
              onClick={() => toggleCurve("atl")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                visibleCurves.atl !== false
                  ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                  : "bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${visibleCurves.atl !== false ? "bg-purple-500" : "bg-slate-300"}`} />
              <span>Fatiga (ATL)</span>
            </button>

            <button
              type="button"
              onClick={() => toggleCurve("tsb")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                visibleCurves.tsb !== false
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${visibleCurves.tsb !== false ? "bg-emerald-500" : "bg-slate-300"}`} />
              <span>Forma (TSB)</span>
            </button>

            <button
              type="button"
              onClick={() => toggleCurve("projection")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                visibleCurves.projection !== false
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  : "bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${visibleCurves.projection !== false ? "text-amber-500" : "text-slate-400"}`} />
              <span>Proyección a Carrera</span>
            </button>
          </div>

          {/* Selector de Rango Temporal Desktop */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700/50">
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
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  timeframe === tf.id || (timeframe === "3m" && tf.id === "90d")
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {tf.label}
              </button>
            ))}
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

        {/* RENDERIZADOR SVG DE 3 PANELES INDEPENDIENTES */}
        <AthletePMCSVG
          points={points}
          activeIdx={activeIdx}
          onHoverIdx={setHoveredIdx}
          showProjection={visibleCurves.projection !== false}
          visibleCurves={visibleCurves}
        />

        {/* PIE DESACOPLADO & LIGERO: Hero Status Card, Diagnóstico vs Prescripción y Acordeón */}
        <PMCInsightReport activePoint={activePoint} summary={summary} />
      </div>
    </div>
  );
};
