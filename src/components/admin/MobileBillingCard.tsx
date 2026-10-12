"use client";

import React from "react";
import { CheckCircle2, RotateCcw, RefreshCw, Calendar, Edit3, Smartphone, AlertCircle, Clock } from "lucide-react";
import { AdminUserListItem } from "@/lib/db/types";
import { formatMoney } from "@/lib/services/adminBillingService";

interface MobileBillingCardProps {
  athlete: AdminUserListItem;
  isUpdating: boolean;
  onSetStatus: (athlete: AdminUserListItem, newStatus: "PAID" | "PENDING" | "OVERDUE") => void;
  onEditAthlete?: (athlete: AdminUserListItem) => void;
}

export const MobileBillingCard: React.FC<MobileBillingCardProps> = ({
  athlete,
  isUpdating,
  onSetStatus,
  onEditAthlete,
}) => {
  const price = typeof athlete.planPrice === "number" ? athlete.planPrice : 80;
  const currency = athlete.planCurrency || "USD";
  const status = athlete.billingStatus || "PENDING";

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
      {/* 1. Cabecera de Tarjeta: Atleta & Monto */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs shrink-0 shadow-2xs">
            {athlete.displayName ? athlete.displayName.charAt(0).toUpperCase() : athlete.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
              {athlete.displayName || "Sin nombre registrado"}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{athlete.email}</p>
          </div>
        </div>

        {/* Monto Limpio (Sin duplicidad $) */}
        <div className="text-right shrink-0">
          <div className="text-sm font-mono font-black text-slate-900 dark:text-white">
            {formatMoney(price, currency)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Día {athlete.billingCycleDay || 5}</div>
        </div>
      </div>

      {/* 2. Estado de Suscripción & Último Pago */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div>
          {status === "PAID" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>AL DÍA</span>
            </span>
          ) : status === "PENDING_VERIFICATION" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
              <Smartphone className="h-3 w-3 text-amber-600" />
              <span>PAGO REPORTADO</span>
            </span>
          ) : status === "OVERDUE" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <AlertCircle className="h-3 w-3 text-rose-600" />
              <span>EN MORA</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Clock className="h-3 w-3 text-slate-500" />
              <span>PENDIENTE</span>
            </span>
          )}
        </div>

        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
          {athlete.lastPaymentDate ? `Último: ${athlete.lastPaymentDate}` : "Sin pagos"}
        </div>
      </div>

      {/* 3. Botonera Táctil Ancha de Gestión */}
      <div className="flex items-center gap-2 pt-1">
        {status === "PAID" ? (
          <button
            type="button"
            onClick={() => onSetStatus(athlete, "PENDING")}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            title="Revertir estado a Pendiente de Pago"
          >
            {isUpdating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5 text-amber-600" />}
            <span>Revertir a Pendiente</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSetStatus(athlete, "PAID")}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
            title="Registrar cobro y marcar al día"
          >
            {isUpdating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>✓ Marcar Pagado</span>
          </button>
        )}

        {onEditAthlete && (
          <button
            type="button"
            onClick={() => onEditAthlete(athlete)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
            title="Editar tarifa o condiciones"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
