"use client";

import React, { useState } from "react";
import {
  X,
  Flame,
  Zap,
  Dumbbell,
  Layers,
} from "lucide-react";
import { CuratedTrainingModel } from "@/lib/ai/knowledge";
import { AdminScientificModelPhasesSection } from "./AdminScientificModelPhasesSection";
import { AdminScientificModelDynamicsSection } from "./AdminScientificModelDynamicsSection";

interface AdminScientificModelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: CuratedTrainingModel | null;
}

export const AdminScientificModelDetailModal: React.FC<AdminScientificModelDetailModalProps> = ({
  isOpen,
  onClose,
  model,
}) => {
  const [activeTab, setActiveTab] = useState<"phases" | "longrun" | "workouts" | "biotype">("phases");

  if (!isOpen || !model) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Cabecera Principal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {model.sportCategory}
              </span>
              <span className="text-[10px] text-slate-300 font-mono">
                {model.periodizationStyle}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              {model.displayName}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">
                Autores:
              </span>
              {model.scientificAuthors.map((author, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-slate-200 border border-white/10"
                >
                  {author}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de Pestañas del Modal */}
        <div className="px-5 sm:px-6 pt-3 border-b border-slate-200/80 bg-slate-50/70 flex gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("phases")}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === "phases"
                ? "border-cyan-600 text-cyan-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Fases del Macrociclo
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("longrun")}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === "longrun"
                ? "border-cyan-600 text-cyan-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5" />
              Tirada Larga & Dinámica Banister
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("workouts")}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === "workouts"
                ? "border-cyan-600 text-cyan-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Sesiones de Calidad
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("biotype")}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === "biotype"
                ? "border-cyan-600 text-cyan-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Dumbbell className="h-3.5 w-3.5" />
              Biotipo & Fuerza Cruzada
            </span>
          </button>
        </div>

        {/* Contenido Scrolleable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {activeTab === "phases" ? (
            <AdminScientificModelPhasesSection model={model} />
          ) : (
            <AdminScientificModelDynamicsSection model={model} activeTab={activeTab} />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-slate-400">
            ID: {model.modelId} • Base Científica SSOT
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Cerrar Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
