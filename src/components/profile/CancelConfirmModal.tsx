"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface CancelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  currentPeriodEnd?: string;
  formatDate: (dateStr?: string) => string;
}

export const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  currentPeriodEnd,
  formatDate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-black">
              ¿Confirmas la cancelación de tu suscripción?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              La renovación automática se apagará de inmediato y no se volverá a cobrar tu tarjeta.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3.5 text-xs text-amber-900 dark:text-amber-300 leading-relaxed font-medium space-y-1.5">
          <div className="font-bold flex items-center gap-1.5">
            <span>Garantía Efecto Netflix:</span>
          </div>
          <p>
            Conservarás acceso completo a tus planes, telemetría y Head Coach IA hasta el{" "}
            <strong>{formatDate(currentPeriodEnd)}</strong> sin ningún cobro futuro. Podrás reanudar cuando quieras.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
          >
            Mantener mi plan
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-700/20 transition cursor-pointer flex items-center gap-1.5"
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Sí, cancelar suscripción</span>
          </button>
        </div>
      </div>
    </div>
  );
};
