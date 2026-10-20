"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Lock,
  ArrowRight,
  Loader2,
  ExternalLink,
  Info,
} from "lucide-react";
import { formatMoney } from "@/lib/services/adminBillingService";
import {
  OpenpayByBbvaLogo,
  PciDssCertifiedBadge,
  VisaLogo,
  MastercardLogo,
  AmexLogo,
} from "../billing/PaymentLogos";
import { GmcCardCheckoutModal } from "../billing/GmcCardCheckoutModal";

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
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEndDate?: string | null;
}

export const AthleteSubscriptionTab: React.FC<AthleteSubscriptionTabProps> = ({
  athleteId,
  athleteName,
  email,
  isMasterAdmin = false,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [subDetails, setSubDetails] = useState<SubscriptionDetails | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchStatus = async () => {
    if (!athleteId && !email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const subscriberId = athleteId || email;
      const res = await fetch(
        `/api/billing/openpay/status?subscriberId=${encodeURIComponent(subscriberId)}`
      );
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        const resolution = data.resolution || {};
        const record = data.record || {};

        setSubDetails({
          status: record.status || resolution.status || "ACTIVE",
          hasAccess: Boolean(resolution.hasAccess ?? true),
          daysRemaining: resolution.daysRemaining ?? 30,
          isTrial: Boolean(resolution.isTrial ?? false),
          willCancelAtPeriodEnd: Boolean(
            record.cancelAtPeriodEnd ?? resolution.willCancelAtPeriodEnd ?? false
          ),
          currentPlanCode: record.currentPlanCode || "PULSE_PRO_MONTHLY",
          cardLast4: record.cardLast4 || null,
          cardBrand: record.cardBrand || null,
          currentPeriodStart: record.currentPeriodStart,
          currentPeriodEnd: record.currentPeriodEnd,
          trialEndDate: record.trialEndDate,
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

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo procesar la cancelación.");
      }

      setFeedbackMessage({
        type: "success",
        text: data?.message || "Cancelación programada. Tu acceso sigue activo hasta el corte.",
      });
      setIsCancelConfirmOpen(false);
      await fetchStatus();
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Error al cancelar la suscripción. Intenta nuevamente.",
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

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo reactivar la suscripción.");
      }

      setFeedbackMessage({
        type: "success",
        text: data?.message || "¡Suscripción reactivada con éxito! Tu ciclo continuará normal.",
      });
      await fetchStatus();
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Error al reanudar la suscripción. Intenta nuevamente.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Fin de ciclo actual";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getBrandLogo = (brand?: string | null) => {
    const b = (brand || "").toLowerCase();
    if (b.includes("visa")) return <VisaLogo />;
    if (b.includes("master")) return <MastercardLogo />;
    if (b.includes("amex") || b.includes("american")) return <AmexLogo />;
    return <CreditCard className="h-7 w-7 text-slate-700" />;
  };

  const isCancelScheduled = Boolean(subDetails?.willCancelAtPeriodEnd);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* 1. Header de Sección */}
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

        {/* Mensaje de retroalimentación de operaciones */}
        {feedbackMessage && (
          <div
            className={`mt-3 p-3 rounded-2xl flex items-center gap-2.5 text-xs font-medium ${
              feedbackMessage.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
            }`}
          >
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}
      </div>

      {/* 2. Grid de Información: Plan Actual & Medio de Pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* =========================================================
            TARJETA 1: PLAN ACTIVO & CICLO DE FACTURACIÓN
           ========================================================= */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Plan Actual
              </span>
              <h4 className="text-xl font-black text-slate-950 dark:text-white mt-0.5">
                Pulse Atleta Pro
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Acceso ilimitado a Head Coach IA, Periodización y Telemetría.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xl font-mono font-black text-slate-900 dark:text-white block">
                {formatMoney(50000, "COP")}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Mensual
              </span>
            </div>
          </div>

          {/* Insignia de Estado */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">Estado de la cuenta:</span>
            {isMasterAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Acceso Administrador (Exento)
              </span>
            ) : isCancelScheduled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Cancelación Programada
              </span>
            ) : subDetails?.isTrial ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                Prueba Gratuita ({subDetails.daysRemaining}d restantes)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Suscripción Activa
              </span>
            )}
          </div>

          {/* Fechas de corte / renovación */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {isCancelScheduled ? "Acceso garantizado hasta:" : "Próxima renovación automática:"}
              </span>
              <strong className="font-mono text-slate-950 dark:text-white">
                {formatDate(subDetails?.currentPeriodEnd)}
              </strong>
            </div>

            {isCancelScheduled && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                Tu suscripción <strong>no se renovará</strong>. Conservarás todos tus entrenamientos y acceso completo hasta la fecha indicada sin ningún cobro futuro.
              </p>
            )}
          </div>
        </div>

        {/* =========================================================
            TARJETA 2: MEDIO DE PAGO EN ARCHIVO (OPENPAY BBVA)
           ========================================================= */}
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

            {/* Visualización de la Tarjeta */}
            <div className="mt-4 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 shadow-lg border border-slate-700/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 flex items-center">
                  {getBrandLogo(subDetails?.cardBrand)}
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                  Protegido 3DS
                </span>
              </div>

              <div className="font-mono text-base sm:text-lg tracking-wider font-semibold text-slate-200 my-2">
                •••• •••• •••• {subDetails?.cardLast4 || "4242"}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
                <span className="truncate max-w-[150px] font-medium text-slate-300">
                  {athleteName || "Atleta Pulse"}
                </span>
                <span className="font-mono text-slate-400">
                  {subDetails?.cardBrand?.toUpperCase() || "TARJETA"}
                </span>
              </div>
            </div>
          </div>

          {/* Botón para Actualizar / Cambiar Medio de Pago */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 group"
            >
              <CreditCard className="h-4 w-4" />
              <span>Actualizar / Cambiar Medio de Pago</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <Lock className="h-3 w-3 text-slate-400" />
              <span>Redirección directa y segura a Openpay (BBVA) • PCI-DSS SAQ-A</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          SECCIÓN 3: GESTIÓN DE CANCELACIÓN / REANUDACIÓN
         ========================================================= */}
      <div className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-950 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Política de Cancelación Transparente ("Efecto Netflix")
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
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Reanudar Suscripción</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(true)}
                disabled={actionLoading || isMasterAdmin}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Cancelar Suscripción</span>
              </button>
            )}
          </div>
        </div>

        {/* Garantías de Seguridad y Certificación Bancaria */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PciDssCertifiedBadge />
            <div className="h-5 w-px bg-slate-300 dark:bg-slate-700" />
            <span className="text-[11px] text-slate-500 font-medium">
              Cero responsabilidad sobre datos de tarjeta • Cifrado Bancario BBVA
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">
              ID Suscriptor: {athleteId || email}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL DE CONFIRMACIÓN DE CANCELACIÓN
         ========================================================= */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black">
                  ¿Confirmas la cancelación de tu suscripción?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  No se realizará ningún cobro posterior en tu tarjeta de crédito o débito.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3.5 text-xs text-amber-900 dark:text-amber-300 leading-relaxed font-medium">
              Conservarás acceso completo a tus planes, telemetría y Head Coach IA hasta el <strong>{formatDate(subDetails?.currentPeriodEnd)}</strong>.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Mantener mi plan
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-700/20 transition cursor-pointer flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Sí, cancelar suscripción</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE CHECKOUT OPENPAY BBVA (ACTUALIZAR MEDIO DE PAGO)
         ========================================================= */}
      <GmcCardCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        subscriberId={athleteId || email}
        athleteName={athleteName}
        athleteEmail={email}
        planName="Actualización de Medio de Pago"
        planAmountCop={50000}
        trialDays={0}
      />
    </div>
  );
};
