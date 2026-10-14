"use client";

import React, { useState } from "react";
import { ArrowUpRight, BookOpen, Quote, ShieldCheck } from "lucide-react";
import { CoachBioModal, CoachData } from "./CoachBioModal";

const ELITE_COACHES: CoachData[] = [
  {
    id: "canova",
    name: "Renato Canova",
    initials: "RC",
    title: "Entrenador Olímpico de Maratón (Kenia e Italia)",
    discipline: "Maratón de Élite",
    focus: "Resistencia Específica al Ritmo Maratón y Cap Biomecánico de 3h",
    quote: "La especificidad biomecánica a ritmo de carrera supera al volumen vacío. El cuerpo debe aprender a reclutar fibras rápidas en estado de glucógeno depletado.",
    biomechanicalImpact: "Revolucionó el atletismo de fondo mundial eliminando los rodajes lentos vacíos. Demostró que entrenamientos superiores a 3 horas generan microlesiones fibrilares irreversibles sin ganancia mitocondrial adicional, priorizando bloques fraccionados al 98-102% del ritmo maratón.",
    pulseApplication: "Algoritmo de Cap Biomecánico de 3h en tiradas dominicales y cálculo automático de bloques fraccionados a Ritmo Específico de Maratón según tu Stryd Critical Power.",
  },
  {
    id: "daniels",
    name: "Dr. Jack Daniels",
    initials: "JD",
    title: "Fisiólogo Olímpico y Creador del Sistema VDOT",
    discipline: "Running & Fisiología",
    focus: "Fórmula VDOT, Zonas Fisiológicas y Economía de Carrera",
    quote: "Entrena al menor costo fisiológico posible para lograr la máxima adaptación biológica requerida.",
    biomechanicalImpact: "Concibió la tabla universal VDOT correlacionando el consumo máximo de oxígeno (VO2max) con la economía de carrera. Estableció los ritmos exactos para Easy, Marathon, Threshold, Interval y Repetition, demostrando el impacto específico de cada zona en la capilarización y aclaramiento del lactato.",
    pulseApplication: "Prescripción de zonas fisiológicas al milímetro. El motor clasifica automáticamente tus series de umbral (T) e intervalos (I) garantizando el estímulo metabólico óptimo sin sobrecarga neuromuscular.",
  },
  {
    id: "coggan",
    name: "Dr. Andrew Coggan",
    initials: "AC",
    title: "Fisiólogo del Ejercicio & Pionero de Métricas de Potencia",
    discipline: "Ciclismo & Potencia",
    focus: "Potencia Ciclista (FTP), Normalización (NP) y Carga TSS",
    quote: "La potencia en vatios es la única métrica honesta e inmune al calor, fatiga acumulada o estrés externo.",
    biomechanicalImpact: "Creador de los estándares mundiales de Functional Threshold Power (FTP), Potencia Normalizada (NP), Factor de Intensidad (IF) y Training Stress Score (TSS). Permitió cuantificar con rigor matemático la carga metabólica real del ejercicio.",
    pulseApplication: "Cálculo en tiempo real de TSS, Fitness (CTL), Fatiga (ATL) y Forma (TSB). Distribución de series por % FTP en rodillo o vatios Stryd con control del factor de variabilidad de la sesión.",
  },
  {
    id: "seiler",
    name: "Dr. Stephen Seiler",
    initials: "SS",
    title: "Investigador Científico de Deportes de Resistencia",
    discipline: "Modelo Polarizado",
    focus: "Entrenamiento Polarizado 80/20 y Preservación del Umbral Z1/Z2",
    quote: "El 80% del volumen debe ser verdaderamente fácil para que el 20% restante pueda ser ejecutado con máxima calidad.",
    biomechanicalImpact: "Descubrió que los atletas de élite realizan el 80% de su volumen en Zona 1/Zona 2 estricta (por debajo del primer umbral ventilatorio VT1) y solo el 20% en alta intensidad, evitando la fatiga crónica del sistema nervioso autónomo generada en la zona gris intermedia.",
    pulseApplication: "Monitoreo estricto del ratio de polarización semanal. Si el sistema detecta exceso de volumen en zona gris, recalibra automáticamente la semana forzando rodajes Z1/Z2 de baja tensión celular.",
  },
];

export const CoachesScienceSection: React.FC = () => {
  const [selectedCoach, setSelectedCoach] = useState<CoachData | null>(null);

  return (
    <section id="metodologia" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full relative z-10">
      {/* Encabezado de la Sección */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
          Metodología de Élite • Evidencia Científica
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
          La Ciencia de los 4 Grandes Metodólogos
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
          PULSE AI no improvisa algoritmos de caja negra. Cada vatio, cada serie de umbral y cada descanso están gobernados por las reglas maestras de los fisiólogos más laureados del deporte mundial.
        </p>
      </div>

      {/* Grid de los 4 Entrenadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {ELITE_COACHES.map((coach) => (
          <div
            key={coach.id}
            onClick={() => setSelectedCoach(coach)}
            className="group relative bg-white/95 border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between space-y-5 cursor-pointer backdrop-blur-xl"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedCoach(coach);
              }
            }}
          >
            <div className="space-y-4">
              {/* Cabecera de Tarjeta: Avatar y Disciplina */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-mono font-bold text-sm shadow-md shadow-emerald-600/15 group-hover:scale-105 transition-transform">
                    {coach.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-950 group-hover:text-emerald-700 transition-colors">
                      {coach.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {coach.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-600 transition-colors">
                  <span className="text-[11px] font-mono font-bold hidden sm:inline">Ver método</span>
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>

              {/* Foco Biomecánico */}
              <div className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700">
                {coach.focus}
              </div>

              {/* Cita Célebre */}
              <div className="relative pl-4 border-l-2 border-emerald-400/50 py-0.5">
                <Quote className="h-3.5 w-3.5 text-emerald-600/40 absolute -top-1 left-0 -translate-x-1/2 bg-white" strokeWidth={1.75} />
                <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-2">
                  &ldquo;{coach.quote}&rdquo;
                </p>
              </div>
            </div>

            {/* Micro-badge de integración con PULSE AI */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
                <span>Integrado en el motor PULSE</span>
              </div>
              <span className="text-slate-400 font-mono text-[10px] group-hover:text-emerald-600 transition-colors">
                Toca para abrir bio &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Biografía en Profundidad */}
      <CoachBioModal
        coach={selectedCoach}
        isOpen={selectedCoach !== null}
        onClose={() => setSelectedCoach(null)}
      />
    </section>
  );
};
