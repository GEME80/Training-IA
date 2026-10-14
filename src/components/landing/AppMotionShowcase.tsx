"use client";

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Heart,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  Activity,
  Footprints,
  BatteryCharging,
  Send,
  Play,
  Pause,
} from "lucide-react";
import { InteractiveHrvSimulator } from "./InteractiveHrvSimulator";

export const AppMotionShowcase: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<0 | 1 | 2>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isTapTriggered, setIsTapTriggered] = useState<boolean>(false);

  // Bucle automático de 3 pantallas (cada 4.5s)
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setIsTapTriggered(true);
      setTimeout(() => setIsTapTriggered(false), 500);

      setActiveScreen((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleSelectScreen = (idx: 0 | 1 | 2) => {
    setIsTapTriggered(true);
    setTimeout(() => setIsTapTriggered(false), 400);
    setActiveScreen(idx);
  };

  const screens = [
    { title: "Dashboard & HRV", icon: <Heart className="h-3.5 w-3.5" strokeWidth={1.75} /> },
    { title: "22 Semanas PMC", icon: <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.75} /> },
    { title: "Head Coach IA", icon: <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} /> },
  ];

  return (
    <section id="showcase" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full relative z-10">
      {/* Encabezado Principal */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
          Showcase Interactivo • La App en Vivo
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
          La Experiencia Móvil Más Rápida de la Resistencia
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
          Diseñada para atletas en movimiento. Sin menús redundantes: telemetría instantánea al despertar, curva de carga de toda la temporada y chat fisiológico en tiempo real.
        </p>
      </div>

      {/* Contenedor Dual: Smartphone Showcase a la Izquierda + Simulador HRV a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* COLUMNA 1: Marco de Smartphone Moderno en Tailwind */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Selector de Pantallas Interactivo */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 mb-6 shadow-2xs">
            {screens.map((scr, idx) => (
              <button
                key={idx}
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
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg ml-1"
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
          </div>

          {/* Maqueta del Smartphone (380x680 aprox) */}
          <div className="relative w-full max-w-[340px] h-[640px] rounded-[48px] bg-slate-950 p-3 shadow-2xl shadow-emerald-500/10 ring-1 ring-slate-800 border-4 border-slate-800">
            {/* Efecto de toque táctil animado */}
            {isTapTriggered && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-emerald-400/30 animate-ping pointer-events-none z-30" />
            )}

            {/* Pantalla Interna */}
            <div className="relative w-full h-full rounded-[38px] bg-slate-900 overflow-hidden flex flex-col text-white font-sans border border-slate-800/80">
              {/* Dynamic Island & Status Bar */}
              <div className="pt-3 px-6 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0 select-none">
                <span>07:15</span>
                {/* Dynamic Island */}
                <div className="h-5 w-24 rounded-full bg-black flex items-center justify-center gap-1.5 px-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-emerald-400 font-mono">PULSE AI</span>
                </div>
                <span>5G 100%</span>
              </div>

              {/* Contenido de la Pantalla Activa */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {/* PANTALLA 1: Dashboard Diario con HRV */}
                {activeScreen === 0 && (
                  <div className="space-y-3.5 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Miércoles • 14 Oct</div>
                        <h4 className="text-base font-black text-white">Buen día, Germán</h4>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                        GM
                      </div>
                    </div>

                    {/* Tarjeta de Recuperación HRV */}
                    <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-850 p-3.5 border border-slate-700/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <Heart className="h-3 w-3" /> Estado Biológico
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Óptimo
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-2xl font-black font-mono text-white">68 ms</div>
                          <div className="text-[10px] text-slate-400 font-mono">HRV rMSSD (+14% vs base)</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-400 font-mono">+12.2 TSB</div>
                          <div className="text-[10px] text-slate-400">Frescura positiva</div>
                        </div>
                      </div>
                    </div>

                    {/* Sesión Prescrita del Día */}
                    <div className="rounded-2xl bg-slate-800/90 p-3.5 border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="text-cyan-400 uppercase font-bold">Sesión Prescrita</span>
                        <span>112 TSS</span>
                      </div>
                      <h5 className="text-xs font-bold text-white leading-snug">
                        Tirada con 2x25m Ritmo Maratón (82% CP)
                      </h5>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-700/60">
                        <span>Potencia Objetivo: 272 W</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Enviada a Garmin
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PANTALLA 2: Gráfica de 22 semanas de Mi Temporada */}
                {activeScreen === 1 && (
                  <div className="space-y-3.5 animate-in fade-in duration-300">
                    <div>
                      <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Mi Temporada 2026</div>
                      <h4 className="text-base font-black text-white">Maratón de Valencia</h4>
                      <p className="text-[11px] text-slate-400">Semana 11 de 22 • Fase Específica II</p>
                    </div>

                    {/* Resumen Métricas PMC */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700">
                        <div className="text-[9px] text-slate-400 font-mono">FITNESS</div>
                        <div className="text-base font-black font-mono text-emerald-400">84.2</div>
                      </div>
                      <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700">
                        <div className="text-[9px] text-slate-400 font-mono">FATIGA</div>
                        <div className="text-base font-black font-mono text-amber-400">72.0</div>
                      </div>
                      <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700">
                        <div className="text-[9px] text-slate-400 font-mono">FORMA</div>
                        <div className="text-base font-black font-mono text-cyan-400">+12.2</div>
                      </div>
                    </div>

                    {/* Gráfica PMC Representativa */}
                    <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700 space-y-2">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Curva Banister 22 Semanas</span>
                        <span className="text-emerald-400">Pico: Dic 2026</span>
                      </div>
                      <div className="h-20 w-full flex items-end gap-1 pt-2">
                        {[35, 42, 50, 46, 58, 64, 61, 72, 78, 81, 84, 88, 92, 86, 95, 98, 92, 99, 102, 94, 85, 78].map(
                          (val, i) => (
                            <div
                              key={i}
                              style={{ height: `${(val / 102) * 100}%` }}
                              className={`flex-1 rounded-t-xs transition-all ${
                                i === 10
                                  ? "bg-emerald-400 ring-1 ring-white"
                                  : i > 10
                                  ? "bg-slate-700 border-t border-dashed border-cyan-400/50"
                                  : "bg-cyan-500/60"
                              }`}
                            />
                          )
                        )}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono flex justify-between">
                        <span>Sem 1</span>
                        <span className="text-emerald-400 font-bold">Hoy (Sem 11)</span>
                        <span>Sem 22</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PANTALLA 3: Interacción en Vivo con Head Coach IA */}
                {activeScreen === 2 && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Head Coach Fisiológico</h4>
                        <span className="text-[9px] font-mono text-emerald-400">Google Gemini • En Línea</span>
                      </div>
                    </div>

                    {/* Burbuja Atleta */}
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-emerald-600 p-2.5 text-xs text-white">
                        ¿Debo forzar el ritmo hoy con 30 km/h de viento en contra?
                      </div>
                    </div>

                    {/* Burbuja Head Coach */}
                    <div className="flex justify-start">
                      <div className="max-w-[90%] rounded-2xl rounded-tl-xs bg-slate-800 border border-slate-700 p-2.5 text-xs text-slate-200 space-y-1.5 leading-relaxed">
                        <p>
                          Negativo Germán. Tu Critical Power está en <strong>332 W</strong>. Mantén 325-330 W independientemente del ritmo GPS.
                        </p>
                        <p className="text-[10px] text-emerald-400 font-mono">
                          El coste celular es el mismo. Evita el colapso neuromuscular.
                        </p>
                      </div>
                    </div>

                    {/* Input Falso */}
                    <div className="mt-4 flex items-center gap-2 p-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-400">
                      <span className="truncate flex-1">Escribe a tu Head Coach...</span>
                      <Send className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Home Indicator Bar */}
              <div className="py-2 flex justify-center shrink-0">
                <div className="h-1 w-28 rounded-full bg-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: Simulador Interactivo HRV / TSB */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          <InteractiveHrvSimulator />
        </div>
      </div>
    </section>
  );
};
