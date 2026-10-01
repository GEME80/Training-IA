"use client";

import React, { useState, useMemo } from "react";
import { AlertTriangle, SlidersHorizontal, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { DEFAULT_VISIBLE_METRICS, AVAILABLE_METRIC_INDICATORS } from "@/lib/intervals/types";
import {
  PhysiologicalMetricCard,
  METRIC_ICONS_MAP,
} from "./dashboard/PhysiologicalMetricCard";
import { buildMetricConfigs } from "./dashboard/physiologicalMetricBuilders";

interface PhysiologicalCardsProps {
  status: PhysiologicalStatus | null;
  runFtp?: number | null;
  bikeFtp?: number | null;
  weightKg?: number | null;
  age?: number | null;
  restingHR?: number | null;
  hrv?: number | null;
  sleepQuality?: number | null;
  sleepSecs?: number | null;
  efficiencyFactor?: number | null;
  visibleMetrics?: string[];
  onToggleMetric?: (id: string) => void;
  runThresholdPaceStr?: string | null;
  swimCssStr?: string | null;
}

export const PhysiologicalCards: React.FC<PhysiologicalCardsProps> = ({
  status,
  runFtp,
  bikeFtp,
  weightKg,
  age,
  restingHR,
  hrv,
  sleepQuality,
  sleepSecs,
  efficiencyFactor,
  visibleMetrics = DEFAULT_VISIBLE_METRICS,
  onToggleMetric,
  runThresholdPaceStr = "4:45",
  swimCssStr = "1:45",
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const activeMetrics = visibleMetrics && visibleMetrics.length > 0 ? visibleMetrics : DEFAULT_VISIBLE_METRICS;

  const metricConfigs = useMemo(() => {
    return buildMetricConfigs({
      status,
      runFtp,
      bikeFtp,
      weightKg,
      age,
      restingHR,
      hrv,
      sleepQuality,
      sleepSecs,
      efficiencyFactor,
      runThresholdPaceStr,
      swimCssStr,
    });
  }, [status, runFtp, bikeFtp, weightKg, age, restingHR, hrv, sleepQuality, sleepSecs, efficiencyFactor, runThresholdPaceStr, swimCssStr]);

  if (!status) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {activeMetrics.map((id) => (
          <div key={id} className="h-16 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2.5 animate-fadeIn">
      {/* Alerta de Fatiga / Sobrecarga Crítica */}
      {status.status === "OVERTRAINING_RISK" && (
        <div className="flex items-center space-x-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3.5 py-2 text-xs text-red-800 dark:text-red-300 shadow-2xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <strong className="text-red-700 dark:text-red-400">Riesgo de Fatiga Alta: </strong>
            TSB crítico ({Number(status.tsb).toFixed(1)}). Se sugiere trote suave Z1 o descanso.
          </div>
        </div>
      )}

      {/* Barra de Título & Personalización Responsiva */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
          Tu Estado de Rendimiento y Recuperación
        </span>

        <div className="flex items-center gap-2">
          {/* Botón Acordeón exclusivo para Móvil (< md) */}
          <button
            type="button"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="flex md:hidden items-center space-x-1 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition shadow-2xs cursor-pointer"
          >
            <span>{isMobileExpanded ? "Plegar" : `Ver (${activeMetrics.length})`}</span>
            {isMobileExpanded ? <ChevronUp className="h-3 w-3 text-sky-500" /> : <ChevronDown className="h-3 w-3 text-sky-500" />}
          </button>

          {onToggleMetric && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold transition shadow-2xs cursor-pointer"
              >
                <SlidersHorizontal className="h-3 w-3 text-sky-500" />
                <span className="hidden sm:inline">Personalizar ({activeMetrics.length})</span>
                <span className="sm:hidden">Ajustes</span>
              </button>

              {/* Popover flotante responsivo con lista de métricas */}
              {isConfigOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsConfigOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-[calc(100vw-2rem)] max-w-xs sm:w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl z-50 animate-fadeIn space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        Métricas Visibles
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsConfigOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {AVAILABLE_METRIC_INDICATORS.map((metric) => {
                        const isChecked = activeMetrics.includes(metric.id);
                        const iconData = METRIC_ICONS_MAP[metric.id];
                        const MetricIcon = iconData ? iconData.icon : null;

                        return (
                          <div
                            key={metric.id}
                            onClick={() => onToggleMetric(metric.id)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-xl cursor-pointer text-xs font-medium transition ${
                              isChecked
                                ? "bg-sky-50 dark:bg-sky-950/50 text-sky-950 dark:text-sky-200 font-bold"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 truncate">
                              {MetricIcon ? (
                                <MetricIcon className={`h-3.5 w-3.5 shrink-0 ${iconData.color}`} />
                              ) : (
                                <span>{metric.icon}</span>
                              )}
                              <span className="truncate">{metric.name}</span>
                            </div>
                            <div
                              className={`h-4 w-4 rounded-md flex items-center justify-center border shrink-0 ml-1.5 ${
                                isChecked
                                  ? "bg-sky-600 border-sky-600 text-white"
                                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                              }`}
                            >
                              {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vista Compacta Horizontal Exclusiva para Móvil (< md) cuando no está expandido */}
      {!isMobileExpanded && (
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
          {activeMetrics.map((metricId) => {
            const cfg = metricConfigs[metricId];
            if (!cfg) return null;
            const Icon = cfg.icon;

            return (
              <div
                key={metricId}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shrink-0 font-mono text-[11px] shadow-2xs"
              >
                <Icon className={`h-3 w-3 ${cfg.iconColor}`} />
                <span className={`font-bold ${cfg.badgeColor}`}>{cfg.badge}</span>
                <strong className={`font-black ${cfg.valueColor || "text-slate-900 dark:text-white"}`}>
                  {cfg.value}
                </strong>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid Dinámico Responsivo: Siempre visible en desktop (md:grid), y en móvil si está expandido */}
      <div
        className={`${
          isMobileExpanded ? "grid" : "hidden md:grid"
        } grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-2.5`}
      >
        {activeMetrics.map((metricId) => {
          const cfg = metricConfigs[metricId];
          if (!cfg) return null;
          return <PhysiologicalMetricCard key={metricId} config={cfg} />;
        })}
      </div>
    </div>
  );
};
