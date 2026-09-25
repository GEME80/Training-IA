"use client";

import React, { useState } from "react";
import {
  Zap,
  Clock,
  Copy,
  CheckCircle2,
  ChevronRight,
  Footprints,
  Bike,
  Waves,
  Activity,
} from "lucide-react";
import { PhysiologicalTestDefinition } from "@/lib/ai/knowledge/types";

interface AdminFieldTestCardProps {
  test: PhysiologicalTestDefinition;
  onSelect: (test: PhysiologicalTestDefinition) => void;
}

export const AdminFieldTestCard: React.FC<AdminFieldTestCardProps> = ({
  test,
  onSelect,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(test.workoutDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const renderSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case "run":
        return <Footprints className="h-4 w-4 text-amber-500" />;
      case "ride":
        return <Bike className="h-4 w-4 text-sky-500" />;
      case "swim":
        return <Waves className="h-4 w-4 text-cyan-500" />;
      default:
        return <Activity className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(test)}
      className="group bg-white border border-slate-200/90 hover:border-cyan-500/80 rounded-3xl p-5 shadow-xs hover:shadow-lg transition-all duration-200 space-y-4 cursor-pointer flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Cabecera del Test */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-xl bg-slate-100 group-hover:bg-cyan-50 border border-slate-200 group-hover:border-cyan-200 transition-colors shrink-0">
                {renderSportIcon(test.sport)}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80 shrink-0">
                {test.targetMetric}
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-bold hidden sm:inline">
                Semana {test.recommendedWeekIndex}
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 group-hover:text-cyan-700 transition-colors">
              {test.testName}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer shrink-0"
            title="Copiar sintaxis estructurada para Intervals"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {test.protocolDescription}
        </p>

        {/* Fórmula de Cálculo */}
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-0.5">
          <span className="text-[9px] font-bold text-emerald-900 uppercase tracking-wider block">
            Fórmula de Determinación
          </span>
          <p className="text-[11px] font-mono text-emerald-800 font-bold truncate">
            {test.calculationFormula}
          </p>
        </div>

        {/* Preview Sintaxis */}
        <div className="space-y-1">
          <span className="text-[9px] font-bold uppercase text-slate-400 block">
            Vista Previa de Estructura de Bloques
          </span>
          <pre className="p-2.5 rounded-xl bg-slate-900 text-cyan-300 font-mono text-[9px] leading-tight overflow-hidden max-h-20">
            {test.workoutDoc.split("\n").slice(0, 5).join("\n")}
            {"\n..."}
          </pre>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[10px] font-mono text-slate-400">
          Tipo: {test.scheduledWeekType}
        </span>
        <span className="text-[11px] font-bold text-cyan-700 group-hover:text-cyan-800 flex items-center gap-1">
          <span>Ver protocolo completo</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
