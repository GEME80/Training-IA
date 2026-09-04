"use client";

import React, { useState } from "react";
import { Award, BookOpen, Quote, ChevronRight, Footprints, Bike, Layers, FlaskConical, Trophy, HeartPulse, LucideIcon } from "lucide-react";

interface CoachProfile {
  name: string;
  initials: string;
  role: string;
  discipline: string;
  origin: string;
  badge: string;
  icon: LucideIcon;
  bio: string;
  legacy: string;
  methodContribution: string;
}

const COACHES: CoachProfile[] = [
  {
    name: "Renato Canova",
    initials: "RC",
    role: "Entrenador de Campeones Mundiales de Maratón",
    discipline: "Maratón & Fondo",
    origin: "Italia / Kenia",
    badge: "Leyenda Olímpica",
    icon: Footprints,
    bio: "Pionero del entrenamiento de fondo en Iten (Kenia). Ha dirigido a campeones mundiales, medallistas olímpicos y plusmarquistas globales de 42K como Wilson Kipsang y Florence Kiplagat.",
    legacy: "Revolucionó el maratón mundial sustituyendo rodajes lentos por bloques específicos al 95-102% del ritmo objetivo de competición.",
    methodContribution: "Periodización Canova 42K con bloques de ritmo maratón y tiradas cumbre progresivas.",
  },
  {
    name: "Jack Daniels, PhD",
    initials: "JD",
    role: "Padre del Sistema VDOT y Fisiólogo Olímpico",
    discipline: "Running 5K a Maratón",
    origin: "Estados Unidos",
    badge: "Mejor Entrenador",
    icon: Award,
    bio: "Doble medallista olímpico y doctor en fisiología del ejercicio. Nombrado 'El Mejor Entrenador del Mundo' por Runner's World. Creador de la célebre fórmula VDOT que calcula ritmos de entrenamiento exactos.",
    legacy: "Estableció el estándar universal para la prescripción de umbral anaeróbico, intervalos de VO2max y ritmos de recuperación.",
    methodContribution: "Fórmulas VDOT, zonas de potencia y micro-intervalos de velocidad aeróbica.",
  },
  {
    name: "Dr. Andrew Coggan",
    initials: "AC",
    role: "Creador del Sistema de 7 Zonas de Potencia & FTP",
    discipline: "Ciclismo & Rodillo",
    origin: "Estados Unidos",
    badge: "Pionero del Vatio",
    icon: Bike,
    bio: "Científico fisiólogo de renombre mundial. Transformó el ciclismo profesional al introducir la potencia en vatios (Functional Threshold Power - FTP), Normalized Power (NP) y TSS.",
    legacy: "Eliminó las suposiciones basadas en pulsaciones para entrenar con precisión matemática en vatios.",
    methodContribution: "7 Zonas de Potencia FTP en Ciclismo, densidad Sweetspot y curvas de potencia.",
  },
  {
    name: "Dr. Jan Olbrecht",
    initials: "JO",
    role: "Fisiólogo Asesor de Campeones Mundiales e IRONMAN",
    discipline: "Triatlón & Natación",
    origin: "Bélgica",
    badge: "Ciencia del Triatlón",
    icon: FlaskConical,
    bio: "Autor del legendario libro 'The Science of Winning'. Asesor fisiológico de campeones mundiales en IRONMAN (Luc Van Lierde) y medallistas olímpicos de natación.",
    legacy: "Desmitificó el lactato, demostrando cómo modular la capacidad glucolítica y aeróbica para usar el lactato como energía.",
    methodContribution: "Modelos Triatlón 70.3 y 140.6, sesiones concurrentes y transiciones Brick.",
  },
  {
    name: "Joe Friel",
    initials: "JF",
    role: "Fundador de la Periodización Moderna en Triatlón",
    discipline: "Triatlón & Ciclismo",
    origin: "Estados Unidos",
    badge: "Biblia del Triatleta",
    icon: Layers,
    bio: "Autor de los bestsellers mundiales 'The Triathlete's Training Bible' y 'The Cyclist's Training Bible'. Fundador de los principios de carga y recuperación concurrente.",
    legacy: "Consagró la estructura de macrociclos (Base, Construcción, Pico y Tapering) para resistencia.",
    methodContribution: "Estructura de fases de temporada y control de sobrecarga en multi-disciplina.",
  },
  {
    name: "Pete Pfitzinger",
    initials: "PP",
    role: "Doble Maratonista Olímpico y Fisiólogo",
    discipline: "Maratón & 10K",
    origin: "Estados Unidos",
    badge: "Maratón Avanzado",
    icon: Trophy,
    bio: "Maratonista olímpico estadounidense y fisiólogo del ejercicio. Autor de 'Advanced Marathoning', la guía de referencia global para maratonistas sub-3h.",
    legacy: "Maestro de la fatiga acumulada controlada, donde el atleta aprende a correr solvente en los últimos 10 kilómetros.",
    methodContribution: "Pfitz Maratón, semanas de descarga 3:1 y afinamiento decreciente.",
  },
  {
    name: "Dr. Stephen Seiler",
    initials: "SS",
    role: "Investigador del Modelo Polarizado 80/20",
    discipline: "Resistencia General",
    origin: "Noruega / EE.UU.",
    badge: "Estándar 80/20",
    icon: HeartPulse,
    bio: "Científico del deporte radicado en Noruega. Sus estudios descubrieron que los mejores fondistas realizan el 80% de su volumen en Zona 2 suave y el 20% en alta intensidad.",
    legacy: "Demostró que el entrenamiento excesivo en zonas medias fatiga sin aportar mejoras mitocondriales.",
    methodContribution: "Modelo Polarizado 80/20, longevidad cardiovascular y salud mitocondrial.",
  },
];

export const LandingHeadCoaches: React.FC = () => {
  const [selectedCoach, setSelectedCoach] = useState<number>(0);
  const coach = COACHES[selectedCoach];
  const CoachIcon = coach.icon;

  return (
    <section id="headcoaches" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
          Salón de la Fama de la Fisiología Deportiva
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Guiado por los Mejores Head Coaches del Mundo
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          PULSE AI no improvisa. Cada zona de potencia y progresión matemática está respaldada por las metodologías contrastadas de estas autoridades olímpicas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Selector de Coaches */}
        <div className="lg:col-span-5 space-y-2">
          {COACHES.map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCoach(idx)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedCoach === idx
                    ? "bg-white border-cyan-400 shadow-md shadow-cyan-500/5 ring-1 ring-cyan-400"
                    : "bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-800 shrink-0">
                    {item.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-950 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate font-normal">
                      {item.discipline} • {item.origin}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Ficha de Autoridad del Coach Seleccionado */}
        <div className="lg:col-span-7 bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/30 backdrop-blur-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center shrink-0">
                <CoachIcon className="h-6 w-6 text-cyan-700" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-cyan-700 uppercase">
                  {coach.badge} • {coach.origin}
                </span>
                <h3 className="text-2xl font-black text-slate-950 mt-0.5">
                  {coach.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">{coach.role}</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {coach.discipline}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
              Biografía & Trayectoria
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {coach.bio}
            </p>
          </div>

          <div className="space-y-2 bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-600" />
              <span>Legado Fisiológico Clave</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {coach.legacy}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center gap-2.5 text-xs font-medium text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              <strong>Integrado en PULSE AI:</strong> {coach.methodContribution}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
