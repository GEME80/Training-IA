"use client";

import React from "react";
import { Zap, ShieldCheck, ArrowRight } from "lucide-react";

interface CoachingImpactBannerProps {
  onOpenAuthModal?: (tab?: "login" | "register") => void;
}

export const CoachingImpactBanner: React.FC<CoachingImpactBannerProps> = ({ onOpenAuthModal }) => {
  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full my-12 sm:my-16">
      <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 md:p-14 border border-slate-800 shadow-2xl relative overflow-hidden text-center max-w-6xl mx-auto">
        {/* Halo Esmeralda Difuso de Fondo (Ambient Glow) */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-xs font-mono font-bold text-emerald-400">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" strokeWidth={1.75} />
            <span>METODOLOGÍA DEPORTIVA INTELIGENTE</span>
          </div>

          {/* Titular de Alto Impacto */}
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            ¿Listo para Entrenar de Forma Más Inteligente, No Más Agresiva?
          </h2>

          {/* Subtítulo */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Eleva tu rendimiento deportivo entrenando a los ritmos y vatios exactos para tu cuerpo, respetando tu recuperación biológica (HRV) y con la guía 24/7 de tu entrenador de inteligencia artificial.
          </p>

          {/* Botón de Alto Contraste y Micro-copy */}
          <div className="pt-3 flex flex-col items-center">
            <button
              type="button"
              onClick={() => onOpenAuthModal?.("register")}
              className="px-8 py-3.5 bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-2xl text-sm md:text-base shadow-xl transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" strokeWidth={1.75} />
              <span>Comenzar Mi Prueba Gratuita Hoy</span>
              <ArrowRight className="w-4 h-4 text-slate-700" strokeWidth={1.75} />
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.75} />
              <span>Entrena con total confianza • Sin tarjeta de crédito requerida</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
