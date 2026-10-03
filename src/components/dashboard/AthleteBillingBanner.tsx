"use client";

import React, { useState } from "react";
import { Smartphone, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { AthleteNequiPaymentModal } from "./AthleteNequiPaymentModal";
import { formatMoney } from "@/lib/services/adminBillingService";

interface AthleteBillingBannerProps {
  athleteUid: string;
  athleteEmail?: string;
  billingStatus?: "PAID" | "PENDING" | "OVERDUE" | "PENDING_VERIFICATION";
  planPrice?: number;
  planCurrency?: string;
  billingCycleDay?: number;
  paymentReference?: string;
  onRefresh?: () => void;
}

export const AthleteBillingBanner: React.FC<AthleteBillingBannerProps> = ({
  athleteUid,
  athleteEmail,
  billingStatus = "PENDING",
  planPrice = 80,
  planCurrency = "USD",
  billingCycleDay = 5,
  paymentReference,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [localStatus, setLocalStatus] = useState<typeof billingStatus>(billingStatus);
  const [localRef, setLocalRef] = useState<string | undefined>(paymentReference);

  const handlePaymentReported = (ref: string) => {
    setLocalStatus("PENDING_VERIFICATION");
    setLocalRef(ref);
    if (onRefresh) onRefresh();
  };

  if (localStatus === "PAID") {
    return (
      <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
        <div className="flex items-center gap-2 text-emerald-900 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Membresía Al Día</span>
          <span className="text-[11px] text-emerald-700 font-mono font-medium">({formatMoney(planPrice, planCurrency)} / mes)</span>
        </div>
        <span className="text-[10px] text-emerald-700 font-mono">Día de corte: {billingCycleDay}</span>
      </div>
    );
  }

  if (localStatus === "PENDING_VERIFICATION") {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-purple-950 font-bold">
          <Clock className="h-4 w-4 text-purple-600 animate-pulse" />
          <span>Pago Reportado por Nequi</span>
          {localRef && <span className="font-mono text-[11px] text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">Ref: {localRef}</span>}
        </div>
        <span className="text-[11px] text-purple-700 font-medium">Validación en curso por tu entrenador</span>
      </div>
    );
  }

  // PENDING u OVERDUE
  const isOverdue = localStatus === "OVERDUE";

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:px-4 sm:py-3 rounded-2xl border shadow-2xs transition-all ${
          isOverdue
            ? "bg-rose-50/90 border-rose-200 text-rose-950"
            : "bg-gradient-to-r from-purple-50/80 via-white to-purple-50/50 border-purple-200/90 text-purple-950"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl shrink-0 ${isOverdue ? "bg-rose-100 text-rose-700" : "bg-purple-100 text-purple-700"}`}>
            {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-bold text-xs flex items-center gap-1.5">
              <span>{isOverdue ? "Membresía Mensual en Mora" : "Cuota de Membresía del Mes"}</span>
              <span className="font-mono font-black">{formatMoney(planPrice, planCurrency)}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              {isOverdue ? "Tu suscripción requiere regularización." : `Corte sugerido: Día ${billingCycleDay} de cada mes.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>Pagar con Nequi</span>
        </button>
      </div>

      <AthleteNequiPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        athleteUid={athleteUid}
        athleteEmail={athleteEmail || ""}
        athletePrice={planPrice}
        athleteCurrency={planCurrency}
        onPaymentReported={handlePaymentReported}
      />
    </>
  );
};
