"use client";

import React from "react";
import { Zap, Radio, CheckCircle2, Activity } from "lucide-react";

export const HeroAthleteTelemetryCard: React.FC = () => {
  return (
    <div className="relative w-full max-w-md lg:max-w-none mx-auto">
      {/* Marco estilizado de la fotografía con aspecto 4/5 */}
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 aspect-[4/5] bg-slate-900 relative group">
        {/* Fotografía Base en Alta Definición */}
        <img
          src="/images/hero-marathon-athlete.jpg"
          alt="Atleta de resistencia ejecutando serie con telemetría en tiempo real"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 select-none"
        />

        {/* Gradiente cinemático de protección de contraste */}
        <div className="bg-gradient-to-t from-slate-950 via-slate-950/35 to-slate-950/10 absolute inset-0 pointer-events-none" />

        {/* Badge Superior Flotante: En Vivo */}
        <div className="absolute top-4 left-4 z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-mono font-bold text-white shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-wide">EN VIVO: SESIÓN EN RUTA</span>
          </div>
        </div>

        {/* Tarjeta HUD Flotante (Glassmorphism en la base) */}
        <div className="absolute bottom-4 inset-x-4 p-4 sm:p-5 bg-slate-950/90 backdrop-blur-md border border-slate-700/70 rounded-2xl text-white space-y-3 shadow-2xl z-20">
          {/* Fila 1: Potenciómetro Stryd & Meta */}
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Zap className="h-3.5 w-3.5 fill-emerald-400" strokeWidth={1.75} />
              <span>STRYD RUN POWER</span>
            </div>
            <span className="text-slate-300">Objetivo: Maratón Tokio 2027</span>
          </div>

          {/* Fila 2: Telemetría de Vatios, Ritmo y HRV */}
          <div className="grid grid-cols-3 gap-2 items-baseline text-left">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Potencia</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight">
                336 <span className="text-xs font-normal text-slate-300">W</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Ritmo Stryd</div>
              <div className="text-sm sm:text-base font-bold font-mono text-white">
                3:45 <span className="text-[10px] font-normal text-slate-400">/km</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Estado HRV</div>
              <div className="text-xs sm:text-sm font-bold font-mono text-cyan-400 flex items-center gap-1">
                <Activity className="h-3 w-3 text-cyan-400" strokeWidth={1.75} />
                <span>+12 TSB</span>
              </div>
            </div>
          </div>

          {/* Fila 3: Sincronización y Regla de Canova */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} />
              <span>Sincronizado con Garmin</span>
            </span>
            <span>1h 45m Canova Z4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
