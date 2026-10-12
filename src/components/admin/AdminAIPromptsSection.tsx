"use client";

import React, { useState } from "react";
import { BookOpen, Sparkles, RotateCcw, ChevronDown, Calendar, Activity, Maximize2, X, Check } from "lucide-react";
import { AgentPromptsLibrary, DEFAULT_PROMPTS, SPECIALIZED_AGENTS_METADATA } from "@/lib/ai/prompts";

interface AdminAIPromptsSectionProps {
  prompts: AgentPromptsLibrary;
  setPrompts: React.Dispatch<React.SetStateAction<AgentPromptsLibrary>>;
  onSavePrompts?: () => void;
  isSavingPrompts?: boolean;
}

type AgentKey = "headCoach" | "macrocycle" | "dailyAudit";

export const AdminAIPromptsSection: React.FC<AdminAIPromptsSectionProps> = ({
  prompts,
  setPrompts,
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

  const [fullscreenAgent, setFullscreenAgent] = useState<AgentKey | null>(null);

  const handleResetPrompt = (key: "headCoachPrompt" | "macrocyclePrompt" | "dailyAuditPrompt", title: string) => {
    if (!confirm(`¿Restablecer las instrucciones maestras de "${title}" a la versión oficial de fábrica? Se perderán las modificaciones no guardadas.`)) {
      return;
    }
    setPrompts((p) => ({ ...p, [key]: DEFAULT_PROMPTS[key] }));
  };

  const getAgentPromptValue = (key: AgentKey) => {
    if (key === "headCoach") return prompts.headCoachPrompt;
    if (key === "macrocycle") return prompts.macrocyclePrompt;
    return prompts.dailyAuditPrompt;
  };

  const setAgentPromptValue = (key: AgentKey, val: string) => {
    if (key === "headCoach") setPrompts((p) => ({ ...p, headCoachPrompt: val }));
    else if (key === "macrocycle") setPrompts((p) => ({ ...p, macrocyclePrompt: val }));
    else setPrompts((p) => ({ ...p, dailyAuditPrompt: val }));
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Cabecera Informativa */}
      <div>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-emerald-600 shrink-0" />
          <h2 className="text-base font-bold text-slate-900">
            Sistema de Agentes de IA Especializados (Instrucciones Maestras SSOT)
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Fuente única de verdad. Las directrices aquí configuradas gobiernan la inferencia, dictámenes y periodización.
        </p>
      </div>

      {/* Agente 01: Head Coach */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm transition-all hover:border-slate-300">
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
              onClick={() => handleResetPrompt("headCoachPrompt", SPECIALIZED_AGENTS_METADATA.headCoach.title)}
              title="Restablecer a versión recomendada"
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

            {/* Desktop View */}
            <div className="hidden sm:block">
              <textarea
                rows={8}
                value={prompts.headCoachPrompt}
                onChange={(e) => setPrompts((p) => ({ ...p, headCoachPrompt: e.target.value }))}
                placeholder="Instrucciones maestras del Head Coach..."
                className="w-full p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-amber-500 focus:bg-white transition shadow-2xs"
              />
            </div>

            {/* Mobile Anti Scroll-Trap Preview + Fullscreen Trigger */}
            <div className="sm:hidden space-y-2">
              <div className="max-h-36 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 leading-relaxed whitespace-pre-wrap select-none">
                {prompts.headCoachPrompt.slice(0, 400)}...
              </div>
              <button
                type="button"
                onClick={() => setFullscreenAgent("headCoach")}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5 text-amber-400" />
                <span>✏️ Editar en Pantalla Completa</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Agente 02: Arquitecto de Macrociclos */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm transition-all hover:border-slate-300">
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
              onClick={() => handleResetPrompt("macrocyclePrompt", SPECIALIZED_AGENTS_METADATA.macrocycle.title)}
              title="Restablecer a versión recomendada"
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

            {/* Desktop View */}
            <div className="hidden sm:block">
              <textarea
                rows={8}
                value={prompts.macrocyclePrompt}
                onChange={(e) => setPrompts((p) => ({ ...p, macrocyclePrompt: e.target.value }))}
                placeholder="Instrucciones maestras del Arquitecto de Macrociclos..."
                className="w-full p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-cyan-500 focus:bg-white transition shadow-2xs"
              />
            </div>

            {/* Mobile Anti Scroll-Trap Preview + Fullscreen Trigger */}
            <div className="sm:hidden space-y-2">
              <div className="max-h-36 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 leading-relaxed whitespace-pre-wrap select-none">
                {prompts.macrocyclePrompt.slice(0, 400)}...
              </div>
              <button
                type="button"
                onClick={() => setFullscreenAgent("macrocycle")}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>✏️ Editar en Pantalla Completa</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Agente 03: Auditor Fisiológico */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm transition-all hover:border-slate-300">
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
              onClick={() => handleResetPrompt("dailyAuditPrompt", SPECIALIZED_AGENTS_METADATA.dailyAudit.title)}
              title="Restablecer a versión recomendada"
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

            {/* Desktop View */}
            <div className="hidden sm:block">
              <textarea
                rows={8}
                value={prompts.dailyAuditPrompt}
                onChange={(e) => setPrompts((p) => ({ ...p, dailyAuditPrompt: e.target.value }))}
                placeholder="Instrucciones maestras del Auditor Fisiológico..."
                className="w-full p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-emerald-500 focus:bg-white transition shadow-2xs"
              />
            </div>

            {/* Mobile Anti Scroll-Trap Preview + Fullscreen Trigger */}
            <div className="sm:hidden space-y-2">
              <div className="max-h-36 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 leading-relaxed whitespace-pre-wrap select-none">
                {prompts.dailyAuditPrompt.slice(0, 400)}...
              </div>
              <button
                type="button"
                onClick={() => setFullscreenAgent("dailyAudit")}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>✏️ Editar en Pantalla Completa</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Dedicado de Edición en Pantalla Completa para Móvil */}
      {fullscreenAgent && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-fadeIn">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {SPECIALIZED_AGENTS_METADATA[fullscreenAgent].title}
              </h3>
              <p className="text-[11px] text-slate-500">
                {getAgentPromptValue(fullscreenAgent).length} caracteres
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFullscreenAgent(null)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Listo</span>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            <textarea
              value={getAgentPromptValue(fullscreenAgent)}
              onChange={(e) => setAgentPromptValue(fullscreenAgent, e.target.value)}
              className="flex-1 w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white leading-relaxed focus:outline-none resize-none"
              placeholder="Escribe las directrices maestras..."
            />
          </div>
        </div>
      )}
    </div>
  );
};
