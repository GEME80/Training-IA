"use client";

import React from "react";
import { Sparkles, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";

export const LandingFeaturesGrid: React.FC = () => {
  const features = [
    {
      title: "Planes Adaptativos Diarios",
      subtitle: "Inferencia Matutina con IA",
      desc: "Tu sesión se recalibra cada mañana según tu HRV, descanso nocturno y fatiga acumulada. Si dormiste mal o necesitas asimilación, el plan se adapta solo.",
      icon: Sparkles,
      tag: "Google Gemini",
    },
    {
      title: "Prevención de Lesiones",
      subtitle: "Ingeniería Fisiológica",
      desc: "Reglas biomédicas inviolables: semanas de descarga 3:1 automáticas y cap de 3 horas en fondos largos para proteger sóleos, rodillas y tendón de Aquiles.",
      icon: ShieldCheck,
      tag: "Cap de 3 Horas",
    },
    {
      title: "Sincronización al Reloj",
      subtitle: "0 Minutos de Programación",
      desc: "Tus series viajan directo a tu reloj Garmin o Coros con objetivos milimétricos de potencia (% FTP) y tiempo. Olvídate de crear intervalos manualmente.",
      icon: Zap,
      tag: "Garmin & Coros",
    },
  ];

  return (
    <section id="como-funciona" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2.5">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Pilares del Sistema
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Tres Pilares Diseñados para Rendir
        </h2>
        <p className="text-sm text-slate-600 font-normal">
          Eliminamos la incertidumbre y la sobrecarga para que llegues a tu carrera en tu pico exacto de forma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5 text-slate-900" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                    {item.tag}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold font-mono text-slate-400 uppercase">
                    {item.subtitle}
                  </div>
                  <h3 className="text-lg font-black text-slate-950 mt-1">{item.title}</h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Rendimiento Garantizado</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
