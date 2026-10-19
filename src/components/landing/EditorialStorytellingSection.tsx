"use client";

import React from "react";
import { ArrowRight, Sparkles, TrendingUp, ShieldAlert, HeartPulse, Zap } from "lucide-react";

interface EditorialStorytellingSectionProps {
  onOpenAuthModal?: (tab?: "login" | "register") => void;
}

export const EditorialStorytellingSection: React.FC<EditorialStorytellingSectionProps> = ({
  onOpenAuthModal,
}) => {
  const scrollToMethodology = () => {
    const el = document.querySelector("#metodologia");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto w-full relative z-10 space-y-24 sm:space-y-32">
      {/* =========================================================================
          BLOQUE 1: "PLANIFICA. Llega en tu pico exacto de forma."
          Texto a la izquierda, Gráfico con Halo a la derecha
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Columna Izquierda: Texto Editorial */}
        <div className="lg:col-span-6 space-y-5 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold tracking-widest text-emerald-700 uppercase">
            <span>PLAN.</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
            Llega a tu carrera en tu{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              pico exacto de forma.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            PULSE ENDURANCE modela tu macrociclo completo de 22 semanas aplicando la periodización de Renato Canova y Eric Banister. Semanas de asimilación 3:1 y tope biomecánico estricto de 3 horas para llegar al día de la carrera sin roturas de sóleo ni rodilla.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={scrollToMethodology}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-md transition-all cursor-pointer group"
            >
              <span>Ver Metodología Canova</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Columna Derecha: Composición Gráfica con Halo Circular */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96">
            {/* Halo Lumínico Inferior */}
            <div className="absolute -bottom-6 inset-x-8 h-24 bg-gradient-to-t from-emerald-500/35 to-teal-400/0 blur-2xl rounded-full pointer-events-none" />

            {/* Micro-badge 3D Flotante Superior */}
            <div className="absolute -top-3 right-4 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-emerald-800 text-xs font-bold font-mono shadow-xl animate-bounce-subtle">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
              <span>+12.2 TSB • Pico en Valencia</span>
            </div>

            {/* Marco Circular Editorial */}
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-200/90 shadow-2xl relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
              {/* Contenido Visual Interior: Curva Banister de 22 Semanas */}
              <div className="space-y-3 w-full max-w-[240px]">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-cyan-400 uppercase font-bold">22 Semanas PMC</span>
                  <span className="text-emerald-400">Canova 3:1</span>
                </div>

                {/* Gráfica de Barras de Carga Semanal */}
                <div className="h-24 w-full flex items-end gap-1.5 pt-2 px-1">
                  {[35, 48, 62, 45, 58, 72, 85, 60, 75, 88, 102, 70, 84, 95, 110, 76, 92, 108, 118, 85, 65, 52].map(
                    (val, i) => (
                      <div
                        key={i}
                        style={{ height: `${(val / 118) * 100}%` }}
                        className={`flex-1 rounded-t-xs transition-all ${
                          i === 18
                            ? "bg-emerald-400 ring-2 ring-white/80"
                            : i % 4 === 3
                            ? "bg-amber-400/80" // Semana de asimilación
                            : "bg-cyan-500/70"
                        }`}
                      />
                    )
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  <span>Asimilación 3:1</span>
                  <span className="text-emerald-400 font-bold">Cap 3h Activo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BLOQUE 2: "ADAPTA. Tu fisiología manda cada mañana."
          Gráfico a la izquierda, Texto a la derecha
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Columna Izquierda (Invertida): Composición Gráfica con Halo Circular */}
        <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
          <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96">
            {/* Halo Lumínico Inferior */}
            <div className="absolute -bottom-6 inset-x-8 h-24 bg-gradient-to-t from-teal-500/35 to-emerald-400/0 blur-2xl rounded-full pointer-events-none" />

            {/* Micro-badge 3D Flotante Superior */}
            <div className="absolute -top-3 left-4 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-teal-900 text-xs font-bold font-mono shadow-xl animate-bounce-subtle">
              <Zap className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" strokeWidth={1.75} />
              <span>⚡ Reajustado en 0.2s</span>
            </div>

            {/* Marco Circular Editorial */}
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-200/90 shadow-2xl relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
              <div className="space-y-3 w-full max-w-[240px]">
                {/* Estado Previo Detectado */}
                <div className="p-2.5 rounded-xl bg-slate-800/90 border border-rose-500/30 flex items-center justify-between text-left">
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-mono text-rose-400 flex items-center gap-1 uppercase font-bold">
                      <ShieldAlert className="h-3 w-3" strokeWidth={1.75} />
                      <span>Fatiga Aguda</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-200">
                      HRV: 28 ms • TSB -18
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800">
                    Alerta
                  </span>
                </div>

                {/* Flecha de transformación adaptativa */}
                <div className="flex justify-center text-emerald-400">
                  <span className="text-[10px] font-mono font-bold">↓ Reajuste Inmediato</span>
                </div>

                {/* Sesión Recalibrada en Verde Esmeralda */}
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-left space-y-1">
                  <div className="text-[9px] font-mono text-emerald-300 font-bold uppercase flex items-center gap-1">
                    <HeartPulse className="h-3 w-3 text-emerald-400" strokeWidth={1.75} />
                    <span>Sesión Modificada</span>
                  </div>
                  <div className="text-xs font-bold text-white leading-tight">
                    40 min Z1 Regenerativo
                  </div>
                  <div className="text-[9px] text-emerald-400 font-mono">
                    Protección de tendones activada
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha (Invertida): Texto Editorial */}
        <div className="lg:col-span-6 space-y-5 text-left order-1 lg:order-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-mono font-bold tracking-widest text-teal-700 uppercase">
            <span>ADAPT.</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
            Tu fisiología real{" "}
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              manda cada mañana.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Los planes de papel asumen que nunca duermes mal ni te enfermas. PULSE ENDURANCE lee tu variabilidad cardíaca (HRV) cada mañana al despertar y, si detecta fatiga aguda, recalibra los vatios y las series en menos de un segundo antes de que te pongas las zapatillas.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenAuthModal?.("register")}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-md transition-all cursor-pointer group"
            >
              <span>Probar Adaptación Gratis</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
