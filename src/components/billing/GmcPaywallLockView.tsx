"use client";

import React, { useState } from "react";
import { PulseLogo } from "@/components/PulseLogo";
import { Lock, CreditCard, Landmark, LogOut, ShieldAlert, Sparkles, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GmcCardCheckoutModal } from "./GmcCardCheckoutModal";
import { AthleteBreBPaymentModal } from "@/components/dashboard/AthleteBreBPaymentModal";

interface GmcPaywallLockViewProps {
  reason?: string;
  onRefresh?: () => void;
}

export const GmcPaywallLockView: React.FC<GmcPaywallLockViewProps> = ({
  reason = "Tu cuenta requiere una membresía activa para continuar accediendo a tus entrenamientos, análisis de IA y métricas fisiológicas.",
  onRefresh,
}) => {
  const { user, userProfile, signOutUser } = useAuth();
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isBreBModalOpen, setIsBreBModalOpen] = useState(false);

  const athleteUid = user?.uid || userProfile?.uid || "";
  const athleteName = userProfile?.displayName || user?.displayName || "Atleta";
  const athleteEmail = user?.email || userProfile?.email || "";

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
                <span>Sincronización en vivo con Intervals.icu y Garmin</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Generación de macrociclos y planes con IA Fisiológica</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Supervisión y feedback directo de tu Head Coach</span>
              </li>
            </ul>
          </div>

          {/* Opciones de Pago (Riel Dual: Tarjeta Openpay BBVA o Bre-B Manual) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCardModalOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" />
                <span>Tarjeta Crédito/Débito</span>
              </div>
              <span className="text-[10px] text-emerald-200 font-normal">
                Openpay BBVA • $99.000 COP / mes
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsBreBModalOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-1.5">
                <Landmark className="h-4 w-4 text-blue-400" />
                <span>Bre-B / BBVA Colombia</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">
                Transferencia Manual
              </span>
            </button>
          </div>

          <p className="text-[10px] text-slate-500">
            ¿Tienes dudas o necesitas asistencia con tu suscripción? Escríbenos a{" "}
            <a href="mailto:soporte@pulseendurance.com" className="text-emerald-400 hover:underline">
              soporte@pulseendurance.com
            </a>
          </p>
        </div>
      </main>

      {/* Modales de Checkout */}
      <GmcCardCheckoutModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        subscriberId={athleteUid}
        athleteName={athleteName}
        athleteEmail={athleteEmail}
        trialDays={0} // Al estar bloqueado en el paywall, se cobra de inmediato para reactivar
        onSuccess={() => {
          if (onRefresh) onRefresh();
          window.location.reload();
        }}
      />

      <AthleteBreBPaymentModal
        isOpen={isBreBModalOpen}
        onClose={() => setIsBreBModalOpen(false)}
        athleteUid={athleteUid}
        athleteEmail={athleteEmail}
        athletePrice={99000}
        athleteCurrency="COP"
        onPaymentReported={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};
