"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, Eye, Quote, ShieldCheck } from "lucide-react";
import { CoachBioModal } from "./CoachBioModal";
import { COACHES_SCIENCE_DATA, CoachId, CoachMethodology } from "./coachScienceData";

const AUTO_PLAY_INTERVAL = 5000; // 5 segundos por entrenador

export const UnifiedPhysioEngine: React.FC = () => {
  const [selectedCoachId, setSelectedCoachId] = useState<CoachId>("daniels");
  const [selectedCoachForModal, setSelectedCoachForModal] = useState<CoachMethodology | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Rotación automática continua cada 5 segundos (solo se detiene si se abre el modal biográfico)
  useEffect(() => {
    if (selectedCoachForModal !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSelectedCoachId((prevId) => {
        const currentIndex = COACHES_SCIENCE_DATA.findIndex((c) => c.id === prevId);
        const nextIndex = (currentIndex + 1) % COACHES_SCIENCE_DATA.length;
        return COACHES_SCIENCE_DATA[nextIndex].id;
      });
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedCoachForModal, selectedCoachId]);

  const activeCoach =
    COACHES_SCIENCE_DATA.find((c) => c.id === selectedCoachId) || COACHES_SCIENCE_DATA[0];

  return (
    <section id="metodologia" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
      {/* Cabecera del Motor con Branding PULSE AI */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
          <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-emerald-500/40">
            <img src="/pulse-icon.jpg" alt="PULSE" className="w-full h-full object-cover" />
          </div>
          <span className="font-mono uppercase tracking-wider text-[11px]">
            PULSE AI™ · METODOLOGÍA CIENTÍFICA APLICADA
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
          La Metodología Científica detrás de tu Plan
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Los métodos comprobados de los 4 grandes entrenadores del mundo, adaptados automáticamente a tu nivel. Haz clic en cualquiera para conocer su fórmula.
        </p>
      </div>

      {/* Selector Visual de los 4 Entrenadores con Indicador de Progreso */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto mb-8">
        {COACHES_SCIENCE_DATA.map((coach) => {
          const isActive = selectedCoachId === coach.id;
          return (
            <button
              key={coach.id}
              type="button"
              onClick={() => setSelectedCoachId(coach.id)}
              className={`relative text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex items-center gap-3 ${
                isActive
                  ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/30 scale-[1.02]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 shadow-2xs"
              }`}
            >
              {/* Barra de Progreso Activa en el Carrusel */}
              {isActive && (
                <span
                  key={`progress-${selectedCoachId}`}
                  className="absolute bottom-0 left-0 h-1 bg-emerald-500 rounded-full animate-[progress_5s_linear]"
                  style={{ animationDuration: `${AUTO_PLAY_INTERVAL}ms` }}
                />
              )}

              {/* Avatar Compacto del Entrenador */}
              <div className="w-10 h-10 min-w-10 max-w-10 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs shrink-0">
                <img
                  src={coach.avatarUrl}
                  alt={coach.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-slate-900 truncate">
                  {coach.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate font-medium">
                  {coach.tabSubtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tarjeta Principal del Entrenador Activo con Transición Fluida */}
      <div
        key={activeCoach.id}
        className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-400 shadow-xl p-6 sm:p-10 transition-all duration-300 relative group"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Columna Izquierda: El Principio Científico (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
                <span>{activeCoach.badgeLabel}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 mt-2 tracking-tight group-hover:text-emerald-900 transition-colors">
                {activeCoach.headline}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {activeCoach.description}
              </p>
            </div>

            {/* 3 Viñetas con checks verde esmeralda */}
            <div className="space-y-3 pt-1">
              {activeCoach.bullets.map((bullet, bIdx) => (
                <div key={bIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span className="leading-snug">{bullet}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
              <span>Adaptado automáticamente a tu condición física por PULSE AI™</span>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Clickeable del Entrenador (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <div
              onClick={() => setSelectedCoachForModal(activeCoach)}
              className="bg-slate-50/90 hover:bg-emerald-50/50 rounded-2xl border border-slate-200 hover:border-emerald-300 p-6 space-y-4 text-left shadow-2xs transition-all cursor-pointer hover:scale-[1.01]"
            >
              {/* Foto compacta y datos del entrenador */}
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 min-w-14 max-w-14 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-xs shrink-0 bg-white">
                  <img
                    src={activeCoach.avatarUrl}
                    alt={activeCoach.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-950">
                    {activeCoach.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeCoach.roleTitle}
                  </p>
                </div>
              </div>

              {/* Cita Célebre */}
              <div className="relative pl-4 border-l-2 border-emerald-400 py-0.5">
                <Quote className="w-3.5 h-3.5 text-emerald-600/50 absolute -top-1 left-0 -translate-x-1/2 bg-slate-50" strokeWidth={1.75} />
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  &ldquo;{activeCoach.quote}&rdquo;
                </p>
              </div>

              {/* Botón para abrir el Modal Biográfico */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCoachForModal(activeCoach);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />
                  <span>
                    Conocer más sobre el método {activeCoach.name.startsWith("Dr.") ? "del" : "de"} {activeCoach.name}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Biográfico Detallado */}
      <CoachBioModal
        coach={selectedCoachForModal}
        isOpen={selectedCoachForModal !== null}
        onClose={() => setSelectedCoachForModal(null)}
      />
    </section>
  );
};
