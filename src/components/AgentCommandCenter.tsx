"use client";

import React, { useState } from "react";
import { Bot, Sparkles, Send, CheckCircle2, RefreshCw, GitBranch, ArrowRight } from "lucide-react";
import { AgentDecisionOutput } from "@/lib/gemini/engine";

interface AgentCommandCenterProps {
  decision: AgentDecisionOutput | null;
  onReevaluate: () => void;
  onSyncIntervals: () => Promise<void>;
  isEvaluating: boolean;
  isSyncing: boolean;
}

export const AgentCommandCenter: React.FC<AgentCommandCenterProps> = ({
  decision,
  onReevaluate,
  onSyncIntervals,
  isEvaluating,
  isSyncing,
}) => {
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncSuccess(null);
    try {
      await onSyncIntervals();
      setSyncSuccess("¡Microciclo publicado exitosamente en Intervals.icu!");
      setTimeout(() => setSyncSuccess(null), 6000);
    } catch {
      // Error handled by parent
    }
  };

  return (
    <div className="card-gradient rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-bold shadow-md shadow-emerald-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Centro de Mando del Head Coach Digital
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Inferencia adaptativa de carga basada en telemetría Stryd y HRV
            </p>
          </div>
        </div>

        {/* Action Buttons (On-Demand Manual Execution) */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onReevaluate}
            disabled={isEvaluating || isSyncing}
            className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 shadow-md transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isEvaluating ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isEvaluating ? "Analizando..." : "Reevaluar Microciclo"}</span>
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing || isEvaluating || !decision}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs font-extrabold text-black shadow-lg shadow-emerald-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin text-black" />
            ) : (
              <Send className="h-4 w-4 text-black" />
            )}
            <span>{isSyncing ? "Sincronizando..." : "Sincronizar a Intervals.icu"}</span>
          </button>
        </div>
      </div>

      {/* Sync Success Alert */}
      {syncSuccess && (
        <div className="flex items-center space-x-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{syncSuccess}</span>
        </div>
      )}

      {/* Diagnostic & Reasoning Tree */}
      {decision && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Diagnóstico Fisiológico
            </span>
            <p className="mt-1 text-sm font-semibold text-slate-100 leading-relaxed">
              {decision.summaryHeadline}
            </p>
          </div>

          {/* Reasoning Steps */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
              <GitBranch className="h-4 w-4 text-cyan-400" />
              <span>Árbol de Razonamiento del Agente:</span>
            </div>

            <div className="space-y-1.5 pl-2">
              {decision.reasoningTree.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300 font-mono">
                  <ArrowRight className="h-3 w-3 mt-0.5 text-slate-500 flex-shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
