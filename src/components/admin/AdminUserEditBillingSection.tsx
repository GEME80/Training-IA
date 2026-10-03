"use client";

import React from "react";
import { CreditCard, Trophy } from "lucide-react";

interface AdminUserEditBillingSectionProps {
  planPrice: number | "";
  setPlanPrice: (v: number | "") => void;
  planCurrency: "USD" | "COP" | "EUR";
  setPlanCurrency: (v: "USD" | "COP" | "EUR") => void;
  billingStatus: "PAID" | "PENDING" | "OVERDUE" | "PENDING_VERIFICATION";
  setBillingStatus: (v: "PAID" | "PENDING" | "OVERDUE" | "PENDING_VERIFICATION") => void;
  billingCycleDay: number | "";
  setBillingCycleDay: (v: number | "") => void;
  paymentMethod: "TRANSFER" | "STRIPE" | "WOMPI" | "CASH" | "OTHER";
  setPaymentMethod: (v: "TRANSFER" | "STRIPE" | "WOMPI" | "CASH" | "OTHER") => void;
  primaryGoalRace: string;
  setPrimaryGoalRace: (v: string) => void;
  primaryGoalDate: string;
  setPrimaryGoalDate: (v: string) => void;
}

export const AdminUserEditBillingSection: React.FC<AdminUserEditBillingSectionProps> = ({
  planPrice,
  setPlanPrice,
  planCurrency,
  setPlanCurrency,
  billingStatus,
  setBillingStatus,
  billingCycleDay,
  setBillingCycleDay,
  paymentMethod,
  setPaymentMethod,
  primaryGoalRace,
  setPrimaryGoalRace,
  primaryGoalDate,
  setPrimaryGoalDate,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
      <div className="flex items-center space-x-2 text-xs font-bold text-emerald-950">
        <CreditCard className="h-4 w-4 text-emerald-600" />
        <span>Plan Comercial & Estado de Cobro</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Precio Mensual</label>
          <input
            type="number"
            value={planPrice}
            onChange={(e) => setPlanPrice(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="80"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Moneda</label>
          <select
            value={planCurrency}
            onChange={(e) => setPlanCurrency(e.target.value as "USD" | "COP" | "EUR")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="USD">USD ($)</option>
            <option value="COP">COP ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Estado de Pago</label>
          <select
            value={billingStatus}
            onChange={(e) => setBillingStatus(e.target.value as "PAID" | "PENDING" | "OVERDUE" | "PENDING_VERIFICATION")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="PAID">Al Día (Pagado)</option>
            <option value="PENDING">Pendiente</option>
            <option value="PENDING_VERIFICATION">🔔 Pago Reportado (Validar)</option>
            <option value="OVERDUE">Vencido / Mora</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Día de Corte</label>
          <input
            type="number"
            min={1}
            max={31}
            value={billingCycleDay}
            onChange={(e) => setBillingCycleDay(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="1"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-emerald-100">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Medio de Pago</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as "TRANSFER" | "STRIPE" | "WOMPI" | "CASH" | "OTHER")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="TRANSFER">Transferencia / Bancolombia</option>
            <option value="STRIPE">Stripe / Tarjeta</option>
            <option value="WOMPI">Wompi / PSE</option>
            <option value="CASH">Efectivo</option>
            <option value="OTHER">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Trophy className="h-3 w-3 text-amber-500" />
            <span>Objetivo Principal</span>
          </label>
          <input
            type="text"
            value={primaryGoalRace}
            onChange={(e) => setPrimaryGoalRace(e.target.value)}
            placeholder="Ej. Maratón de Tokio 2027"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Fecha Objetivo</label>
          <input
            type="date"
            value={primaryGoalDate}
            onChange={(e) => setPrimaryGoalDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
