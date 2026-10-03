"use client";

import React from "react";
import { DollarSign, CheckCircle2, AlertCircle, TrendingUp, Users } from "lucide-react";
import { AdminBillingStats } from "@/lib/db/types";
import { formatMoney } from "@/lib/services/adminBillingService";

interface AdminBillingKpisProps {
  stats: AdminBillingStats;
}

export const AdminBillingKpis: React.FC<AdminBillingKpisProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: MRR / Facturación Mensual Proyectada */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
            MRR / Facturación Mes
          </span>
          <div className="h-8 w-8 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200/70 flex items-center justify-center">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tight">
          {formatMoney(stats.totalExpectedRevenue, stats.currency)}
        </div>
        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span>{stats.paidCount + stats.pendingCount + stats.overdueCount} atletas en planes activos</span>
        </div>
      </div>

      {/* KPI 2: Recaudado este Mes */}
      <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-1.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700">
            Recaudado este Mes
          </span>
          <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="text-3xl font-black text-emerald-800 tracking-tight">
          {formatMoney(stats.totalCollectedMonth, stats.currency)}
        </div>
        <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          <span>{stats.paidCount} atletas al día con su pago</span>
        </div>
      </div>

      {/* KPI 3: Cartera Pendiente / Por Cobrar */}
      <div className={`p-5 rounded-2xl border shadow-2xs space-y-1.5 flex flex-col justify-between ${
        stats.totalPendingMonth > 0 ? "bg-amber-50/40 border-amber-200" : "bg-white border-slate-200/90"
      }`}>
        <div className="flex items-center justify-between text-slate-500">
          <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
            stats.totalPendingMonth > 0 ? "text-amber-800" : "text-slate-600"
          }`}>
            Por Cobrar / Pendiente
          </span>
          <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center">
            <AlertCircle className="h-4 w-4" />
          </div>
        </div>
        <div className={`text-3xl font-black tracking-tight ${
          stats.totalPendingMonth > 0 ? "text-amber-900" : "text-slate-900"
        }`}>
          {formatMoney(stats.totalPendingMonth, stats.currency)}
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {stats.pendingVerificationCount > 0 ? (
            <span className="text-purple-700 font-bold flex items-center gap-1">
              <span>🔔</span>
              <span>{stats.pendingVerificationCount} pago(s) por validar</span>
            </span>
          ) : stats.pendingCount + stats.overdueCount > 0 ? (
            `${stats.pendingCount} pendientes • ${stats.overdueCount} en mora`
          ) : (
            "Toda la cartera al día"
          )}
        </div>
      </div>

      {/* KPI 4: Tasa de Cobro Efectivo */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700">
            Tasa de Recaudación
          </span>
          <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/70 flex items-center justify-center">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.collectionRatePercent}%
          </span>
          <span className="text-xs font-mono text-slate-500 font-semibold">recaudado</span>
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
