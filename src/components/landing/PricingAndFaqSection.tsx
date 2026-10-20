"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Landmark,
  Lock,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GmcCardCheckoutModal } from "../billing/GmcCardCheckoutModal";
import { DEFAULT_SUBSCRIPTION_PLAN, SubscriptionPlanConfig } from "@/lib/db/types";
import { formatMoney } from "@/lib/services/adminBillingService";

interface PricingAndFaqSectionProps {
  onOpenAuthModal?: (tab?: "login" | "register") => void;
}

const FAQS = [
  {
    q: "¿Cómo funciona el periodo de prueba gratis de 7 días?",
    a: "Al registrarte ingresas tu tarjeta de crédito o débito de forma segura a través de Openpay BBVA. Se realiza una verificación de $0 COP (sin cobro inicial). Entrenas con acceso total ilimitado durante 7 días y solo se te cobrará el valor mensual en el Día 8 si decides continuar.",
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
    q: "¿Qué medios de pago aceptan para la suscripción recurrente?",
    a: "Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, American Express) procesadas con seguridad criptográfica a través de Openpay BBVA Colombia. Cero almacenamiento de números de tarjeta en nuestros servidores (PCI-DSS SAQ-A).",
  },
  {
    q: "¿Cómo cancelo mi suscripción?",
    a: "Puedes cancelar en cualquier momento con un solo clic directamente desde tu dashboard. Si cancelas durante los 7 días de prueba, no se te cobrará absolutamente nada. Y si cancelas a mitad de mes, conservas tu acceso hasta el final del periodo ya pagado ('Efecto Netflix').",
  },
];

export const PricingAndFaqSection: React.FC<PricingAndFaqSectionProps> = ({ onOpenAuthModal }) => {
  const { user, userProfile } = useAuth();
  const [currency, setCurrency] = useState<"COP" | "USD">("COP");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [plan, setPlan] = useState<SubscriptionPlanConfig>(DEFAULT_SUBSCRIPTION_PLAN);
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [copiedCard, setCopiedCard] = useState<boolean>(false);

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
  const currentPrice = currency === "COP" ? plan.price : 14.99;
  const priceDisplay = formatMoney(currentPrice, currency);
  const periodText = currency === "COP" ? "/ mes" : "/ mo";

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  const handleStartCardCheckout = () => {
    setIsCardModalOpen(true);
  };

  const handleCopySandboxCard = () => {
    navigator.clipboard.writeText("4111111111111111");
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
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

      {/* Toggle de Divisa */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold shadow-2xs">
          <button
            type="button"
            onClick={() => setCurrency("COP")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              currency === "COP"
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>🇨🇴 COP {formatMoney(plan.price, "COP")} / mes</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              currency === "USD"
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>🌎 USD $14.99 / mo</span>
          </button>
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
                  {priceDisplay}
                </span>
                <span className="text-xs font-bold text-slate-500">{periodText}</span>
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
                    Prueba Gratuita de {trialDays} Días Activa
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Registras tu tarjeta hoy por <strong>$0 COP</strong>. Tu primer cobro automático será en el Día{" "}
                    {trialDays + 1}. Cancela cuando quieras.
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
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 group"
            >
              <CreditCard className="w-5 h-5 shrink-0" />
              <span>
                {userProfile?.hasUsedTrial
                  ? `Activar Suscripción Mensual (${priceDisplay})`
                  : trialDays > 0
                  ? `Comenzar mis ${trialDays} Días Gratis ($0 COP Hoy)`
                  : `Suscribirme con Tarjeta (${priceDisplay})`}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
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
                  BBVA Colombia
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                  Débito / Crédito
                </span>
              </div>

              {/* Helper para Pruebas Sandbox Openpay */}
              <div className="mt-2 p-2.5 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase">
                    Sandbox Test
                  </span>
                  <span className="truncate">
                    Tarjeta: <strong className="text-white">4111 1111 1111 1111</strong> • Exp: <strong>12/28</strong> • CVV: <strong>123</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySandboxCard}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0 flex items-center gap-1 text-[10px]"
                >
                  {copiedCard ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCard ? "Copiada" : "Copiar"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pago con Tarjeta Openpay BBVA */}
      <GmcCardCheckoutModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        subscriberId={user?.uid || "guest_tester"}
        athleteName={userProfile?.displayName || user?.displayName || "Atleta Pulse"}
        athleteEmail={user?.email || "atleta@pulse.com"}
        planAmountCop={plan.price}
        trialDays={userProfile?.hasUsedTrial ? 0 : trialDays}
        onSuccess={() => {
          setIsCardModalOpen(false);
          alert("¡Tarjeta registrada con éxito! Tu suscripción está activa.");
          window.location.reload();
        }}
      />

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
