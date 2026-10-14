"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp, Sparkles, Play, Pause, LayoutDashboard, Target,
} from "lucide-react";
import { InteractiveHrvSimulator } from "./InteractiveHrvSimulator";

interface ShowcaseScreen {
  id: "dashboard" | "pmc" | "season" | "headcoach";
  title: string;
  icon: React.ReactNode;
  imageSrc: string;
  alt: string;
}

const SHOWCASE_SCREENS: ShowcaseScreen[] = [
  {
    id: "dashboard",
    title: "Mi Dashboard",
    icon: <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.75} />,
    imageSrc: "/showcase/mobile-dashboard.png",
    alt: "Captura Real del Dashboard Móvil con Calendario y Test Stryd",
  },
  {
    id: "pmc",
    title: "Evolución PMC",
    icon: <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.75} />,
    imageSrc: "/showcase/mobile-pmc.png",
    alt: "Captura Real de la Gráfica PMC y Cumplimiento Semanal",
  },
  {
    id: "season",
    title: "Mi Temporada",
    icon: <Target className="h-3.5 w-3.5" strokeWidth={1.75} />,
    imageSrc: "/showcase/mobile-season.png",
    alt: "Captura Real de la Periodización de 22 semanas",
  },
  {
    id: "headcoach",
    title: "Head Coach IA",
    icon: <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />,
    imageSrc: "/showcase/mobile-coach.png",
    alt: "Captura Real del Chat Fisiológico Head Coach En Vivo",
  },
];

export const AppMotionShowcase: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isTapTriggered, setIsTapTriggered] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setIsTapTriggered(true);
      setTimeout(() => setIsTapTriggered(false), 500);
      setActiveScreen((prev) => (prev + 1) % SHOWCASE_SCREENS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleSelectScreen = (idx: number) => {
    setIsTapTriggered(true);
    setTimeout(() => setIsTapTriggered(false), 400);
    setActiveScreen(idx);
  };

  const currentScreen = SHOWCASE_SCREENS[activeScreen];
  const hasRealImage = !imageErrors[currentScreen.id];

  return (
    <section id="showcase" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
          Showcase Interactivo • La App en Vivo
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
          La Experiencia Móvil Real de la Resistencia
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
          Capturas reales de cómo funciona PULSE AI en tu teléfono. Visualiza tu calendario estructurado, telemetría Stryd, curva PMC y el Head Coach Fisiológico autónomo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* COLUMNA 1: Marco de Smartphone con Capturas Reales */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Selector de Pantallas Interactivo */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 mb-6 shadow-2xs">
            {SHOWCASE_SCREENS.map((scr, idx) => (
              <button
                key={scr.id}
                type="button"
                onClick={() => handleSelectScreen(idx)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeScreen === idx
                    ? "bg-white text-emerald-800 shadow-sm border border-slate-200/60 scale-[1.02]"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {scr.icon}
                <span>{scr.title}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pausar animación" : "Reanudar animación"}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg ml-0.5 cursor-pointer"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Play className="h-3.5 w-3.5" strokeWidth={1.75} />}
            </button>
          </div>

          {/* Maqueta del Smartphone (340x660 aprox con pantalla de alta fidelidad) */}
          <div className="relative w-full max-w-[340px] h-[660px] rounded-[48px] bg-slate-950 p-3 shadow-2xl shadow-emerald-500/10 ring-1 ring-slate-800 border-4 border-slate-800 flex flex-col">
            {isTapTriggered && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-emerald-400/30 animate-ping pointer-events-none z-30" />
            )}

            <div className="relative w-full h-full rounded-[38px] bg-white overflow-hidden flex flex-col text-slate-900 font-sans border border-slate-200 shadow-inner">
              {/* Dynamic Island & Status Bar */}
              <div className="pt-2.5 px-6 pb-1.5 flex items-center justify-between text-[11px] font-mono text-slate-600 shrink-0 select-none bg-white/95 backdrop-blur-md z-20 border-b border-slate-100">
                <span className="font-semibold">07:15</span>
                <div className="h-5 w-24 rounded-full bg-black flex items-center justify-center gap-1.5 px-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] text-emerald-300 font-mono font-bold">PULSE AI</span>
                </div>
                <span className="font-semibold">5G 100%</span>
              </div>

              {/* Contenedor de la Captura Real de la App */}
              <div className="flex-1 overflow-y-auto scrollbar-none relative bg-slate-50 flex items-start justify-center">
                <img
                  src={currentScreen.imageSrc}
                  alt={currentScreen.alt}
                  onError={() => setImageErrors((prev) => ({ ...prev, [currentScreen.id]: true }))}
                  className={`w-full h-auto min-h-full object-cover object-top transition-opacity duration-300 select-none ${
                    hasRealImage ? "opacity-100 block" : "opacity-0 hidden"
                  }`}
                />

                {/* Fallback si la imagen no cargara */}
                {!hasRealImage && (
                  <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center h-full">
                    <span>{currentScreen.title}</span>
                  </div>
                )}
              </div>

              {/* Home Indicator Bar */}
              <div className="py-2 flex justify-center shrink-0 bg-white z-20 border-t border-slate-100">
                <div className="h-1 w-28 rounded-full bg-slate-300" />
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-400 text-center font-mono">
            Captura real de la versión móvil de PULSE AI
          </p>
        </div>

        {/* COLUMNA 2: Simulador Interactivo HRV / TSB */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          <InteractiveHrvSimulator />
        </div>
      </div>
    </section>
  );
};
