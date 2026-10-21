"use client";

import React, { useState, useEffect } from "react";
import { PulseLogo } from "@/components/PulseLogo";
import { Lock, CreditCard, LogOut, Sparkles, Check, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatMoney } from "@/lib/services/adminBillingService";
import { redirectToOpenpayCheckout } from "@/lib/services/openpayClient";

interface GmcPaywallLockViewProps {
  reason?: string;
  onRefresh?: () => void;
}

export const GmcPaywallLockView: React.FC<GmcPaywallLockViewProps> = ({
  reason = "Tu cuenta requiere una membresía activa para continuar accediendo a tus entrenamientos, análisis de IA y métricas fisiológicas.",
}) => {
  const { user, userProfile, signOutUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [planPrice, setPlanPrice] = useState<number>(55000);

  useEffect(() => {
    fetch("/api/admin/subscription-plan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.plan?.price) {
          setPlanPrice(data.plan.price);
        }
      })
      .catch(() => {});
  }, []);

  const athleteUid = userProfile?.intervalsAthleteId || user?.uid || userProfile?.uid || "";
  const athleteName = userProfile?.displayName || user?.displayName || "Atleta Pulse";
  const athleteEmail = user?.email || userProfile?.email || "";

  const handleProceedToOpenpay = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await redirectToOpenpayCheckout({
        subscriberId: athleteUid,
        athleteName,
        athleteEmail,
        planCode: "PULSE_PRO_MONTHLY",
      });
    } catch (err: any) {
      console.error("[PAYWALL_CHECKOUT_ERROR]", err);
      setErrorMessage(err?.message || "Error al conectar con Openpay BBVA. Intenta nuevamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between font-sans">
      {/* Header Seguro */}
      <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <PulseLogo size="md" showSubtext={true} />
          <button
            type="button"
            onClick={signOutUser}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Cuerpo Central del Paywall */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-xl w-full rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-9 text-center space-y-6">
          {/* Ícono de Candado Animado */}
          <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="h-8 w-8 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Continúa tu Entrenamiento con Pulse Pro
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
              {reason}
            </p>
          </div>

          {/* Beneficios Incluidos */}
          <div className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800/80 text-left space-y-2.5 text-xs text-slate-300">
            <div className="font-bold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Tu Membresía Atleta Pro incluye:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Sincronización en vivo con Intervals.icu, Garmin y Coros</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Generación de macrociclos y planes con IA Fisiológica</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Supervisión y feedback continuo de tu Head Coach Digital</span>
              </li>
            </ul>
          </div>

          {/* Acción Principal: Redirección Directa a Openpay BBVA */}
          <div className="pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleProceedToOpenpay}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-950 transition cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 group disabled:opacity-75 disabled:cursor-wait"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Conectando con Openpay BBVA...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 shrink-0" />
                  <span>Activar Membresía con Openpay BBVA ({formatMoney(planPrice, "COP")})</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            {errorMessage && (
              <p className="text-xs text-rose-400 mt-2 font-medium">{errorMessage}</p>
            )}
            <span className="block text-[11px] text-slate-400 mt-2 font-mono">
              Redirección directa a pasarela bancaria oficial de BBVA • Cifrado PCI-DSS SAQ-A
            </span>
          </div>

          <p className="text-[10px] text-slate-500">
            ¿Tienes dudas o necesitas asistencia con tu suscripción? Escríbenos a{" "}
            <a href="mailto:soporte@pulseendurance.com" className="text-emerald-400 hover:underline">
              soporte@pulseendurance.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};
