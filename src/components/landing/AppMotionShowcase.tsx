"use client";

import React, { useState, useEffect } from "react";
import {
  Heart, TrendingUp, MessageSquare, Sparkles, CheckCircle2,
  Send, Play, Pause, LayoutDashboard, Target, HeartPulse, Radio,
} from "lucide-react";
import { InteractiveHrvSimulator } from "./InteractiveHrvSimulator";

interface ShowcaseScreen {
  id: "dashboard" | "season" | "headcoach";
  title: string;
  icon: React.ReactNode;
  imageSrc: string;
  alt: string;
}

const SHOWCASE_SCREENS: ShowcaseScreen[] = [
  {
    id: "dashboard",
    title: "Dashboard & HRV",
    icon: <Heart className="h-3.5 w-3.5" strokeWidth={1.75} />,
    imageSrc: "/showcase/mobile-dashboard.png",
    alt: "Captura Real del Dashboard Móvil de PULSE AI",
  },
  {
    id: "season",
    title: "22 Semanas PMC",
    icon: <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.75} />,
    imageSrc: "/showcase/mobile-season.png",
    alt: "Captura Real de la Periodización de 22 semanas",
  },
  {
    id: "headcoach",
    title: "Head Coach IA",
    icon: <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />,
    imageSrc: "/showcase/mobile-coach.png",
    alt: "Captura Real del Chat Fisiológico Head Coach",
  },
];

export const AppMotionShowcase: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<0 | 1 | 2>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isTapTriggered, setIsTapTriggered] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setIsTapTriggered(true);
      setTimeout(() => setIsTapTriggered(false), 500);
      setActiveScreen((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 4800);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleSelectScreen = (idx: 0 | 1 | 2) => {
    setIsTapTriggered(true);
    setTimeout(() => setIsTapTriggered(false), 400);
    setActiveScreen(idx);
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
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
          Diseñada para atletas en movimiento. Visualiza tu telemetría al despertar, tu curva de carga de 22 semanas y tu Head Coach Fisiológico con la interfaz real de la aplicación.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* COLUMNA 1: Marco de Smartphone Moderno en Tailwind */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Selector de Pantallas Interactivo */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 mb-6 shadow-2xs">
            {SHOWCASE_SCREENS.map((scr, idx) => (
              <button
                key={scr.id}
                type="button"
                onClick={() => handleSelectScreen(idx as 0 | 1 | 2)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeScreen === idx
                    ? "bg-white text-emerald-800 shadow-sm border border-slate-200/60"
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
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg ml-1 cursor-pointer"
            >
              {isPlaying ? <Pause className="h-3 w-3" strokeWidth={1.75} /> : <Play className="h-3 w-3" strokeWidth={1.75} />}
            </button>
          </div>

          {/* Maqueta del Smartphone */}
          <div className="relative w-full max-w-[340px] h-[660px] rounded-[48px] bg-slate-950 p-3 shadow-2xl shadow-emerald-500/10 ring-1 ring-slate-800 border-4 border-slate-800 flex flex-col">
            {isTapTriggered && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-emerald-400/30 animate-ping pointer-events-none z-30" />
            )}

            <div className="relative w-full h-full rounded-[38px] bg-slate-900 overflow-hidden flex flex-col text-white font-sans border border-slate-800/80">
              {/* Dynamic Island & Status Bar */}
              <div className="pt-3 px-6 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0 select-none bg-slate-900/90 backdrop-blur-md z-20">
                <span>07:15</span>
                <div className="h-5 w-24 rounded-full bg-black flex items-center justify-center gap-1.5 px-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-emerald-400 font-mono font-bold">PULSE AI</span>
                </div>
                <span>5G 100%</span>
              </div>

              {/* Contenido Visual: Si existe imagen real cargada la muestra; si no, renderiza la UI responsive nativa */}
              <div className="flex-1 overflow-y-auto flex flex-col justify-between">
                <img
                  src={currentScreen.imageSrc}
                  alt={currentScreen.alt}
                  onError={() => handleImageError(currentScreen.id)}
                  className={`w-full h-full object-cover object-top transition-opacity duration-300 ${
                    hasRealImage ? "block" : "hidden"
                  }`}
                />

                {!hasRealImage && (
                  <div className="flex-1 p-3.5 flex flex-col justify-between space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 shrink-0">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">Germán Morales</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Atleta
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Garmin Forerunner 965 • Stryd</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-700/50">
                        <Radio className="h-2.5 w-2.5 animate-pulse" strokeWidth={1.75} />
                        <span>Live</span>
                      </div>
                    </div>

                    {activeScreen === 0 && (
                      <div className="space-y-2.5 flex-1">
                        <div className="grid grid-cols-7 gap-1 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-center text-[9px] font-mono">
                          {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
                            <div
                              key={i}
                              className={`py-1 rounded-lg ${
                                i === 2 ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
                              }`}
                            >
                              <div>{d}</div>
                              <div className="font-bold">{12 + i}</div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-gradient-to-br from-slate-850 to-slate-800 rounded-2xl p-3 border border-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">
                              <Heart className="h-3 w-3" strokeWidth={1.75} /> Recuperación HRV
                            </span>
                            <span className="text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full">Óptimo</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div>
                              <div className="text-xl font-black font-mono text-white">68 ms</div>
                              <div className="text-[9px] text-slate-400">HRV rMSSD (+14%)</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-emerald-400 font-mono">+12.2 TSB</div>
                              <div className="text-[9px] text-slate-400">Frescura positiva</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-850 rounded-2xl p-3 border border-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-cyan-400 uppercase font-bold">Sesión del Día</span>
                            <span className="text-slate-400">112 TSS • 1h 45m</span>
                          </div>
                          <div className="text-xs font-bold text-white leading-snug">
                            Tirada con 2x25m Ritmo Maratón
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-750 font-mono">
                            <span>Objetivo: 272 W (82% CP)</span>
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} /> Garmin
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeScreen === 1 && (
                      <div className="space-y-2.5 flex-1">
                        <div>
                          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Plan Activo</span>
                          <h5 className="text-xs font-black text-white">Maratón de Valencia 2026</h5>
                          <span className="text-[10px] text-slate-400">Semana 11 de 22 • Fase Específica II</span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                            <div className="text-[8px] font-mono text-slate-400">FITNESS</div>
                            <div className="text-sm font-black font-mono text-emerald-400">84.2</div>
                          </div>
                          <div className="bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                            <div className="text-[8px] font-mono text-slate-400">FATIGA</div>
                            <div className="text-sm font-black font-mono text-amber-400">72.0</div>
                          </div>
                          <div className="bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                            <div className="text-[8px] font-mono text-slate-400">FORMA</div>
                            <div className="text-sm font-black font-mono text-cyan-400">+12.2</div>
                          </div>
                        </div>

                        <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-700 space-y-1.5">
                          <div className="flex justify-between text-[9px] font-mono text-slate-400">
                            <span>Curva Banister 22 Semanas</span>
                            <span className="text-emerald-400">Tapering Activo</span>
                          </div>
                          <div className="h-16 w-full flex items-end gap-1 pt-1">
                            {[35, 42, 50, 46, 58, 64, 61, 72, 78, 81, 84, 88, 92, 86, 95, 98, 92, 99, 102, 94, 85, 78].map((val, i) => (
                              <div
                                key={i}
                                style={{ height: `${(val / 102) * 100}%` }}
                                className={`flex-1 rounded-t-xs ${
                                  i === 10 ? "bg-emerald-400 ring-1 ring-white" : i > 10 ? "bg-slate-700" : "bg-cyan-500/70"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeScreen === 2 && (
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.75} />
                          <span className="text-xs font-bold text-white">Head Coach Fisiológico</span>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-emerald-600 p-2 rounded-xl text-[11px] text-white max-w-[85%]">
                            ¿Debo mantener el ritmo hoy con 30 km/h de viento?
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-[11px] text-slate-200 max-w-[90%] leading-relaxed">
                            Negativo Germán. Tu Critical Power es <strong>332 W</strong>. Mantén 325-330 W independientemente del GPS.
                          </div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Consulta al Head Coach...</span>
                          <Send className="h-3 w-3 text-emerald-400" strokeWidth={1.75} />
                        </div>
                      </div>
                    )}

                    {/* Bottom Nav Real */}
                    <div className="border-t border-slate-800 pt-1.5 grid grid-cols-4 gap-1 text-center shrink-0">
                      <div className={`p-1 rounded-lg ${activeScreen === 0 ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                        <LayoutDashboard className="h-3.5 w-3.5 mx-auto" strokeWidth={1.75} />
                        <span className="text-[8px] block mt-0.5">Dashboard</span>
                      </div>
                      <div className={`p-1 rounded-lg ${activeScreen === 1 ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                        <Target className="h-3.5 w-3.5 mx-auto" strokeWidth={1.75} />
                        <span className="text-[8px] block mt-0.5">Temporada</span>
                      </div>
                      <div className={`p-1 rounded-lg ${activeScreen === 2 ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                        <Sparkles className="h-3.5 w-3.5 mx-auto" strokeWidth={1.75} />
                        <span className="text-[8px] block mt-0.5">Coach IA</span>
                      </div>
                      <div className="p-1 rounded-lg text-slate-500">
                        <HeartPulse className="h-3.5 w-3.5 mx-auto" strokeWidth={1.75} />
                        <span className="text-[8px] block mt-0.5">Perfil</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="py-2 flex justify-center shrink-0 bg-slate-900/90 z-20">
                <div className="h-1 w-28 rounded-full bg-slate-600" />
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-400 text-center font-mono">
            {hasRealImage ? "Captura fotográfica real activa" : "Interfaz responsive real de la app"}
          </p>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          <InteractiveHrvSimulator />
        </div>
      </div>
    </section>
  );
};
