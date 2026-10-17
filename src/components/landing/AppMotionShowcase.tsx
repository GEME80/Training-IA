"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Sparkles,
  Play,
  Pause,
  LayoutDashboard,
  Target,
  ArrowRight,
  Watch,
  HeartPulse,
  Brain,
  ShieldCheck,
} from "lucide-react";

interface ShowcaseScreen {
  id: "dashboard" | "pmc" | "season" | "headcoach";
  title: string;
  icon: React.ReactNode;
  imageSrc: string;
  alt: string;
  highlightTitle: string;
  highlightDesc: string;
}

const SHOWCASE_SCREENS: ShowcaseScreen[] = [
  {
    id: "dashboard",
    title: "Mi Plan Diario",
    icon: <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.75} />,
    imageSrc: "/showcase/mobile-dashboard.png",
    alt: "Captura Real del Dashboard Móvil con Calendario y Entrenamiento de Hoy",
    highlightTitle: "Calendario y Sesión Diaria Personalizada",
    highlightDesc: "Tu entrenamiento del día explicado paso a paso: series, ritmos sugeridos y sincronización automática con tu reloj.",
  },
  {
    id: "pmc",
    title: "Forma y Fatiga (PMC)",
    icon: <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.75} />,
    imageSrc: "/showcase/mobile-pmc.png",
    alt: "Captura Real de la Gráfica de Rendimiento y Estado de Forma",
    highlightTitle: "Curva de Rendimiento y Estado de Forma",
    highlightDesc: "Monitorea tu Condición Física (Fitness), Fatiga acumulada y Nivel de Frescura para saber exactamente qué día alcanzarás tu pico máximo.",
  },
  {
    id: "season",
    title: "Mi Temporada (22 Semanas)",
    icon: <Target className="h-3.5 w-3.5" strokeWidth={1.75} />,
    imageSrc: "/showcase/mobile-season.png",
    alt: "Captura Real de la Planificación de 22 semanas",
    highlightTitle: "Planificación Completa hacia tu Gran Meta",
    highlightDesc: "Desglose por etapas: Base, Construcción, Pico de Forma y Puesta a Punto (Tapering), controlando el volumen semanal para evitar sobreentrenamiento.",
  },
  {
    id: "headcoach",
    title: "Head Coach IA 24/7",
    icon: <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />,
    imageSrc: "/showcase/mobile-coach.png",
    alt: "Captura Real del Chat con el Entrenador de Inteligencia Artificial",
    highlightTitle: "Tu Entrenador Personal Inteligente 24/7",
    highlightDesc: "Pregúntale qué hacer si no pudiste entrenar hoy, cómo ajustar tus series si hace calor o cómo interpretar tu fatiga. Respuestas claras y adaptadas a tu nivel.",
  },
];

interface AppMotionShowcaseProps {
  onOpenAuthModal?: (tab?: "login" | "register") => void;
}

export const AppMotionShowcase: React.FC<AppMotionShowcaseProps> = ({ onOpenAuthModal }) => {
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
          Diseñada para atletas que entrenan a diario. Sin tablas complejas de Excel: cada mañana abres tu teléfono y tienes la prescripción exacta adaptada a tu cuerpo.
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

          {/* Maqueta del Smartphone (Chasis Negro Azabache / Black Titanium) */}
          <div
            style={{ backgroundColor: "#020617", borderColor: "#0f172a" }}
            className="phone-chassis-black relative w-full max-w-[340px] h-[660px] rounded-[50px] p-3 shadow-2xl shadow-black/50 ring-2 ring-black border-[5px] flex flex-col select-none"
          >
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

        {/* COLUMNA 2: Argumentario Comercial de Venta (Reemplaza el simulador pesado) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ¿Por qué elegir PULSE AI?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Toda la Ciencia de la Resistencia en la Palma de tu Mano
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Erradica la rigidez de las hojas de cálculo y los planes de papel que no saben si dormiste mal o tuviste un viaje de trabajo. PULSE AI modela tu estrés biológico diario y recalibra tu microciclo en segundos.
            </p>
          </div>

          {/* 4 Propuestas de Valor Clave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <HeartPulse className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <h4 className="text-sm font-bold text-slate-950">
                Adaptación Matutina por HRV
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Si tu variabilidad cardíaca o sueño nocturno muestran fatiga aguda, el sistema recalibra los vatios y el volumen automáticamente.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-2">
              <div className="h-9 w-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-200">
                <Watch className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <h4 className="text-sm font-bold text-slate-950">
                Directo a Garmin & Coros
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Las series viajan por API a tu reloj deportivo en segundo plano. Sales a entrenar y el reloj te guía en tu muñeca marcando cada intervalo exacto de potencia o ritmo.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <h4 className="text-sm font-bold text-slate-950">
                Pico de Forma Modelado Matemáticamente
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Algoritmo de 22 semanas (impulso-respuesta Banister/Coggan) para que alcances tu día de carrera con máxima aptitud neuromuscular y balance de estrés positivo (+TSB).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-2">
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                <Brain className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <h4 className="text-sm font-bold text-slate-950">
                Head Coach con IA 24/7
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pregunta cualquier duda sobre ritmos con viento, nutrición o sobrecarga aguda y fatiga neuromuscular residual. Respuestas fisiológicas fundamentadas en segundos.
              </p>
            </div>
          </div>

          {/* Tarjeta de Conversión Rápida */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-sm font-black flex items-center justify-center sm:justify-start gap-1.5">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                <span>Comienza tu Prueba de 7 Días Gratis</span>
              </div>
              <p className="text-xs text-emerald-100">
                Configura tu cuenta en 2 minutos conectando tu Intervals.icu o reloj habitual.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuthModal?.("register")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-emerald-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Comenzar Prueba de 7 Días</span>
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
