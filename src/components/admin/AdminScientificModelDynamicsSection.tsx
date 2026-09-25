"use client";

import React from "react";
import { TrendingUp, Dumbbell } from "lucide-react";
import { CuratedTrainingModel } from "@/lib/ai/knowledge";

interface AdminScientificModelDynamicsSectionProps {
  model: CuratedTrainingModel;
  activeTab: "longrun" | "workouts" | "biotype";
}

export const AdminScientificModelDynamicsSection: React.FC<AdminScientificModelDynamicsSectionProps> = ({
  model,
  activeTab,
}) => {
  return (
    <>
      {/* TAB 2: TIRADA LARGA & DINÁMICA BANISTER */}
      {activeTab === "longrun" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-900">Distancia Pico</span>
              <span className="text-xl font-black text-amber-950 block">
                {model.longRunRules.peakKm} km
              </span>
              <span className="text-[10px] text-amber-800 font-mono">
                Inicio: {model.longRunRules.startKm} km
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-900">Duración Pico</span>
              <span className="text-xl font-black text-amber-950 block">
                {model.longRunRules.peakMinutes} min
              </span>
              <span className="text-[10px] text-amber-800 font-mono">
                Cap máximo: {model.maxLongRunMinutesCap || 150} min
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-900">Intensidad Diana</span>
              <span className="text-xs font-black text-amber-950 block pt-1">
                {model.longRunRules.targetIntensityPercentCpOrFtp}
              </span>
              <span className="text-[10px] text-amber-800 block">
                {model.longRunRules.description}
              </span>
            </div>
          </div>

          {/* Parámetros de Dinámica de Carga Banister */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-[11px] font-bold text-slate-900 uppercase flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Modelo de Impulso-Respuesta (Banister & Ramp Rate)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[9px] uppercase text-slate-400 block font-bold">Rampa Mínima</span>
                <span className="text-sm font-black text-slate-900 font-mono">+{model.banisterRampRateLimits.minCtlPerWeek}</span>
                <span className="text-[9px] text-slate-500 block">CTL / semana</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[9px] uppercase text-slate-400 block font-bold">Rampa Máxima</span>
                <span className="text-sm font-black text-emerald-700 font-mono">+{model.banisterRampRateLimits.maxCtlPerWeek}</span>
                <span className="text-[9px] text-slate-500 block">CTL / semana</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[9px] uppercase text-slate-400 block font-bold">Descarga Deload</span>
                <span className="text-sm font-black text-cyan-700 font-mono">-{Math.round((model.tssProgressionRules.recoveryDropPercent || 0.25) * 100)}%</span>
                <span className="text-[9px] text-slate-500 block">Volumen semana 3</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[9px] uppercase text-slate-400 block font-bold">Paso Carga TSS</span>
                <span className="text-sm font-black text-slate-900 font-mono">+{model.tssProgressionRules.weeklyLoadStepTss || 30}</span>
                <span className="text-[9px] text-slate-500 block">TSS / microciclo</span>
              </div>
            </div>
          </div>

          {/* Tapering Sequence */}
          {model.longRunRules.taperKmSequence && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-900 uppercase">
                Secuencia de Descarga (Tapering) en Tiradas Largas
              </span>
              <div className="flex gap-2">
                {model.longRunRules.taperKmSequence.map((km, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-900 font-mono font-bold text-xs"
                  >
                    Sem -{model.longRunRules.taperKmSequence.length - idx}: {km} km
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SESIONES DE CALIDAD */}
      {activeTab === "workouts" && (
        <div className="space-y-4">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Catálogo de Sesiones Específicas del Modelo
          </span>
          <div className="space-y-3">
            {Object.entries(model.workoutVariations.qualityWorkouts || {}).map(([phase, workouts]) => (
              <div key={phase} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Fase {phase} ({workouts.length} Variaciones)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {workouts.map((w, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/70 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 text-xs">{w.name}</strong>
                        <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">
                          {w.powerTarget}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{w.justification}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BIOTIPO & FUERZA */}
      {activeTab === "biotype" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-2">
            <span className="text-[11px] font-bold text-purple-950 uppercase flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4 text-purple-600" />
              Prescripción de Fuerza & Prevención
            </span>
            <p className="text-xs text-purple-900">
              {model.crossTrainingRules.notes}
            </p>
            <div className="flex gap-4 pt-1 text-[11px] font-mono text-purple-800">
              <span>Fuerza semanal sugerida: {model.crossTrainingRules.recommendedStrengthSessionsPerWeek || 2} sesiones</span>
              <span>Ciclismo Z2 alternativo: {model.crossTrainingRules.recommendedBikeZ2WeeklyMin || 90} min/sem</span>
            </div>
          </div>

          {model.biotypeCrossTrainingRule && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-amber-950 uppercase">
                Regla de Protección de Impacto Articular por Biotipo
              </span>
              <p className="text-xs text-amber-900">
                {model.biotypeCrossTrainingRule.notes}
              </p>
              <div className="text-[11px] font-mono text-amber-800 pt-1">
                Umbral de activación: Peso {">="} {model.biotypeCrossTrainingRule.triggerWeightKgThreshold} kg
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
