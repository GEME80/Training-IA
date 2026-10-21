"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Sparkles,
  Clock,
  ShieldCheck,
  Search,
  Download,
  ExternalLink,
  Layers,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { SubscriptionPlanConfig, DEFAULT_SUBSCRIPTION_PLAN } from "@/lib/db/types";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface AdminPlansTabProps {
  showMessage: (text: string, type: "success" | "error") => void;
}

export const AdminPlansTab: React.FC<AdminPlansTabProps> = ({ showMessage }) => {
  const { user, userProfile } = useAuth();
  const requesterUid = user?.uid || userProfile?.uid || "superadmin-root";
  const requesterEmail = user?.email || userProfile?.email || "";

  const [activeSubTab, setActiveSubTab] = useState<"config" | "transactions">("config");
  const [plan, setPlan] = useState<SubscriptionPlanConfig>(DEFAULT_SUBSCRIPTION_PLAN);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [newFeatureText, setNewFeatureText] = useState<string>("");

  // Estado para la pestaña de Transacciones de Pulse
  const [pulseMetrics, setPulseMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(false);
  const [txSearchQuery, setTxSearchQuery] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/subscription-plan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.plan) setPlan(data.plan);
      })
      .catch((err) => console.warn("Aviso al consultar plan:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchPulseTransactions = async () => {
    setLoadingMetrics(true);
    try {
      const res = await fetch("/api/admin/finsec/metrics?tenantId=PULSE_ENDURANCE");
      if (res.ok) {
        const json = await res.json();
        setPulseMetrics(json);
      }
    } catch (err) {
      console.warn("Aviso al consultar transacciones de Pulse:", err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "transactions") {
      fetchPulseTransactions();
    }
  }, [activeSubTab]);

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setPlan((prev) => ({ ...prev, features: [...prev.features, newFeatureText.trim()] }));
    setNewFeatureText("");
  };

  const handleRemoveFeature = (idx: number) => {
    setPlan((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/subscription-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterUid, requesterEmail, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar plan");
      showMessage("¡Plan Pulse Pro y días de trial configurados exitosamente!", "success");
      if (data.plan) setPlan(data.plan);
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const exportPulseCsv = () => {
    const entries = pulseMetrics?.ledgerEntries || [];
    if (entries.length === 0) {
      alert("No hay transacciones registradas para exportar.");
      return;
    }
    const headers = ["Timestamp", "SubscriberId", "OrderId", "Type", "GrossCOP", "FeeCOP", "VatCOP", "NetDisbursedCOP", "Status"];
    const rows = entries.map((e: any) => [
      e.timestamp,
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
    link.setAttribute("download", `pulse_endurance_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPulseLedger = (pulseMetrics?.ledgerEntries || []).filter((tx: any) => {
    if (!txSearchQuery) return true;
    const q = txSearchQuery.toLowerCase();
    return (
      tx.orderId?.toLowerCase().includes(q) ||
      tx.subscriberId?.toLowerCase().includes(q) ||
      tx.metadata?.customerName?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3">
        <RefreshCw className="h-6 w-6 animate-spin text-cyan-600 mx-auto" />
        <p className="text-xs text-slate-500 font-mono">Cargando configuración de suscripciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Encabezado y Navegación entre Sub-Pestañas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <span>Suscripciones & Transacciones • Pulse Endurance</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestiona la tarifa, días de prueba gratis y audita las transacciones en vivo procesadas por Openpay BBVA.
          </p>
        </div>

        {/* Selector de Sub-Pestañas */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab("config")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === "config"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Configuración del Plan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("transactions")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === "transactions"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-cyan-600" />
            <span>Transacciones de Pulse</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 1: CONFIGURACIÓN DEL PLAN PULSE PRO                           */}
      {/* ========================================================================= */}
      {activeSubTab === "config" && (
        <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Columna Principal: Parámetros Financieros y Trial */}
            <div className="lg:col-span-2 space-y-5">
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>Definición, Precio & Periodo de Prueba</span>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">
                    Cancelación Flexible
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre Oficial del Plan
                    </label>
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => setPlan({ ...plan, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                      placeholder="Ej. Plan Atleta Pro"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subtítulo / Propuesta de Valor
                    </label>
                    <input
                      type="text"
                      value={plan.tagline}
                      onChange={(e) => setPlan({ ...plan, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                      placeholder="Ej. Periodización Dinámica, Fisiología Stryd y Head Coach Digital"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Precio Mensual Recurrente
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={plan.price}
                        onChange={(e) => setPlan({ ...plan, price: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Moneda</label>
                      <select
                        value={plan.currency}
                        onChange={(e) => setPlan({ ...plan, currency: e.target.value as "USD" | "COP" | "EUR" })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
                      >
                        <option value="COP">COP ($ - Pesos Colombianos)</option>
                        <option value="USD">USD ($ - Dólares)</option>
                        <option value="EUR">EUR (€ - Euros)</option>
                      </select>
                    </div>
                  </div>

                  {/* CAMPO CONFIGURABLE: DÍAS DE PRUEBA GRATIS (TRIAL DAYS) */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-emerald-700" />
                        <span>Días de Prueba Gratuita (Free Trial)</span>
                      </label>
                      <span className="font-mono text-xs font-black text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {plan.trialDays ?? 7} Días
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={90}
                        value={plan.trialDays ?? 7}
                        onChange={(e) => setPlan({ ...plan, trialDays: Math.max(0, Number(e.target.value)) })}
                        className="w-24 px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                      />

                      {/* Accesos rápidos de días */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[0, 7, 14, 30].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setPlan({ ...plan, trialDays: days })}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              (plan.trialDays ?? 7) === days
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {days === 0 ? "0d (Cobro Inmediato)" : `${days} días`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-emerald-900 leading-relaxed">
                      💡 <strong>Mecanismo Automático:</strong> Los atletas registrarán su tarjeta en el Día 1 con cobro de <strong>$0 COP</strong>. El Agente <code>Sentinel</code> registrará la huella para evitar abuso de pruebas, y el primer cobro automático por <strong>{formatCOP(plan.price)}</strong> se ejecutará en el Día {(plan.trialDays ?? 7) + 1} a menos que cancelen antes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Horas de Gracia Dunning (Reintentos)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={plan.dunningGraceHours ?? 72}
                        onChange={(e) => setPlan({ ...plan, dunningGraceHours: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Horas que se da a un atleta antiguo si su tarjeta falla antes de bloquearlo.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Días de Corte Sugeridos
                      </label>
                      <input
                        type="text"
                        value={plan.billingCycleDaysText}
                        onChange={(e) => setPlan({ ...plan, billingCycleDaysText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                        placeholder="Ej. Día 5 de cada mes"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Lateral: Características & Beneficios Incluidos */}
            <div className="space-y-5">
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Beneficios Incluidos ({plan.features.length})</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {plan.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-800"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Nuevo beneficio..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              {/* Botón de Guardado */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{isSaving ? "Guardando Plan..." : "Guardar Configuración del Plan"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 2: TRANSACCIONES EN VIVO DE PULSE ENDURANCE                   */}
      {/* ========================================================================= */}
      {activeSubTab === "transactions" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Métricas Resumen de Pulse Endurance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Recaudado en Pulse
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-slate-900">
                {formatCOP(pulseMetrics?.financialSummary?.totalGrossCop || 0)}
              </div>
              <span className="text-[10px] text-slate-400 block">
                Comisión BBVA: {formatCOP(pulseMetrics?.financialSummary?.totalFeesCop || 0)}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Neto Liquidable en BBVA
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-emerald-950">
                {formatCOP(pulseMetrics?.financialSummary?.totalNetDisbursementCop || 0)}
              </div>
              <span className="text-[10px] text-emerald-700 block">
                {pulseMetrics?.financialSummary?.nextDisbursementDate || "Miércoles"}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                En Trial (7 Días Gratis)
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-cyan-600">
                {pulseMetrics?.subscriptionPipeline?.activeTrial ?? 0}
              </div>
              <span className="text-[10px] text-slate-400 block">
                Tarjeta registrada hoy ($0)
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Suscripciones Activas
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-emerald-600">
                {pulseMetrics?.subscriptionPipeline?.activePaid ?? 0}
              </div>
              <span className="text-[10px] text-slate-400 block">
                Cobro recurrente mensual activo
              </span>
            </div>
          </div>

          {/* Tabla de Auditoría de Pulse */}
          <div className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs space-y-4 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Libro Mayor de Transacciones • Solo Pulse</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    PULSE_ENDURANCE
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Registro bancario inmutable de cada cargo, alta de prueba o cancelación de tu plataforma deportiva
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por orden o atleta..."
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-56 bg-slate-50"
                  />
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <button
                  type="button"
                  onClick={exportPulseCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>CSV</span>
                </button>

                <Link
                  href="/admin/finsec"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-2xs"
                >
                  <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Consola Holding HQ</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto w-full pt-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Fecha / Hora</th>
                    <th className="py-2.5 px-3">Atleta / Suscriptor</th>
                    <th className="py-2.5 px-3">Order ID Determinista</th>
                    <th className="py-2.5 px-3">Tipo de Operación</th>
                    <th className="py-2.5 px-3 text-right">Bruto</th>
                    <th className="py-2.5 px-3 text-right">Comisión Pasarela</th>
                    <th className="py-2.5 px-3 text-right">Neto a BBVA</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {loadingMetrics ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                        <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-1 text-cyan-600" />
                        <span>Consultando transacciones en vivo...</span>
                      </td>
                    </tr>
                  ) : filteredPulseLedger.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-xs text-slate-400 space-y-1">
                        <div className="font-bold text-slate-700">Sin transacciones registradas aún</div>
                        <p className="text-[11px] text-slate-500">
                          Al registrar una tarjeta de prueba en Sandbox, el asiento contable aparecerá aquí al instante.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPulseLedger.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(tx.timestamp).toLocaleString("es-CO")}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-900 text-xs">
                          <div className="font-bold">{tx.metadata?.customerName || tx.subscriberId}</div>
                          <div className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                            {tx.subscriberId}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-700 font-bold">
                          {tx.orderId}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          {tx.type === "TRIAL_START" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                              <Clock className="h-3 w-3 text-cyan-600" />
                              <span>ALTA TRIAL 7D</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>COBRO MENSUAL</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatCOP(tx.grossAmountCop)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-600">
                          {formatCOP((tx.openpayFeeCop || 0) + (tx.openpayVatCop || 0))}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                          {formatCOP(tx.netAmountCop)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
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
        </div>
      )}
    </div>
  );
};
