"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PMCDataPoint } from "@/lib/physiology/pmcEngine";

interface PMCInsightsCardProps {
  activePoint: PMCDataPoint | null;
}

export const PMCInsightsCard: React.FC<PMCInsightsCardProps> = ({ activePoint }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tsb = activePoint?.tsb ?? 0;
  const ctl = activePoint?.ctl ?? 0;
  const atl = activePoint?.atl ?? 0;
  const rampRate = activePoint?.rampRate ?? 0;

  // Clasificación fisiológica y badge
  let badgeConfig = {
    emoji: "🟢",
    label: "Óptimo",
    colorClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    dotClass: "bg-emerald-500",
    insight: "Equilibrio fisiológico óptimo. La fatiga se ha disipado manteniendo tu Fitness, estado ideal para rendir al máximo o competir.",
  };

  if (tsb > 25) {
    badgeConfig = {
      emoji: "🟡",
      label: "Transición / Descanso",
      colorClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
      dotClass: "bg-amber-400",
      insight: "Fase de descanso o descarga prolongada. Alto nivel de frescura con pérdida paulatina de Fitness acumulado.",
    };
  } else if (tsb >= 5) {
    badgeConfig = {
      emoji: "🟢",
      label: "Óptimo",
      colorClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
      dotClass: "bg-emerald-500",
      insight: "Equilibrio fisiológico ideal. La fatiga se ha disipado manteniendo un nivel alto de Fitness, óptimo para competir.",
    };
  } else if (tsb >= -10) {
    badgeConfig = {
      emoji: "🔵",
      label: "Mantenimiento Neutro",
      colorClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25",
      dotClass: "bg-sky-500",
      insight: "Carga estabilizada. El balance entre aptitud y fatiga mantiene tu condición física sin acumulación severa de estrés.",
    };
  } else if (tsb >= -30) {
    badgeConfig = {
      emoji: "🟡",
      label: "Fatiga Productiva",
      colorClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
      dotClass: "bg-amber-500",
      insight: "Estímulo adaptativo efectivo. La carga aguda supera el Fitness de forma controlada, generando adaptaciones biológicas productivas.",
    };
  } else {
    badgeConfig = {
      emoji: "🔴",
      label: "Sobrecarga / Alto Riesgo",
      colorClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25",
      dotClass: "bg-rose-500",
      insight: "Fatiga acumulada en zona de precaución. Se sugiere modular la intensidad o programar recuperación para asimilar el entrenamiento.",
    };
  }

  const tsbStr = tsb > 0 ? `+${tsb}` : `${tsb}`;
  const rampStr = rampRate > 0 ? `+${rampRate}` : `${rampRate}`;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-700/60 space-y-3 select-none">
      {/* 1. Hero Status Card (Resumen en 3 segundos) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black border ${badgeConfig.colorClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${badgeConfig.dotClass}`} />
              <span>{badgeConfig.label} ({tsbStr} TSB)</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
            Telemetría PMC
          </span>
        </div>

        {/* Insight Clave: Máximo 2 líneas de texto plano sin palabras multicolores */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {badgeConfig.insight}
        </p>

        {/* Métricas Rápidas: Fila horizontal compacta 4 KPIs con tabular-nums */}
        <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-700/50 text-center font-mono tabular-nums">
          <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">
              Fitness
            </span>
            <span className="text-xs font-black text-sky-600 dark:text-sky-400">
              {ctl || "—"}
            </span>
            <span className="block text-[8px] text-slate-400">CTL</span>
          </div>

          <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">
              Fatiga
            </span>
            <span className="text-xs font-black text-purple-600 dark:text-purple-400">
              {atl || "—"}
            </span>
            <span className="block text-[8px] text-slate-400">ATL</span>
          </div>

          <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">
              Forma
            </span>
            <span className={`text-xs font-black ${tsb >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {tsbStr}
            </span>
            <span className="block text-[8px] text-slate-400">TSB</span>
          </div>

          <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">
              Rampa
            </span>
            <span className={`text-xs font-black ${rampRate >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-sky-600 dark:text-sky-400"}`}>
              {rampStr}
            </span>
            <span className="block text-[8px] text-slate-400">/sem</span>
          </div>
        </div>
      </div>

      {/* 2. Revelación Progresiva (Acordeón desplegable colapsado por defecto) */}
      <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/50">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center justify-between w-full py-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <span>{isExpanded ? "▾ Ocultar desglose fisiológico" : "▸ Ver desglose fisiológico completo"}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
        </button>

        {isExpanded && (
          <div className="pt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 space-y-1.5 animate-fadeIn font-sans">
            <p>
              <strong className="text-sky-600 dark:text-sky-400 font-bold">Aptitud (CTL):</strong> Media móvil exponencial de 42 días de tu carga de entrenamiento. Refleja tu resistencia de base acumulada.
            </p>
            <p>
              <strong className="text-purple-600 dark:text-purple-400 font-bold">Fatiga (ATL):</strong> Media móvil exponencial de 7 días. Representa el cansancio a corto plazo inducido por los entrenamientos recientes.
            </p>
            <p>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Forma (TSB = CTL - ATL):</strong> Diferencia neta entre aptitud y fatiga.
              Zona óptima (-10 a -30) para ganar forma; zona fresca (+5 a +20) para competir; zona de riesgo (&lt; -30) requiere vigilar sobreentrenamiento.
            </p>
            <p className="text-[10px] text-slate-400 italic pt-1">
              Metodología basada en los modelos de impulso-respuesta de Banister, Joe Friel y Science2Sport.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
