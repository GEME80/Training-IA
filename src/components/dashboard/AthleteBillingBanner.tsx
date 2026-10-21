"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Sparkles,
  AlertTriangle,
  Award,
  ArrowRight,
} from "lucide-react";
import { GmcCardCheckoutModal } from "../billing/GmcCardCheckoutModal";
import { formatMoney } from "@/lib/services/adminBillingService";
import { useAuth } from "@/context/AuthContext";

interface AthleteBillingBannerProps {
  athleteUid: string;
  athleteEmail?: string;
  athleteName?: string;
  billingStatus?: "PAID" | "PENDING" | "OVERDUE" | "PENDING_VERIFICATION";
  billingExempt?: boolean;
  hasUsedTrial?: boolean;
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
  billingExempt = false,
  hasUsedTrial = false,
  planPrice = 50000,
  planCurrency = "COP",
  billingCycleDay = 5,
  paymentReference,
  onRefresh,
}) => {
  const { userProfile } = useAuth();
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [localStatus, setLocalStatus] = useState<typeof billingStatus>(billingStatus);
  const [gmcResolution, setGmcResolution] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [configuredTrialDays, setConfiguredTrialDays] = useState<number>(7);
  const [configuredPrice, setConfiguredPrice] = useState<number>(planPrice);

  const isExempt = Boolean(billingExempt || userProfile?.billingExempt);
  const userHasConsumedTrial = Boolean(hasUsedTrial || userProfile?.hasUsedTrial);

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
    const effectiveId = athleteUid || userProfile?.intervalsAthleteId || userProfile?.uid;
    if (!effectiveId || isExempt) return;

    const fetchGmcStatus = async () => {
      try {
        const res = await fetch(`/api/billing/openpay/status?subscriberId=${encodeURIComponent(effectiveId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.resolution) {
            setGmcResolution(data.resolution);
            if (data.resolution.hasAccess && data.resolution.status !== "GRACE_PERIOD") {
              setLocalStatus("PAID");
            } else if (!data.resolution.hasAccess) {
              setLocalStatus("PENDING");
            }
          }
        }
      } catch (err) {
        console.warn("[GMC_STATUS_FETCH_WARN]", err);
      }
    };

    fetchGmcStatus();
  }, [athleteUid, userProfile?.intervalsAthleteId, userProfile?.uid, isExempt]);

  const handleCancelSubscription = async () => {
    const effectiveId = athleteUid || userProfile?.intervalsAthleteId || userProfile?.uid;
    if (!confirm("¿Estás seguro de que deseas cancelar tu suscripción? Seguirás teniendo acceso completo hasta el final de tu periodo actual y no se realizará ningún cobro futuro.")) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/billing/openpay/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriberId: effectiveId }),
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
    const effectiveId = athleteUid || userProfile?.intervalsAthleteId || userProfile?.uid;
    setActionLoading(true);
    try {
      const res = await fetch("/api/billing/openpay/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriberId: effectiveId }),
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

  const isGraceDunning = gmcResolution?.status === "GRACE_PERIOD" || localStatus === "OVERDUE";
  const isExistingAthlete = userHasConsumedTrial;

  // Renderizado dinámico del banner según el estado
  let bannerElement = null;

  if (isExempt) {
    // CASO 0: LISTA BLANCA / BECA DEPORTIVA (CORTESÍA)
    bannerElement = (
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-purple-50 border border-purple-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 text-purple-950 font-bold">
          <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
            <Award className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span>Membresía Atleta Élite • Beca Cortesía</span>
            <span className="font-mono text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-black">
              ACCESO TOTAL ACTIVO
            </span>
          </div>
        </div>
        <span className="text-[11px] text-purple-700 font-medium hidden sm:inline">
          Exento de cobro por GM Consulting
        </span>
      </div>
    );
  } else if (isGraceDunning) {
    // CASO 1: FALLO DE COBRO AUTOMÁTICO / DUNNING CON GRACIA
    const hoursRemaining = gmcResolution?.daysRemaining ? gmcResolution.daysRemaining * 24 : 72;
    bannerElement = (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-2 border-rose-300 text-xs shadow-md animate-pulse">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="font-black text-rose-950 text-sm flex items-center gap-2">
              <span>⚠️ Atención: Cobro Fallido de tu Membresía</span>
              <span className="font-mono text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                {hoursRemaining}h de gracia
              </span>
            </div>
            <p className="text-[11px] text-rose-900 font-medium mt-0.5 max-w-xl">
              Tu banco rechazó el cargo mensual de <strong>{formatMoney(configuredPrice, planCurrency)}</strong> (fondos insuficientes o tarjeta declinada). Actualiza tu tarjeta para evitar la interrupción de tus entrenamientos.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCardModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition cursor-pointer shrink-0"
        >
          <CreditCard className="h-4 w-4" />
          <span>Actualizar Tarjeta o Pagar Ahora</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  } else if (gmcResolution?.isTrial && gmcResolution?.hasAccess) {
    // CASO 2: EN PERIODOS DE PRUEBA GRATUITA (TRIAL ACTIVO SIN TARJETA)
    bannerElement = (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border border-emerald-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <span>Prueba Gratuita Activa (Sin Tarjeta)</span>
              <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                {gmcResolution.daysRemaining} {gmcResolution.daysRemaining === 1 ? "día restante" : "días restantes"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              Acceso total ilimitado. Al finalizar tu prueba podrás activar tu membresía de {formatMoney(configuredPrice, planCurrency)} / mes con seguridad bancaria en Openpay BBVA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCardModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer shadow-sm"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Activar Membresía</span>
          </button>
        </div>
      </div>
    );
  } else if (gmcResolution?.willCancelAtPeriodEnd && gmcResolution?.hasAccess) {
    // CASO 3: CANCELACIÓN PROGRAMADA (EFECTO NETFLIX)
    bannerElement = (
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
  } else if (localStatus === "PAID") {
    // CASO 4: SUSCRIPCIÓN ACTIVA AL DÍA -> UX LIMPIA: Sin banner invasivo en el Dashboard
    bannerElement = null;
  } else {
    // CASO 5: ATLETA SIN SUSCRIPCIÓN O PENDIENTE
    bannerElement = (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3 rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/60 shadow-2xs transition-all">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-xs flex items-center gap-1.5 text-slate-950">
              <span>
                {isExistingAthlete
                  ? "Activa tu Membresía Mensual Recurrente"
                  : `Inicia tus ${configuredTrialDays} Días de Prueba Gratis`}
              </span>
              <span className="font-mono font-black text-emerald-800">
                {formatMoney(configuredPrice, planCurrency)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              {isExistingAthlete
                ? "Suscripción automática mensual con tarjeta de crédito o débito a través de Openpay BBVA."
                : `Registra tu tarjeta y entrena ${configuredTrialDays} días sin costo ($0 COP hoy). Cancela cuando quieras.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsCardModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-sm transition cursor-pointer"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>
              {isExistingAthlete
                ? `Pagar con Tarjeta (${formatMoney(configuredPrice, planCurrency)})`
                : configuredTrialDays > 0
                ? `Pagar con Tarjeta (${configuredTrialDays}d Gratis)`
                : "Pagar con Tarjeta"}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {bannerElement}

      {/* Modal Seguro de Tarjeta Openpay BBVA (Siempre montado para evitar que se cierre por re-render) */}
      <GmcCardCheckoutModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        subscriberId={athleteUid || userProfile?.uid || "guest_subscriber"}
        athleteName={athleteName || userProfile?.displayName || "Atleta Pulse"}
        athleteEmail={athleteEmail || userProfile?.email || ""}
        planAmountCop={configuredPrice}
        trialDays={isExistingAthlete ? 0 : configuredTrialDays}
        onSuccess={() => {
          setLocalStatus("PAID");
          if (onRefresh) onRefresh();
          window.location.reload();
        }}
      />
    </>
  );
};
