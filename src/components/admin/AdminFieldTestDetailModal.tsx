"use client";

import React, { useState } from "react";
import {
  X,
  Zap,
  Clock,
  Copy,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { PhysiologicalTestDefinition } from "@/lib/ai/knowledge/types";

interface AdminFieldTestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: PhysiologicalTestDefinition | null;
}

export const AdminFieldTestDetailModal: React.FC<AdminFieldTestDetailModalProps> = ({
  isOpen,
  onClose,
  test,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !test) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(test.workoutDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                {test.sport === "Run" ? "Stryd Potencia" : test.sport === "Ride" ? "Ciclismo FTP" : "Natación CSS"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {test.targetMetric}
              </span>
              <span className="text-[10px] text-slate-300 font-mono">
                Semana Sugerida: {test.recommendedWeekIndex} ({test.scheduledWeekType})
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              {test.testName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido Scrolleable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 text-xs">
          {/* Descripción del Protocolo */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Objetivo Fisiológico
            </span>
            <p className="text-slate-700 leading-relaxed text-xs">
              {test.protocolDescription}
            </p>
          </div>

          {/* Fórmula Matemática */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider">
                Fórmula de Determinación & Algoritmo
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-emerald-900 bg-white/80 p-2.5 rounded-xl border border-emerald-200">
              {test.calculationFormula}
            </p>
            <p className="text-[11px] text-emerald-800/90 pt-1">
              Al completarse en Intervals.icu, el SGEA detecta la sesión, extrae la potencia media real y recalibra automáticamente las zonas en Firestore e Intervals.icu sin intervención manual.
            </p>
          </div>

          {/* Sintaxis Estructurada */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Sintaxis Oficial Estructurada (Stryd / Intervals.icu)
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>¡Copiado al Portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Copiar Workout Completo</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 text-cyan-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-60 border border-slate-800">
              {test.workoutDoc}
            </pre>
          </div>

          {/* Criterios de Validez */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-950 font-bold text-[11px] uppercase">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span>Directrices de Ejecución & Criterios de Validez</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
              <li>
                <strong>Pacing Constante:</strong> Evitar salir a un ritmo excesivo en los primeros 2 minutos; buscar una potencia regular con variación menor al 5%.
              </li>
              <li>
                <strong>Esfuerzo Máximo (All-Out):</strong> Los bloques de test deben realizarse al límite sostenible para ese tiempo para garantizar un modelado biológico exacto.
              </li>
              <li>
                <strong>Condiciones Fisiológicas:</strong> Realizar el test con al menos 48h de recuperación previa sin sesiones de fatiga aguda.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-slate-400">
            ID: {test.testId} • {test.targetMetric}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Cerrar Protocolo
          </button>
        </div>
      </div>
    </div>
  );
};
