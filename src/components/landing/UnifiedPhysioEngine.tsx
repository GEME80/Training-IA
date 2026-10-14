"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Eye,
  Quote,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { CoachBioModal, CoachData } from "./CoachBioModal";
import { PHYSIO_PILLARS } from "./physioEngineData";

const AUTO_PLAY_INTERVAL = 6000; // 6 segundos por metodólogo

export const UnifiedPhysioEngine: React.FC = () => {
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [selectedCoach, setSelectedCoach] = useState<CoachData | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Rotación automática tipo carrusel con pausa al interactuar o abrir modal
  useEffect(() => {
    if (isPaused || selectedCoach !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveTabIdx((prev) => (prev + 1) % PHYSIO_PILLARS.length);
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, selectedCoach]);

  const activePillar = PHYSIO_PILLARS[activeTabIdx];

  const handleNext = () => {
    setActiveTabIdx((prev) => (prev + 1) % PHYSIO_PILLARS.length);
  };

  const handlePrev = () => {
    setActiveTabIdx((prev) => (prev - 1 + PHYSIO_PILLARS.length) % PHYSIO_PILLARS.length);
  };

  return (
    <section
      id="metodologia"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cabecera del Motor con Branding PULSE AI */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
          <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-emerald-500/40">
            <img src="/pulse-icon.jpg" alt="PULSE" className="w-full h-full object-cover" />
          </div>
          <span className="font-mono uppercase tracking-wider text-[11px]">
            PULSE AI™ · CIENCIA DEL ALTO RENDIMIENTO
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
          El Motor Fisiológico que Gobierna tu Plan
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Los 4 grandes metodólogos de resistencia vigentes, orquestados en tiempo real por inteligencia artificial. Haz clic en cualquiera para explorar su metodología completa.
        </p>
      </div>

      {/* Controles de Carrusel: Selector Visual de los 4 Entrenadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto mb-6">
        {PHYSIO_PILLARS.map((pillar, idx) => {
          const isActive = activeTabIdx === idx;
          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => {
                setActiveTabIdx(idx);
                setSelectedCoach(pillar.coach);
              }}
              className={`relative text-left p-3 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex items-center gap-3 ${
                isActive
                  ? "bg-white border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[1.02]"
                  : "bg-slate-50/80 hover:bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
              }`}
            >
              {/* Barra de Progreso Activa en el Carrusel */}
              {isActive && (
                <span
                  key={`progress-${activeTabIdx}-${isPaused}`}
                  className={`absolute bottom-0 left-0 h-1 bg-emerald-500 rounded-full ${
                    isPaused ? "w-full" : "animate-[progress_6s_linear]"
                  }`}
                  style={{ animationDuration: `${AUTO_PLAY_INTERVAL}ms` }}
                />
              )}

              {/* Avatar Compacto del Metodólogo */}
              <div className="w-10 h-10 min-w-10 max-w-10 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs shrink-0">
                <img
                  src={pillar.coach.imageUrl}
                  alt={pillar.coach.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-slate-900 truncate">
                  {pillar.coach.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate font-medium">
                  {pillar.tabTitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Barra de Navegación del Carrusel (Flechas + Pausa + Indicador) */}
      <div className="flex items-center justify-between max-w-5xl mx-auto px-2 mb-4 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            title="Entrenador anterior"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            title="Siguiente entrenador"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] transition cursor-pointer"
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                <span>Reanudar rotación</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-slate-500" />
                <span>Pausar</span>
              </>
            )}
          </button>
        </div>

        <div className="text-[11px]">
          Metodólogo <span className="font-bold text-slate-900">{activeTabIdx + 1}</span> de{" "}
          <span className="font-bold text-slate-900">{PHYSIO_PILLARS.length}</span> (auto-rotación activa)
        </div>
      </div>

      {/* Tarjeta Principal del Metodólogo Activo (2 Columnas con Clic Directo al Modal) */}
      <div
        onClick={() => setSelectedCoach(activePillar.coach)}
        className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-400 shadow-xl hover:shadow-2xl p-6 sm:p-10 transition-all duration-300 cursor-pointer group relative"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Columna Izquierda: La Regla Biomecánica (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <activePillar.tabIcon className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
                <span>Regla Biomecánica Activa</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 mt-2 tracking-tight group-hover:text-emerald-900 transition-colors">
                {activePillar.ruleTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {activePillar.ruleDescription}
              </p>
            </div>

            {/* 3 Viñetas con checks verde esmeralda */}
            <div className="space-y-3 pt-1">
              {activePillar.bullets.map((bullet, bIdx) => (
                <div key={bIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span className="leading-snug">{bullet}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
              <span>Orquestado en tiempo real por los algoritmos de PULSE AI™</span>
            </div>
          </div>

          {/* Columna Derecha: El Metodólogo de Élite (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50/90 group-hover:bg-emerald-50/40 rounded-2xl border border-slate-200 group-hover:border-emerald-300 p-6 space-y-4 text-left shadow-2xs transition-all">
              {/* Foto compacta y datos del entrenador */}
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 min-w-14 max-w-14 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-xs shrink-0 bg-white group-hover:scale-105 transition-transform">
                  <img
                    src={activePillar.coach.imageUrl}
                    alt={activePillar.coach.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-950">
                    {activePillar.coach.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {activePillar.coach.title}
                  </p>
                </div>
              </div>

              {/* Cita Célebre */}
              <div className="relative pl-4 border-l-2 border-emerald-400 py-0.5">
                <Quote className="w-3.5 h-3.5 text-emerald-600/50 absolute -top-1 left-0 -translate-x-1/2 bg-slate-50" strokeWidth={1.75} />
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  &ldquo;{activePillar.coach.quote}&rdquo;
                </p>
              </div>

              {/* Botón para abrir el Modal Biográfico */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCoach(activePillar.coach);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 group-hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Ver biografía y metodología completa de {activePillar.coach.name}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Biográfico Detallado */}
      <CoachBioModal
        coach={selectedCoach}
        isOpen={selectedCoach !== null}
        onClose={() => setSelectedCoach(null)}
      />
    </section>
  );
};
