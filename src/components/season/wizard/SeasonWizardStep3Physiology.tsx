"use client";

import React from "react";
import { Activity, ShieldCheck, Zap, Heart, Flame, Sparkles, Bot } from "lucide-react";

interface SeasonWizardStep3PhysiologyProps {
  ctl?: number;
  runFtp?: number;
  bikeFtp?: number;
  lthr?: number;
  periodization: "2:1" | "3:1" | "CONTINUO";
  onChangePeriodization: (p: "2:1" | "3:1" | "CONTINUO") => void;
  customPromptText: string;
  onChangeCustomPromptText: (t: string) => void;
  onGeneratePlan: () => void;
  isGenerating: boolean;
}

export const SeasonWizardStep3Physiology: React.FC<SeasonWizardStep3PhysiologyProps> = ({
  ctl = 0,
  runFtp = 0,
  bikeFtp = 0,
  lthr = 165,
  periodization,
  onChangePeriodization,
  customPromptText,
  onChangeCustomPromptText,
  onGeneratePlan,
  isGenerating,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. TELEMETRÍA FISIOLÓGICA MINIMALISTA */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-emerald-500" />
            Tus Datos Fisiológicos Actuales
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
            Intervals.icu en vivo
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-400 block uppercase">Fitness CTL</span>
            <strong className="text-xs font-black text-slate-900 dark:text-white">
              {ctl > 0 ? ctl.toFixed(1) : "—"}
            </strong>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-400 block uppercase">Potencia Stryd</span>
            <strong className="text-xs font-black text-amber-600 dark:text-amber-400">
              {runFtp > 0 ? `${runFtp}W` : "—"}
            </strong>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-400 block uppercase">FTP Ciclismo</span>
            <strong className="text-xs font-black text-cyan-600 dark:text-cyan-400">
              {bikeFtp > 0 ? `${bikeFtp}W` : "—"}
            </strong>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-400 block uppercase">Umbral FC (LTHR)</span>
            <strong className="text-xs font-black text-rose-600 dark:text-rose-400">
              {lthr > 0 ? `${lthr} bpm` : "—"}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. RITMO DE PROGRESIÓN Y RECUPERACIÓN (LENGUAJE CLARO Y AMIGABLE) */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">
          Estrategia de Progresión y Descanso
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div
            onClick={() => onChangePeriodization("2:1")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1 ${
              periodization === "2:1"
                ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Ritmo Preventivo
              </h4>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[9px]">
                Recomendado
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              2 semanas de entrenamiento + 1 semana suave de asimilación. Ideal para asimilar mejor la carga y cuidar el cuerpo.
            </p>
          </div>

          <div
            onClick={() => onChangePeriodization("3:1")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1 ${
              periodization === "3:1"
                ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500" />
                Ritmo Estándar
              </h4>
              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold text-[9px]">
                Clásico
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              3 semanas de entrenamiento progresivo + 1 semana suave. Progresión clásica de volumen.
            </p>
          </div>
        </div>
      </div>

      {/* 3. DIRECTRICES ESPECÍFICAS ADICIONALES */}
      <div className="space-y-1">
        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">
          Notas o Preferencias para el Entrenador IA (Opcional)
        </label>
        <textarea
          rows={2}
          value={customPromptText}
          onChange={(e) => onChangeCustomPromptText(e.target.value)}
          placeholder="Ej: Tiradas largas los domingos, series de umbral los martes..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-none"
        />
      </div>

      {/* 4. BOTÓN DISPARADOR DE LA IA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGeneratePlan}
          disabled={isGenerating}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Bot className="h-4 w-4 animate-spin text-white" />
              <span>Head Coach IA Periodizando Temporada...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-white" />
              <span>Generar Macrociclo con Head Coach IA</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
