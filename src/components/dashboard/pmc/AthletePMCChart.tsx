"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Plus } from "lucide-react";
import { AthleteWellness } from "@/lib/intervals/types";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { generatePMCSeries, PMCTimeframe, PMCDataPoint } from "@/lib/physiology/pmcEngine";
import { AthletePMCKpiCards } from "./AthletePMCKpiCards";
import { AthletePMCSVG } from "./AthletePMCSVG";

interface AthletePMCChartProps {
  wellnessHistory: AthleteWellness[];
  blueprint: MacrocycleBlueprint | null;
  athleteName?: string;
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

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 4 TARJETAS KPI RESUMEN SUPERIOR */}
      <AthletePMCKpiCards summary={summary} targetPoint={points[points.length - 1] || null} />

      {/* CONTENEDOR PRINCIPAL ESTILO INTERVALS.ICU */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
        {/* BARRA SUPERIOR DE PESTAÑAS Y HUD (EXACTO A INTERVALS.ICU) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          {/* Pestañas izquierda */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="pb-2 border-b-2 border-sky-500 text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider"
            >
              APTITUD
            </button>
            <button
              type="button"
              className="pb-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-wider transition"
            >
              TAB 2
            </button>
            <button
              type="button"
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Añadir pestaña"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* HUD DERECHO (EXACTO INTERVALS) */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-bold self-end md:self-auto bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-600 dark:text-slate-300 font-black">
              {formatPmcHeaderDate(activePoint?.date)}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Aptitud:</span>
              <span className="text-sky-500 font-black">{activePoint?.ctl ?? "—"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Fatiga:</span>
              <span className="text-purple-500 font-black">{activePoint?.atl ?? "—"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Forma:</span>
              <span className={`font-black ${(activePoint?.tsb ?? 0) >= 0 ? "text-emerald-500" : "text-amber-500"}`}>
                {activePoint?.tsb !== undefined ? (activePoint.tsb > 0 ? `+${activePoint.tsb}` : activePoint.tsb) : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Rampa:</span>
              <span className={`font-black ${(activePoint?.rampRate ?? 0) >= 0 ? "text-emerald-500" : "text-sky-500"}`}>
                {activePoint?.rampRate !== undefined ? (activePoint.rampRate > 0 ? `+${activePoint.rampRate}` : activePoint.rampRate) : "0"}
              </span>
            </div>
          </div>
        </div>

        {/* SUBHEADER: SEMANAS / DÍAS + SELECTORES DE HORIZONTE */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-400 font-semibold">
            <strong className="text-slate-700 dark:text-slate-200 font-black">{weeksCount} Semanas</strong> {daysCount} días
          </span>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700/50">
              {(["3m", "6m", "1y"] as PMCTimeframe[]).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    timeframe === tf
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

        {/* RENDERIZADOR SVG DE 3 PANELES INDEPENDIENTES */}
        <AthletePMCSVG
          points={points}
          activeIdx={activeIdx}
          onHoverIdx={setHoveredIdx}
          showProjection={showProjection}
        />

        {/* TEXTO EXPLICATIVO FISIOLÓGICO OFICIAL (PIE DE GRÁFICO INTERVALS) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 space-y-1">
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
