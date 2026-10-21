"use client";

import React from "react";
import {
  Calendar,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatMoney } from "@/lib/services/adminBillingService";

interface SubscriptionPlanCardProps {
  planPrice: number;
  isMasterAdmin: boolean;
  isCancelScheduled: boolean;
  isTrial: boolean;
  isActive: boolean;
  daysRemaining: number;
  currentPeriodEnd?: string | null;
  formatDate: (dateStr?: string | null) => string;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  planPrice,
  isMasterAdmin,
  isCancelScheduled,
  isTrial,
  isActive,
  daysRemaining,
  currentPeriodEnd,
  formatDate,
}) => {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Plan Actual
          </span>
          <h4 className="text-xl font-black text-slate-950 dark:text-white mt-0.5">
            Pulse Atleta Pro
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acceso ilimitado a Head Coach IA, Periodización y Telemetría.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xl font-mono font-black text-slate-900 dark:text-white block">
            {formatMoney(planPrice, "COP")}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Mensual</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500">Estado de la cuenta:</span>
        {isMasterAdmin ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Acceso Administrador (Exento)
          </span>
        ) : isCancelScheduled ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            Cancelación Programada (Acceso Activo)
          </span>
        ) : isTrial ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
            Prueba Gratuita ({daysRemaining}d restantes)
          </span>
        ) : isActive ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Suscripción Activa
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <AlertCircle className="h-3.5 w-3.5 text-slate-500" />
            Sin Suscripción Activa
          </span>
        )}
      </div>

      <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-2">
            <Calendar className={`h-4 w-4 ${isCancelScheduled ? "text-amber-500" : "text-slate-400"}`} />
            {isCancelScheduled ? "Acceso garantizado hasta:" : "Próxima renovación automática:"}
          </span>
          <strong className={`font-mono ${isCancelScheduled ? "text-amber-600 dark:text-amber-400 font-black" : "text-slate-950 dark:text-white"}`}>
            {formatDate(currentPeriodEnd)}
          </strong>
        </div>

        {isCancelScheduled && (
          <div className="p-3.5 rounded-2xl bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Suscripción cancelada — Renovación automática desactivada</span>
            </div>
            <p className="text-[11px] text-amber-900/90 dark:text-amber-200">
              No se realizará ningún cobro posterior en tu tarjeta. Conservarás todos tus entrenamientos, análisis de IA y acceso completo hasta el <strong>{formatDate(currentPeriodEnd)}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
