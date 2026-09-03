"use client";

import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

export const LandingControlHub: React.FC = () => {
  return (
    <section id="control-hub" className="px-4 sm:px-6 max-w-6xl mx-auto -mt-4 mb-24 w-full">
      <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 space-y-6 backdrop-blur-xl">
        {/* Cabecera del Hub */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-rose-500" />
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono text-slate-800 ml-2 font-bold">
              PULSE AI Master Control Hub
            </span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Telemetría en Vivo Sincronizada
          </span>
        </div>

        {/* Grid de 6 Tarjetas Fisiológicas Humanizadas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/80 transition hover:border-emerald-300">
            <div className="text-[11px] text-slate-500 font-semibold">📈 Forma Acumulada</div>
            <div className="text-xl font-black text-emerald-600 mt-1 font-mono">84.2</div>
            <div className="text-[10px] text-slate-400 font-medium">Capacidad Aeróbica</div>
          </div>

          <div className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/80 transition hover:border-amber-300">
            <div className="text-[11px] text-slate-500 font-semibold">⚡ Fatiga Reciente</div>
            <div className="text-xl font-black text-amber-600 mt-1 font-mono">72.0</div>
            <div className="text-[10px] text-slate-400 font-medium">Carga 7 Días</div>
          </div>

          <div className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/80 transition hover:border-cyan-300">
            <div className="text-[11px] text-slate-500 font-semibold">🔋 Batería / Frescura</div>
            <div className="text-xl font-black text-cyan-600 mt-1 font-mono">+12.2</div>
            <div className="text-[10px] text-emerald-600 font-bold">🟢 Óptimo para Rendir</div>
          </div>

          <div className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/80 transition hover:border-teal-300">
            <div className="text-[11px] text-slate-500 font-semibold">📐 Tasa de Rampa</div>
            <div className="text-xl font-black text-teal-600 mt-1 font-mono">+4.8</div>
            <div className="text-[10px] text-slate-400 font-medium">Incremento Seguro / sem</div>
          </div>

          <div className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/80 transition hover:border-amber-300">
            <div className="text-[11px] text-slate-500 font-semibold">👟 Stryd Potencia</div>
            <div className="text-xl font-black text-amber-600 mt-1 font-mono">332 W</div>
            <div className="text-[10px] text-slate-400 font-medium">3.95 W/kg en Carrera</div>
          </div>

          <div className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/80 transition hover:border-cyan-300">
            <div className="text-[11px] text-slate-500 font-semibold">🚴 Vatios Ciclismo</div>
            <div className="text-xl font-black text-cyan-600 mt-1 font-mono">260 W</div>
            <div className="text-[10px] text-slate-400 font-medium">FTP Rodillo / Ruta</div>
          </div>
        </div>

        {/* Banner de Dictamen del Head Coach en Vivo */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-cyan-50/90 via-white to-emerald-50/90 border border-cyan-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 text-xl border border-cyan-200 shadow-xs">
              🤖
            </div>
            <div>
              <div className="text-xs font-bold text-slate-950 flex items-center gap-2">
                <span>Dictamen Head Coach</span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 font-mono font-bold">
                  <Sparkles className="h-2.5 w-2.5 text-cyan-700" />
                  Google Gemini
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mt-1 font-normal leading-relaxed">
                &ldquo;Frescura en +12 con variabilidad cardíaca (HRV) balanceada. Asimilación biológica óptima para ejecutar la tirada programada con bloques específicos a 80-84% de Potencia Crítica.&rdquo;
              </p>
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-cyan-200 text-xs font-mono font-bold text-cyan-900 shrink-0 shadow-xs flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Semana 11 • Pico Específico</span>
          </div>
        </div>
      </div>
    </section>
  );
};
