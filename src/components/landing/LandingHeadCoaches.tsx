"use client";

import React from "react";
import { Quote } from "lucide-react";

interface CoachSummary {
  name: string;
  initials: string;
  role: string;
  discipline: string;
  quote: string;
}

const COACHES: CoachSummary[] = [
  {
    name: "Renato Canova",
    initials: "RC",
    role: "Entrenador de Campeones Mundiales de Maratón (Kenia)",
    discipline: "Maratón",
    quote: "La especificidad biomecánica a ritmo de carrera supera al volumen vacío.",
  },
  {
    name: "Jack Daniels, PhD",
    initials: "JD",
    role: "Padre del Sistema VDOT y Fisiólogo Olímpico",
    discipline: "Running",
    quote: "Entrena al menor costo fisiológico posible para lograr la máxima adaptación.",
  },
  {
    name: "Dr. Andrew Coggan",
    initials: "AC",
    role: "Creador del Sistema de 7 Zonas de Potencia & FTP",
    discipline: "Ciclismo",
    quote: "La potencia en vatios es la única métrica honesta e inmune al calor o estrés.",
  },
  {
    name: "Dr. Jan Olbrecht",
    initials: "JO",
    role: "Fisiólogo de Campeones Mundiales e IRONMAN",
    discipline: "Triatlón",
    quote: "El lactato no es un desecho; es el combustible principal del deportista.",
  },
  {
    name: "Joe Friel",
    initials: "JF",
    role: "Fundador de la Periodización Moderna en Triatlón",
    discipline: "Periodización",
    quote: "El descanso no es la ausencia de entrenamiento; es cuando el cuerpo se reconstruye.",
  },
  {
    name: "Dr. Stephen Seiler",
    initials: "SS",
    role: "Investigador del Modelo Polarizado 80/20",
    discipline: "Fisiología",
    quote: "El 80% del volumen debe ser en Zona 2 pura para multiplicar las mitocondrias.",
  },
];

export const LandingHeadCoaches: React.FC = () => {
  return (
    <section id="headcoaches" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2.5">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
          Metodólogos de Autoridad
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Principios de Entrenadores de Élite
        </h2>
        <p className="text-sm text-slate-600 font-normal">
          Cada regla y zona de potencia en PULSE AI está respaldada por las mayores eminencias de la ciencia deportiva.
        </p>
      </div>

      {/* Grid Minimalista de Fichas de Autoridad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COACHES.map((coach, idx) => (
          <div
            key={idx}
            className="bg-white/90 border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 backdrop-blur-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                  {coach.initials}
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {coach.discipline}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-950">{coach.name}</h3>
                <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                  {coach.role}
                </div>
              </div>

              <p className="text-xs text-slate-600 italic leading-relaxed pt-1">
                &ldquo;{coach.quote}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
