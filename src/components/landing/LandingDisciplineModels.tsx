"use client";

import React, { useState } from "react";
import { Footprints, Bike, Layers, CheckCircle2, ArrowRight } from "lucide-react";

type DisciplineKey = "running" | "cycling" | "triathlon";

interface DisciplineData {
  title: string;
  badge: string;
  desc: string;
  targets: Array<{ name: string; detail: string; method: string }>;
  keyTakeaways: string[];
}

const DISCIPLINES: Record<DisciplineKey, DisciplineData> = {
  running: {
    title: "Running & Trail Running",
    badge: "Potencia Stryd & VDOT",
    desc: "Planes estructurados por vatios exactos inmunes a pendientes y viento. Llega al día de carrera en tu pico óptimo de forma sin riesgo de rotura de sóleo o Aquiles.",
    targets: [
      { name: "Maratón 42K", detail: "Fondos progresivos con bloques a ritmo objetivo", method: "Canova & Pfitz" },
      { name: "Media Maratón 21K", detail: "Potencia de crucero en umbral anaeróbico", method: "Daniels & Magness" },
      { name: "10K & 5K Speed", detail: "Velocidad neuromuscular y potencia VO2max", method: "Billat & Daniels" },
      { name: "Trail & Montaña", detail: "Gestión de desnivel acumulado D+ y fuerza", method: "Koop & Jornet" },
    ],
    keyTakeaways: [
      "Cap estricto de 3 horas en fondos",
      "Semanas de asimilación biológica 3:1",
      "Afinamiento (Tapering) de 3 semanas",
    ],
  },
  cycling: {
    title: "Ciclismo de Rendimiento",
    badge: "7 Zonas de Potencia FTP",
    desc: "Optimiza tus vatios por kilo (W/kg), resiste en puertos prolongados y entrena con precisión matemática en rodillo inteligente o carretera.",
    targets: [
      { name: "Gran Fondo & Fondo", detail: "Densidad de potencia y volumen mitocondrial Z2", method: "Coggan & Allen" },
      { name: "Escalada & Puertos", detail: "Potencia sostenida en subida y Over-Unders", method: "Hunter Allen" },
      { name: "Criterium & Potencia", detail: "Aceleraciones repetidas y tolerancia lactato", method: "Coggan 7 Zonas" },
      { name: "Gravel & Mixto", detail: "Cadencia eficiente y tracción de fuerza", method: "Joe Friel" },
    ],
    keyTakeaways: [
      "Zonas FTP individuales por vatios",
      "Densidad Sweetspot sin quemar fibras",
      "Compatible con rodillos y Edge",
    ],
  },
  triathlon: {
    title: "Triatlón Multidisciplina",
    badge: "Gestión de Carga Concurrente",
    desc: "Combina natación, ciclismo y carrera a pie en un calendario armónico que evita la interferencia muscular y maximiza la velocidad en transiciones.",
    targets: [
      { name: "70.3 Media Distancia", detail: "Resistencia concurrente y nutrición en carrera", method: "Friel & Olbrecht" },
      { name: "Full 140.6 IRONMAN", detail: "Eficiencia glucogénica y economía motriz", method: "Olbrecht & Friel" },
      { name: "Sprint & Olímpico", detail: "Potencia en transiciones y VO2max agudo", method: "Joe Friel" },
      { name: "Duatlón", detail: "Transición rápida de carrera a bici y viceversa", method: "Friel Power" },
    ],
    keyTakeaways: [
      "Sesiones Brick clave (Bici aero + Carrera)",
      "Zonas CSS de natación integradas",
      "Cinética de lactato Jan Olbrecht",
    ],
  },
};

export const LandingDisciplineModels: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DisciplineKey>("running");
  const data = DISCIPLINES[activeTab];

  return (
    <section id="modelos" className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2.5">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
          Metodologías Deportivas
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Modelos por Disciplina
        </h2>
        <p className="text-sm text-slate-600 font-normal">
          Selecciona tu disciplina para ver los modelos y objetivos adaptados a tu fisiología.
        </p>
      </div>

      {/* Selector de Pestañas con Desplazamiento Suave en Móvil */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs backdrop-blur-md overflow-x-auto scrollbar-none snap-x max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("running")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "running"
                ? "bg-cyan-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Footprints className="h-4 w-4" />
            <span>Running</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cycling")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "cycling"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Bike className="h-4 w-4" />
            <span>Ciclismo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("triathlon")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "triathlon"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Triatlón</span>
          </button>
        </div>
      </div>

      {/* Tarjeta Condensada de la Disciplina */}
      <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/30 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-cyan-700 uppercase">{data.badge}</span>
            <h3 className="text-2xl font-black text-slate-950 mt-0.5">{data.title}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-emerald-800">
            {data.keyTakeaways.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl font-normal">
          {data.desc}
        </p>

        {/* Grid 2x2 Compacto de Modelos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {data.targets.map((target, idx) => (
            <div key={idx} className="rounded-2xl p-4 bg-slate-50/90 border border-slate-200/80 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black text-slate-900">{target.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-normal">{target.detail}</div>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                {target.method}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
