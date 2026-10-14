"use client";

import React, { useState } from "react";
import { Zap, HeartPulse, ShieldAlert, CheckCircle2, Sliders, Activity, Sparkles, RefreshCw } from "lucide-react";

export const InteractiveHrvSimulator: React.FC = () => {
  // Slider de Fatiga Matutina: de -25 TSB a +15 TSB (por defecto -14 para mostrar la adaptación activa al usuario)
  const [tsbValue, setTsbValue] = useState<number>(-14);

  // Clasificación fisiológica
  const isHighFatigue = tsbValue < -10;
  const isOptimal = tsbValue >= -5;
  const isModerate = !isHighFatigue && !isOptimal;

  // Datos dinámicos según el slider
  let badgeColor = "bg-rose-50 text-rose-800 border-rose-200";
  let statusText = "Fatiga Aguda / HRV Deprimido";
  let hrvMs = 42;
  let statusIcon = <ShieldAlert className="h-4 w-4 text-rose-600" strokeWidth={1.75} />;
  let recommendationTitle = "Sustitución Automática Requerida";
  let recommendationSession =
    "Sustitución Automática: Rodaje Regenerativo Z1 40 min o Descanso Activo. Protección de tendones activada.";
  let originalSession = "Series de Umbral 6x1.000m al 98% CP (Plan Original)";
  let sessionStatusBadge = "bg-amber-100 text-amber-900 border-amber-300";
  let sessionStatusLabel = "Recalibrado a Z1";

  if (isOptimal) {
    badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
    statusText = "Estado Óptimo / Recuperación Alta";
    hrvMs = 78;
    statusIcon = <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />;
    recommendationTitle = "Ejecución Completa Autorizada";
    recommendationSession =
      "Series de Umbral 6x1.000m al 98% CP. Luz verde fisiológica.";
    originalSession = "Series de Umbral 6x1.000m al 98% CP";
    sessionStatusBadge = "bg-emerald-100 text-emerald-900 border-emerald-300";
    sessionStatusLabel = "Luz Verde";
  } else if (isModerate) {
    badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
    statusText = "Fatiga Moderada / HRV Estable";
    hrvMs = 58;
    statusIcon = <Activity className="h-4 w-4 text-amber-600" strokeWidth={1.75} />;
    recommendationTitle = "Modulación Preventiva";
    recommendationSession =
      "Ajuste Dinámico: Reducción de 2 repeticiones (4x1.000m al 96% CP) para evitar colapso del sistema parasimpático.";
    originalSession = "Series de Umbral 6x1.000m al 98% CP";
    sessionStatusBadge = "bg-amber-100 text-amber-900 border-amber-300";
    sessionStatusLabel = "Carga Modulada";
  }

  return (
    <div className="w-full bg-white/95 rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-7 backdrop-blur-xl space-y-6">
      {/* Cabecera del Simulador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Simulador Interactivo
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500">
              <Sliders className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Prueba el motor en vivo</span>
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-950 mt-1">
            Respuesta Adaptativa por HRV & TSB Matutino
          </h3>
        </div>

        {/* Micro-badge interactivo exigido en la instrucción */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold font-mono shadow-2xs shrink-0">
          <Zap className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" strokeWidth={1.75} />
          <span>Adaptado por Head Coach en 0.2s</span>
        </div>
      </div>

      {/* Control Slider de Fatiga Matutina (-25 a +15 TSB) */}
      <div className="space-y-3 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
        <div className="flex items-center justify-between">
          <label htmlFor="tsb-slider" className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
            <span>Balance de Estrés del Entrenamiento (TSB):</span>
          </label>
          <div className="flex items-center gap-2 font-mono">
            <span
              className={`text-sm font-black px-2.5 py-0.5 rounded-lg border ${
                tsbValue < -10
                  ? "bg-rose-100 text-rose-800 border-rose-300"
                  : tsbValue >= -5
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              }`}
            >
              {tsbValue > 0 ? `+${tsbValue}` : tsbValue} TSB
            </span>
            <span className="text-[11px] text-slate-500">({hrvMs} ms rMSSD)</span>
          </div>
        </div>

        {/* Range Input Slider */}
        <div className="relative">
          <input
            id="tsb-slider"
            type="range"
            min="-25"
            max="15"
            step="1"
            value={tsbValue}
            onChange={(e) => setTsbValue(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-hidden"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
            <span>-25 (Fatiga Extrema)</span>
            <span>-10</span>
            <span>-5 (Neutral)</span>
            <span>0</span>
            <span>+15 (Frescura Total)</span>
          </div>
        </div>

        {/* Botones de acceso rápido para probar escenarios */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <span className="text-slate-400 font-mono text-[10px]">Escenarios rápidos:</span>
          <button
            type="button"
            onClick={() => setTsbValue(-18)}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold transition cursor-pointer"
          >
            Fatiga Alta (-18)
          </button>
          <button
            type="button"
            onClick={() => setTsbValue(-8)}
            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold transition cursor-pointer"
          >
            Moderada (-8)
          </button>
          <button
            type="button"
            onClick={() => setTsbValue(4)}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold transition cursor-pointer"
          >
            Óptimo (+4)
          </button>
        </div>
      </div>

      {/* Respuesta Visual Dinámica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Panel 1: Estado Biológico Detectado */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
              Lectura Biológica Matutina
            </span>
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
              {statusIcon}
              <span>{statusText}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Variabilidad (HRV rMSSD):</span>
              <span className="font-mono font-bold text-slate-900">{hrvMs} ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Balance Simpático/Parasimpático:</span>
              <span className="font-mono font-bold text-slate-900">
                {isHighFatigue ? "Predominio Simpático (Estrés)" : isOptimal ? "Balance Normal" : "Ligera Inhibición"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Plan Original en Calendario:</span>
              <span className="font-semibold text-slate-700 truncate max-w-[180px]">{originalSession}</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Sesión Adaptada por PULSE AI */}
        <div
          className={`p-4 rounded-2xl border transition-all duration-300 space-y-2 ${
            isHighFatigue
              ? "bg-gradient-to-br from-amber-50/70 to-rose-50/40 border-amber-300/80"
              : isOptimal
              ? "bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border-emerald-300/80"
              : "bg-gradient-to-br from-amber-50/50 to-slate-50 border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
              <span className="text-[10px] font-mono font-bold uppercase text-slate-700">
                {recommendationTitle}
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${sessionStatusBadge}`}>
              {sessionStatusLabel}
            </span>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-slate-200/80 shadow-2xs">
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              {recommendationSession}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 text-emerald-600" strokeWidth={1.75} />
              <span>Sincronizado vía API a Garmin/Coros</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-700 font-bold">Sin intervención humana</span>
          </div>
        </div>
      </div>
    </div>
  );
};
