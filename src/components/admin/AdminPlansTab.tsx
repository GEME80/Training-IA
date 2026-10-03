"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Sparkles,
  Landmark,
} from "lucide-react";
import { SubscriptionPlanConfig, DEFAULT_SUBSCRIPTION_PLAN } from "@/lib/db/types";
import { useAuth } from "@/context/AuthContext";

interface AdminPlansTabProps {
  showMessage: (text: string, type: "success" | "error") => void;
}

export const AdminPlansTab: React.FC<AdminPlansTabProps> = ({ showMessage }) => {
  const { user, userProfile } = useAuth();
  const requesterUid = user?.uid || userProfile?.uid || "superadmin-root";
  const requesterEmail = user?.email || userProfile?.email || "";

  const [plan, setPlan] = useState<SubscriptionPlanConfig>(DEFAULT_SUBSCRIPTION_PLAN);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [newFeatureText, setNewFeatureText] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/subscription-plan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.plan) setPlan(data.plan);
      })
      .catch((err) => console.warn("Aviso al consultar plan:", err))
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

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
      showMessage("¡Plan único y datos de pago guardados exitosamente!", "success");
      if (data.plan) setPlan(data.plan);
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3">
        <RefreshCw className="h-6 w-6 animate-spin text-cyan-600 mx-auto" />
        <p className="text-xs text-slate-500 font-mono">Cargando configuración de plan & pagos...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <span>Configuración del Plan Único & Pagos por Bre-B (BBVA)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Define características, precio y datos de recaudo interoperable con Llave Bre-B y cuenta BBVA Colombia.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
        </button>
      </div>

      {/* Grid de 2 Columnas: Plan + BBVA / Bre-B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA 1: PLAN ÚNICO */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>1. Definición & Valor del Plan Único</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Oficial del Plan</label>
              <input type="text" value={plan.name} onChange={(e) => setPlan({ ...plan, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-500 outline-none" placeholder="Ej. Plan Élite Pro SGEA" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subtítulo / Propuesta de Valor</label>
              <input type="text" value={plan.tagline} onChange={(e) => setPlan({ ...plan, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-cyan-500 outline-none" placeholder="Ej. Periodización Dinámica y Stryd" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Precio Mensual</label>
                <input type="number" min={0} value={plan.price} onChange={(e) => setPlan({ ...plan, price: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-cyan-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Moneda</label>
                <select value={plan.currency} onChange={(e) => setPlan({ ...plan, currency: e.target.value as "USD" | "COP" | "EUR" })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-500 outline-none cursor-pointer">
                  <option value="USD">USD ($ - Dólares)</option>
                  <option value="COP">COP ($ - Pesos Col)</option>
                  <option value="EUR">EUR (€ - Euros)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fechas de Pago / Días de Corte</label>
              <input type="text" value={plan.billingCycleDaysText} onChange={(e) => setPlan({ ...plan, billingCycleDaysText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-cyan-500 outline-none" placeholder="Ej. Días 1 al 5 de cada mes" />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">Características & Beneficios Incluidos</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveFeature(idx)} className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="text" value={newFeatureText} onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddFeature(); } }}
                  placeholder="Agregar nuevo beneficio..." className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white outline-none" />
                <button type="button" onClick={handleAddFeature} className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: BBVA & BRE-B PAGOS INTEROPERABLES */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
              <Landmark className="h-4 w-4 text-blue-600" />
              <span>2. Cobro por BBVA (vía Bre-B)</span>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-blue-950 cursor-pointer">
              <input type="checkbox" checked={plan.breBEnabled ?? plan.nequiEnabled ?? true}
                onChange={(e) => setPlan({ ...plan, breBEnabled: e.target.checked, nequiEnabled: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
              <span>Habilitar Bre-B</span>
            </label>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Llave Bre-B</label>
                <select value={plan.breBKeyType || "CELULAR"}
                  onChange={(e) => setPlan({ ...plan, breBKeyType: e.target.value as "CELULAR" | "CEDULA" | "CORREO" | "ALFANUMERICA" })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none cursor-pointer">
                  <option value="CELULAR">Celular (Móvil)</option>
                  <option value="CEDULA">Cédula / NIT</option>
                  <option value="CORREO">Correo Electrónico</option>
                  <option value="ALFANUMERICA">Llave Alfanumérica</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Llave Bre-B</label>
                <input type="text" value={plan.breBKey || plan.nequiNumber || ""}
                  onChange={(e) => setPlan({ ...plan, breBKey: e.target.value, nequiNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  placeholder="Ej. 310 123 4567" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titular de la Cuenta</label>
                <input type="text" value={plan.accountHolderName || plan.nequiAccountName || ""}
                  onChange={(e) => setPlan({ ...plan, accountHolderName: e.target.value, nequiAccountName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  placeholder="Ej. Germán Morales" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cédula / NIT Titular</label>
                <input type="text" value={plan.accountDocumentId || plan.nequiDocumentId || ""}
                  onChange={(e) => setPlan({ ...plan, accountDocumentId: e.target.value, nequiDocumentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  placeholder="Ej. CC 1.234.567.890" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Banco</label>
                <input type="text" value={plan.bankName || "BBVA Colombia"} onChange={(e) => setPlan({ ...plan, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none" placeholder="BBVA Colombia" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo Cuenta</label>
                <select value={plan.bankAccountType || "Ahorros"} onChange={(e) => setPlan({ ...plan, bankAccountType: e.target.value as "Ahorros" | "Corriente" })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none cursor-pointer">
                  <option value="Ahorros">Ahorros</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nº Cuenta BBVA</label>
                <input type="text" value={plan.bankAccountNumber || ""} onChange={(e) => setPlan({ ...plan, bankAccountNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none" placeholder="0013-0000-00000000" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-blue-600" />
                <span>URL Imagen QR Bre-B / BBVA</span>
              </label>
              <input type="text" value={plan.qrImageUrl || plan.nequiQrImageUrl || ""}
                onChange={(e) => setPlan({ ...plan, qrImageUrl: e.target.value, nequiQrImageUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                placeholder="https://... o deja vacío para usar QR Bre-B dinámico" />
              <p className="text-[11px] text-slate-500 mt-1">
                Bre-B es interoperable: atletas de cualquier entidad (Bancolombia, Nequi, etc.) pueden pagar con este QR o tu Llave Bre-B.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instrucciones de Pago</label>
              <textarea rows={2} value={plan.paymentInstructions} onChange={(e) => setPlan({ ...plan, paymentInstructions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none resize-none" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
