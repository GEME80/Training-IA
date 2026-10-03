"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  QrCode,
  AlertCircle,
  RefreshCw,
  Send,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { SubscriptionPlanConfig, DEFAULT_SUBSCRIPTION_PLAN } from "@/lib/db/types";
import { formatMoney } from "@/lib/services/adminBillingService";

export interface AthleteBreBPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteUid: string;
  athleteEmail: string;
  athletePrice?: number;
  athleteCurrency?: string;
  onPaymentReported?: (ref: string) => void;
}

export const AthleteBreBPaymentModal: React.FC<AthleteBreBPaymentModalProps> = ({
  isOpen,
  onClose,
  athleteUid,
  athleteEmail,
  athletePrice,
  athleteCurrency,
  onPaymentReported,
}) => {
  const [plan, setPlan] = useState<SubscriptionPlanConfig>(DEFAULT_SUBSCRIPTION_PLAN);
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsSuccess(false);
    setErrorMsg(null);
    setReference("");

    fetch("/api/admin/subscription-plan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.plan) setPlan(data.plan);
      })
      .catch((err) => console.warn("Aviso al consultar plan:", err));
  }, [isOpen]);

  if (!isOpen) return null;

  const effectivePrice = typeof athletePrice === "number" ? athletePrice : plan.price;
  const effectiveCurrency = athleteCurrency || plan.currency;
  const displayKey = plan.breBKey || plan.nequiNumber || "310 123 4567";
  const displayHolder = plan.accountHolderName || plan.nequiAccountName || "Germán Morales";
  const displayBank = plan.bankName || "BBVA Colombia";
  const displayAccountType = plan.bankAccountType || "Ahorros";

  const handleCopyKey = () => {
    navigator.clipboard.writeText(displayKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleReportPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) {
      setErrorMsg("Ingresa el número de comprobante o referencia de pago.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/billing/report-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteUid,
          athleteEmail,
          referenceNumber: reference.trim(),
          amount: effectivePrice,
          currency: effectiveCurrency,
          notes: notes.trim(),
          paymentMethod: "TRANSFER",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar el reporte.");

      setIsSuccess(true);
      if (onPaymentReported) onPaymentReported(reference.trim());
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al reportar pago.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950 tracking-tight">
                Pago por Bre-B (BBVA Colombia)
              </h3>
              <p className="text-xs text-slate-500 font-mono">Transferencia instantánea e interoperable</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-base font-bold text-slate-950">¡Pago Reportado Exitosamente!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Registramos tu referencia <strong>{reference}</strong>. Tu entrenador validará la acreditación y actualizará tu estado en el sistema.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold transition hover:bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Monto a Pagar */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">
                  Valor a Transferir:
                </span>
                <span className="text-2xl font-black text-blue-950 font-mono">
                  {formatMoney(effectivePrice, effectiveCurrency)}
                </span>
              </div>
              <span className="text-xs font-bold text-blue-800 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                Membresía Mensual
              </span>
            </div>

            {/* Código QR o Tarjeta Bre-B */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                <QrCode className="h-4 w-4 text-blue-600" />
                <span>Paga escaneando el QR con cualquier App bancaria</span>
              </div>

              {plan.qrImageUrl || plan.nequiQrImageUrl ? (
                <div className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                  <img
                    src={plan.qrImageUrl || plan.nequiQrImageUrl}
                    alt="Código QR Bre-B BBVA"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto bg-gradient-to-tr from-slate-950 via-blue-950 to-cyan-700 p-4 rounded-2xl shadow-md flex flex-col items-center justify-center text-white space-y-2">
                  <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                    <QrCode className="h-10 w-10 text-white" />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-cyan-400/20 text-cyan-200 px-2 py-0.5 rounded-full border border-cyan-400/30">
                    BRE-B • INTEROPERABLE
                  </span>
                  <span className="text-xs font-mono font-black">{displayKey}</span>
                  <span className="text-[10px] text-slate-300 font-medium">{displayBank}</span>
                </div>
              )}

              {/* Datos de Transferencia con Copiar Llave */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-left min-w-0">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      Llave Bre-B ({plan.breBKeyType || "CELULAR"})
                    </span>
                    <span className="text-sm font-black font-mono text-slate-900 tracking-wider truncate block">
                      {displayKey}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition cursor-pointer shrink-0"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{isCopied ? "¡Copiada!" : "Copiar Llave"}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-1 text-left">
                  <span><strong>Titular:</strong> {displayHolder}</span>
                  <span><strong>Banco:</strong> {displayBank}</span>
                  {plan.bankAccountNumber && (
                    <span><strong>Cuenta {displayAccountType}:</strong> {plan.bankAccountNumber}</span>
                  )}
                </div>
              </div>

              {/* Nota de interoperabilidad */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-blue-50/50 p-2 rounded-xl text-left border border-blue-100">
                <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Bre-B es 100% interoperable:</strong> transfiere desde Nequi, Bancolombia, Daviplata o cualquier banco colombiano sin costo.
                </span>
              </div>
            </div>

            {/* Formulario de Reporte de Pago */}
            <form onSubmit={handleReportPayment} className="space-y-3 pt-1">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Número de Comprobante / Referencia de Pago
                </label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ej. B12345678 o # de aprobación BBVA/Bre-B"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nota o Comentario (Opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Transferencia Bre-B desde Bancolombia"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>{isSubmitting ? "Enviando..." : "Reportar Pago"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
