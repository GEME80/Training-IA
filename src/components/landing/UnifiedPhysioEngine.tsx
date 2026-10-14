"use client";

import React, { useState } from "react";
import { Shield, Activity, Zap, Timer, CheckCircle2, Eye, Quote, ShieldCheck } from "lucide-react";
import { CoachBioModal, CoachData } from "./CoachBioModal";

interface PhysioPillar {
  id: string;
  tabTitle: string;
  tabIcon: React.ElementType;
  ruleTitle: string;
  ruleDescription: string;
  bullets: string[];
  coach: CoachData;
}

const PHYSIO_PILLARS: PhysioPillar[] = [
  {
    id: "canova",
    tabTitle: "Prevención & Cap 3h (Canova)",
    tabIcon: Shield,
    ruleTitle: "Tope Biomecánico de 3 Horas y Asimilación 3:1",
    ruleDescription:
      "La ciencia moderna demostró que superar las 3 horas de carrera continua en fondos dominicales destruye tejido conectivo sin generar adaptaciones mitocondriales adicionales.",
    bullets: [
      "Bloqueo estricto a 3 horas de tirada larga para blindar tendones, sóleos y rodillas contra sobreentrenamiento.",
      "Fraccionamiento de fondos con bloques específicos al 98-102% del ritmo maratón según tu potencia crítica.",
      "Periodización con ciclos 3:1: tres microciclos de carga progresiva seguidos por una semana de asimilación obligatoria.",
    ],
    coach: {
      id: "canova",
      name: "Renato Canova",
      initials: "RC",
      imageUrl: "/coaches/renato-canova.png",
      title: "Entrenador Olímpico de Maratón (Kenia e Italia)",
      discipline: "Maratón de Élite",
      focus: "Resistencia Específica al Ritmo Maratón y Cap Biomecánico de 3h",
      quote: "La especificidad biomecánica a ritmo de carrera supera al volumen vacío. El cuerpo debe aprender a reclutar fibras rápidas en estado de glucógeno depletado.",
      biomechanicalImpact: "Eliminó el kilometraje basura en maratón mundial. Demostró que fondos superiores a 3 horas generan microlesiones fibrilares irreversibles, priorizando bloques fraccionados a ritmo competitivo.",
      pulseApplication: "Algoritmo de Cap Biomecánico de 3h en tiradas dominicales y cálculo automático de bloques fraccionados a Ritmo Específico de Maratón según tu Stryd Critical Power.",
    },
  },
  {
    id: "banister",
    tabTitle: "Adaptación Diaria HRV (Banister)",
    tabIcon: Activity,
    ruleTitle: "Modelo Impulso-Respuesta y Variabilidad Cardíaca",
    ruleDescription:
      "Tu sistema nervioso autónomo nunca miente. El algoritmo de Eric Banister y Stephen Seiler cruza tu HRV matutino con la carga acumulada para recalibrar la sesión del día.",
    bullets: [
      "Lectura matutina de variabilidad cardíaca (HRV rMSSD) que detecta fatiga del sistema parasimpático antes de salir a entrenar.",
      "Sustitución automática instantánea: si tu TSB cae bajo -10, la sesión de umbral se modula a rodaje Z1 regenerativo.",
      "Ratio polarizado 80/20 estricto: el 80% del volumen semanal se ejecuta en Zona 1/2 real para multiplicar capilares sin estrés crónico.",
    ],
    coach: {
      id: "seiler",
      name: "Dr. Stephen Seiler",
      initials: "SS",
      imageUrl: "/coaches/stephen-seiler.jpg",
      title: "Investigador Científico de Deportes de Resistencia",
      discipline: "Modelo Polarizado & Banister",
      focus: "Entrenamiento Polarizado 80/20 y Preservación del Umbral Z1/Z2",
      quote: "El 80% del volumen debe ser verdaderamente fácil para que el 20% restante pueda ser ejecutado con máxima calidad.",
      biomechanicalImpact: "Descubrió que los atletas de élite realizan el 80% de su volumen por debajo del umbral ventilatorio VT1, evitando la fatiga crónica del sistema nervioso autónomo generada en la zona gris.",
      pulseApplication: "Monitoreo del ratio de polarización semanal y modelo impulso-respuesta de Banister para calcular tu Fitness (CTL), Fatiga (ATL) y Forma (TSB) al segundo.",
    },
  },
  {
    id: "coggan",
    tabTitle: "Potencia y Vatios (Coggan & Stryd)",
    tabIcon: Zap,
    ruleTitle: "Cuantificación por Potencia Normalizada (NP) y TSS",
    ruleDescription:
      "El pulso cardíaco sufre de deriva por calor, estrés y cafeína. Los vatios de potencia son la métrica honesta que calcula el coste fisiológico real e inmune al viento.",
    bullets: [
      "Prescripción en vatios exactos con Stryd Running Power y medidores de potencia ciclistas en rodillo o ruta.",
      "Cálculo del Training Stress Score (TSS) y Factor de Intensidad (IF) para cada serie y microciclo.",
      "Eliminación de la deriva cardíaca: mantén el mismo esfuerzo celular en subidas pronunciadas o viento en contra sin sobrecargar el miocardio.",
    ],
    coach: {
      id: "coggan",
      name: "Dr. Andrew Coggan",
      initials: "AC",
      imageUrl: "/coaches/andrew-coggan.jpg",
      title: "Fisiólogo del Ejercicio & Pionero de Métricas de Potencia",
      discipline: "Ciclismo & Potencia Stryd",
      focus: "Potencia Ciclista (FTP), Normalización (NP) y Carga TSS",
      quote: "La potencia en vatios es la única métrica honesta e inmune al calor, fatiga acumulada o estrés externo.",
      biomechanicalImpact: "Creador de los estándares mundiales de Functional Threshold Power (FTP), Potencia Normalizada (NP) y TSS. Permitió cuantificar con rigor matemático la carga metabólica real del ejercicio.",
      pulseApplication: "Cálculo en tiempo real de TSS, Fitness (CTL), Fatiga (ATL) y Forma (TSB). Distribución de series por % FTP en rodillo o vatios Stryd con control del factor de variabilidad.",
    },
  },
  {
    id: "daniels",
    tabTitle: "Ritmos de Precisión VDOT (Daniels)",
    tabIcon: Timer,
    ruleTitle: "Fórmula VDOT y Zonas Fisiológicas Específicas",
    ruleDescription:
      "El Dr. Jack Daniels vinculó el consumo máximo de oxígeno (VO2max) con la economía de carrera para diseñar las zonas metabólicas más respetadas del atletismo olímpico.",
    bullets: [
      "Calibración de ritmos de entrenamiento (Easy, Marathon, Threshold, Interval, Repetition) según tu marca más reciente.",
      "Estímulo óptimo del aclaramiento de lactato en series de umbral (T) al 88-92% de tu frecuencia cardíaca máxima.",
      "Economía de carrera optimizada: series rápidas fraccionadas que mejoran la eficiencia neuromuscular con el mínimo costo biológico.",
    ],
    coach: {
      id: "daniels",
      name: "Dr. Jack Daniels",
      initials: "JD",
      imageUrl: "/coaches/jack-daniels.jpg",
      title: "Fisiólogo Olímpico y Creador del Sistema VDOT",
      discipline: "Running & Fisiología",
      focus: "Fórmula VDOT, Zonas Fisiológicas y Economía de Carrera",
      quote: "Entrena al menor costo fisiológico posible para lograr la máxima adaptación biológica requerida.",
      biomechanicalImpact: "Concibió la tabla universal VDOT correlacionando el VO2max con la economía de carrera. Estableció los ritmos exactos para cada zona demostrando su impacto específico en la capilarización celular.",
      pulseApplication: "Prescripción de zonas fisiológicas al milímetro. El motor clasifica automáticamente tus series de umbral (T) e intervalos (I) garantizando el estímulo metabólico óptimo sin sobrecarga neuromuscular.",
    },
  },
];

export const UnifiedPhysioEngine: React.FC = () => {
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [selectedCoach, setSelectedCoach] = useState<CoachData | null>(null);

  const activePillar = PHYSIO_PILLARS[activeTabIdx];

  return (
    <section id="metodologia" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
      {/* Cabecera del Motor */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
          CIENCIA DEL ALTO RENDIMIENTO
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
          El Motor Fisiológico que Gobierna tu Plan
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Los principios biomecánicos de los mayores preparadores olímpicos, orquestados en tiempo real por inteligencia artificial.
        </p>
      </div>

      {/* Selector de Pestañas Interactivas (Tabs) */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 max-w-4xl mx-auto mb-8 shadow-2xs">
        {PHYSIO_PILLARS.map((pillar, idx) => {
          const Icon = pillar.tabIcon;
          const isActive = activeTabIdx === idx;
          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => setActiveTabIdx(idx)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-white text-emerald-900 shadow-sm border border-slate-200/80 scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-500"}`} strokeWidth={1.75} />
              <span className="whitespace-nowrap">{pillar.tabTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido del Panel Activo (2 Columnas Equilibradas) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Columna Izquierda: La Regla Biomecánica (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Regla Biomecánica Activa
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 mt-2 tracking-tight">
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
              <span>Orquestado en tiempo real por el motor autónomo PULSE AI</span>
            </div>
          </div>

          {/* Columna Derecha: El Metodólogo de Élite (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 space-y-4 text-left shadow-2xs">
              {/* Foto compacta y datos del entrenador */}
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 min-w-14 max-w-14 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xs shrink-0 bg-white">
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
                  onClick={() => setSelectedCoach(activePillar.coach)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Saber más sobre el método de {activePillar.coach.name}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Biográfico Reutilizable */}
      <CoachBioModal
        coach={selectedCoach}
        isOpen={selectedCoach !== null}
        onClose={() => setSelectedCoach(null)}
      />
    </section>
  );
};
