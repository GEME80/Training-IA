"use client";

import React from "react";
import {
  Save,
  Cpu,
  RefreshCw,
  Thermometer,
} from "lucide-react";
import { GeminiModelDto, GlobalAISettings } from "./types";
import { AgentPromptsLibrary } from "@/lib/ai/prompts";
import { AdminAIPromptsSection } from "./AdminAIPromptsSection";

interface AdminAISettingsTabProps {
  aiSettings: GlobalAISettings;
  setAiSettings: React.Dispatch<React.SetStateAction<GlobalAISettings>>;
  availableModels: GeminiModelDto[];
  isLoadingModels: boolean;
  fetchGeminiModels: () => void;
  prompts: AgentPromptsLibrary;
  setPrompts: React.Dispatch<React.SetStateAction<AgentPromptsLibrary>>;
  onSaveAISettings: () => void;
  isSavingAI: boolean;
  onSavePrompts: () => void;
  isSavingPrompts: boolean;
}

export const AdminAISettingsTab: React.FC<AdminAISettingsTabProps> = ({
  aiSettings,
  setAiSettings,
  availableModels,
  isLoadingModels,
  fetchGeminiModels,
  prompts,
  setPrompts,
  onSaveAISettings,
  isSavingAI,
  onSavePrompts,
  isSavingPrompts,
}) => {

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Titular */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-950 tracking-tight">Configuración del Motor AI & Prompts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ajustes de inferencia, temperatura y biblioteca de prompts maestros SSOT.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onSaveAISettings}
            disabled={isSavingAI}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSavingAI ? "Guardando..." : "Guardar Motor AI"}</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN A: AJUSTES DE MODELO Y TEMPERATURA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Modelo Primario */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-cyan-600" />
              <h3 className="text-xs font-bold uppercase text-slate-800">Modelo Primario Gemini</h3>
            </div>
            <button
              type="button"
              onClick={fetchGeminiModels}
              disabled={isLoadingModels}
              className="text-[11px] font-bold text-cyan-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingModels ? "animate-spin" : ""}`} />
              <span>Sincronizar</span>
            </button>
          </div>
          <select
            value={aiSettings.primaryModel}
            onChange={(e) => setAiSettings((prev) => ({ ...prev, primaryModel: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {availableModels.length > 0 ? (
              availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  🟢 {m.id} {m.isRecommended ? "★ (Recomendado)" : ""} — [{m.category}]
                </option>
              ))
            ) : (
              <>
                <option value="gemini-2.5-flash">🟢 gemini-2.5-flash (Recomendado) — [Flash / Rápido]</option>
                <option value="gemini-2.0-flash">🟢 gemini-2.0-flash — [Flash / Rápido]</option>
                <option value="gemini-1.5-pro">🟢 gemini-1.5-pro — [Pro / Analítico]</option>
              </>
            )}
          </select>
          <p className="text-[11px] text-slate-500">
            Motor de IA para prescripción, análisis fisiológico y macrociclos.
          </p>
        </div>

        {/* Slider de Temperatura */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-rose-500" />
              <h3 className="text-xs font-bold uppercase text-slate-800">
                Temperatura: <span className="font-mono text-rose-600">{aiSettings.temperature.toFixed(1)}</span>
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {aiSettings.temperature === 0 ? "0.0 = Determinista" : aiSettings.temperature <= 0.3 ? "Estructurado" : "Creativo"}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={aiSettings.temperature}
            onChange={(e) => setAiSettings((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
            className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setAiSettings((prev) => ({ ...prev, temperature: 0.0 }))}
              className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                aiSettings.temperature === 0.0 ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              0.0 Determinista
            </button>
            <button
              type="button"
              onClick={() => setAiSettings((prev) => ({ ...prev, temperature: 0.2 }))}
              className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                aiSettings.temperature === 0.2 ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              0.2 Estructurado
            </button>
            <button
              type="button"
              onClick={() => setAiSettings((prev) => ({ ...prev, temperature: 0.7 }))}
              className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                aiSettings.temperature === 0.7 ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              0.7 Creativo
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN B: SISTEMA DE AGENTES DE IA ESPECIALIZADOS (SSOT) */}
      <AdminAIPromptsSection
        prompts={prompts}
        setPrompts={setPrompts}
        onSavePrompts={onSavePrompts}
        isSavingPrompts={isSavingPrompts}
      />
    </div>
  );
};
