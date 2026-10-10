"use client";

import React from "react";
import {
  Trophy,
  Calendar,
  Sparkles,
  Zap,
  Compass,
  ArrowRight,
} from "lucide-react";

interface MacrocycleEmptyStateProps {
  onOpenWizard: () => void;
  onOpenRaceSettings?: () => void;
}

export const MacrocycleEmptyState: React.FC<MacrocycleEmptyStateProps> = ({
  onOpenWizard,
  onOpenRaceSettings,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn py-2">
      {/* Hero Onboarding Banner */}
      <div className="card-gradient rounded-3xl p-8 sm:p-10 border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-bold text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Arquitectura Fisiológica de Temporada PULSE AI PRO</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Diseña tu Macrociclo a Medida desde Cero
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            No tienes ningún macrociclo activo ni carreras asignadas. PULSE AI PRO utiliza tu telemetría biológica directa de <strong>Intervals.icu</strong> (Stryd CP, Bike FTP y modelo Banister) para calcular periodizaciones adaptativas con ratios de carga y asimilación <strong>3:1</strong> sin riesgo de lesión ni sobreentrenamiento.
          </p>
        </div>
      </div>

      {/* 3 Interactive Pathway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pathway 1: Asistente Guiado Paso a Paso (Recomendado) */}
        <div className="card-gradient rounded-2xl p-6 border border-amber-500/40 flex flex-col justify-between space-y-5 shadow-xl hover:border-amber-500/70 transition group relative">
          <div className="absolute top-4 right-4">
            <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
              Recomendado
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              <Zap className="h-6 w-6 text-black" />
            </div>

            <div>
              <h3 className="text-base font-black text-white group-hover:text-amber-400 transition">
                1. Asistente con IA Paso a Paso
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Configura tu objetivo (ej. Maratón de Tokio 2027 a 29 semanas) y la IA dividirá tu temporada en semanas de mantenimiento previo y 16 semanas de preparación específica con tests Stryd CP y Bike FTP.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenWizard}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 py-3 text-xs font-black text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
          >
            <span>Iniciar Asistente Inteligente</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Pathway 2: Añadir Carrera al Calendario */}
        <div className="card-gradient rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-5 shadow-xl hover:border-slate-700 transition group">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition">
              <Trophy className="h-6 w-6 text-cyan-400" />
            </div>

            <div>
              <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition">
                2. Programar Carrera Objetivo
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Registra manualmente tus competiciones (Maratón, Media Maratón, 10K, Gran Fondo de Ciclismo o Triatlón) en el gestor de eventos con prioridad A, B o C.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenRaceSettings && onOpenRaceSettings()}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900 border border-slate-700 py-3 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition"
          >
            <Calendar className="h-4 w-4 text-cyan-400" />
            <span>Abrir Gestor de Carreras</span>
          </button>
        </div>

        {/* Pathway 3: Bloque de Mantenimiento & Consistencia */}
        <div className="card-gradient rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-5 shadow-xl hover:border-slate-700 transition group">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition">
              <Compass className="h-6 w-6 text-emerald-400" />
            </div>

            <div>
              <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition">
                3. Bloque de Consistencia & Base
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                ¿Sin carrera a la vista? Activa un macrociclo de mantenimiento adaptativo o construcción de base aeróbica con tiradas seguras y preservación de tendones de Aquiles.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenWizard}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
          >
            <Compass className="h-4 w-4 text-emerald-400" />
            <span>Activar Bloque de Consistencia</span>
          </button>
        </div>
      </div>

      {/* Feature Badges Footer */}
      <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/80 flex flex-wrap items-center justify-around gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Integración Bidireccional Intervals.icu
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Prescripción Stryd CP & Bike FTP
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          Gobernanza Fisiológica 3:1 (Regeneración Miofibrilar)
        </span>
      </div>
    </div>
  );
};
