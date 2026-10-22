"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Globe,
  Lock,
  Loader2,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_SUBSCRIPTION_PLAN, SubscriptionPlanConfig } from "@/lib/db/types";
import { formatMoney } from "@/lib/services/adminBillingService";
import { redirectToOpenpayCheckout } from "@/lib/services/openpayClient";

interface PricingAndFaqSectionProps {
  onOpenAuthModal?: (tab?: "login" | "register") => void;
}

const FAQS = [
  {
    q: "¿Cómo funciona el periodo de prueba gratis de 7 días?",
    a: "Te registras en 30 segundos sin necesidad de ingresar tarjeta de crédito ni datos bancarios. Conectas tu reloj (Garmin o Coros) o tu perfil de Intervals.icu y comienzas a entrenar de inmediato con tu plan adaptativo por IA. Al finalizar los 7 días, tú decides si deseas activar tu membresía Pro en la pasarela bancaria oficial de Openpay BBVA.",
  },
  {
    q: "¿Cómo se sincroniza con mi reloj deportivo?",
    a: "Tus entrenamientos viajan automáticamente a tu reloj (Garmin o Coros). Al salir a entrenar, tu reloj te guiará en cada serie, intervalo de ritmo y descanso sin que tengas que programar nada manualmente.",
  },
  {
    q: "¿Qué pasa si un día no puedo entrenar o duermo mal?",
    a: "PULSE ENDURANCE recalibra tu microciclo en tiempo real. Al registrar tu asimilación matutina por HRV o notar una sesión omitida por trabajo o familia, el motor reestructura la carga semanal sin duplicar volumen ni castigar al cuerpo, eliminando la culpa psicológica.",
  },
  {
    q: "¿Puedo pagar desde fuera de Colombia con tarjeta internacional?",
    a: "Sí. Todos los cobros se procesan oficialmente en Pesos Colombianos (COP) a través de Openpay by BBVA Colombia (comercio German Morales Consulting). Si pagas con una tarjeta internacional (Visa, Mastercard o American Express), tu banco emisor convertirá automáticamente el valor a tu moneda local a la tasa vigente del día.",
  },
  {
    q: "¿Cómo cancelo mi suscripción?",
    a: "Puedes cancelar en cualquier momento con un solo clic directamente desde tu dashboard, sin cláusulas de permanencia ni penalidades. Si cancelas durante los 7 días de prueba, no se te cobrará nada. Si cancelas durante un mes pagado, conservas tu acceso hasta el último día de tu ciclo vigente.",
  },
];

export const PricingAndFaqSection: React.FC<PricingAndFaqSectionProps> = ({ onOpenAuthModal }) => {
  const { user, userProfile } = useAuth();
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [plan, setPlan] = useState<SubscriptionPlanConfig>(DEFAULT_SUBSCRIPTION_PLAN);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/subscription-plan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.plan) {
          setPlan(data.plan);
        }
      })
      .catch((err) => console.warn("Aviso al consultar plan público:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const trialDays = typeof plan.trialDays === "number" ? plan.trialDays : 7;
  const priceDisplay = `${formatMoney(plan.price, "COP")} COP`;

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  const handleStartCardCheckout = async () => {
    if (!user) {
      if (onOpenAuthModal) {
        onOpenAuthModal("register");
      }
      return;
    }

    setIsRedirecting(true);
    try {
      await redirectToOpenpayCheckout({
        subscriberId: userProfile?.intervalsAthleteId || user.uid,
        athleteName: userProfile?.displayName || user.displayName || "Atleta Pulse",
        athleteEmail: user.email || "atleta@pulseendurance.co",
      });
    } catch (err: any) {
      alert(err?.message || "No fue posible conectar con la pasarela de Openpay BBVA.");
      setIsRedirecting(false);
    }
  };

  return (
    <section id="precios" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
      {/* =========================================================
          PARTE 1: ENCABEZADO CON PRICE ANCHORING
         ========================================================= */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
          TRANSPARENCIA TOTAL • PLAN ÚNICO
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
          Un Solo Plan. Todo tu Entrenamiento Inteligente.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Un entrenador presencial te cuesta entre <strong className="text-slate-900">$250.000</strong> y{" "}
          <strong className="text-slate-900">$450.000 COP</strong> al mes. Con PULSE ENDURANCE tienes periodización
          fisiológica de élite mundial 24/7 por solo{" "}
          <strong className="text-emerald-700">{formatMoney(plan.price, "COP")} COP/mes</strong> con{" "}
          <strong className="text-emerald-700">{trialDays} días de prueba gratis</strong>.
        </p>
      </div>

      {/* Distintivo de Moneda Única Oficial (COP) y Conversión Internacional */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
          <span className="px-2.5 py-1 rounded-xl bg-white text-emerald-800 shadow-2xs border border-slate-200">
            🇨🇴 Facturación Oficial en Pesos Colombianos ({priceDisplay} / mes)
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 px-1">
            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Tarjetas internacionales convierten automáticamente a tu moneda local</span>
          </span>
        </div>
      </div>

      {/* Tarjeta Maestra de Membresía */}
      <div className="max-w-2xl mx-auto mb-20">
        <div className="relative rounded-3xl bg-white border-2 border-emerald-500/50 p-7 sm:p-10 shadow-2xl shadow-emerald-500/10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Membresía Completa • {trialDays > 0 ? `${trialDays} Días Gratis` : "Cobro Inmediato"}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-slate-100 pb-6 pt-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950">{plan.name}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">{plan.tagline}</p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="flex items-baseline sm:justify-end gap-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-950 font-mono tracking-tight">
                  {formatMoney(plan.price, "COP")}
                </span>
                <span className="text-xs font-bold text-slate-500">COP / mes</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                {plan.billingCycleDaysText}
              </span>
            </div>
          </div>

          {/* Banner de Free Trial */}
          {trialDays > 0 && (
            <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-emerald-950">
                    Prueba Gratuita de {trialDays} Días Activa • Cero Tarjetas Requeridas
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Comienza hoy sin ingresar tarjeta de crédito. Prueba la IA y conecta tus dispositivos. Activas tu membresía únicamente si te convence.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Características Incluidas */}
          <div className="py-6 space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
              Todo lo que incluye tu suscripción:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              {(plan.features && plan.features.length > 0
                ? plan.features
                : [
                    "Macrociclo adaptativo de 22 semanas",
                    "Recalibración diaria por HRV al despertar",
                    "Tope biomecánico de 3h para preservar tendón de Aquiles (Canova)",
                    "Prescripción por vatios Stryd y FTP Coggan",
                    "Sincronización directa con Garmin & Coros",
                    "Head Coach Fisiológico 24/7 Adaptativo",
                  ]
              ).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botonera de Acción: Suscripción 100% Recurrente con Tarjeta Openpay */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {/* Botón Principal: Tarjeta Openpay */}
            <button
              type="button"
              onClick={handleStartCardCheckout}
              disabled={isRedirecting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 group"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
                  <span>Conectando con pasarela segura Openpay BBVA...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 shrink-0" />
                  <span>
                    {userProfile?.hasUsedTrial
                      ? `Activar Suscripción Mensual (${priceDisplay})`
                      : trialDays > 0
                      ? `Comenzar mis ${trialDays} Días Gratis (Sin Tarjeta)`
                      : `Suscribirme con Openpay BBVA (${priceDisplay})`}
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                </>
              )}
            </button>

            {/* Métodos de Pago Seguros y Sellos Oficiales */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pasarela Criptográfica Openpay BBVA • Cero PAN en Servidor (PCI SAQ-A)</span>
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sin permanencia</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono font-bold text-slate-600">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-slate-700" />
                  <span>Visa</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-slate-700" />
                  <span>Mastercard</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                  American Express
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                  Openpay by BBVA
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                  Débito / Crédito (Nacional e Internacional)
                </span>
              </div>

              <p className="text-[11px] text-center text-slate-500 leading-relaxed pt-1">
                Comercio procesado por <strong className="text-slate-700">German Morales Consulting</strong> en Pesos Colombianos (COP). Si pagas desde el exterior con tarjeta internacional, tu banco convertirá automáticamente el valor a tu moneda local.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          PARTE 2: ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
         ========================================================= */}
      <div id="faq" className="max-w-4xl mx-auto pt-6 border-t border-slate-200">
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs font-bold font-mono uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Preguntas Frecuentes
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
            Todo lo que necesitas saber antes de empezar
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
              onClick={() => toggleFaq(idx)}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    openFaqIdx === idx ? "rotate-180 text-emerald-600" : ""
                  }`}
                  strokeWidth={1.75}
                />
              </div>
              {openFaqIdx === idx && (
                <p className="text-xs text-slate-600 leading-relaxed pt-3 font-normal border-t border-slate-100 mt-3 animate-in fade-in duration-150">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
