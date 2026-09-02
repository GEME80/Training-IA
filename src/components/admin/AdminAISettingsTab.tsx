"use client";

import React, { useState } from "react";
import {
  Save,
  Cpu,
  RefreshCw,
  Thermometer,
  BookOpen,
  Sparkles,
  RotateCcw,
  ChevronDown,
  Calendar,
  Activity,
} from "lucide-react";
import { GeminiModelDto, GlobalAISettings } from "./types";
import { AgentPromptsLibrary, DEFAULT_PROMPTS, SPECIALIZED_AGENTS_METADATA } from "@/lib/ai/prompts";

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
  const [collapsedPrompts, setCollapsedPrompts] = useState<{
    headCoach: boolean;
    macrocycle: boolean;
    dailyAudit: boolean;
  }>({
    headCoach: false,
    macrocycle: true,
    dailyAudit: true,
  });

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
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">
                Sistema de Agentes de IA Especializados (Instrucciones Maestras SSOT)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fuente única de verdad. Las directrices aquí configuradas gobiernan la inferencia, dictámenes y periodización en toda la plataforma.
            </p>
          </div>

          <button
            type="button"
            onClick={onSavePrompts}
            disabled={isSavingPrompts}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50 transition shrink-0"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSavingPrompts ? "Guardando..." : "Guardar Todos los Agentes"}</span>
          </button>
        </div>

        {/* Agente 01: Head Coach */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm transition-all hover:border-slate-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div
              onClick={() => setCollapsedPrompts((p) => ({ ...p, headCoach: !p.headCoach }))}
              className="flex items-start sm:items-center space-x-3 cursor-pointer group flex-1"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {SPECIALIZED_AGENTS_METADATA.headCoach.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                    {SPECIALIZED_AGENTS_METADATA.headCoach.badgeLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium leading-snug">
                  {SPECIALIZED_AGENTS_METADATA.headCoach.specialty} • <span className="font-mono text-slate-700 font-bold">{prompts.headCoachPrompt.length} caracteres</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setPrompts((p) => ({ ...p, headCoachPrompt: DEFAULT_PROMPTS.headCoachPrompt }))}
                title="Restablecer a versión entrenada recomendada"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
              >
                <RotateCcw className="h-3 w-3 text-amber-600" />
                <span>Restablecer</span>
              </button>
              <button
                type="button"
                onClick={() => setCollapsedPrompts((p) => ({ ...p, headCoach: !p.headCoach }))}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${collapsedPrompts.headCoach ? "-rotate-90" : "rotate-0 text-amber-600"}`} />
              </button>
            </div>
          </div>

          {!collapsedPrompts.headCoach && (
            <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn space-y-2">
              <p className="text-[11px] text-slate-500 italic">
                {SPECIALIZED_AGENTS_METADATA.headCoach.roleDescription}
              </p>
              <textarea
                rows={8}
                value={prompts.headCoachPrompt}
                onChange={(e) => setPrompts((p) => ({ ...p, headCoachPrompt: e.target.value }))}
                placeholder="Instrucciones maestras del Head Coach..."
                className="w-full p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-amber-500 focus:bg-white transition shadow-2xs"
              />
            </div>
          )}
        </div>

        {/* Agente 02: Arquitecto de Macrociclos */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm transition-all hover:border-slate-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div
              onClick={() => setCollapsedPrompts((p) => ({ ...p, macrocycle: !p.macrocycle }))}
              className="flex items-start sm:items-center space-x-3 cursor-pointer group flex-1"
            >
              <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200/80 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                    {SPECIALIZED_AGENTS_METADATA.macrocycle.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-100 text-cyan-800 border border-cyan-200">
                    {SPECIALIZED_AGENTS_METADATA.macrocycle.badgeLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium leading-snug">
                  {SPECIALIZED_AGENTS_METADATA.macrocycle.specialty} • <span className="font-mono text-slate-700 font-bold">{prompts.macrocyclePrompt.length} caracteres</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setPrompts((p) => ({ ...p, macrocyclePrompt: DEFAULT_PROMPTS.macrocyclePrompt }))}
                title="Restablecer a versión entrenada recomendada"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
              >
                <RotateCcw className="h-3 w-3 text-cyan-600" />
                <span>Restablecer</span>
              </button>
              <button
                type="button"
                onClick={() => setCollapsedPrompts((p) => ({ ...p, macrocycle: !p.macrocycle }))}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${collapsedPrompts.macrocycle ? "-rotate-90" : "rotate-0 text-cyan-600"}`} />
              </button>
            </div>
          </div>

          {!collapsedPrompts.macrocycle && (
            <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn space-y-2">
              <p className="text-[11px] text-slate-500 italic">
                {SPECIALIZED_AGENTS_METADATA.macrocycle.roleDescription}
              </p>
              <textarea
                rows={8}
                value={prompts.macrocyclePrompt}
                onChange={(e) => setPrompts((p) => ({ ...p, macrocyclePrompt: e.target.value }))}
                placeholder="Instrucciones maestras del Arquitecto de Macrociclos..."
                className="w-full p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-cyan-500 focus:bg-white transition shadow-2xs"
              />
            </div>
          )}
        </div>

        {/* Agente 03: Auditor Fisiológico */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm transition-all hover:border-slate-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div
              onClick={() => setCollapsedPrompts((p) => ({ ...p, dailyAudit: !p.dailyAudit }))}
              className="flex items-start sm:items-center space-x-3 cursor-pointer group flex-1"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Activity className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {SPECIALIZED_AGENTS_METADATA.dailyAudit.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {SPECIALIZED_AGENTS_METADATA.dailyAudit.badgeLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium leading-snug">
                  {SPECIALIZED_AGENTS_METADATA.dailyAudit.specialty} • <span className="font-mono text-slate-700 font-bold">{prompts.dailyAuditPrompt.length} caracteres</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setPrompts((p) => ({ ...p, dailyAuditPrompt: DEFAULT_PROMPTS.dailyAuditPrompt }))}
                title="Restablecer a versión entrenada recomendada"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
              >
                <RotateCcw className="h-3 w-3 text-emerald-600" />
                <span>Restablecer</span>
              </button>
              <button
                type="button"
                onClick={() => setCollapsedPrompts((p) => ({ ...p, dailyAudit: !p.dailyAudit }))}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${collapsedPrompts.dailyAudit ? "-rotate-90" : "rotate-0 text-emerald-600"}`} />
              </button>
            </div>
          </div>

          {!collapsedPrompts.dailyAudit && (
            <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn space-y-2">
              <p className="text-[11px] text-slate-500 italic">
                {SPECIALIZED_AGENTS_METADATA.dailyAudit.roleDescription}
              </p>
              <textarea
                rows={8}
                value={prompts.dailyAuditPrompt}
                onChange={(e) => setPrompts((p) => ({ ...p, dailyAuditPrompt: e.target.value }))}
                placeholder="Instrucciones maestras del Auditor Fisiológico..."
                className="w-full p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-emerald-500 focus:bg-white transition shadow-2xs"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
