"use client";

import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Cpu, Compass, RefreshCw } from "lucide-react";
import { AgentDecisionOutput } from "@/lib/gemini/engine";

interface AgentCommandCenterProps {
  decision: AgentDecisionOutput | null;
  onReevaluate: () => void;
  isEvaluating: boolean;
}

export const AgentCommandCenter: React.FC<AgentCommandCenterProps> = ({
  decision,
  onReevaluate,
  isEvaluating,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!decision) return null;

  return (
    <div className="card-gradient rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fadeIn">
      {/* Botón Barra Acordeón (Cerrado por defecto) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 sm:px-5 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
      >
        <div className="flex items-center space-x-2.5">
          <span className="text-sm">🔍</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Ver lógica del Agente (Gemini Thinking)
          </span>
          {decision.modelUsed && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              <Cpu className="h-3 w-3" />
              {decision.modelUsed}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {isOpen ? "Ocultar" : "Desplegar"}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          )}
        </div>
      </button>

      {/* Contenido Desplegable */}
      {isOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
          {/* Titular del Diagnóstico */}
          <div className="rounded-xl bg-white dark:bg-slate-900/80 p-3.5 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Resumen Fisiológico Gemini:
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  decision.status === "OPTIMAL"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : decision.status === "CAUTION"
                    ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-400"
                    : "bg-red-100 text-red-800 border border-red-300 dark:bg-red-500/10 dark:text-red-400"
                }`}
              >
                {decision.status === "OPTIMAL"
                  ? "🟢 Estado Óptimo"
                  : decision.status === "CAUTION"
                  ? "🟡 Precaución"
                  : "🔴 Fatiga Elevada"}
              </span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {decision.summaryHeadline}
            </p>
          </div>

          {/* Árbol de Razonamiento */}
          {decision.reasoningTree && decision.reasoningTree.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Cadena de Razonamiento (Thinking Steps):
              </span>
              <ul className="space-y-1.5 pl-1">
                {decision.reasoningTree.map((reason, index) => (
                  <li key={index} className="flex items-start space-x-2 text-slate-600 dark:text-slate-300">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">›</span>
                    <span className="leading-snug">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
