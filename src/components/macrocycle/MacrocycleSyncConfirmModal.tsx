"use client";

import React from "react";
import { Sparkles, CalendarRange, AlertTriangle, X, CheckCircle2 } from "lucide-react";

interface MacrocycleSyncConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRollingSync: () => void;
  onConfirmFullSync: () => void;
  totalWeeks: number;
  isSyncing?: boolean;
}

export const MacrocycleSyncConfirmModal: React.FC<MacrocycleSyncConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmRollingSync,
  onConfirmFullSync,
  totalWeeks,
  isSyncing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="card-gradient rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scaleUp">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <CalendarRange className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Sincronización con Intervals.icu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Estrategia Adaptativa de Carga y Garmin Connect
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSyncing}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
            title="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Consejo Pedagógico de Head Coach */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Recomendación Fisiológica Adaptativa</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Para que tu entrenamiento se adapte en tiempo real a tus mejoras de umbral
            (Stryd CP / Ciclismo FTP) y fatiga (TSB), el método recomendado es la{" "}
            <strong>Ventana Rodante de 3 Semanas</strong>.
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
            Si sincronizas las <strong>{totalWeeks} semanas</strong> de golpe, las sesiones
            lejanas quedarán fijadas en Intervals y requerirán re-sincronizarse manualmente
            cuando tu estado de forma aumente.
          </p>
        </div>

        {/* Acciones */}
        <div className="space-y-2.5 pt-1">
          {/* Opción 1: Ventana Rodante (Recomendada) */}
          <button
            type="button"
            disabled={isSyncing}
            onClick={() => {
              onConfirmRollingSync();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-left">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <div>
                <div>Sincronizar Próximas 3 Semanas (Recomendado)</div>
                <div className="text-[10px] font-medium text-slate-900/80">
                  Ventana adaptativa 2:1 alineada a tu fitness actual
                </div>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950/15">
              Óptimo
            </span>
          </button>

          {/* Opción 2: Todo el Macrociclo (Avanzado) */}
          <button
            type="button"
            disabled={isSyncing}
            onClick={() => {
              onConfirmFullSync();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-left">
              <Sparkles className="h-4 w-4 text-cyan-500 shrink-0" />
              <div>
                <div>Sincronizar Todo el Plan ({totalWeeks} Semanas)</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                  Carga el calendario completo hasta la competición objetivo
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Avanzado
            </span>
          </button>
        </div>

        {/* Botón Cancelar */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            disabled={isSyncing}
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-3 py-1.5 transition cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
