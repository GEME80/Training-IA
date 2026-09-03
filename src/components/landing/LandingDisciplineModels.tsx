"use client";

import React, { useState } from "react";
import { Check, Target, Compass, Award, ArrowUpRight } from "lucide-react";

type DisciplineKey = "running" | "cycling" | "triathlon";

interface DisciplineData {
  title: string;
  badge: string;
  subtitle: string;
  models: Array<{
    name: string;
    distance: string;
    idealFor: string;
    method: string;
  }>;
  benefits: Array<{
    title: string;
    desc: string;
    icon: string;
  }>;
  highlight: string;
}

const DISCIPLINES: Record<DisciplineKey, DisciplineData> = {
  running: {
    title: "Modelos de Carrera a Pie (Running & Trail)",
    badge: "Potencia Stryd & Ritmos VDOT",
    subtitle:
      "Diseñados para romper tus mejores marcas personales sin caer en el sobreentrenamiento ni en lesiones de sóleo o Aquiles.",
    models: [
      {
        name: "Maratón 42K",
        distance: "42.195 km",
        idealFor: "Dominar los 42K sin chocar contra el muro",
        method: "Canova & Pfitzinger",
      },
      {
        name: "Media Maratón 21K",
        distance: "21.097 km",
        idealFor: "Potencia de crucero en umbral anaeróbico",
        method: "Jack Daniels & Magness",
      },
      {
        name: "10K / 5K Speed",
        distance: "5 a 10 km",
        idealFor: "Velocidad neuromuscular y potencia aeróbica VO2max",
        method: "Billat & Daniels",
      },
      {
        name: "Trail & Montaña",
        distance: "25K a Ultra",
        idealFor: "Desnivel acumulado D+ y fuerza excéntrica",
        method: "Jason Koop & Kilian Jornet",
      },
    ],
    benefits: [
      {
        title: "Vatios Reales con Stryd",
        desc: "Entrena con potencia milimétrica que no se distorsiona por viento en contra ni pendientes.",
        icon: "⚡",
      },
      {
        title: "Fondos Cumbre Progresivos",
        desc: "Tiradas largas calculadas al milímetro (con cap de 3h) para proteger tus articulaciones.",
        icon: "🛡️",
      },
      {
        title: "Afinamiento (Tapering) Científico",
        desc: "Reducción precisa de fatiga manteniendo el ritmo para volar el día de la prueba.",
        icon: "🎯",
      },
    ],
    highlight: "Sincronización directa de series estructuradas (% FTP + Tiempo) a tu Garmin o Coros.",
  },
  cycling: {
    title: "Modelos de Ciclismo de Rendimiento",
    badge: "7 Zonas de Potencia FTP",
    subtitle:
      "Maximiza tus vatios por kilo (W/kg), resiste en puertos prolongados y entrena con inteligencia en rodillo y carretera.",
    models: [
      {
        name: "Gran Fondo & Resistencia",
        distance: "80 a 160 km",
        idealFor: "Densidad de potencia y economía mitocondrial Z2",
        method: "Dr. Andrew Coggan & Allen",
      },
      {
        name: "Escalada & Puertos",
        distance: "Desnivel + W/kg",
        idealFor: "Potencia sostenida en subidas y series Over-Under",
        method: "Hunter Allen",
      },
      {
        name: "Criterium & Potencia Corta",
        distance: "Circuitos rápidos",
        idealFor: "Aceleraciones repetidas y tolerancia glucolítica",
        method: "Coggan 7 Zonas",
      },
    ],
    benefits: [
      {
        title: "Zonas de FTP Personalizadas",
        desc: "Prescripción de vatios por umbral funcional calibrados con tests de rampa y 20 min.",
        icon: "🚴",
      },
      {
        title: "Sweetspot sin Sobrecarga",
        desc: "Bloques de alta densidad aeróbica que multiplican tu fondo sin agotar tus piernas.",
        icon: "🔥",
      },
      {
        title: "Fondo Extensivo Inteligente",
        desc: "Salidas de fin de semana con ritmo de cadencia optimizado para quemar grasa eficientemente.",
        icon: "⏱️",
      },
    ],
    highlight: "Compatibilidad total con rodillos inteligentes, potenciómetros y ciclocomputadores Garmin Edge.",
  },
  triathlon: {
    title: "Modelos de Triatlón Multidisciplina",
    badge: "Eficiencia Metabólica Concurrente",
    subtitle:
      "Combina natación, ciclismo y carrera a pie en un calendario armónico que evita la interferencia muscular.",
    models: [
      {
        name: "Triatlón Media Distancia 70.3",
        distance: "1.9k + 90k + 21.1k",
        idealFor: "Resistencia concurrente y nutrición en carrera",
        method: "Joe Friel & Dr. Jan Olbrecht",
      },
      {
        name: "Full 140.6 / IRONMAN",
        distance: "3.8k + 180k + 42.2k",
        idealFor: "Gestión glucogénica profunda y economía de carrera",
        method: "Olbrecht & Friel",
      },
      {
        name: "Sprint & Olímpico",
        distance: "Distancias cortas",
        idealFor: "Transiciones T1/T2 veloces y potencia anaeróbica",
        method: "Joe Friel",
      },
    ],
    benefits: [
      {
        title: "Sesiones Brick Clave",
        desc: "Transiciones de bicicleta aero a carrera a pie para que tus piernas corran fluidas desde la T2.",
        icon: "🧱",
      },
      {
        title: "Cero Interferencia Negativa",
        desc: "Distribución de sesiones que compensa el impacto mecánico con el bajo estrés articular del agua.",
        icon: "🏊",
      },
      {
        title: "Dinámica de Lactato Óptima",
        desc: "Aplica las leyes de Jan Olbrecht para convertir el lactato en tu mayor fuente de energía.",
        icon: "🧪",
      },
    ],
    highlight: "Integración simultánea de zonas de natación CSS, vatios en bici y potencia Stryd en carrera.",
  },
};

export const LandingDisciplineModels: React.FC = () => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineKey>("running");
  const data = DISCIPLINES[selectedDiscipline];

  return (
    <section id="modelos" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
          Metodologías Deportivas de Élite
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Modelos Específicos para Cada Objetivo
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          No creemos en planes genéricos de PDF. Cada disciplina cuenta con una arquitectura fisiológica construida por las mayores mentes de la ciencia del ejercicio.
        </p>
      </div>

      {/* Selector de Pestañas de Disciplinas */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex p-1.5 rounded-2xl bg-white/90 border border-slate-200 shadow-sm backdrop-blur-md gap-1">
          <button
            type="button"
            onClick={() => setSelectedDiscipline("running")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedDiscipline === "running"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>🏃 Running</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedDiscipline("cycling")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedDiscipline === "cycling"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>🚴 Ciclismo</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedDiscipline("triathlon")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedDiscipline === "triathlon"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>🏊🚴🏃 Triatlón</span>
          </button>
        </div>
      </div>

      {/* Contenido Dinámico de la Disciplina Seleccionada */}
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Encabezado de la Disciplina */}
        <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/30 backdrop-blur-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-700 uppercase tracking-wider">
                {data.badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">
                {data.title}
              </h3>
            </div>
            <span className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
              {data.highlight}
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            {data.subtitle}
          </p>

          {/* Grid de Modelos Específicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {data.models.map((mod, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-4 bg-slate-50/90 border border-slate-200/80 hover:border-cyan-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                      {mod.distance}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-2">{mod.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">{mod.idealFor}</p>
                </div>
                <div className="border-t border-slate-200 pt-2 text-[11px] font-mono text-slate-600">
                  <span className="text-slate-400">Método:</span> <strong>{mod.method}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Tarjetas de Beneficios Comerciales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.benefits.map((ben, idx) => (
            <div
              key={idx}
              className="bg-white/90 border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-200/20 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-cyan-300 transition-all"
            >
              <div className="space-y-2">
                <div className="text-3xl">{ben.icon}</div>
                <h4 className="text-lg font-bold text-slate-950">{ben.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {ben.desc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 border-t border-slate-100 pt-3">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Adaptación Biológica Garantizada</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
