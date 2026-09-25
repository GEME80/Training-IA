"use client";

import React from "react";
import {
  BookOpen,
  CheckCircle2,
  Zap,
  Activity,
  Clock,
  Sparkles,
  Layers,
  Dumbbell,
  Target,
} from "lucide-react";
import { MacrocycleDefinition, IntensityMetric } from "@/lib/physiology/macrocycleLibrary";

interface AdminProgramDetailViewSectionProps {
  program: MacrocycleDefinition;
}

export const AdminProgramDetailViewSection: React.FC<AdminProgramDetailViewSectionProps> = ({
  program,
}) => {
  const getMetricBadge = (m: IntensityMetric) => {
    switch (m) {
      case "POWER":
        return { label: "Potencia (Stryd/FTP)", icon: <Zap className="h-3 w-3 text-amber-500" />, color: "bg-amber-50 text-amber-800 border-amber-200" };
      case "HEART_RATE":
        return { label: "Frecuencia Cardíaca", icon: <Activity className="h-3 w-3 text-rose-500" />, color: "bg-rose-50 text-rose-800 border-rose-200" };
      case "PACE":
        return { label: "Ritmo / Velocidad", icon: <Clock className="h-3 w-3 text-cyan-500" />, color: "bg-cyan-50 text-cyan-800 border-cyan-200" };
      case "RPE":
        return { label: "Sensaciones / RPE", icon: <Sparkles className="h-3 w-3 text-emerald-500" />, color: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    }
  };

  const basePercent = Math.round((program.phaseRatios?.base || 0.3) * 100);
  const buildPercent = Math.round((program.phaseRatios?.build || 0.4) * 100);
  const peakPercent = Math.round((program.phaseRatios?.peak || 0.2) * 100);
  const taperPercent = Math.round((program.phaseRatios?.taper || 0.1) * 100);

  return (
    <div className="space-y-6">
      {/* Badges Clave */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {program.category === "RACE_TARGET" ? "🏆 Carrera Objetivo" : "🌱 Momento del Atleta"}
        </span>
        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
          Distancia: {program.distanceType.toUpperCase()}
        </span>
        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-900 text-white">
          {program.defaultWeeks} Semanas ({program.minWeeks} - {program.maxWeeks} sem)
        </span>
        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
          Fondo Pico: {program.maxLongRunKm ? `${program.maxLongRunKm} km` : `${program.maxLongRunMinutes} min`}
        </span>
      </div>

      {/* Descripción Metodológica */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-cyan-600" />
          <span>Descripción y Filosofía del Plan</span>
        </h4>
        <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 leading-relaxed whitespace-pre-line">
          {program.description}
        </p>
      </div>

      {/* Arquitectura de Fases & Periodización Biológica 3:1 */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-indigo-600" />
          <span>Distribución de Macrociclo (Fases)</span>
        </h4>
        <div className="h-4 rounded-full overflow-hidden flex shadow-inner border border-slate-200">
          <div style={{ width: `${basePercent}%` }} className="bg-emerald-500 flex items-center justify-center text-[9px] font-black text-white" title={`Base: ${basePercent}%`}>
            {basePercent > 12 && `${basePercent}%`}
          </div>
          <div style={{ width: `${buildPercent}%` }} className="bg-amber-500 flex items-center justify-center text-[9px] font-black text-white" title={`Construcción: ${buildPercent}%`}>
            {buildPercent > 12 && `${buildPercent}%`}
          </div>
          <div style={{ width: `${peakPercent}%` }} className="bg-rose-500 flex items-center justify-center text-[9px] font-black text-white" title={`Pico/Impacto: ${peakPercent}%`}>
            {peakPercent > 12 && `${peakPercent}%`}
          </div>
          <div style={{ width: `${taperPercent}%` }} className="bg-cyan-500 flex items-center justify-center text-[9px] font-black text-white" title={`Tapering: ${taperPercent}%`}>
            {taperPercent > 12 && `${taperPercent}%`}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex flex-col">
            <span className="font-bold text-[11px]">1. Base ({basePercent}%)</span>
            <span className="text-[10px] text-emerald-700">Adaptación Aeróbica</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex flex-col">
            <span className="font-bold text-[11px]">2. Build ({buildPercent}%)</span>
            <span className="text-[10px] text-amber-700">Fuerza & Umbral</span>
          </div>
          <div className="p-2 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 flex flex-col">
            <span className="font-bold text-[11px]">3. Peak ({peakPercent}%)</span>
            <span className="text-[10px] text-rose-700">Impacto Específico</span>
          </div>
          <div className="p-2 rounded-xl bg-cyan-50 text-cyan-900 border border-cyan-200 flex flex-col">
            <span className="font-bold text-[11px]">4. Taper ({taperPercent}%)</span>
            <span className="text-[10px] text-cyan-700">Frescura & Carrera</span>
          </div>
        </div>
      </div>

      {/* Enfoque Fisiológico */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-rose-600" />
          <span>Adaptaciones Fisiológicas Clave</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {program.physiologicalFocus?.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 text-xs font-medium"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-rose-600" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Sesiones y Entrenamientos Rectores */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Dumbbell className="h-3.5 w-3.5 text-amber-600" />
          <span>Protocolos & Entrenamientos Estructurados</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {program.keyWorkoutsSummary?.map((workout, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2 text-xs font-medium text-slate-800"
            >
              <Zap className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>{workout}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas de Intensidad */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Métricas de Intensidad Compatibles
        </h4>
        <div className="flex flex-wrap gap-2">
          {program.supportedMetrics?.map((m) => {
            const badge = getMetricBadge(m);
            const isDefault = m === program.defaultMetric;
            return (
              <div
                key={m}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${badge.color}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
                {isDefault && <span className="ml-1 text-[9px] px-1 rounded bg-black/10 font-mono">Por Defecto</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recomendado Para */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex items-start space-x-2.5">
        <Target className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Perfil del Atleta Recomendado: </strong>
          <span>{program.recommendedFor}</span>
        </div>
      </div>
    </div>
  );
};
