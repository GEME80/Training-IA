"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, X } from "lucide-react";
import { PciDssCertifiedBadge } from "../billing/PaymentLogos";
import { GmcCardCheckoutModal } from "../billing/GmcCardCheckoutModal";
import { CancelConfirmModal } from "./CancelConfirmModal";
import { PaymentMethodCard } from "./PaymentMethodCard";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";

interface AthleteSubscriptionTabProps {
  athleteId: string;
  athleteName: string;
  email: string;
  isMasterAdmin?: boolean;
}

interface SubscriptionDetails {
  status: string;
  hasAccess: boolean;
  daysRemaining: number;
  isTrial: boolean;
  willCancelAtPeriodEnd: boolean;
  currentPlanCode: string;
  cardLast4?: string | null;
  cardBrand?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  trialEndDate?: string | null;
  hasActiveSubscription?: boolean;
}

export const AthleteSubscriptionTab: React.FC<AthleteSubscriptionTabProps> = ({
  athleteId,
  athleteName,
  email,
  isMasterAdmin = false,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [subDetails, setSubDetails] = useState<SubscriptionDetails | null>(null);
  const [planPrice, setPlanPrice] = useState<number>(55000);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("pulse_payment_notice");
      if (stored) {
        setFeedbackMessage({ type: "success", text: stored });
        sessionStorage.removeItem("pulse_payment_notice");
      }
    } catch {}

    fetch("/api/admin/subscription-plan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.plan?.price) setPlanPrice(data.plan.price);
      })
      .catch(() => {});
  }, []);

  const fetchStatus = async () => {
    const subscriberId = athleteId || email;
    if (!subscriberId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/billing/openpay/status?subscriberId=${encodeURIComponent(subscriberId)}`);
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        const resolution = data.resolution || {};
        const record = data.record || {};

        const isCancelScheduledFromData = Boolean(
          record.cancelAtPeriodEnd ??
          resolution.willCancelAtPeriodEnd ??
          (record.status === "CANCEL_SCHEDULED" || resolution.status === "CANCEL_SCHEDULED")
        );

        setSubDetails({
          status: isCancelScheduledFromData ? "CANCEL_SCHEDULED" : (record.status || resolution.status || "INACTIVE"),
          hasAccess: Boolean(resolution.hasAccess ?? false),
          daysRemaining: resolution.daysRemaining ?? 0,
          isTrial: Boolean(resolution.isTrial ?? false),
          willCancelAtPeriodEnd: isCancelScheduledFromData,
          currentPlanCode: record.currentPlanCode || "PULSE_PRO_MONTHLY",
          cardLast4: record.cardLast4 || null,
          cardBrand: record.cardBrand || null,
          currentPeriodStart: record.currentPeriodStart,
          currentPeriodEnd: record.currentPeriodEnd,
          trialEndDate: record.trialEndDate,
          hasActiveSubscription: Boolean(record.hasActiveSubscription),
        });
      }
    } catch (err) {
      console.error("[SUBSCRIPTION_TAB_FETCH_ERROR]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [athleteId, email]);

  const handleCancelSubscription = async () => {
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const subscriberId = athleteId || email;
      const res = await fetch("/api/billing/openpay/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriberId }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) throw new Error(data?.error || "No se pudo procesar la cancelación.");

      setFeedbackMessage({
        type: "success",
        text: data?.message || "Cancelación programada. Tu acceso sigue activo hasta el corte.",
      });
      setIsCancelConfirmOpen(false);
      setSubDetails((prev) => (prev ? { ...prev, status: "CANCEL_SCHEDULED", willCancelAtPeriodEnd: true } : null));
      await fetchStatus();
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err?.message || "Ocurrió un error al cancelar la suscripción.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const subscriberId = athleteId || email;
      const res = await fetch("/api/billing/openpay/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriberId }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) throw new Error(data?.error || "No se pudo reanudar la suscripción.");

      setFeedbackMessage({
        type: "success",
        text: data?.message || "¡Suscripción reactivada con éxito! Tu ciclo continuará normal.",
      });
      setSubDetails((prev) => (prev ? { ...prev, status: "ACTIVE", willCancelAtPeriodEnd: false } : null));
      await fetchStatus();
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err?.message || "Ocurrió un error al reanudar la suscripción.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return isActive ? "Al finalizar el ciclo" : "Sin renovación programada";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const isCancelScheduled = Boolean(
    subDetails?.willCancelAtPeriodEnd || subDetails?.status === "CANCEL_SCHEDULED"
  );
  const isActive = Boolean(subDetails?.status === "ACTIVE" && !isCancelScheduled);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Suscripción & Medios de Pago
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gestiona tu membresía, actualiza tu tarjeta en Openpay (BBVA) o administra tu ciclo de cobro.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar estado</span>
          </button>
        </div>

        {feedbackMessage && (
          <div
            className={`mt-3 p-3 rounded-2xl flex items-center justify-between gap-2.5 text-xs font-medium ${
              feedbackMessage.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {feedbackMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span className="truncate">{feedbackMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition shrink-0 cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Grid: Plan y Medio de Pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SubscriptionPlanCard
          planPrice={planPrice}
          isMasterAdmin={isMasterAdmin}
          isCancelScheduled={isCancelScheduled}
          isTrial={Boolean(subDetails?.isTrial)}
          isActive={isActive}
          daysRemaining={subDetails?.daysRemaining ?? 0}
          currentPeriodEnd={subDetails?.currentPeriodEnd}
          formatDate={formatDate}
        />

        <PaymentMethodCard
          cardLast4={subDetails?.cardLast4}
          cardBrand={subDetails?.cardBrand}
          athleteName={athleteName}
          onOpenCheckout={() => setIsCheckoutModalOpen(true)}
        />
      </div>

      {/* Sección Gestión de Cancelación / Reanudación */}
      <div className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-950 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Política de Cancelación del Plan
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              En Pulse no existen cláusulas de permanencia ni penalizaciones. Puedes cancelar o reanudar tu membresía en cualquier momento con un solo clic. Si cancelas, mantendrás acceso completo hasta el último segundo de tu periodo pagado.
            </p>
          </div>

          <div className="shrink-0">
            {isCancelScheduled ? (
              <button
                type="button"
                onClick={handleResumeSubscription}
                disabled={actionLoading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${actionLoading ? "animate-spin" : ""}`} />
                <span>Reanudar Suscripción</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(true)}
                disabled={actionLoading || isMasterAdmin || !subDetails?.hasActiveSubscription}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <span>Cancelar Suscripción</span>
              </button>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PciDssCertifiedBadge />
            <div className="h-5 w-px bg-slate-300 dark:bg-slate-700" />
            <span className="text-[11px] text-slate-500 font-medium">
              Cero responsabilidad sobre datos de tarjeta • Cifrado Bancario BBVA
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">ID: {athleteId || email}</span>
        </div>
      </div>

      <CancelConfirmModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancelSubscription}
        isLoading={actionLoading}
        currentPeriodEnd={subDetails?.currentPeriodEnd || undefined}
        formatDate={formatDate}
      />

      <GmcCardCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        subscriberId={athleteId || email}
        athleteName={athleteName}
        athleteEmail={email}
        planName="Actualización de Medio de Pago"
        planAmountCop={planPrice}
        trialDays={0}
      />
    </div>
  );
};
