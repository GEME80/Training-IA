"use client";

import React, { useState } from "react";
import { X, ShieldCheck, Lock, ExternalLink, Loader2, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { formatMoney } from "@/lib/services/adminBillingService";

interface GmcCardCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriberId: string;
  athleteName: string;
  athleteEmail: string;
  planName?: string;
  planAmountCop?: number;
  trialDays?: number;
  onSuccess?: (details: any) => void;
}

export const GmcCardCheckoutModal: React.FC<GmcCardCheckoutModalProps> = ({
  isOpen,
  onClose,
  subscriberId,
  athleteName,
  athleteEmail,
  planName = "Plan Atleta Pro",
  planAmountCop = 50000,
  trialDays = 7,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProceedToOpenpay = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/billing/openpay/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriberId,
          athleteName: athleteName || "Atleta Pulse",
          athleteEmail,
          planCode: "PULSE_PRO_MONTHLY",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.checkoutUrl) {
        throw new Error(data?.error || "No se pudo generar la sesión de pago con Openpay BBVA.");
      }

      // Redirección inmediata al portal bancario seguro de Openpay (BBVA)
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error("[CHECKOUT_REDIRECT_ERROR]", err);
      setErrorMessage(err.message || "Error al conectar con la pasarela bancaria. Intenta nuevamente.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 text-white space-y-5">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Encabezado con Insignia de Seguridad Bancaria */}
        <div className="text-center space-y-2 pt-1">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Checkout Seguro Openpay
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Pasarela bancaria oficial de BBVA Colombia • Cumplimiento PCI-DSS SAQ-A
          </p>
        </div>

        {/* Resumen del Plan */}
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">{planName}</span>
            <span className="font-mono font-bold text-white text-sm">
              {formatMoney(planAmountCop, "COP")} / mes
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Acceso total ilimitado a IA Fisiológica y Head Coach</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Sincronización en vivo con Intervals.icu y Garmin</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Cancela cuando quieras con 1 clic desde tu panel</span>
            </div>
          </div>
        </div>

        {/* Garantía de Seguridad PCI */}
        <div className="rounded-xl bg-blue-950/30 border border-blue-800/40 p-3 flex items-start gap-2.5 text-xs text-blue-200">
          <Lock className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-blue-300">
            Serás transferido al portal bancario de <strong>Openpay (BBVA)</strong>. Tus datos financieros jamás tocan los servidores de Pulse, garantizando 100% de protección y autenticación 3D Secure.
          </p>
        </div>

        {/* Mensaje de Error si ocurre */}
        {errorMessage && (
          <div className="rounded-xl bg-rose-950/40 border border-rose-800/60 p-3 flex items-start gap-2 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-[11px]">{errorMessage}</p>
          </div>
        )}

        {/* Botón de Acción Principal: Redirección a Openpay BBVA */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleProceedToOpenpay}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-950 transition cursor-pointer flex items-center justify-center gap-2 group active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Conectando con Openpay BBVA...</span>
              </>
            ) : (
              <>
                <span>Continuar a Openpay (BBVA)</span>
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <span className="block text-center text-[10px] text-slate-500 font-mono">
            Acepta Tarjetas Visa, Mastercard, American Express y PSE
          </span>
        </div>
      </div>
    </div>
  );
};
