"use client";

import React, { useState } from "react";
import {
  Save,
  BookOpen,
  Sparkles,
  RotateCcw,
  ChevronDown,
  Calendar,
  Activity,
} from "lucide-react";
import { AgentPromptsLibrary, DEFAULT_PROMPTS, SPECIALIZED_AGENTS_METADATA } from "@/lib/ai/prompts";

interface AdminAIPromptsSectionProps {
  prompts: AgentPromptsLibrary;
  setPrompts: React.Dispatch<React.SetStateAction<AgentPromptsLibrary>>;
  onSavePrompts: () => void;
  isSavingPrompts: boolean;
}

export const AdminAIPromptsSection: React.FC<AdminAIPromptsSectionProps> = ({
  prompts,
  setPrompts,
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
    <div className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-amber-500 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">
              Sistema de Agentes de IA Especializados (Instrucciones Maestras SSOT)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fuente única de verdad. Las directrices aquí configuradas gobiernan la inferencia, dictámenes y periodización.
          </p>
        </div>

        <button
          type="button"
          onClick={onSavePrompts}
          disabled={isSavingPrompts}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50 transition w-full sm:w-auto shrink-0"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{isSavingPrompts ? "Guardando..." : "Guardar Todos los Agentes"}</span>
        </button>
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
              className="w-full p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-amber-500 focus:bg-white transition shadow-2xs"
            />
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
              className="w-full p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-cyan-500 focus:bg-white transition shadow-2xs"
            />
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
              className="w-full p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-emerald-500 focus:bg-white transition shadow-2xs"
            />
          </div>
        )}
      </div>
    </div>
  );
};
