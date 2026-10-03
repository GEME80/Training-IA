"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Smartphone } from "lucide-react";
import { DEFAULT_SUBSCRIPTION_PLAN, SubscriptionPlanConfig } from "@/lib/db/types";
import { formatMoney } from "@/lib/services/adminBillingService";

interface LandingPricingSectionProps {
  onOpenAuthModal?: (tab?: "login" | "register") => void;
  initialPlan?: SubscriptionPlanConfig;
}

export const LandingPricingSection: React.FC<LandingPricingSectionProps> = ({
  onOpenAuthModal,
  initialPlan,
}) => {
  const [plan, setPlan] = useState<SubscriptionPlanConfig>(initialPlan || DEFAULT_SUBSCRIPTION_PLAN);

  useEffect(() => {
    if (initialPlan) return;
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
  }, [initialPlan]);

  return (
    <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
          Transparencia Total • Plan Único
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Un Solo Plan. Toda la Inteligencia Fisiológica.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Sin niveles recortados ni funciones bloqueadas. Accede a toda la potencia de la periodización adaptativa con IA, telemetría Stryd y Head Coach Digital.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-b from-white via-white to-slate-50 border-2 border-emerald-500/40 p-7 sm:p-10 shadow-2xl shadow-emerald-500/10 transition-all hover:border-emerald-500">
          {/* Badge Destacado */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Membresía Oficial SSOT</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-slate-100 pb-6 pt-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                {plan.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {plan.tagline}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="flex items-baseline sm:justify-end gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight">
                  {formatMoney(plan.price, plan.currency)}
                </span>
                <span className="text-xs font-bold text-slate-500">/ mes</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                {plan.billingCycleDaysText}
              </span>
            </div>
          </div>

          {/* Características */}
          <div className="py-6 space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
              Todo lo que incluye tu suscripción:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botonera de Acción y Pagos */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <button
              type="button"
              onClick={() => onOpenAuthModal?.("register")}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>Comenzar Mi Entrenamiento</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Insignias de Pago y Confianza */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-600 shrink-0" />
                <span>Aceptamos <strong>Nequi</strong>, <strong>Bancolombia</strong> y transferencia directa</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Sin contratos forzosos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
