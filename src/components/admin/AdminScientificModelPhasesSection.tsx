"use client";

import React from "react";
import { Zap } from "lucide-react";
import { CuratedTrainingModel } from "@/lib/ai/knowledge";

interface AdminScientificModelPhasesSectionProps {
  model: CuratedTrainingModel;
}

export const AdminScientificModelPhasesSection: React.FC<AdminScientificModelPhasesSectionProps> = ({
  model,
}) => {
  return (
    <div className="space-y-4">
      <p className="text-slate-600 leading-relaxed text-xs">
        {model.description}
      </p>

      <div className="space-y-3">
        <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
          Desglose Detallado por Fase Fisiológica
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {model.phaseDistributions.map((phase) => (
            <div
              key={phase.phaseKey}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-900 text-white">
                    {phase.phaseKey}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">
                    {phase.phaseName}
                  </span>
                </div>
                <span className="font-mono font-bold text-cyan-700 text-xs">
                  {Math.round(phase.percentageDuration * 100)}% de la temporada
                </span>
              </div>

              <p className="text-slate-600 leading-normal text-[11px]">
                {phase.focusDescription}
              </p>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Carga Semanal:</span>
                <span className="font-bold text-slate-900">
                  {phase.weeklyTssRange.min} - {phase.weeklyTssRange.max} TSS
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <span className="text-slate-500 block">Pauta de Tirada:</span>
                <span className="text-slate-700 italic block">
                  {phase.longRunGuideline}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {phase.recommendedIntensityZones.map((z, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-100/70 text-cyan-800"
                  >
                    {z}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tests Fisiológicos Obligatorios */}
      <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 space-y-2">
        <span className="text-[11px] font-bold text-cyan-950 uppercase flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-cyan-600" />
          Tests de Control Fisiológico Obligatorios
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {model.mandatoryTests.map((t) => (
            <div
              key={t.testId}
              className="p-2.5 rounded-xl bg-white border border-cyan-200/60 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{t.testName}</span>
                <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">
                  Sem {t.recommendedWeekIndex}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2">
                {t.protocolDescription}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
