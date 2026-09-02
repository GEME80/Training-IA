"use client";

import React from "react";
import {
  Trophy,
  Sliders,
  Sparkles,
  Layers,
  CheckCircle2,
  Trash2,
  ArrowRight,
} from "lucide-react";
import {
  MacrocycleBlueprint,
  SeasonPlanItem,
  calculatePlanStatus,
} from "@/lib/physiology/macrocycle";

export type GoalTemplateType =
  | "MARATON_42K"
  | "MEDIA_MARATON_21K"
  | "TRIATLON_703"
  | "BASE_BUILD"
  | "MANTENIMIENTO";

interface SeasonPlanGeneratorTabProps {
  currentPlanStep: number;
  setCurrentPlanStep: (step: number) => void;
  selectedGoalTemplate: GoalTemplateType;
  onSelectGoalTemplate: (template: GoalTemplateType) => void;
  seasonPlans: SeasonPlanItem[];
  chainMode: "CHAIN" | "REPLACE";
  onToggleChainMode: (mode: "CHAIN" | "REPLACE") => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  progressionRate: "ESTANDAR" | "CONSERVADOR";
  setProgressionRate: (v: "ESTANDAR" | "CONSERVADOR") => void;
  planPreviewData: MacrocycleBlueprint | null;
  isRegenerating: boolean;
  onGenerateAIPreview: () => void;
  onApplyAndConfirmPlan: () => void;
  onDeleteSeasonPlan: (id: string) => void;
}

export const SeasonPlanGeneratorTab: React.FC<SeasonPlanGeneratorTabProps> = ({
  currentPlanStep,
  setCurrentPlanStep,
  selectedGoalTemplate,
  onSelectGoalTemplate,
  seasonPlans,
  chainMode,
  onToggleChainMode,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  progressionRate,
  setProgressionRate,
  planPreviewData,
  isRegenerating,
  onGenerateAIPreview,
  onApplyAndConfirmPlan,
  onDeleteSeasonPlan,
}) => {
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* STEPPER ENCABEZADO (1 ➔ 2 ➔ 3) */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <span
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${
              currentPlanStep === 1
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            1
          </span>
          <span
            className={`font-bold ${
              currentPlanStep === 1 ? "text-slate-900 dark:text-white" : "text-slate-400"
            }`}
          >
            Programa
          </span>
        </div>

        <div className="h-0.5 w-8 bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center space-x-2">
          <span
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${
              currentPlanStep === 2
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            2
          </span>
          <span
            className={`font-bold ${
              currentPlanStep === 2 ? "text-slate-900 dark:text-white" : "text-slate-400"
            }`}
          >
            Personalización & Fechas
          </span>
        </div>

        <div className="h-0.5 w-8 bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center space-x-2">
          <span
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${
              currentPlanStep === 3
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            3
          </span>
          <span
            className={`font-bold ${
              currentPlanStep === 3 ? "text-slate-900 dark:text-white" : "text-slate-400"
            }`}
          >
            Preview IA & Confirmación
          </span>
        </div>
      </div>

      {/* PASO 1: SELECCIÓN DEL PROGRAMA */}
      {currentPlanStep === 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Selecciona el Programa PULSE PRO para tu Temporada</span>
            </h3>
            <span className="text-[10px] text-slate-500">Paso 1 de 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                id: "MARATON_42K",
                name: "PULSE 42K Marathon",
                weeks: 16,
                icon: "🏃",
                desc: "Periodización 3:1 para maratón de asfalto, fondo dominical progresivo y bloques de umbral.",
                badge: "Maratón",
              },
              {
                id: "MEDIA_MARATON_21K",
                name: "PULSE 21K Half-Marathon",
                weeks: 12,
                icon: "⚡",
                desc: "Desarrollo de ritmo de crucero, VO2max y resistencia láctica para media maratón.",
                badge: "Media Maratón",
              },
              {
                id: "TRIATLON_703",
                name: "PULSE 70.3 Middle Distance",
                weeks: 16,
                icon: "🏊🚴🏃",
                desc: "Estructura multideporte coordinada (Swim + Bike FTP + Run CP) sin interferencias.",
                badge: "Triatlón 70.3",
              },
              {
                id: "BASE_BUILD",
                name: "PULSE Aerobic Engine Build",
                weeks: 10,
                icon: "🌱",
                desc: "Construcción de base mitocondrial Z2, fuerza estructural e incremento de volumen seguro.",
                badge: "Base & Fuerza",
              },
              {
                id: "MANTENIMIENTO",
                name: "PULSE Longevity & Health",
                weeks: 8,
                icon: "❤️",
                desc: "Salud cardiovascular, VO2max y preservación muscular sin fatiga extrema de competición.",
                badge: "Salud & Fitness",
              },
            ].map((prog) => {
              const isSelected = selectedGoalTemplate === prog.id;
              return (
                <div
                  key={prog.id}
                  onClick={() => onSelectGoalTemplate(prog.id as GoalTemplateType)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-lg scale-[1.01]"
                      : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{prog.icon}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-cyan-400 text-slate-950"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {prog.weeks} Semanas
                      </span>
                    </div>
                    <h4 className="text-xs font-black mt-2">{prog.name}</h4>
                    <p
                      className={`text-[11px] mt-1 leading-relaxed ${
                        isSelected ? "text-slate-300 dark:text-slate-700" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {prog.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                      <span>Seleccionar</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PASO 2: PERSONALIZACIÓN & ENCADENAMIENTO DE FECHAS */}
      {currentPlanStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-cyan-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                2. Fechas, Encadenamiento y Nivel de Carga
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPlanStep(1)}
              className="text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
            >
              ← Cambiar Programa
            </button>
          </div>

          {/* Selector de Modo: Encadenar vs Reemplazar */}
          {seasonPlans.length > 0 && (
            <div className="p-3 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/80 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 dark:text-cyan-300 block">
                🔗 Modo de Integración en tu Temporada ({seasonPlans.length} planes previos)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onToggleChainMode("CHAIN")}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    chainMode === "CHAIN"
                      ? "bg-cyan-500 text-slate-950 border-cyan-600 font-black shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <div className="text-xs font-black flex items-center gap-1">
                    <span>🔗 Encadenar a mi Temporada</span>
                  </div>
                  <p className="text-[10px] opacity-80 mt-0.5">
                    Inicia el lunes posterior al plan actual sin solapamientos.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleChainMode("REPLACE")}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    chainMode === "REPLACE"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-950 font-black shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <div className="text-xs font-black flex items-center gap-1">
                    <span>↺ Reemplazar / Iniciar Nuevo</span>
                  </div>
                  <p className="text-[10px] opacity-80 mt-0.5">
                    Reinicia la cadena y fija este plan como único activo.
                  </p>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Fecha de Inicio del Plan
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Fecha Meta / Finalización
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Nivel de Carga & Asimilación Fisiológica
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProgressionRate("ESTANDAR")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  progressionRate === "ESTANDAR"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-950 font-black shadow-sm"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="text-xs font-black">🟢 Estándar (3:1 Progresivo)</div>
                <p className="text-[10px] opacity-75 mt-0.5">3 semanas de carga + 1 semana de descarga.</p>
              </button>

              <button
                type="button"
                onClick={() => setProgressionRate("CONSERVADOR")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  progressionRate === "CONSERVADOR"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-950 font-black shadow-sm"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="text-xs font-black">🔵 Conservador (2:1 Máster / Asimilación)</div>
                <p className="text-[10px] opacity-75 mt-0.5">2 semanas de carga + 1 semana de asimilación rápida.</p>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setCurrentPlanStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              ← Volver al Catálogo
            </button>
            <button
              type="button"
              onClick={onGenerateAIPreview}
              disabled={isRegenerating}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-400 hover:brightness-105 px-6 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-slate-950" />
              <span>{isRegenerating ? "Calculando..." : "Generar Preview con IA ➔"}</span>
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: PREVIEW IA & CONFIRMACIÓN */}
      {currentPlanStep === 3 && planPreviewData && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {planPreviewData.cycleTitle}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    📅 {startDate} ➔ {endDate} ({planPreviewData.totalWeeks} semanas)
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300">
                {planPreviewData.totalWeeks} Semanas
              </span>
            </div>

            {(() => {
              const totalWeeksCount = planPreviewData.totalWeeks;
              const recoveryWeeksCount = planPreviewData.weeks.filter(
                (w) => w.microcycleType === "DESCARGA_ASIMILACION"
              ).length;
              const avgTss = Math.round(
                planPreviewData.weeks.reduce((acc, w) => acc + w.targetTss, 0) / (totalWeeksCount || 1)
              );
              const peakTss = Math.max(...planPreviewData.weeks.map((w) => w.targetTss));
              const maxLongRun = Math.max(...planPreviewData.weeks.map((w) => w.maxLongRunMinutes));

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      📅 Duración
                    </span>
                    <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                      {totalWeeksCount} Semanas
                    </span>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{startDate} ➔ {endDate}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      🔄 Asimilación
                    </span>
                    <span className="text-sm font-black font-mono text-blue-600 dark:text-blue-400">
                      {recoveryWeeksCount} Descargas
                    </span>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {progressionRate === "CONSERVADOR" ? "Ritmo 2:1" : "Ritmo 3:1"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      ⚡ TSS Estimado
                    </span>
                    <span className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">
                      ~{avgTss} /sem
                    </span>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">Pico: {peakTss} TSS</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      🏔️ Tirada Límite
                    </span>
                    <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ⏱️ {maxLongRun} min
                    </span>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">Fondo dominical</p>
                  </div>
                </div>
              );
            })()}

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setCurrentPlanStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ↺ Reajustar Fechas o Nivel
              </button>

              <button
                type="button"
                onClick={onApplyAndConfirmPlan}
                disabled={isRegenerating}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-105 px-6 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95 transition cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-slate-950" />
                <span>
                  {isRegenerating
                    ? "Guardando Plan..."
                    : chainMode === "CHAIN" && seasonPlans.length > 0
                    ? "🚀 Aceptar y Encadenar a mi Temporada"
                    : "🚀 Aceptar y Activar Plan"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN INFERIOR: MI CADENA DE TEMPORADA */}
      {seasonPlans.length > 0 && (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3 shadow-sm pt-4 mt-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-cyan-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                🗺️ Mi Cadena de Temporada ({seasonPlans.length} Planes)
              </h4>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">
              Secuencia activa sin superposición
            </span>
          </div>

          <div className="space-y-2">
            {seasonPlans.map((plan, idx) => {
              const status = calculatePlanStatus(plan.startDate, plan.endDate);
              const isActive = status === "ACTIVE";
              const isCompleted = status === "COMPLETED";

              return (
                <div
                  key={plan.id}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isActive
                      ? "border-emerald-400 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : isCompleted
                      ? "border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 opacity-70"
                      : "border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/30 dark:bg-cyan-950/20"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {plan.planName}
                        </span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300"
                              : isCompleted
                              ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                              : "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300"
                          }`}
                        >
                          {isActive ? "🟢 En Ejecución" : isCompleted ? "⚪ Completado" : "🟡 Próximo"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        📅 {plan.startDate} ➔ {plan.endDate} ({plan.totalWeeks} semanas)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteSeasonPlan(plan.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Eliminar este plan de la cadena"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
