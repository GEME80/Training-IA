"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Search,
  Download,
  ExternalLink,
  Layers,
  ArrowLeft,
  Sparkles,
  CreditCard,
  Lock,
} from "lucide-react";
import Link from "next/link";

export const GmcHoldingFinanceConsole: React.FC = () => {
  const [selectedTenant, setSelectedTenant] = useState<string>("ALL");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchData = async (tenantId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/finsec/metrics?tenantId=${tenantId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("[FINSEC_CONSOLE_FETCH_ERROR]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedTenant);
  }, [selectedTenant]);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredLedger = (data?.ledgerEntries || []).filter((entry: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.orderId?.toLowerCase().includes(q) ||
      entry.subscriberId?.toLowerCase().includes(q) ||
      entry.tenantId?.toLowerCase().includes(q) ||
      entry.metadata?.customerName?.toLowerCase().includes(q)
    );
  });

  const exportCsv = () => {
    if (!data?.ledgerEntries) return;
    const headers = ["Timestamp", "Tenant", "SubscriberId", "OrderId", "Type", "GrossCOP", "FeeCOP", "VatCOP", "NetDisbursedCOP", "Status"];
    const rows = data.ledgerEntries.map((e: any) => [
      e.timestamp,
      e.tenantId,
      e.subscriberId,
      e.orderId,
      e.type,
      e.grossAmountCop,
      e.openpayFeeCop,
      e.openpayVatCop,
      e.netAmountCop,
      e.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gmc_ledger_${selectedTenant}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* 1. BARRA SUPERIOR EJECUTIVA */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  GMC FinSec Headquarters
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                  Openpay BBVA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                German Morales Consulting • Control Financiero y Pasarela Multi-App
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchData(selectedTenant)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Actualizar</span>
            </button>

            <a
              href="https://sandbox-dashboard.openpay.co"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold border border-blue-500/30 transition cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Panel Openpay BBVA</span>
            </a>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver a Pulse</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* 2. SELECTOR MULTI-APLICACIÓN (TENANTS) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {(data?.tenants || [
            { id: "ALL", name: "Consolidado GM Consulting" },
            { id: "PULSE_ENDURANCE", name: "Pulse Endurance" },
            { id: "HUBINFO", name: "Hubinfo SaaS" },
          ]).map((t: any) => {
            const isSelected = selectedTenant === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTenant(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* 3. TARJETA PRINCIPAL: LIQUIDACIÓN SEMANAL BBVA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CreditCard className="h-4 w-4" />
                <span>Próximo Desembolso en Cuenta BBVA (Miércoles)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                {data?.financialSummary?.nextDisbursementDate || "Próximo Miércoles"}
              </span>
            </div>

            <div className="py-6 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Neto Liquidable Proyectado:</span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight flex items-baseline gap-2">
                <span>{formatCOP(data?.financialSummary?.totalNetDisbursementCop || 0)}</span>
                <span className="text-xs font-sans text-emerald-400 font-bold">COP</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Depositado automáticamente los miércoles en tu <strong>Cuenta de Ahorros BBVA Colombia</strong>.
              </p>
            </div>

            {/* Desglose de Comisión Openpay */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Total Bruto Cobrado</span>
                <span className="font-mono font-bold text-white text-sm">
                  {formatCOP(data?.financialSummary?.totalGrossCop || 0)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Comisión Pasarela BBVA (2.99% + $800)</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  - {formatCOP(data?.financialSummary?.totalOpenpayFeeCop || 0)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Retención IVA (19% s/ Tarifa)</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  - {formatCOP(data?.financialSummary?.totalOpenpayVatCop || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Resumen Rápido de Pipeline */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Estado de Suscriptores
              </span>
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Suscripciones Activas Pagadas</span>
                </div>
                <span className="font-mono font-black text-white text-sm">
                  {data?.subscriptionPipeline?.activePaid ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Clock className="h-4 w-4" />
                  <span>En Periodo de Prueba (7 Días)</span>
                </div>
                <span className="font-mono font-black text-white text-sm">
                  {data?.subscriptionPipeline?.activeTrial ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Cancelación Programada (Vencen pronto)</span>
                </div>
                <span className="font-mono font-black text-white text-sm">
                  {data?.subscriptionPipeline?.cancelScheduled ?? 0}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 text-center">
              Aislamiento Multi-Tenant activo para German Morales Consulting
            </div>
          </div>
        </div>

        {/* 4. ESTADO EN VIVO DEL ESCUADRÓN DE 5 AGENTES FINSEC */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Escuadrón de 5 Agentes FinSec (Monitoreo 24/7)</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
              TODOS LOS AGENTES OPERATIVOS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(data?.finSecAgentsStatus || []).map((agent: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{agent.name}</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{agent.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. LIBRO MAYOR INMUTABLE MULTI-TENANT (gmc_immutable_ledger) */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Libro Mayor Inmutable de Transacciones</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Append-Only
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Auditoría financiera unificada de todas tus aplicaciones conectadas
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar orden, suscriptor o app..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-60"
                />
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>

              <button
                type="button"
                onClick={exportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full pt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-3">Fecha / Hora</th>
                  <th className="py-3 px-3">Aplicación</th>
                  <th className="py-3 px-3">Suscriptor / Cliente</th>
                  <th className="py-3 px-3">Order ID Determinista</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3 text-right">Bruto COP</th>
                  <th className="py-3 px-3 text-right">Comisión Pasarela</th>
                  <th className="py-3 px-3 text-right">Neto a BBVA</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-slate-400 space-y-2">
                      <div className="font-bold text-slate-300">No hay transacciones registradas aún</div>
                      <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                        La base de datos está limpia. Al registrar una tarjeta de prueba en Sandbox desde Pulse Endurance, la orden determinista y su asiento contable inmutable aparecerán aquí automáticamente.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(tx.timestamp).toLocaleString("es-CO")}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.tenantId === "PULSE_ENDURANCE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {tx.tenantId}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-white text-xs">
                        <div className="font-bold">{tx.metadata?.customerName || tx.subscriberId}</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
                          {tx.subscriberId}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-300 font-bold">
                        {tx.orderId}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] text-slate-400 uppercase">
                          {tx.type === "TRIAL_START"
                            ? "Inicio Trial 7d"
                            : tx.type === "SUBSCRIPTION_CHARGE"
                            ? "Cobro Mensual"
                            : tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {formatCOP(tx.grossAmountCop)}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-400">
                        {formatCOP((tx.openpayFeeCop || 0) + (tx.openpayVatCop || 0))}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-400">
                        {formatCOP(tx.netAmountCop)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>COMPLETED</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
