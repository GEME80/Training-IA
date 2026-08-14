"use client";

import React from "react";
import { Bot, Sparkles, RefreshCw, Cpu, Compass } from "lucide-react";
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
  return (
    <div className="card-gradient rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-black font-bold shadow-md shadow-cyan-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Centro de Mando del Head Coach Digital
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </h2>
              {decision?.modelUsed && (
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  {decision.modelUsed}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Inferencia adaptativa de carga según telemetría Stryd, HRV y fase de tu macrociclo
            </p>
          </div>
        </div>

        {/* Action Button: Generar Plan con IA */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onReevaluate}
            disabled={isEvaluating}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-5 py-2.5 text-xs font-black text-black shadow-lg shadow-cyan-500/20 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            title="Analizar asimilación de cargas y periodización con Inteligencia Artificial"
          >
            <RefreshCw className={`h-4 w-4 ${isEvaluating ? "animate-spin text-black" : ""}`} />
            <span>{isEvaluating ? "Consultando IA..." : "🧠 Generar Plan con IA"}</span>
          </button>
        </div>
      </div>

      {/* Decision Summary & Status */}
      {decision ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] uppercase font-bold text-slate-400">
                  Diagnóstico Adaptativo del Agente
                </span>
                {decision.macrocyclePhase && (
                  <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-slate-800 flex items-center gap-1">
                    <Compass className="h-3 w-3" />
                    {decision.macrocyclePhase}
                  </span>
                )}
              </div>
              <span
                className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  decision.status === "OPTIMAL"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : decision.status === "CAUTION"
                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {decision.status === "OPTIMAL"
                  ? "🟢 Estado Óptimo"
                  : decision.status === "CAUTION"
                  ? "🟡 Precaución"
                  : "🔴 Fatiga Elevada"}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-white leading-relaxed">
              {decision.summaryHeadline}
            </p>
          </div>

          {/* Reasoning Tree */}
          {decision.reasoningTree && decision.reasoningTree.length > 0 && (
            <div className="rounded-xl bg-slate-950/40 p-3.5 border border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Árbol de Decisión Fisiológica (Gemini Thinking):
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {decision.reasoningTree.map((reason, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-cyan-400 font-mono text-[11px] shrink-0 mt-0.5">
                      ›
                    </span>
                    <span className="leading-snug">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-slate-950/40 p-6 text-center text-slate-400 border border-slate-800/60">
          <p className="text-xs">
            Pulsa <strong>"🧠 Generar Plan con IA"</strong> para que el Head Coach Digital evalúe tu telemetría y periodice tu microciclo.
          </p>
        </div>
      )}
    </div>
  );
};
