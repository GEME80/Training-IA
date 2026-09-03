"use client";

import React, { useState } from "react";
import { WorkoutChart } from "@/components/WorkoutChart";
import { Layers, Calendar, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";

interface SampleWorkout {
  title: string;
  discipline: string;
  focus: string;
  powerTarget: string;
  duration: string;
  tss: number;
  doc: string;
}

const SAMPLE_WORKOUTS: SampleWorkout[] = [
  {
    title: "Series Umbral Lactato (4x 8m @ 100% CP)",
    discipline: "Carrera",
    focus: "Tolerancia a la fatiga y aclaramiento de lactato",
    powerTarget: "98-100% Stryd CP",
    duration: "58m",
    tss: 68,
    doc: `Warmup\n- 15m 70% FTP\n\n4x\n- 8m 100% FTP\n- 3m 65% FTP\n\nCooldown\n- 10m 60% FTP`,
  },
  {
    title: "Tirada Larga Progresiva con Bloques de Carrera",
    discipline: "Carrera",
    focus: "Especificidad de ritmo maratón y economía lipídica",
    powerTarget: "78-83% Stryd CP",
    duration: "1h 45m",
    tss: 112,
    doc: `Warmup\n- 20m 68% FTP\n\n2x\n- 25m 82% FTP\n- 5m 68% FTP\n\nMain (Z2)\n- 45m 74% FTP\n\nCooldown\n- 10m 60% FTP`,
  },
  {
    title: "Sweetspot Extensivo en Ciclismo (3x 12m)",
    discipline: "Ciclismo",
    focus: "Densidad de potencia aeróbica y resistencia muscular",
    powerTarget: "88-92% Bike FTP",
    duration: "1h 30m",
    tss: 82,
    doc: `Warmup\n- 15m 55% FTP\n\n3x\n- 12m 90% FTP\n- 4m 60% FTP\n\nMain (Z2)\n- 25m 70% FTP\n\nCooldown\n- 10m 50% FTP`,
  },
  {
    title: "Micro-Intervalos VO2max Billat (10x 30s/30s)",
    discipline: "Carrera",
    focus: "Velocidad neuromuscular y potencia aeróbica máxima",
    powerTarget: "108-112% Stryd CP",
    duration: "45m",
    tss: 54,
    doc: `Warmup\n- 15m 68% FTP\n\n10x\n- 30s 110% FTP\n- 30s 60% FTP\n\nMain\n- 15m 70% FTP\n\nCooldown\n- 10m 60% FTP`,
  },
];

export const LandingCyclePreview: React.FC = () => {
  const [activeWorkoutIdx, setActiveWorkoutIdx] = useState<number>(0);
  const currentWorkout = SAMPLE_WORKOUTS[activeWorkoutIdx];

  return (
    <section id="ciclos" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Arquitectura de Temporada & Sesiones
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Visualiza tus Ciclos y Cada Intervalo
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Observa la arquitectura de progresión de tu temporada y cómo se traducen los bloques científicos en gráficas visuales de potencia para tu reloj.
        </p>
      </div>

      {/* 1. Las 4 Fases de Periodización Progresiva */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 shadow-sm backdrop-blur-xl relative overflow-hidden group hover:border-cyan-400 transition-all">
          <div className="text-[11px] font-mono font-bold text-cyan-700 uppercase">Fase 01</div>
          <h3 className="text-lg font-bold text-slate-950 mt-1">Base Mitocondrial</h3>
          <div className="h-1.5 w-full bg-cyan-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full w-3/4" />
          </div>
          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Construcción de densidad capilar y red mitocondrial en Zona 2 suave, fortaleciendo tendones y sóleos sin fatiga neural.
          </p>
          <div className="mt-4 text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg inline-block">
            Sem 1 - 4 • Carga 3:1
          </div>
        </div>

        <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 shadow-sm backdrop-blur-xl relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="text-[11px] font-mono font-bold text-amber-700 uppercase">Fase 02</div>
          <h3 className="text-lg font-bold text-slate-950 mt-1">Construcción</h3>
          <div className="h-1.5 w-full bg-amber-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full w-4/5" />
          </div>
          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Bloques de umbral anaeróbico y Sweetspot para elevar tu potencia de crucero y resistir ritmos exigentes con menor pulso.
          </p>
          <div className="mt-4 text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg inline-block">
            Sem 5 - 10 • Umbral Lactato
          </div>
        </div>

        <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 shadow-sm backdrop-blur-xl relative overflow-hidden group hover:border-rose-400 transition-all">
          <div className="text-[11px] font-mono font-bold text-rose-700 uppercase">Fase 03</div>
          <h3 className="text-lg font-bold text-slate-950 mt-1">Pico Específico</h3>
          <div className="h-1.5 w-full bg-rose-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full w-full" />
          </div>
          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Tiradas cumbre con fracciones prolongadas a potencia exacta de carrera para dominar la biomecánica y el ritmo del día D.
          </p>
          <div className="mt-4 text-[10px] font-mono font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg inline-block">
            Sem 11 - 13 • Fondo Cumbre
          </div>
        </div>

        <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 shadow-sm backdrop-blur-xl relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="text-[11px] font-mono font-bold text-emerald-700 uppercase">Fase 04</div>
          <h3 className="text-lg font-bold text-slate-950 mt-1">Afinamiento & Carrera</h3>
          <div className="h-1.5 w-full bg-emerald-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-2/4" />
          </div>
          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Descarga exponencial de volumen (-50%) manteniendo toques de intensidad para llegar fresco y supercompensado a la salida.
          </p>
          <div className="mt-4 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">
            Sem 14 - 16 • Supercompensación
          </div>
        </div>
      </div>

      {/* 2. Visualizador Interactivo de Sesión en Vivo con WorkoutChart */}
      <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/30 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Gráfica de Intervalos en Tiempo Real</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
              {currentWorkout.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
              {currentWorkout.focus}
            </p>
          </div>

          {/* Badges de Métricas */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-800 border border-slate-200">
              ⏱️ {currentWorkout.duration}
            </span>
            <span className="px-3 py-1 rounded-xl bg-amber-50 font-mono text-xs font-bold text-amber-800 border border-amber-200">
              ⚡ {currentWorkout.powerTarget}
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 font-mono text-xs font-bold text-emerald-800 border border-emerald-200">
              🎯 ~{currentWorkout.tss} TSS
            </span>
          </div>
        </div>

        {/* Gráfica Stepped Profile de Intervalos estilo Intervals.icu */}
        <div className="space-y-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
            <span>Perfil de Esfuerzo (Zonas Z1 a Z5)</span>
            <span className="text-emerald-700 font-bold">Línea de Umbral (100% FTP)</span>
          </div>

          <WorkoutChart
            workoutDoc={currentWorkout.doc}
            discipline={currentWorkout.discipline}
            className="rounded-xl border border-slate-200 bg-white"
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1 pt-1">
            <span>Calentamiento Progresivo</span>
            <span>Bloques Clave de Potencia</span>
            <span>Enfriamiento Activo</span>
          </div>
        </div>

        {/* Selector de Sesiones de Ejemplo */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-700 mb-3">
            Prueba cómo lucen diferentes sesiones estructuradas:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SAMPLE_WORKOUTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveWorkoutIdx(idx)}
                className={`text-left p-3 rounded-xl border text-xs transition cursor-pointer ${
                  activeWorkoutIdx === idx
                    ? "bg-cyan-50 border-cyan-400 text-cyan-950 font-bold shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-medium"
                }`}
              >
                <div className="font-mono text-[10px] text-slate-400 uppercase">
                  {item.discipline} • {item.duration}
                </div>
                <div className="truncate mt-1">{item.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
