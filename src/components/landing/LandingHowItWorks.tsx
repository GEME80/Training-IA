"use client";

import React from "react";
import { Watch, Sparkles, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

export const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Sincroniza en 30 Segundos",
      subtitle: "Conexión Nativa de Hardware",
      desc: "Vincula tu reloj Garmin, Coros, potenciómetro Stryd o cuenta de Intervals.icu en un clic. Cero configuraciones complicadas.",
      icon: Watch,
      color: "cyan",
      badge: "Plug & Play",
    },
    {
      step: "02",
      title: "Tu Fisiología Toma el Mando",
      subtitle: "Evaluación Matutina con IA",
      desc: "Google Gemini evalúa tu HRV, sueño y fatiga cada mañana. Si tu cuerpo necesita descanso o asimilación, recalibra la sesión al instante.",
      icon: Sparkles,
      color: "emerald",
      badge: "Adaptación Diaria",
    },
    {
      step: "03",
      title: "Entrena con Vatios Exactos",
      subtitle: "Series Directas a tu Muñeca",
      desc: "Las series estructuradas se descargan automáticamente en tu dispositivo. Corre o pedalea con zonas exactas de potencia sin programar nada.",
      icon: Zap,
      color: "amber",
      badge: "100% Precisión",
    },
  ];

  return (
    <section id="como-funciona" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Experiencia Sin Fricción
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Tu Camino al Pico de Forma en 3 Pasos
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Diseñado para que dediques tu energía a entrenar y descansar, mientras la plataforma gestiona la matemática y la periodización.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white/90 border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between space-y-6 relative group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-slate-900 transition-colors">
                    {item.step}
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                    {item.badge}
                  </span>
                </div>

                <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6 text-slate-900" />
                </div>

                <div>
                  <div className="text-xs font-bold font-mono text-slate-500 uppercase">
                    {item.subtitle}
                  </div>
                  <h3 className="text-xl font-black text-slate-950 mt-1">{item.title}</h3>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 border-t border-slate-100 pt-4">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Automatizado y sin errores</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
