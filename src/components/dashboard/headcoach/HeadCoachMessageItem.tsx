"use client";

import React from "react";
import {
  User, Activity, Flame, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles,
  Compass, Target, CalendarSync, TrendingDown, TrendingUp,
  Sliders, Check, X, Undo2, RotateCcw
} from "lucide-react";
import { PlanItem, WeeklyAvailabilityMap } from "@/lib/gemini/engine";
import { SmartActionItem } from "@/lib/ai/headcoach/types";
import { HeadCoachMicrocycleCard } from "./HeadCoachMicrocycleCard";
import { HeadCoachInlineMatrixCard } from "./HeadCoachInlineMatrixCard";

export interface HeadCoachMessageData {
  id: string;
  role: "user" | "assistant";
  text: string;
  suggestedPlan?: PlanItem[] | null;
  targetWeekNumber?: number;
  modelUsed?: string;
  timestamp?: string;
  reasoning?: string | null;
  quickReplies?: string[] | null;
  smartActions?: (string | SmartActionItem)[] | null;
  showInlineMatrix?: boolean;
  inlineMatrixAvailability?: WeeklyAvailabilityMap;
}

interface HeadCoachMessageItemProps {
  message: HeadCoachMessageData;
  weekNumber: number;
  onApplyAndSync?: (plan: PlanItem[]) => Promise<void>;
  isApplying?: boolean;
  onSelectQuickReply?: (replyText: string) => void;
  onSelectSmartAction?: (action: SmartActionItem | string) => void;
  onApplyInlineMatrix?: (tempAvailability: WeeklyAvailabilityMap) => void;
  onCancelInlineMatrix?: () => void;
  isGeneratingFromMatrix?: boolean;
}

/**
 * Renderizador de Texto Formateado Deportivo Profesional (Cero Emojis Infantiles)
 */
const FormattedMessageBody: React.FC<{ text: string }> = ({ text }) => {
  // Pre-normalizar etiquetas si vienen en líneas aisladas
  let normalizedText = text
    .replace(/^\[?📍?\s*ESTADO DEL PROCESO\]?:?\s*$/gim, "[ESTADO DEL PROCESO]:")
    .replace(/^\[?⚖️?\s*DIAGN[OÓ]STICO(?:\s*\/\s*VEREDICTO)?\]?:?\s*$/gim, "[DIAGNÓSTICO]:")
    .replace(/^\[?🎯?\s*ACCI[OÓ]N PRESCRIPTIVA\]?:?\s*$/gim, "[ACCIÓN PRESCRIPTIVA]:");

  // Si las etiquetas están aisladas sin dos puntos, unirlas con la siguiente línea
  normalizedText = normalizedText
    .replace(/\[ESTADO DEL PROCESO\]:\n+/gi, "[ESTADO DEL PROCESO] ")
    .replace(/\[DIAGNÓSTICO\]:\n+/gi, "[DIAGNÓSTICO] ")
    .replace(/\[ACCIÓN PRESCRIPTIVA\]:\n+/gi, "[ACCIÓN PRESCRIPTIVA] ");

  const lines = normalizedText.split("\n");

  const formatInline = (str: string) => {
    // Limpieza de emojis infantiles
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
                <span className="font-black uppercase tracking-wider text-[10px] text-cyan-700 dark:text-cyan-300 block mb-0.5">Estado de la Semana</span>
                <div>{formatInline(content || "Semana en curso.")}</div>
              </div>
            </div>
          );
        }

        // Bloque Canónico 2: Diagnóstico / Veredicto
        if (/^\[?⚖️?\s*DIAGN[OÓ]STICO/i.test(trimmed)) {
          const content = trimmed.replace(/^\[?⚖️?\s*DIAGN[OÓ]STICO\s*(\/\s*VEREDICTO)?\]?:?\s*/i, "");
          const isAdjustment = /ajuste|recalibraci|descarga|fatiga/i.test(content);
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
                  {isAdjustment ? "Diagnóstico: Ajuste Fisiológico Sugerido" : "Veredicto: Continuidad del Plan"}
                </span>
                <div>{formatInline(content || "Mantenemos el plan previsto.")}</div>
              </div>
            </div>
          );
        }

        // Bloque Canónico 3: Acción Prescriptiva / Pauta para hoy
        if (/^\[?🎯?\s*ACCI[OÓ]N PRESCRIPTIVA\]?/i.test(trimmed)) {
          const content = trimmed.replace(/^\[?🎯?\s*ACCI[OÓ]N PRESCRIPTIVA\]?:?\s*/i, "");
          return (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 flex items-start gap-2">
              <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-black uppercase tracking-wider text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">Pauta para Hoy</span>
                <div>{formatInline(content || "Sigue las zonas estipuladas.")}</div>
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

const renderActionIcon = (action: SmartActionItem | string) => {
  const icon = typeof action === "string" ? undefined : action.icon;
  const label = typeof action === "string" ? action : action.label;

  if (icon === "activity" || /detalle|estado|fisiol[oó]g/i.test(label)) return <Activity className="h-3.5 w-3.5" />;
  if (icon === "calendar-sync" || /reorganizar/i.test(label)) return <CalendarSync className="h-3.5 w-3.5" />;
  if (icon === "trending-down" || /fatiga|cansad/i.test(label)) return <TrendingDown className="h-3.5 w-3.5" />;
  if (icon === "trending-up" || /suave|aumentar|mayor carga/i.test(label)) return <TrendingUp className="h-3.5 w-3.5" />;
  if (icon === "sliders" || /matriz temporal/i.test(label)) return <Sliders className="h-3.5 w-3.5" />;
  if (icon === "check" || /aprobar|confirmar|aplicar/i.test(label)) return <Check className="h-3.5 w-3.5" />;
  if (icon === "undo" || /deshacer/i.test(label)) return <Undo2 className="h-3.5 w-3.5" />;
  if (icon === "x" || /descartar|descansar/i.test(label)) return <X className="h-3.5 w-3.5" />;
  if (/mantener/i.test(label)) return <RotateCcw className="h-3.5 w-3.5" />;
  return null;
};

const getActionVariantClasses = (variant?: string, label?: string) => {
  if (variant === "primary" || (!variant && /confirmar|aprobar|aplicar|mantener/i.test(label || ""))) {
    return "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold active:scale-95 shadow-md shadow-emerald-500/20 border border-emerald-400";
  }
  if (variant === "secondary" || (!variant && /descartar|descansar|reorganizar/i.test(label || ""))) {
    return "bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold";
  }
  if (variant === "tertiary" || (!variant && /deshacer/i.test(label || ""))) {
    return "text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 text-[11px] underline decoration-dotted bg-transparent border-0 p-1 font-medium";
  }
  return "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200/60 dark:border-slate-700";
};

export const HeadCoachMessageItem: React.FC<HeadCoachMessageItemProps> = ({
  message,
  weekNumber,
  onApplyAndSync,
  isApplying = false,
  onSelectQuickReply,
  onSelectSmartAction,
  onApplyInlineMatrix,
  onCancelInlineMatrix,
  isGeneratingFromMatrix = false,
}) => {
  const isAssistant = message.role === "assistant";
  const actionsList = message.smartActions || message.quickReplies || [];

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
        className={`rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
          isAssistant
            ? "w-full max-w-full lg:max-w-[96%] xl:max-w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200"
            : "max-w-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-medium ml-auto"
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

        {/* Acciones Tácticas Dinámicas (Smart Replies con Iconos Lucide & Jerarquía) */}
        {isAssistant && actionsList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 items-center">
            {actionsList.map((action, idx) => {
              const rawLabel = typeof action === "string" ? action : action.label;
              const label = rawLabel.replace(/^[📊✈️📉📈]\s*/, "");
              const variant = typeof action === "string" ? undefined : action.variant;
              const isTertiary = variant === "tertiary" || /deshacer/i.test(label);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (onSelectSmartAction) onSelectSmartAction(action);
                    else if (onSelectQuickReply) onSelectQuickReply(label);
                  }}
                  className={`inline-flex items-center gap-1.5 transition cursor-pointer ${
                    isTertiary ? "px-1 py-0.5" : "px-3 py-1.5 rounded-xl text-xs"
                  } ${getActionVariantClasses(variant, label)}`}
                >
                  {renderActionIcon(action)}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Matriz Temporal Deportiva Inline (100% en el Chat) */}
        {isAssistant && message.showInlineMatrix && message.inlineMatrixAvailability && onApplyInlineMatrix && (
          <HeadCoachInlineMatrixCard
            weekNumber={message.targetWeekNumber || weekNumber}
            initialAvailability={message.inlineMatrixAvailability}
            onApplyMatrix={onApplyInlineMatrix}
            onCancel={onCancelInlineMatrix}
            isLoading={isGeneratingFromMatrix}
          />
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
