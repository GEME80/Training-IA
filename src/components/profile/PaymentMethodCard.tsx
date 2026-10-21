"use client";

import React from "react";
import { CreditCard, Lock, ArrowRight, Loader2 } from "lucide-react";
import {
  OpenpayByBbvaLogo,
  VisaLogo,
  MastercardLogo,
  AmexLogo,
} from "../billing/PaymentLogos";

interface PaymentMethodCardProps {
  cardLast4?: string | null;
  cardBrand?: string | null;
  athleteName: string;
  onOpenCheckout: () => void;
  isLoading?: boolean;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  cardLast4,
  cardBrand,
  athleteName,
  onOpenCheckout,
  isLoading = false,
}) => {
  const getBrandLogo = (brand?: string | null) => {
    const b = (brand || "").toLowerCase();
    if (b.includes("visa")) return <VisaLogo />;
    if (b.includes("master")) return <MastercardLogo />;
    if (b.includes("amex") || b.includes("american")) return <AmexLogo />;
    return <CreditCard className="h-7 w-7 text-slate-700" />;
  };

  const hasCard = Boolean(cardLast4);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Método de Pago
            </span>
            <h4 className="text-lg font-black text-slate-950 dark:text-white mt-0.5">
              Tarjeta Registrada
            </h4>
          </div>
          <OpenpayByBbvaLogo />
        </div>

        {hasCard ? (
          <div className="mt-4 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 shadow-lg border border-slate-700/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 flex items-center">{getBrandLogo(cardBrand)}</div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                Protegido 3DS
              </span>
            </div>
            <div className="font-mono text-base sm:text-lg tracking-wider font-semibold text-slate-200 my-2">
              •••• •••• •••• {cardLast4}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
              <span className="truncate max-w-[150px] font-medium text-slate-300">
                {athleteName || "Atleta Pulse"}
              </span>
              <span className="font-mono text-slate-400">
                {cardBrand?.toUpperCase() || "VISA"}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 text-center space-y-2">
            <CreditCard className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No hay tarjeta registrada
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Registra tu tarjeta en Openpay BBVA para activar tu suscripción mensual.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={onOpenCheckout}
          className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-75 disabled:cursor-wait"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Conectando con Openpay BBVA...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              <span>{hasCard ? "Actualizar / Cambiar Medio de Pago" : "Registrar Tarjeta y Activar Plan"}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
          <Lock className="h-3 w-3 text-slate-400" />
          <span>Redirección directa y segura a Openpay (BBVA) • PCI-DSS SAQ-A</span>
        </div>
      </div>
    </div>
  );
};
