"use client";

import React from "react";
import { DollarSign, CheckCircle2, AlertCircle, TrendingUp, Users, Bell } from "lucide-react";
import { AdminBillingStats } from "@/lib/db/types";
import { formatMoney } from "@/lib/services/adminBillingService";

interface AdminBillingKpisProps {
  stats: AdminBillingStats;
}

export const AdminBillingKpis: React.FC<AdminBillingKpisProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {/* KPI 1: MRR / Facturación Mensual Proyectada */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 truncate">
            MRR / Facturación
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200/70 flex items-center justify-center shrink-0">
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
          {formatMoney(stats.totalExpectedRevenue, stats.currency)}
        </div>
        <div className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-1.5 truncate">
          <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{stats.paidCount + stats.pendingCount + stats.overdueCount} atletas activos</span>
        </div>
      </div>

      {/* KPI 2: Recaudado este Mes */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-1.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 truncate">
            Recaudado Mes
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-800 tracking-tight">
          {formatMoney(stats.totalCollectedMonth, stats.currency)}
        </div>
        <div className="text-[11px] sm:text-xs text-emerald-700 font-semibold flex items-center gap-1.5 truncate">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate">{stats.paidCount} atletas al día</span>
        </div>
      </div>

      {/* KPI 3: Cartera Pendiente / Por Cobrar */}
      <div className={`p-3.5 sm:p-5 rounded-2xl border shadow-2xs space-y-1.5 flex flex-col justify-between ${
        stats.totalPendingMonth > 0 ? "bg-amber-50/40 border-amber-200" : "bg-white border-slate-200/90"
      }`}>
        <div className="flex items-center justify-between text-slate-500">
          <span className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider truncate ${
            stats.totalPendingMonth > 0 ? "text-amber-800" : "text-slate-600"
          }`}>
            Por Cobrar
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center shrink-0">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${
          stats.totalPendingMonth > 0 ? "text-amber-900" : "text-slate-900"
        }`}>
          {formatMoney(stats.totalPendingMonth, stats.currency)}
        </div>
        <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
          {stats.pendingVerificationCount > 0 ? (
            <span className="text-amber-700 font-bold flex items-center gap-1 truncate">
              <Bell className="h-3 w-3 text-amber-600 shrink-0" />
              <span className="truncate">{stats.pendingVerificationCount} pago(s) por validar</span>
            </span>
          ) : stats.pendingCount + stats.overdueCount > 0 ? (
            `${stats.pendingCount} pend. • ${stats.overdueCount} mora`
          ) : (
            "Cartera al día"
          )}
        </div>
      </div>

      {/* KPI 4: Tasa de Cobro Efectivo */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
            Recaudación
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center shrink-0">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            {stats.collectionRatePercent}%
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-slate-500 font-semibold">recaudado</span>
        </div>
        {/* Barra de Progreso Visual */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-1">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, stats.collectionRatePercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
