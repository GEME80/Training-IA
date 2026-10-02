"use client";

import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Shield, Rocket, Check, ArrowRight } from "lucide-react";
import { MacrocycleUpgradeProposal } from "@/lib/physiology/ctlPotentialEngine";

interface MacrocycleUpgradeCardProps {
  proposal: MacrocycleUpgradeProposal | null;
  onAcceptUpgrade: (proposal: MacrocycleUpgradeProposal) => Promise<void> | void;
  onDismissUpgrade: () => void;
  isProcessing?: boolean;
}

export const MacrocycleUpgradeCard: React.FC<MacrocycleUpgradeCardProps> = ({
  proposal,
  onAcceptUpgrade,
  onDismissUpgrade,
  isProcessing = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!proposal || proposal.status !== "PENDING") return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-teal-500/10 p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-300 animate-fadeIn">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-40 w-40 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header Badge & Title */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black shadow-md shadow-amber-500/30">
              <Rocket className="h-4 w-4" />
            </span>
            <div>
              <span className="rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                🚀 Oportunidad de Upgrade Fisiológico · Head Coach AI
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 tracking-wide">
                {proposal.triggerDetail}
              </h3>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <span>🛡️</span>
            <span>Plan actual protegido</span>
          </span>
        </div>

        {/* Pragmatic Impact Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 p-3 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              ⏱️ Tiempo Semanal
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">
              +{proposal.weeklyTimeDeltaMin} min promedio
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 p-3 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              🎯 Sesión Clave
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5">
              {proposal.keyLongWorkoutDelta}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 p-3 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              📈 Target Peak CTL
            </div>
            <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              {proposal.currentPeakCtl} → {proposal.proposedPeakCtl} CTL (+{(proposal.proposedPeakCtl - proposal.currentPeakCtl).toFixed(1)})
            </div>
          </div>
        </div>

        {/* Toggle Vista Previa Acordeón */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition cursor-pointer select-none"
          >
            <span>{isExpanded ? "Ocultar Vista Previa del Calendario" : "👁️ Ver Vista Previa Día por Día (Próxima Semana)"}</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Desplegable Día por Día */}
          {isExpanded && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 shadow-inner animate-fadeIn">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-black">DÍA</th>
                      <th className="py-2.5 px-3 font-black">PLAN ACTUAL</th>
                      <th className="py-2.5 px-3 font-black text-emerald-600 dark:text-emerald-400">PLAN OPTIMIZADO (UPGRADE)</th>
                      <th className="py-2.5 px-3 font-black">CAMBIO PRÁCTICO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-700 dark:text-slate-300">
                    {proposal.nextWeekDiff.map((item, idx) => (
                      <tr key={idx} className={item.isKeyWorkout ? "bg-amber-500/5 dark:bg-amber-500/10" : ""}>
                        <td className="py-2 px-3 font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          {item.day}
                          {item.isKeyWorkout && <span className="text-[10px]" title="Sesión clave">🔥</span>}
                        </td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{item.currentWorkout}</td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white font-mono text-[11px]">{item.proposedWorkout}</td>
                        <td className="py-2 px-3">
                          <span className="inline-block rounded-md bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                            {item.changeSummary}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Decision Soberana del Atleta */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200/60 dark:border-slate-800/80">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            🛡️ <em>Inacción: Tu plan vigente continuará corriendo sin ninguna alteración.</em>
          </p>

          <div className="flex items-center space-x-2.5 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={onDismissUpgrade}
              disabled={isProcessing}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shadow-xs active:scale-95"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Continuar con el Plan Actual</span>
            </button>

            <button
              type="button"
              onClick={() => onAcceptUpgrade(proposal)}
              disabled={isProcessing}
              className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-5 py-2 text-xs font-black text-black shadow-md shadow-amber-500/25 hover:brightness-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isProcessing ? "Optimizando..." : "Aceptar y Optimizar Plan"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
