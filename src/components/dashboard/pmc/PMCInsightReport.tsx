"use client";

import React, { useState } from "react";
import { ChevronDown, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { PMCDataPoint, PMCHistoricalSummary } from "@/lib/physiology/pmcEngine";

interface PMCInsightReportProps {
  activePoint: PMCDataPoint | null;
  summary: PMCHistoricalSummary;
}

export const PMCInsightReport: React.FC<PMCInsightReportProps> = ({
  activePoint,
  summary,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tsb = activePoint?.tsb ?? summary.lastKnownTsb ?? 0;
  const ctl = activePoint?.ctl ?? summary.lastKnownCtl ?? 0;
  const atl = activePoint?.atl ?? summary.lastKnownAtl ?? 0;
  const ramp = activePoint?.rampRate ?? summary.avgRampRate ?? 0;
  const plannedCtl = activePoint?.plannedCtl ?? summary.plannedCtlToday;

  // Clasificación del Estado Fisiológico
  let statusBadge = {
    emoji: "🟢",
    label: "FRESCO / PICO DE FORMA",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    dotClass: "bg-emerald-500",
    insight: `Tu forma actual (${tsb > 0 ? `+${tsb}` : tsb} TSB) indica frescura muscular óptima tras la asimilación. Estás en ventana ideal para competir o iniciar un bloque exigente.`,
    diagnosis: "Balance biológico positivo con disipación efectiva de la fatiga aguda (ATL). Estabilidad neuromuscular alta.",
    prescription: "Apta para intensidades pico (Z4-Z6) o sesiones de test de rendimiento. Mantener estímulos de activación neuromuscular.",
  };

  if (tsb > 25) {
    statusBadge = {
      emoji: "🟡",
      label: "DESCARGA PROLONGADA / TRANSICIÓN",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
      dotClass: "bg-amber-400",
      insight: `Forma elevada (+${tsb} TSB) por reducción de carga sostenida. Recomendable reactivar la estimulación de fondo para no ceder Fitness.`,
      diagnosis: "Descarga profunda. Pérdida incipiente de adaptaciones crónicas de volumen si se extiende la inactividad.",
      prescription: "Reincorporar microciclo de volumen aeróbico Z2 controlado con progresión gradual de carga semanal.",
    };
  } else if (tsb >= -10 && tsb <= 5) {
    statusBadge = {
      emoji: "🔵",
      label: "MANTENIMIENTO / EQUILIBRIO NEUTRO",
      badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25",
      dotClass: "bg-sky-500",
      insight: `Balance fisiológico estable (${tsb > 0 ? `+${tsb}` : tsb} TSB). Tu carga de entrenamiento preserva la condición física sin fatiga residual severa.`,
      diagnosis: "Equilibrio entre la aptitud crónica (CTL) y la fatiga aguda (ATL). Sin estrés biológico limitante.",
      prescription: "Continuar con la periodización planificada. Posibilidad de alternar microciclos de tempo con días de rodaje suave.",
    };
  } else if (tsb >= -30) {
    statusBadge = {
      emoji: "🟡",
      label: "SOBRECARGA PRODUCTIVA",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
      dotClass: "bg-amber-500",
      insight: `Fatiga productiva acumulada (${tsb} TSB). La carga aguda supera la aptitud crónica de forma controlada, generando adaptaciones de resistencia.`,
      diagnosis: "Estímulo de sobrecarga en rango seguro. La tasa de rampa semanal se mantiene dentro de la tolerancia biológica.",
      prescription: "Priorizar la ventana de recuperación post-sesión (nutrición y sueño). Respetar los días de descanso programados.",
    };
  } else {
    statusBadge = {
      emoji: "🔴",
      label: "RIESGO DE FATIGA EXCESIVA",
      badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25",
      dotClass: "bg-rose-500",
      insight: `Alerta por fatiga acumulada crítica (${tsb} TSB). Riesgo elevado de sobreentrenamiento; se aconseja reducir intensidad inmediatamente.`,
      diagnosis: "Déficit agudo de recuperación. Sobrecarga simpática y riesgo de agotamiento del sistema neuroendocrino.",
      prescription: "Reducir carga un 40-50% o introducir 48 horas de descanso activo/total antes del siguiente entrenamiento estructurado.",
    };
  }

  const tsbStr = tsb > 0 ? `+${tsb}` : `${tsb}`;

  return (
    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 select-none">
      {/* ── 1. HERO STATUS CARD (Lectura en 3 segundos) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${statusBadge.badgeClass} self-start`}
        >
          <span className={`h-2 w-2 rounded-full ${statusBadge.dotClass}`} />
          <span>{statusBadge.label} ({tsbStr} TSB)</span>
        </span>

        <span className="text-[11px] font-mono text-slate-400 font-semibold">
          Diagnóstico adaptativo SGEA
        </span>
      </div>

      {/* Insight Ejecutivo de 2 líneas */}
      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
        {statusBadge.insight}
      </p>

      {/* ── 2. WEB DESKTOP (>= 768px): 2 Columnas Limpias ── */}
      <div className="hidden md:grid md:grid-cols-2 gap-4 pt-2">
        {/* Columna Izquierda: Diagnóstico del Modelo */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-sky-500 shrink-0" />
            <span>Diagnóstico del Modelo Fisiológico</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            {statusBadge.diagnosis}
          </p>
          <div className="pt-1 flex items-center gap-4 text-[11px] font-mono tabular-nums text-slate-500">
            <span>CTL: <strong className="text-slate-700 dark:text-slate-300">{ctl.toFixed(1)}</strong></span>
            <span>ATL: <strong className="text-slate-700 dark:text-slate-300">{atl.toFixed(1)}</strong></span>
            {plannedCtl !== undefined && (
              <span>Obj: <strong className="text-amber-500">{plannedCtl.toFixed(1)}</strong></span>
            )}
          </div>
        </div>

        {/* Columna Derecha: Prescripción Táctica */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Prescripción y Pauta Táctica</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            {statusBadge.prescription}
          </p>
          <div className="pt-1 text-[11px] font-mono tabular-nums text-slate-500">
            Rampa semanal: <strong className={ramp >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}>{ramp > 0 ? `+${ramp}` : ramp}</strong> CTL/sem
          </div>
        </div>
      </div>

      {/* ── 3. ACORDEÓN COLAPSABLE: Progresión por Demanda ── */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center justify-between w-full py-1 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <span>{isExpanded ? "▾ Ocultar análisis fisiológico completo y correlación" : "▸ Ver análisis fisiológico completo y correlación"}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
        </button>

        {isExpanded && (
          <div className="pt-3 pb-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 space-y-2 animate-fadeIn border-t border-slate-100 dark:border-slate-800/80 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <strong className="text-sky-600 dark:text-sky-400 block text-xs font-bold mb-1">Aptitud (CTL - 42 días)</strong>
                <p className="text-[11px]">Media móvil exponencial de tu carga de entrenamiento. Representa la base biológica y volumen crónico adaptado.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <strong className="text-purple-600 dark:text-purple-400 block text-xs font-bold mb-1">Fatiga (ATL - 7 días)</strong>
                <p className="text-[11px]">Respuesta de estrés a corto plazo inducida por sesiones recientes. Se disipa rápidamente con reposo adecuado.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <strong className="text-emerald-600 dark:text-emerald-400 block text-xs font-bold mb-1">Forma (TSB = CTL - ATL)</strong>
                <p className="text-[11px]">Diferencia neta. Zona óptima de ganancia (-10 a -30), zona fresca (&gt; 0) para eventos y zona de riesgo (&lt; -30).</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic pt-1">
              Metodología basada en los modelos matemáticos de impulso-respuesta de Banister, Joe Friel y Science2Sport.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
