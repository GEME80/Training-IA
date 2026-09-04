"use client";

import React from "react";
import { WorkoutChart } from "@/components/WorkoutChart";
import { Sparkles, CheckCircle2, TrendingUp, Flame, BatteryCharging, Footprints, Bike, Compass } from "lucide-react";

export const LandingProductMockup: React.FC = () => {
  const sampleWorkoutDoc = `Warmup\n- 20m 68% FTP\n\n2x\n- 25m 82% FTP\n- 5m 68% FTP\n\nMain (Z2)\n- 45m 74% FTP\n\nCooldown\n- 10m 60% FTP`;

  return (
    <section id="ciclos" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2.5">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
          Demostración Visual en Vivo
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Tu Telemetría y Entrenamientos en un Solo Vistazo
        </h2>
        <p className="text-sm text-slate-600 font-normal">
          Sin tablas complicadas ni hojas de cálculo. Visualiza tu pico de forma y cada serie estructurada con claridad absoluta.
        </p>
      </div>

      {/* Mockup de Laptop / Dashboard de Alta Fidelidad */}
      <div className="rounded-3xl border border-slate-300/80 bg-white shadow-2xl shadow-slate-300/50 overflow-hidden backdrop-blur-xl">
        {/* Barra Superior de Ventana Minimalista */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-100/90 border-b border-slate-200 text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="hidden sm:inline-flex items-center px-4 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-slate-600 shadow-2xs">
            🔒 pulseai.pro/dashboard/athlete
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sincronizado</span>
          </div>
        </div>

        {/* Interior del Dashboard */}
        <div className="p-4 sm:p-7 space-y-6 bg-slate-50/40">
          {/* Fila de Métricas Fisiológicas (Grid 3x2 en Móvil, 6 en Desktop) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 text-center">
            <div className="rounded-2xl p-2.5 sm:p-3 bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
                <span className="truncate">Forma</span>
              </div>
              <div className="text-base sm:text-xl font-black text-emerald-600 font-mono mt-0.5">84.2</div>
              <div className="text-[9px] text-slate-400 font-mono">Fitness CTL</div>
            </div>

            <div className="rounded-2xl p-2.5 sm:p-3 bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1">
                <Flame className="h-3 w-3 text-amber-600" />
                <span className="truncate">Fatiga</span>
              </div>
              <div className="text-base sm:text-xl font-black text-amber-600 font-mono mt-0.5">72.0</div>
              <div className="text-[9px] text-slate-400 font-mono">Carga 7D</div>
            </div>

            <div className="rounded-2xl p-2.5 sm:p-3 bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1">
                <BatteryCharging className="h-3 w-3 text-cyan-600" />
                <span className="truncate">Frescura</span>
              </div>
              <div className="text-base sm:text-xl font-black text-cyan-600 font-mono mt-0.5">+12.2</div>
              <div className="text-[9px] text-emerald-600 font-bold">Óptimo</div>
            </div>

            <div className="rounded-2xl p-2.5 sm:p-3 bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1">
                <Compass className="h-3 w-3 text-teal-600" />
                <span className="truncate">Rampa</span>
              </div>
              <div className="text-base sm:text-xl font-black text-teal-600 font-mono mt-0.5">+4.8</div>
              <div className="text-[9px] text-slate-400 font-mono">pts/sem</div>
            </div>

            <div className="rounded-2xl p-2.5 sm:p-3 bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1">
                <Footprints className="h-3 w-3 text-amber-600" />
                <span className="truncate">Stryd CP</span>
              </div>
              <div className="text-base sm:text-xl font-black text-amber-600 font-mono mt-0.5">332 W</div>
              <div className="text-[9px] text-slate-400 font-mono">3.95 W/kg</div>
            </div>

            <div className="rounded-2xl p-2.5 sm:p-3 bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1">
                <Bike className="h-3 w-3 text-cyan-600" />
                <span className="truncate">FTP Bici</span>
              </div>
              <div className="text-base sm:text-xl font-black text-cyan-600 font-mono mt-0.5">260 W</div>
              <div className="text-[9px] text-slate-400 font-mono">Rodillo/Ruta</div>
            </div>
          </div>

          {/* Gráfica de Intervalos Visual Real (WorkoutChart) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-700 uppercase">
                  Sesión del Día • Tirada Larga Progresiva
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-950">
                  1h 45m con 2 bloques de Ritmo Maratón (82% CP)
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold">112 TSS</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold">Semana 11</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Perfil de Potencia por Zonas (Z1 a Z5)</span>
                <span className="text-emerald-600 font-bold">Línea de Umbral (100% FTP)</span>
              </div>
              <WorkoutChart workoutDoc={sampleWorkoutDoc} discipline="Carrera" className="border border-slate-100 rounded-xl" />
            </div>
          </div>

          {/* Dictamen del Head Coach con Google Gemini */}
          <div className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-cyan-50/80 via-white to-emerald-50/80 border border-cyan-200/80 flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-200 shadow-2xs">
              <Sparkles className="h-4 w-4 text-cyan-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-950 flex items-center gap-2">
                <span>Dictamen Head Coach</span>
                <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-full">
                  Google Gemini
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                &ldquo;Frescura en +12 con variabilidad cardíaca (HRV) balanceada. Asimilación biológica óptima para ejecutar la tirada con bloques de ritmo maratón. Series enviadas directamente a tu Garmin.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
