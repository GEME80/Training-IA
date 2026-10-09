"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  DollarSign,
  Calendar,
  Edit3,
  RotateCcw,
  Smartphone,
  X,
} from "lucide-react";
import { AdminUserListItem } from "@/lib/db/types";
import { formatMoney } from "@/lib/services/adminBillingService";

interface AdminBillingTableProps {
  users: AdminUserListItem[];
  onRefresh: () => void;
  showMessage: (text: string, type: "success" | "error") => void;
  onEditAthlete?: (user: AdminUserListItem) => void;
}

export const AdminBillingTable: React.FC<AdminBillingTableProps> = ({
  users,
  onRefresh,
  showMessage,
  onEditAthlete,
}) => {
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PAID" | "PENDING" | "VERIFY">("ALL");

  const athletes = users.filter((u) => u.role === "athlete" && u.status === "active");

  const paidCount = athletes.filter(
    (a) => (a.billingStatus || "PENDING") === "PAID"
  ).length;

  const verifyCount = athletes.filter((a) => a.billingStatus === "PENDING_VERIFICATION").length;
  const pendingCount = athletes.length - paidCount;

  const filteredAthletes = athletes.filter((athlete) => {
    const status = athlete.billingStatus || "PENDING";
    if (filter === "PAID") return status === "PAID";
    if (filter === "VERIFY") return status === "PENDING_VERIFICATION";
    if (filter === "PENDING") return status === "PENDING" || status === "OVERDUE" || status === "PENDING_VERIFICATION";
    return true;
  });

  const handleSetStatus = async (athlete: AdminUserListItem, newStatus: "PAID" | "PENDING" | "OVERDUE") => {
    const todayStr = new Date().toISOString().split("T")[0];
    setUpdatingUid(athlete.uid);

    try {
      const res = await fetch("/api/admin/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUid: athlete.uid,
          billingStatus: newStatus,
          lastPaymentDate: newStatus === "PAID" ? todayStr : athlete.lastPaymentDate,
          planPrice: typeof athlete.planPrice === "number" ? athlete.planPrice : 80,
          planCurrency: athlete.planCurrency || "USD",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar estado");

      const label = newStatus === "PAID" ? "Al Día (Pagado)" : newStatus === "PENDING" ? "Pendiente" : "En Mora";
      showMessage(`Estado de ${athlete.displayName || athlete.email} cambiado a "${label}".`, "success");
      onRefresh();
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Error al procesar cobro", "error");
    } finally {
      setUpdatingUid(null);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      {/* Encabezado y Filtros Rápidos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Control de Cobros a Atletas</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Mes en Curso
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro mensual de suscripciones, pagos por Bre-B (BBVA) y modificación directa de estados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Todos ({athletes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("PAID")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === "PAID" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Al Día ({paidCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("PENDING")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === "PENDING" ? "bg-white text-amber-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          {verifyCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter("VERIFY")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                filter === "VERIFY" ? "bg-purple-600 text-white shadow-2xs" : "text-purple-700 bg-purple-100/60 hover:bg-purple-100"
              }`}
            >
              <span>Por Validar ({verifyCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabla Panorámica de Pagos */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="py-3 px-4">Atleta</th>
              <th className="py-3 px-4">Tarifa Mensual</th>
              <th className="py-3 px-4">Día de Corte</th>
              <th className="py-3 px-4">Estado del Mes</th>
              <th className="py-3 px-4">Último Pago / Ref</th>
              <th className="py-3 px-4 text-right">Gestión de Cobro Reversible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAthletes.map((athlete) => {
              const price = typeof athlete.planPrice === "number" ? athlete.planPrice : 80;
              const currency = athlete.planCurrency || "USD";
              const status = athlete.billingStatus || "PENDING";
              const isUpdating = updatingUid === athlete.uid;

              return (
                <tr key={athlete.uid} className="hover:bg-slate-50/70 transition-colors">
                  {/* Atleta */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 shadow-2xs">
                        {athlete.displayName ? athlete.displayName.charAt(0).toUpperCase() : athlete.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate">
                          {athlete.displayName || "Sin nombre"}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{athlete.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Tarifa */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                      <span>{formatMoney(price, currency)}</span>
                    </div>
                  </td>

                  {/* Día de Corte */}
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Día {athlete.billingCycleDay || 5} de cada mes</span>
                    </div>
                  </td>

                  {/* Estado del Mes */}
                  <td className="py-3 px-4">
                    {status === "PAID" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>PAGADO</span>
                      </span>
                    ) : status === "PENDING_VERIFICATION" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 animate-pulse">
                        <Smartphone className="h-3 w-3 text-purple-600" />
                        <span>PAGO REPORTADO</span>
                      </span>
                    ) : status === "OVERDUE" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        <AlertCircle className="h-3 w-3 text-rose-600" />
                        <span>EN MORA</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="h-3 w-3 text-amber-600" />
                        <span>PENDIENTE</span>
                      </span>
                    )}
                  </td>

                  {/* Último Pago / Ref */}
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">
                    {status === "PENDING_VERIFICATION" && athlete.paymentReference ? (
                      <div className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block">
                        Ref: {athlete.paymentReference}
                      </div>
                    ) : athlete.lastPaymentDate ? (
                      athlete.lastPaymentDate
                    ) : (
                      "Sin registro"
                    )}
                  </td>

                  {/* Botonera de Cobro Reversible */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {status === "PENDING_VERIFICATION" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(athlete, "PAID")}
                            disabled={isUpdating}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                            title="Aprobar reporte y marcar al día"
                          >
                            {isUpdating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            <span>Aprobar Pago</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(athlete, "PENDING")}
                            disabled={isUpdating}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 transition cursor-pointer"
                            title="Rechazar reporte y dejar pendiente"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : status === "PAID" ? (
                        <button
                          type="button"
                          onClick={() => handleSetStatus(athlete, "PENDING")}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 border border-slate-200 transition cursor-pointer disabled:opacity-50"
                          title="Revertir estado a Pendiente de Pago"
                        >
                          {isUpdating ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                          )}
                          <span>Revertir a Pendiente</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetStatus(athlete, "PAID")}
                          disabled={isUpdating}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                          title="Registrar cobro y marcar al día"
                        >
                          {isUpdating ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          <span>Marcar Pagado</span>
                        </button>
                      )}

                      {onEditAthlete && (
                        <button
                          type="button"
                          onClick={() => onEditAthlete(athlete)}
                          title="Modificar tarifa o condiciones comerciales"
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-500 transition cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
