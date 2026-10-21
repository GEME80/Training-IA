"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { OpenpayByBbvaLogo, VisaLogo, MastercardLogo, AmexLogo } from "./PaymentLogos";
import { formatMoney } from "@/lib/services/adminBillingService";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardBrand?: string | null;
  cardLast4?: string | null;
  planName?: string;
  planPrice?: number;
  transactionId?: string | null;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  cardBrand = "visa",
  cardLast4 = "1111",
  planName = "Pulse Atleta Pro",
  planPrice = 55000,
  transactionId,
}) => {
  if (!isOpen) return null;

  const brandLower = (cardBrand || "visa").toLowerCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white space-y-6 text-center">
        {/* Glow & Badge de Éxito */}
        <div className="relative mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-inner">
          <CheckCircle2 className="w-12 h-12 animate-in zoom-in-75 duration-300" />
          <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Titular */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            ¡Pago Confirmado por Openpay!
          </span>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            Membresía Activada
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tu plan <strong className="text-slate-900 dark:text-white">{planName}</strong> ha sido activado exitosamente. Ya tienes acceso completo a todas las funciones.
          </p>
        </div>

        {/* Tarjeta Informativa de Resumen */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-4 text-left space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500">Monto Facturado</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {formatMoney(planPrice)} COP <span className="text-[10px] text-slate-400 font-normal">/ mes</span>
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500">Medio Registrado</span>
            <div className="flex items-center gap-2">
              {brandLower.includes("master") ? (
                <MastercardLogo className="h-4" />
              ) : brandLower.includes("amex") ? (
                <AmexLogo className="h-4" />
              ) : (
                <VisaLogo className="h-4" />
              )}
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                •••• {cardLast4 || "1111"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Estado de Membresía</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Activa (30 días)
            </span>
          </div>

          {transactionId && (
            <div className="pt-1 text-[10px] text-slate-400 font-mono truncate">
              Ref: {transactionId}
            </div>
          )}
        </div>

        {/* Pasarela y Garantía */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Procesado por <strong>Openpay by BBVA</strong> • PCI-DSS SAQ-A</span>
        </div>

        {/* Botón de Acción Principal */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-sm shadow-lg shadow-emerald-700/25 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Ir a mi Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
