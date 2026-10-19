"use client";

import React, { useState } from "react";
import { CheckCircle2, ChevronDown, Sparkles, ArrowRight, ShieldCheck, CreditCard, Landmark } from "lucide-react";

interface PricingAndFaqSectionProps {
  onOpenAuthModal?: (tab?: "login" | "register") => void;
}

const FAQS = [
  {
    q: "¿Cómo se sincroniza con mi reloj deportivo?",
    a: "Tus entrenamientos viajan automáticamente a tu reloj (Garmin o Coros). Al salir a entrenar, tu reloj te guiará en cada serie, intervalo de ritmo y descanso sin que tengas que programar nada manualmente.",
  },
  {
    q: "¿Qué pasa si un día no puedo entrenar o duermo mal?",
    a: "PULSE ENDURANCE recalibra tu microciclo en tiempo real. Al registrar tu asimilación matutina por HRV o notar una sesión omitida por trabajo o familia, el motor reestructura la carga semanal sin duplicar volumen ni castigar al cuerpo, eliminando la culpa psicológica.",
  },
  {
    q: "¿Necesito sensores costosos o potenciómetro obligatoriamente?",
    a: "No es obligatorio. La app funciona perfecto con cualquier reloj deportivo estándar, banda de pulso cardíaco o sensores de potencia. Si entrenas solo por ritmo, calcula tus pasos ideales mediante la fórmula científica VDOT.",
  },
  {
    q: "¿Cómo cancelo mi suscripción?",
    a: "Puedes cancelar en cualquier momento con un solo clic directamente desde tu perfil de usuario. Sin cláusulas de permanencia, sin contratos forzosos ni trámites complicados.",
  },
];

export const PricingAndFaqSection: React.FC<PricingAndFaqSectionProps> = ({ onOpenAuthModal }) => {
  const [currency, setCurrency] = useState<"COP" | "USD">("COP");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const priceText = currency === "COP" ? "$50.000 COP" : "$14.99 USD";
  const periodText = currency === "COP" ? "/ mes" : "/ mo";

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  return (
    <section id="precios" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
      {/* =========================================================
          PARTE 1: PLAN ÚNICO CON PRICE ANCHORING
         ========================================================= */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
          TRANSPARENCIA TOTAL • PLAN ÚNICO
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
          Un Solo Plan. Todo tu Entrenamiento Inteligente.
        </h2>
        {/* Anclaje de Valor (Price Anchoring) */}
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Un entrenador presencial te cuesta entre <strong className="text-slate-900">$250.000</strong> y <strong className="text-slate-900">$450.000 COP</strong> al mes. Con PULSE ENDURANCE tienes periodización de élite mundial 24/7 por solo <strong className="text-emerald-700">$50.000 COP/mes</strong> (menos de lo que gastas en dos geles energéticos a la semana).
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
            <span>🇨🇴 COP $50.000 / mes</span>
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
            <span>Membresía Completa Ilimitada</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-slate-100 pb-6 pt-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                PULSE ENDURANCE Pro Plan
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Acceso total a todos los motores de Running, Ciclismo y Triatlón.
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="flex items-baseline sm:justify-end gap-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-950 font-mono tracking-tight">
                  {priceText}
                </span>
                <span className="text-xs font-bold text-slate-500">{periodText}</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                Facturación mensual flexible
              </span>
            </div>
          </div>

          {/* Características Incluidas */}
          <div className="py-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              {[
                "Macrociclo adaptativo de 22 semanas",
                "Recalibración diaria por HRV al despertar",
                "Tope biomecánico de 3h para preservar tendón de Aquiles y sóleos (Canova)",
                "Prescripción por vatios Stryd y FTP Coggan",
                "Sincronización directa con Garmin & Coros",
                "Head Coach Fisiológico 24/7 Adaptativo",
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botonera de Acción */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <button
              type="button"
              onClick={() => onOpenAuthModal?.("register")}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>Comenzar Mis 7 Días Gratis</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
            </button>

            {/* Sellos Visuales de Pago de Confianza */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block text-center">
                Métodos de Pago Seguros Disponibles:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-700">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.75} />
                  <span>Bre-B (BBVA)</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800">
                  Nequi
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                  Bancolombia
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                  Daviplata
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.75} />
                  <span>Visa / Mastercard</span>
                </span>
              </div>
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
