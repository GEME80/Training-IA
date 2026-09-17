"use client";

import React from "react";
import { User, Activity, Flame, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, ChevronDown, Dna, Compass, Target } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { HeadCoachMicrocycleCard } from "./HeadCoachMicrocycleCard";

export interface HeadCoachMessageData {
  id: string;
  role: "user" | "assistant";
  text: string;
  suggestedPlan?: PlanItem[] | null;
  targetWeekNumber?: number;
  modelUsed?: string;
  timestamp?: string;
  reasoning?: string | null;
}

interface HeadCoachMessageItemProps {
  message: HeadCoachMessageData;
  weekNumber: number;
  onApplyAndSync?: (plan: PlanItem[]) => Promise<void>;
  isApplying?: boolean;
}

/**
 * Renderizador de Texto Formateado Deportivo Profesional (Cero Emojis Infantiles)
 */
const FormattedMessageBody: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split("\n");

  const formatInline = (str: string) => {
    // Limpieza de emojis infantiles que pudieran venir en el texto crudo
    const sanitized = str.replace(/[📍⚖️🎯🧬👈👉⚡🔋📈✈️⏱️🚲]/g, "").trim();
    const boldParts = sanitized.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith("**") && bPart.endsWith("**")) {
        return (
          <strong key={bIdx} className="font-black text-slate-950 dark:text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  };

  return (
    <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-0.5" />;

        // Bloque Canónico 1: Estado del Proceso
        if (/^\[?📍?\s*ESTADO DEL PROCESO\]?/i.test(trimmed)) {
          const content = trimmed.replace(/^\[?📍?\s*ESTADO DEL PROCESO\]?:?\s*/i, "");
          return (
            <div key={idx} className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-950 dark:text-cyan-100 flex items-start gap-2">
              <Compass className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-black uppercase tracking-wider text-[10px] text-cyan-700 dark:text-cyan-300 block mb-0.5">Estado del Proceso</span>
                <div>{formatInline(content)}</div>
              </div>
            </div>
          );
        }

        // Bloque Canónico 2: Diagnóstico / Veredicto
        if (/^\[?⚖️?\s*DIAGN[OÓ]STICO/i.test(trimmed)) {
          const content = trimmed.replace(/^\[?⚖️?\s*DIAGN[OÓ]STICO\s*(\/\s*VEREDICTO)?\]?:?\s*/i, "");
          const isAdjustment = /ajuste|recalibraci/i.test(content);
          return (
            <div key={idx} className={`p-2.5 rounded-xl border flex items-start gap-2 ${
              isAdjustment
                ? "bg-amber-500/10 border-amber-500/20 text-amber-950 dark:text-amber-100"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
            }`}>
              {isAdjustment ? (
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <span className={`font-black uppercase tracking-wider text-[10px] block mb-0.5 ${
                  isAdjustment ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"
                }`}>
                  {isAdjustment ? "Ajuste Táctico" : "Veredicto: Continuidad"}
                </span>
                <div>{formatInline(content)}</div>
              </div>
            </div>
          );
        }

        // Bloque Canónico 3: Acción Prescriptiva
        if (/^\[?🎯?\s*ACCI[OÓ]N PRESCRIPTIVA\]?/i.test(trimmed)) {
          const content = trimmed.replace(/^\[?🎯?\s*ACCI[OÓ]N PRESCRIPTIVA\]?:?\s*/i, "");
          return (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 flex items-start gap-2">
              <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-black uppercase tracking-wider text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">Acción Prescriptiva</span>
                <div>{formatInline(content)}</div>
              </div>
            </div>
          );
        }

        // Cabeceras de Sección Markdown
        if (trimmed.startsWith("###") || trimmed.startsWith("##")) {
          const headerText = trimmed.replace(/^#+\s*/, "");
          return (
            <div key={idx} className="pt-2 pb-1 border-b border-slate-200/60 dark:border-slate-800 mb-1">
              <h4 className="font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm tracking-wide">
                {formatInline(headerText)}
              </h4>
            </div>
          );
        }

        // Bloque Positivo genérico (🟢)
        if (trimmed.startsWith("🟢")) {
          return (
            <div key={idx} className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{formatInline(trimmed.replace(/^🟢\s*/, ""))}</span>
            </div>
          );
        }

        // Bloque de Alertas genérico (⚠️ / 🚨)
        if (trimmed.startsWith("⚠️") || trimmed.startsWith("🚨")) {
          return (
            <div key={idx} className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200 font-medium flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>{formatInline(trimmed.replace(/^[⚠️🚨]\s*/, ""))}</span>
            </div>
          );
        }

        // Elementos de lista
        if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-emerald-500 font-bold shrink-0">•</span>
              <span>{formatInline(trimmed.replace(/^[-•]\s*/, ""))}</span>
            </div>
          );
        }

        return <p key={idx}>{formatInline(line)}</p>;
      })}
    </div>
  );
};

export const HeadCoachMessageItem: React.FC<HeadCoachMessageItemProps> = ({
  message,
  weekNumber,
  onApplyAndSync,
  isApplying = false,
}) => {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex items-start gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}>
      {/* Insignia Atlética Head Coach Pro */}
      {isAssistant && (
        <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs shadow-sm border border-emerald-400/40 relative">
          <Activity className="h-4 w-4" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        </div>
      )}

      {/* Cuerpo del Mensaje */}
      <div
        className={`max-w-3xl rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
          isAssistant
            ? "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200"
            : "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-medium ml-auto"
        }`}
      >
        {isAssistant && (
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 dark:text-white text-xs tracking-tight">
                PULSE Head Coach
              </span>
              <span className={`text-[9px] font-mono px-2 py-0.2 rounded-full font-bold border ${
                message.modelUsed && message.modelUsed.includes("gemini")
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                  : "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20"
              }`}>
                {message.modelUsed || "Resistencia Pro"}
              </span>
            </div>
            {message.timestamp && (
              <span className="text-[10px] font-mono text-slate-400">
                {message.timestamp}
              </span>
            )}
          </div>
        )}

        {/* Texto Formateado */}
        <FormattedMessageBody text={message.text} />

        {/* Profundidad Fisiológica Bajo Demanda ("Depth on Demand") */}
        {isAssistant && message.reasoning && (
          <details className="mt-3 text-xs bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/60 group">
            <summary className="cursor-pointer font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2 select-none hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <span className="flex items-center gap-1.5">
                <Dna className="h-3.5 w-3.5 text-emerald-500" />
                Profundidad Fisiológica & Telemetría
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="mt-2.5 pt-2.5 border-t border-slate-200/40 dark:border-slate-700/40 text-slate-600 dark:text-slate-300 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
              {message.reasoning}
            </div>
          </details>
        )}

        {/* Tarjeta del Microciclo Adaptado (Si el Coach propuso un plan) */}
        {isAssistant && Array.isArray(message.suggestedPlan) && message.suggestedPlan.length > 0 && (
          <HeadCoachMicrocycleCard
            plan={message.suggestedPlan}
            weekNumber={message.targetWeekNumber || weekNumber}
            onApplyAndSync={onApplyAndSync}
            isApplying={isApplying}
          />
        )}
      </div>

      {/* Avatar del Atleta */}
      {!isAssistant && (
        <div className="h-9 w-9 rounded-2xl bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};
