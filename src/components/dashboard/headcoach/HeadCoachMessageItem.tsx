"use client";

import React from "react";
import { User, Activity, Flame, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
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
}

interface HeadCoachMessageItemProps {
  message: HeadCoachMessageData;
  weekNumber: number;
  onApplyAndSync?: (plan: PlanItem[]) => Promise<void>;
  isApplying?: boolean;
}

/**
 * Renderizador de Texto Formateado Deportivo (con soporte de secciones Positivas y Críticas)
 */
const FormattedMessageBody: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split("\n");

  const formatInline = (str: string) => {
    const boldParts = str.split(/(\*\*.*?\*\*)/g);
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
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Cabeceras de Sección
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

        // Bloque de Fortalezas / Positivo
        if (trimmed.startsWith("🟢")) {
          return (
            <div key={idx} className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 font-medium">
              {formatInline(trimmed)}
            </div>
          );
        }

        // Bloque de Alertas / Crítico
        if (trimmed.startsWith("⚠️") || trimmed.startsWith("🚨")) {
          return (
            <div key={idx} className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200 font-medium">
              {formatInline(trimmed)}
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
      {/* Insignia Atlética Head Coach Pro (Cero icono infantil) */}
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
