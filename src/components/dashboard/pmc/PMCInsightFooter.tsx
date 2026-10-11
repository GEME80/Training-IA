"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PMCDataPoint } from "@/lib/physiology/pmcEngine";

interface PMCInsightFooterProps {
  activePoint: PMCDataPoint | null;
}

/**
 * Footer ligero y desencajonado para la vista Evolución Móvil (< 768px).
 * Reemplaza cajas cuadradas rígidas y contenedores grises pesados por:
 * 1. Hero Status Chip + Rampa semanal en una sola línea sutil.
 * 2. Insight Ejecutivo conciso en 2 líneas de texto plano.
 * 3. Acordeón desplegable colapsado por defecto.
 */
export const PMCInsightFooter: React.FC<PMCInsightFooterProps> = ({ activePoint }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tsb = activePoint?.tsb ?? 0;
  const rampRate = activePoint?.rampRate ?? 0;

  // Clasificación fisiológica para el Hero Status Chip
  let statusChip = {
    emoji: "🟢",
    label: "Fresco / Óptimo",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
    insight: "Equilibrio fisiológico óptimo. La fatiga se ha disipado manteniendo tu Fitness, estado ideal para competir o rendir con frescura.",
  };

  if (tsb > 25) {
    statusChip = {
      emoji: "🟡",
      label: "Descanso / Transición",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      dotClass: "bg-amber-400",
      insight: "Fase de descanso prolongada. Alto nivel de frescura con pérdida progresiva del Fitness acumulado.",
    };
  } else if (tsb > 0) {
    statusChip = {
      emoji: "🟢",
      label: "Fresco / Óptimo",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      dotClass: "bg-emerald-500",
      insight: "Equilibrio fisiológico favorable. TSB positivo que garantiza frescura muscular para rendir al máximo.",
    };
  } else if (tsb >= -30) {
    statusChip = {
      emoji: "🟡",
      label: "Sobrecarga Productiva",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      dotClass: "bg-amber-500",
      insight: "Estímulo adaptativo efectivo. La carga aguda genera adaptaciones fisiológicas productivas sin riesgo excesivo.",
    };
  } else {
    statusChip = {
      emoji: "🔴",
      label: "Fatiga Crítica / Riesgo",
      badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
      dotClass: "bg-rose-500",
      insight: "Fatiga acumulada en zona de precaución. Se sugiere programar descanso o regeneración para asimilar la carga.",
    };
  }

  const tsbStr = tsb > 0 ? `+${tsb}` : `${tsb}`;
  const rampStr = rampRate > 0 ? `+${rampRate}` : `${rampRate}`;

  return (
    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 select-none">
      {/* 1. Hero Status Chip + Rampa Semanal en una sola fila compacta */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black border ${statusChip.badgeClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusChip.dotClass}`} />
            <span>{statusChip.label} ({tsbStr} TSB)</span>
          </span>
        </div>

        {/* Indicador de Tasa de Rampa semanal en tabular-nums */}
        <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 font-semibold shrink-0">
          Rampa: <strong className={`font-black ${rampRate >= 0 ? "text-slate-700 dark:text-slate-200" : "text-amber-500"}`}>{rampStr}</strong>/sem
        </div>
      </div>

      {/* 2. Insight Ejecutivo (Máximo 2 líneas de texto plano) */}
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
        {statusChip.insight}
      </p>

      {/* 3. Acordeón Colapsable */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center justify-between w-full py-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <span>{isExpanded ? "▾ Ocultar desglose fisiológico" : "▸ Ver desglose fisiológico completo"}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
        </button>

        {isExpanded && (
          <div className="pt-2 pb-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 space-y-1.5 animate-fadeIn">
            <p>
              <strong className="text-sky-600 dark:text-sky-400 font-bold">Aptitud (CTL):</strong> Media móvil de 42 días de tu carga de entrenamiento. Representa tu condición física acumulada.
            </p>
            <p>
              <strong className="text-purple-600 dark:text-purple-400 font-bold">Fatiga (ATL):</strong> Media móvil de 7 días. Refleja el cansancio agudo inducido por sesiones recientes.
            </p>
            <p>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Forma (TSB = CTL - ATL):</strong> Balance neto. Zona de sobrecarga óptima (-10 a -30), zona fresca (&gt; 0) para competir y zona de riesgo (&lt; -30) a vigilar.
            </p>
            <p className="text-[10px] text-slate-400 italic pt-0.5">
              Metodología basada en los modelos de impulso-respuesta de Banister y Joe Friel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
