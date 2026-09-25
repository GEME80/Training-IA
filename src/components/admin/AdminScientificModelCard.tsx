"use client";

import React from "react";
import {
  Flame,
  Zap,
  Footprints,
  Bike,
  Waves,
  Mountain,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { CuratedTrainingModel } from "@/lib/ai/knowledge";

interface AdminScientificModelCardProps {
  model: CuratedTrainingModel;
  onSelect: (model: CuratedTrainingModel) => void;
}

export const AdminScientificModelCard: React.FC<AdminScientificModelCardProps> = ({
  model,
  onSelect,
}) => {
  const renderSportIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "running":
        return <Footprints className="h-5 w-5 text-amber-500" />;
      case "cycling":
        return <Bike className="h-5 w-5 text-sky-500" />;
      case "triathlon":
        return <Waves className="h-5 w-5 text-cyan-500" />;
      case "trail":
        return <Mountain className="h-5 w-5 text-emerald-500" />;
      default:
        return <ShieldCheck className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(model)}
      className="group bg-white border border-slate-200/90 hover:border-cyan-500/80 rounded-3xl p-5 shadow-xs hover:shadow-lg transition-all duration-200 space-y-4 cursor-pointer flex flex-col justify-between"
    >
      <div className="space-y-3.5">
        {/* Cabecera del Modelo */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-slate-100 group-hover:bg-cyan-50 border border-slate-200 group-hover:border-cyan-200 transition-colors shrink-0">
              {renderSportIcon(model.sportCategory)}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900 group-hover:text-cyan-700 transition-colors truncate">
                {model.displayName}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {model.periodizationStyle}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200/80 shrink-0">
            {model.sportCategory}
          </span>
        </div>

        {/* Autores Científicos */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Fundamento Científico
          </span>
          <div className="flex flex-wrap gap-1.5">
            {model.scientificAuthors.map((author, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white text-slate-700 border border-slate-200"
              >
                {author}
              </span>
            ))}
          </div>
        </div>

        {/* Distribución de Fases Macrocíclicas */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Distribución de Fases Macrocíclicas
          </span>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            {model.phaseDistributions.map((p) => (
              <div
                key={p.phaseKey}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5"
              >
                <span className="text-[9px] font-bold text-slate-500 uppercase block">
                  {p.phaseKey}
                </span>
                <span className="text-xs font-black text-slate-900">
                  {Math.round(p.percentageDuration * 100)}%
                </span>
                <span className="text-[9px] text-slate-400 block font-mono">
                  {p.weeklyTssRange.min}-{p.weeklyTssRange.max} TSS
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pauta de Tirada Pico & Tests */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
              <Flame className="h-3 w-3 text-amber-600" /> Tirada Pico
            </span>
            <strong className="text-amber-950 block text-[11px] truncate">
              {model.longRunRules.targetIntensityPercentCpOrFtp}
            </strong>
            <span className="text-[10px] text-amber-800 font-mono">
              Pico: {model.longRunRules.peakKm} km ({model.longRunRules.peakMinutes} min)
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 space-y-1">
            <span className="text-[10px] font-bold text-cyan-900 flex items-center gap-1">
              <Zap className="h-3 w-3 text-cyan-600" /> Tests Fisiológicos
            </span>
            <span className="text-[10px] text-cyan-800 font-medium block truncate">
              {model.mandatoryTests.map((t) => `Sem ${t.recommendedWeekIndex}: ${t.testName.slice(0, 18)}`).join(" • ") || "Calibración Continua"}
            </span>
            <span className="text-[9px] text-cyan-700/80 font-mono block">
              {model.mandatoryTests.length} protocolos integrados
            </span>
          </div>
        </div>
      </div>

      {/* Footer Interactivo */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-slate-400" />
          Rampa CTL: +{model.banisterRampRateLimits.minCtlPerWeek} a +{model.banisterRampRateLimits.maxCtlPerWeek}/sem
        </span>
        <span className="text-[11px] font-bold text-cyan-700 group-hover:text-cyan-800 flex items-center gap-1">
          <span>Ver modelo completo</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
