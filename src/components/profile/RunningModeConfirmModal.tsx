"use client";

import React from "react";
import { Zap, Timer, AlertTriangle } from "lucide-react";
import { RunningTrainingMode } from "@/lib/db/types";

interface RunningModeConfirmModalProps {
  currentMode: RunningTrainingMode;
  targetMode: RunningTrainingMode;
  onCancel: () => void;
  onConfirm: () => void;
}

export const RunningModeConfirmModal: React.FC<RunningModeConfirmModalProps> = ({
  currentMode,
  targetMode,
  onCancel,
  onConfirm,
}) => {
  const isTargetPower = targetMode === "POWER";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            {isTargetPower ? <Zap className="h-6 w-6" /> : <Timer className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Confirmar Transformación de Plan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transición de {currentMode === "POWER" ? "Potencia Stryd" : "Ritmo (Pace)"} a {isTargetPower ? "Potencia Stryd" : "Ritmo (Pace)"}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono space-y-2">
          {isTargetPower ? (
            <p>
              ⚡ Al cambiar a <strong>Potencia Stryd</strong>, las semanas futuras de tu macrociclo activo se prescribirán en <strong>vatios (% CP)</strong>.
            </p>
          ) : (
            <p>
              ⏱️ Al cambiar a <strong>Ritmo (Pace)</strong>, las semanas futuras de tu macrociclo activo se prescribirán en <strong>min/km (% Pace)</strong>.
            </p>
          )}
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            * Para que este cambio se refleje en tu reloj deportivo, recuerda presionar <strong>"Sincronizar a Intervals.icu"</strong> en el calendario.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs font-mono transition cursor-pointer shadow-md"
          >
            Sí, transformar a {isTargetPower ? "Potencia" : "Ritmo"}
          </button>
        </div>
      </div>
    </div>
  );
};
