"use client";

import React from "react";
import { X, Sparkles, RefreshCw } from "lucide-react";
import { SportType, IntensityMetric } from "@/lib/physiology/macrocycleLibrary";

interface AdminProgramAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (e: React.FormEvent) => Promise<void>;
  aiPromptInput: string;
  setAiPromptInput: (val: string) => void;
  aiSportInput: SportType;
  setAiSportInput: (val: SportType) => void;
  aiDistanceInput: string;
  setAiDistanceInput: (val: string) => void;
  aiMetricInput: IntensityMetric;
  setAiMetricInput: (val: IntensityMetric) => void;
  isGenerating: boolean;
}

export const AdminProgramAiModal: React.FC<AdminProgramAiModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  aiPromptInput,
  setAiPromptInput,
  aiSportInput,
  setAiSportInput,
  aiDistanceInput,
  setAiDistanceInput,
  aiMetricInput,
  setAiMetricInput,
  isGenerating,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-base font-bold">Diseñar Programa con Asistente IA</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onGenerate} className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Deporte Objetivo</label>
            <select
              value={aiSportInput}
              onChange={(e) => setAiSportInput(e.target.value as SportType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="running">Carrera en Ruta (Running)</option>
              <option value="cycling">Ciclismo</option>
              <option value="triathlon">Triatlón</option>
              <option value="trail_running">Trail Running</option>
              <option value="swimming">Natación</option>
              <option value="maintenance">Salud / Mantenimiento</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Distancia / Modalidad</label>
              <input
                type="text"
                value={aiDistanceInput}
                onChange={(e) => setAiDistanceInput(e.target.value)}
                placeholder="42k, 21k, 10k, Fondo 120k..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Métrica Principal</label>
              <select
                value={aiMetricInput}
                onChange={(e) => setAiMetricInput(e.target.value as IntensityMetric)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="POWER">Potencia (Stryd / FTP)</option>
                <option value="HEART_RATE">Frecuencia Cardíaca</option>
                <option value="PACE">Ritmo</option>
                <option value="RPE">Sensaciones / RPE</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Instrucciones Específicas para el Arquitecto de Macrociclos *
            </label>
            <textarea
              rows={4}
              required
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              placeholder="Ej: Plan para corredor máster que busca bajar de 3:30 en Maratón de Valencia, enfatizando bloques de umbral funcional y fondos clave de hasta 32 km sin sobrecarga tendinosa..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isGenerating || !aiPromptInput.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Diseñando Programa...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generar con IA</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
