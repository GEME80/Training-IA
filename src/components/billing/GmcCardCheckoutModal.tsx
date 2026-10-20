"use client";

import React, { useState } from "react";
import { X, Lock, ExternalLink, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { formatMoney } from "@/lib/services/adminBillingService";
import {
  OpenpayByBbvaLogo,
  PciDssCertifiedBadge,
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  PseLogo,
} from "./PaymentLogos";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-900 space-y-6 max-h-[95vh] overflow-y-auto">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* =========================================================
            ENCABEZADO CON LOGOS OFICIALES (OPENPAY BBVA + PCI DSS)
           ========================================================= */}
        <div className="text-center space-y-3 pt-1">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <OpenpayByBbvaLogo />
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <PciDssCertifiedBadge />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">
              Checkout Seguro Openpay
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pasarela de pagos oficial de <strong>BBVA Colombia</strong> • Cumplimiento PCI-DSS SAQ-A
            </p>
          </div>
        </div>

        {/* =========================================================
            RESUMEN DEL PLAN CON ALTO CONTRASTE (BLANCO / SLATE)
           ========================================================= */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-4 sm:p-5 space-y-3.5">
          <div className="flex items-baseline justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <span className="font-extrabold text-slate-950 text-base block">
                {planName}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Suscripción mensual de rendimiento atlético
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono font-black text-emerald-700 text-xl tracking-tight block">
                {formatMoney(planAmountCop, "COP")}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                Facturación mensual
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
              <span className="font-medium text-slate-800">
                Acceso total a <strong>IA Fisiológica, Métricas Stryd y Head Coach 24/7</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
              <span className="font-medium text-slate-800">
                Sincronización en vivo bidireccional con <strong>Intervals.icu, Garmin y Coros</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
              <span className="font-medium text-slate-800">
                Sin contratos ni permanencia • Cancela con 1 clic desde tu perfil
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            GARANTÍA DE SEGURIDAD PCI (EXENCIÓN TOTAL EN PULSE)
           ========================================================= */}
        <div className="rounded-2xl bg-blue-50/80 border border-blue-200/90 p-3.5 flex items-start gap-3 text-xs text-blue-950">
          <div className="p-1.5 rounded-xl bg-blue-100 text-blue-700 shrink-0 mt-0.5">
            <Lock className="h-4 w-4" />
          </div>
          <p className="text-[11px] leading-relaxed text-blue-900 font-medium">
            Al presionar el botón serás transferido a los servidores bancarios de <strong>Openpay (BBVA)</strong>. Tus datos de tarjeta <strong>jamás tocan los servidores de Pulse</strong>, garantizando autenticación bancaria <strong>3D Secure</strong> y cero riesgo de clonación.
          </p>
        </div>

        {/* Mensaje de Error Amigable si ocurre */}
        {errorMessage && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-xs text-rose-900">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* =========================================================
            BOTÓN PRINCIPAL DE REDIRECCIÓN A OPENPAY BBVA
           ========================================================= */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleProceedToOpenpay}
            disabled={loading}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-base shadow-lg shadow-emerald-700/25 transition cursor-pointer flex items-center justify-center gap-2.5 group active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-white" />
                <span>Conectando con Openpay BBVA...</span>
              </>
            ) : (
              <>
                <span>Continuar a Openpay (BBVA)</span>
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </>
            )}
          </button>

          {/* Insignias Oficiales de Medios de Pago */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-[10px] text-slate-500 font-medium">
              Acepta Tarjetas Débito, Crédito y Pagos en Línea
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5">
              <div className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 flex items-center">
                <VisaLogo className="h-3 w-8" />
              </div>
              <div className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 flex items-center">
                <MastercardLogo className="h-4 w-6" />
              </div>
              <AmexLogo className="h-5" />
              <PseLogo className="h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
