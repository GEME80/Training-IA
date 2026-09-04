"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Flame,
  BatteryCharging,
  Compass,
  Footprints,
  Bike,
  SlidersHorizontal,
} from "lucide-react";

type ScenarioKey = "peak" | "heavy" | "deload";

interface ScenarioData {
  name: string;
  badge: string;
  fitness: string;
  fatigue: string;
  form: string;
  formStatus: string;
  formStatusColor: string;
  rampRate: string;
  strydPower: string;
  bikeFtp: string;
  coachVerdict: string;
  weekLabel: string;
}

const SCENARIOS: Record<ScenarioKey, ScenarioData> = {
  peak: {
    name: "Día de Carrera / Supercompensación",
    badge: "Frescura Máxima",
    fitness: "88.4",
    fatigue: "42.0",
    form: "+14.2",
    formStatus: "Óptimo para Competir",
    formStatusColor: "text-emerald-700",
    rampRate: "+3.2 pts/sem",
    strydPower: "334 W",
    bikeFtp: "265 W",
    coachVerdict:
      "Supercompensación biológica completada con HRV balanceado. Sistema cardiovascular en punto óptimo para sostener tu ritmo de carrera con máxima economía sin fatiga prematura.",
    weekLabel: "Semana 16 • Competición Objetivo",
  },
  heavy: {
    name: "Semana de Choque / Carga Alta",
    badge: "Adaptación Aguda",
    fitness: "84.2",
    fatigue: "94.5",
    form: "-18.5",
    formStatus: "Sobrecarga Controlada",
    formStatusColor: "text-amber-700",
    rampRate: "+6.8 pts/sem",
    strydPower: "330 W",
    bikeFtp: "258 W",
    coachVerdict:
      "Pico de fatiga detectado tras sesiones de calidad consecutivas. El Head Coach reconvierte la tirada a rodaje regenerativo en Z1 para proteger sóleos y tendones de Aquiles.",
    weekLabel: "Semana 10 • Bloque de Choque",
  },
  deload: {
    name: "Semana de Descarga Biológica (3:1)",
    badge: "Asimilación Celular",
    fitness: "82.0",
    fatigue: "54.0",
    form: "+5.2",
    formStatus: "Recuperación Positiva",
    formStatusColor: "text-cyan-700",
    rampRate: "-1.8 pts/sem",
    strydPower: "332 W",
    bikeFtp: "260 W",
    coachVerdict:
      "Microciclo de asimilación activa en curso. Reducción programada de volumen del -28% para permitir reparación miofibrilar antes de iniciar el bloque cumbre.",
    weekLabel: "Semana 8 • Descarga 3:1",
  },
};

export const LandingControlHub: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>("peak");
  const data = SCENARIOS[activeScenario];

  return (
    <section id="control-hub" className="px-4 sm:px-6 max-w-6xl mx-auto -mt-4 mb-24 w-full">
      <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 space-y-6 backdrop-blur-xl">
        {/* Cabecera del Hub con Selector Interactivo de Escenarios */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-900 uppercase">
                Simulador del Motor Fisiológico en Vivo
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Prueba cómo el Head Coach IA adapta las métricas y decisiones según tu fatiga real:
            </div>
          </div>

          {/* Botones de Escenario */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveScenario("peak")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeScenario === "peak"
                  ? "bg-white text-emerald-800 shadow-xs border border-emerald-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Frescura (Día D)
            </button>
            <button
              type="button"
              onClick={() => setActiveScenario("heavy")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeScenario === "heavy"
                  ? "bg-white text-amber-800 shadow-xs border border-amber-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semana de Carga
            </button>
            <button
              type="button"
              onClick={() => setActiveScenario("deload")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeScenario === "deload"
                  ? "bg-white text-cyan-800 shadow-xs border border-cyan-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Descarga 3:1
            </button>
          </div>
        </div>

        {/* Grid de 6 Tarjetas Fisiológicas con Iconos Vectoriales Lucide */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/80 transition hover:border-emerald-300">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span>Forma Acumulada</span>
            </div>
            <div className="text-xl font-black text-emerald-600 mt-1 font-mono">{data.fitness}</div>
            <div className="text-[10px] text-slate-400 font-medium">Capacidad Aeróbica</div>
          </div>

          <div className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/80 transition hover:border-amber-300">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
              <Flame className="h-3.5 w-3.5 text-amber-600" />
              <span>Fatiga Reciente</span>
            </div>
            <div className="text-xl font-black text-amber-600 mt-1 font-mono">{data.fatigue}</div>
            <div className="text-[10px] text-slate-400 font-medium">Estrés 7 Días</div>
          </div>

          <div className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/80 transition hover:border-cyan-300">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
              <BatteryCharging className="h-3.5 w-3.5 text-cyan-600" />
              <span>Frescura / Batería</span>
            </div>
            <div className="text-xl font-black text-cyan-600 mt-1 font-mono">{data.form}</div>
            <div className={`text-[10px] font-bold ${data.formStatusColor}`}>{data.formStatus}</div>
          </div>

          <div className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/80 transition hover:border-teal-300">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
              <Compass className="h-3.5 w-3.5 text-teal-600" />
              <span>Tasa de Rampa</span>
            </div>
            <div className="text-xl font-black text-teal-600 mt-1 font-mono">{data.rampRate}</div>
            <div className="text-[10px] text-slate-400 font-medium">Incremento Seguro</div>
          </div>

          <div className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/80 transition hover:border-amber-300">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
              <Footprints className="h-3.5 w-3.5 text-amber-600" />
              <span>Stryd Potencia</span>
            </div>
            <div className="text-xl font-black text-amber-600 mt-1 font-mono">{data.strydPower}</div>
            <div className="text-[10px] text-slate-400 font-medium">Potencia Crítica</div>
          </div>

          <div className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/80 transition hover:border-cyan-300">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
              <Bike className="h-3.5 w-3.5 text-cyan-600" />
              <span>Vatios Ciclismo</span>
            </div>
            <div className="text-xl font-black text-cyan-600 mt-1 font-mono">{data.bikeFtp}</div>
            <div className="text-[10px] text-slate-400 font-medium">FTP Umbral</div>
          </div>
        </div>

        {/* Banner de Dictamen del Head Coach en Vivo */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-cyan-50/90 via-white to-emerald-50/90 border border-cyan-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-200 shadow-xs">
              <Sparkles className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-950 flex items-center gap-2">
                <span>Dictamen Head Coach</span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 font-mono font-bold">
                  Google Gemini
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mt-1 font-normal leading-relaxed">
                &ldquo;{data.coachVerdict}&rdquo;
              </p>
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-cyan-200 text-xs font-mono font-bold text-cyan-900 shrink-0 shadow-xs flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{data.weekLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
