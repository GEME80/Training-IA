"use client";

import React, { useState, useEffect } from "react";
import { Landmark, CheckCircle2, Clock, AlertCircle, CreditCard, Sparkles, RefreshCw, XCircle } from "lucide-react";
import { AthleteBreBPaymentModal } from "./AthleteBreBPaymentModal";
import { GmcCardCheckoutModal } from "../billing/GmcCardCheckoutModal";
import { formatMoney } from "@/lib/services/adminBillingService";

interface AthleteBillingBannerProps {
  athleteUid: string;
  athleteEmail?: string;
  athleteName?: string;
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
  athleteName,
  billingStatus = "PENDING",
  planPrice = 99000,
  planCurrency = "COP",
  billingCycleDay = 5,
  paymentReference,
  onRefresh,
}) => {
  const [isBreBModalOpen, setIsBreBModalOpen] = useState<boolean>(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [localStatus, setLocalStatus] = useState<typeof billingStatus>(billingStatus);
  const [localRef, setLocalRef] = useState<string | undefined>(paymentReference);
  const [gmcResolution, setGmcResolution] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [configuredTrialDays, setConfiguredTrialDays] = useState<number>(7);
  const [configuredPrice, setConfiguredPrice] = useState<number>(planPrice);

  // Consultar configuración del plan para obtener trialDays y precio actualizados
  useEffect(() => {
    fetch("/api/admin/subscription-plan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.plan) {
          if (typeof data.plan.trialDays === "number") {
            setConfiguredTrialDays(data.plan.trialDays);
          }
          if (typeof data.plan.price === "number") {
            setConfiguredPrice(data.plan.price);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Consultar estado en vivo del GMC Billing Engine ("Efecto Netflix")
  useEffect(() => {
    if (!athleteUid) return;

    const fetchGmcStatus = async () => {
      try {
        const res = await fetch(`/api/billing/openpay/status?subscriberId=${athleteUid}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.resolution) {
            setGmcResolution(data.resolution);
            if (data.resolution.hasAccess) {
              setLocalStatus("PAID");
            }
          }
        }
      } catch (err) {
        console.warn("[GMC_STATUS_FETCH_WARN]", err);
      }
    };

    fetchGmcStatus();
  }, [athleteUid]);

  const handlePaymentReported = (ref: string) => {
    setLocalStatus("PENDING_VERIFICATION");
    setLocalRef(ref);
    if (onRefresh) onRefresh();
  };

  const handleCancelSubscription = async () => {
    if (!confirm("¿Estás seguro de que deseas cancelar tu suscripción? Seguirás teniendo acceso completo hasta el final de tu periodo actual y no se realizará ningún cobro futuro.")) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/billing/openpay/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriberId: athleteUid }),
      });
      if (res.ok) {
        alert("Suscripción cancelada. Conservarás tu acceso hasta el vencimiento de tu periodo actual.");
        window.location.reload();
      }
    } catch {
      alert("Error al comunicarse con el servidor.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/billing/openpay/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriberId: athleteUid }),
      });
      if (res.ok) {
        alert("¡Suscripción reanudada con éxito! Tu plan continuará activo.");
        window.location.reload();
      }
    } catch {
      alert("Error al comunicarse con el servidor.");
    } finally {
      setActionLoading(false);
    }
  };

  // CASO 1: EN PERIODOS DE PRUEBA GRATUITA (TRIAL 7 DÍAS)
  if (gmcResolution?.isTrial && gmcResolution?.hasAccess) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border border-emerald-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <span>Periodo de Prueba Gratuita</span>
              <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                {gmcResolution.daysRemaining} {gmcResolution.daysRemaining === 1 ? "día restante" : "días restantes"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              Tarjeta registrada. Tu primer cobro automático se realizará al finalizar los 7 días.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={actionLoading}
          onClick={handleCancelSubscription}
          className="text-[11px] text-slate-500 hover:text-rose-600 underline cursor-pointer shrink-0"
        >
          Cancelar suscripción
        </button>
      </div>
    );
  }

  // CASO 2: CANCELACIÓN PROGRAMADA (EFECTO NETFLIX)
  if (gmcResolution?.willCancelAtPeriodEnd && gmcResolution?.hasAccess) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <span>Suscripción Cancelada (No se renovará)</span>
              <span className="font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                {gmcResolution.daysRemaining} días de acceso restantes
              </span>
            </div>
            <p className="text-[11px] text-amber-800 font-normal">
              No se realizarán cobros futuros. Tu acceso vencerá al final del ciclo.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={actionLoading}
          onClick={handleResumeSubscription}
          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
        >
          Reanudar mi Suscripción
        </button>
      </div>
    );
  }

  // CASO 3: SUSCRIPCIÓN ACTIVA REGULAR
  if (localStatus === "PAID") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
        <div className="flex items-center gap-2 text-emerald-900 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Membresía Al Día</span>
          <span className="text-[11px] text-emerald-700 font-mono font-medium">({formatMoney(planPrice, planCurrency)} / mes)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-emerald-700 font-mono">Día de corte: {billingCycleDay}</span>
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleCancelSubscription}
            className="text-[10px] text-slate-400 hover:text-rose-600 underline cursor-pointer"
          >
            Cancelar renovación
          </button>
        </div>
      </div>
    );
  }

  // CASO 4: PAGO REPORTADO MANUALMENTE POR BRE-B
  if (localStatus === "PENDING_VERIFICATION") {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-blue-950 font-bold">
          <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
          <span>Pago Reportado (Bre-B / BBVA)</span>
          {localRef && <span className="font-mono text-[11px] text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">Ref: {localRef}</span>}
        </div>
        <span className="text-[11px] text-blue-700 font-medium">Validación en curso por tu entrenador</span>
      </div>
    );
  }

  // CASO 5: PENDIENTE O MORA (Ofrecer Riel Dual: Tarjeta Openpay con 7 Días Gratis vs Bre-B Manual)
  const isOverdue = localStatus === "OVERDUE";

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3 rounded-2xl border shadow-2xs transition-all ${
          isOverdue
            ? "bg-rose-50/90 border-rose-200 text-rose-950"
            : "bg-gradient-to-r from-blue-50/80 via-white to-emerald-50/50 border-blue-200/90 text-blue-950"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl shrink-0 ${isOverdue ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
            {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-bold text-xs flex items-center gap-1.5">
              <span>{isOverdue ? "Membresía Mensual en Mora" : "Inicia tus 7 Días de Prueba Gratis"}</span>
              <span className="font-mono font-black text-emerald-800">{formatMoney(planPrice, planCurrency)}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              {isOverdue
                ? "Tu suscripción requiere regularización para evitar el bloqueo del servicio."
                : "Registra tu tarjeta y entrena 7 días sin costo. O paga manualmente vía transferencia."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsCardModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>
              {configuredTrialDays > 0
                ? `Pagar con Tarjeta (${configuredTrialDays}d Gratis)`
                : "Pagar con Tarjeta"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsBreBModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
          >
            <Landmark className="h-3.5 w-3.5 text-blue-600" />
            <span>Bre-B / BBVA</span>
          </button>
        </div>
      </div>

      {/* Modal de Tarjeta Openpay BBVA */}
      <GmcCardCheckoutModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        subscriberId={athleteUid}
        athleteName={athleteName || "Atleta Pulse"}
        athleteEmail={athleteEmail || ""}
        planAmountCop={configuredPrice}
        trialDays={configuredTrialDays}
        onSuccess={() => {
          setLocalStatus("PAID");
          if (onRefresh) onRefresh();
        }}
      />

      {/* Modal Bre-B Transferencia Manual */}
      <AthleteBreBPaymentModal
        isOpen={isBreBModalOpen}
        onClose={() => setIsBreBModalOpen(false)}
        athleteUid={athleteUid}
        athleteEmail={athleteEmail || ""}
        athletePrice={planPrice}
        athleteCurrency={planCurrency}
        onPaymentReported={handlePaymentReported}
      />
    </>
  );
};
