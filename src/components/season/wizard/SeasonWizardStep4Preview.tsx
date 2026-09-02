"use client";

import React from "react";
import { Sparkles, Rocket, Bot, CheckCircle2, ArrowLeft } from "lucide-react";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { SeasonCurveChart } from "./SeasonCurveChart";

interface SeasonWizardStep4PreviewProps {
  blueprint: MacrocycleBlueprint | null;
  planTitle: string;
  trainingApproach: string;
  periodization: "2:1" | "3:1" | "CONTINUO";
  aiNotes?: string[];
  onApplyMacrocycle: () => void;
  onGoBack: () => void;
  isGenerating: boolean;
}

export const SeasonWizardStep4Preview: React.FC<SeasonWizardStep4PreviewProps> = ({
  blueprint,
  planTitle,
  trainingApproach,
  periodization,
  aiNotes,
  onApplyMacrocycle,
  onGoBack,
  isGenerating,
}) => {
  if (isGenerating || !blueprint) {
    return (
      <div className="py-12 px-6 rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-4 font-mono animate-fadeIn">
        <div className="relative mx-auto w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <Bot className="h-7 w-7 text-emerald-500 dark:text-emerald-400 relative z-10" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            Head Coach IA Diseñando tu Macrociclo...
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Analizando tus umbrales de potencia, matriz semanal y periodizando las semanas con ritmo {periodization === "2:1" ? "Preventivo (2:1)" : "Estándar (3:1)"}.
          </p>
        </div>
      </div>
    );
  }

  const totalWeeks = blueprint.weeks.length;
  const peakCtl = Math.round(50 + totalWeeks * 1.8);
  const maxWeeklyTss = Math.max(...blueprint.weeks.map((w) => w.targetTss || 400));
  const peakHoursEst = (maxWeeklyTss / 60).toFixed(1);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. HERO RESUMEN DEL MACROCICLO GENERADO */}
      <div className="rounded-2xl border border-emerald-400/60 dark:border-emerald-700/60 bg-gradient-to-tr from-emerald-50/70 via-teal-50/30 to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-[10px] font-mono shadow-xs">
            <Sparkles className="h-3 w-3" />
            MACROCICLO GENERADO POR HEAD COACH IA
          </span>
          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
            {trainingApproach} • Ritmo {periodization}
          </span>
        </div>

        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {planTitle || blueprint.cycleTitle}
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            {blueprint.startDate} hasta {blueprint.weeks[blueprint.weeks.length - 1]?.endDate} ({totalWeeks} Semanas)
          </p>
        </div>

        {/* Métricas Clave de la Curva */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-center">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Duración</span>
            <strong className="text-xs font-black text-slate-900 dark:text-white">{totalWeeks} Semanas</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Pico CTL Estimado</span>
            <strong className="text-xs font-black text-emerald-600 dark:text-emerald-400">~{peakCtl} CTL</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Volumen Pico</span>
            <strong className="text-xs font-black text-cyan-600 dark:text-cyan-400">~{peakHoursEst}h / sem</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Carga Máxima</span>
            <strong className="text-xs font-black text-amber-600 dark:text-amber-400">{maxWeeklyTss} TSS</strong>
          </div>
        </div>
      </div>

      {/* 2. GRÁFICA VISUAL INTERACTIVA DE LA CURVA DE TEMPORADA */}
      <SeasonCurveChart weeks={blueprint.weeks} />

      {/* 3. JUSTIFICACIÓN & NOTAS DE LA IA */}
      {aiNotes && aiNotes.length > 0 && (
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            Criterios de Periodización Aplicados:
          </span>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 font-mono">
            {aiNotes.map((note, nIdx) => (
              <li key={nIdx} className="flex items-start gap-1.5">
                <span className="text-emerald-500">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. BOTÓN DE ACTIVACIÓN */}
      <div className="pt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onGoBack}
          className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Ajustar</span>
        </button>

        <button
          type="button"
          onClick={onApplyMacrocycle}
          className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <Rocket className="h-4 w-4" />
          <span>Activar este Macrociclo en Mi Calendario</span>
        </button>
      </div>
    </div>
  );
};
