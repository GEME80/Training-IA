"use client";

import React, { useState } from "react";
import {
  Trophy,
  Calendar,
  Flag,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  Compass,
  ArrowRight,
  Code2,
  Footprints,
  Bike,
  Dumbbell,
  Moon,
  Layers,
  BookOpen,
} from "lucide-react";
import { MacrocyclePhaseInfo, TargetRace, MacrocycleWeek, MacrocycleBlueprint, MicrocycleType } from "@/lib/physiology/macrocycle";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, PlanItem } from "@/lib/gemini/engine";
import { MacrocycleWizardModal } from "./MacrocycleWizardModal";
import { MacrocyclePreviewTimeline } from "./MacrocyclePreviewTimeline";
import { AthleteProfile } from "@/lib/intervals/types";
import { PhysiologicalStatus } from "@/lib/physiology/engine";

interface MacrocycleViewProps {
  phaseInfo: MacrocyclePhaseInfo | null;
  races: TargetRace[];
  profile: AthleteProfile;
  physioStatus: PhysiologicalStatus | null;
  apiKey?: string;
  geminiApiKey?: string;
  selectedModel?: string;
  weeklyAvailability?: WeeklyAvailabilityMap;
  onOpenRaceSettings?: () => void;
  onResetMacrocycle?: () => void;
  onJumpToMicrocycleWithAI: (weekOffset: number, plan: PlanItem[]) => void;
  onApplyMacrocycle?: (blueprint: MacrocycleBlueprint, targetRace?: TargetRace, source?: "AI_GENERATED" | "WIZARD_CUSTOM") => void;
}

export const MacrocycleView: React.FC<MacrocycleViewProps> = ({
  phaseInfo,
  races,
  profile,
  physioStatus,
  apiKey,
  geminiApiKey,
  selectedModel,
  weeklyAvailability = DEFAULT_WEEKLY_AVAILABILITY,
  onOpenRaceSettings,
  onResetMacrocycle,
  onJumpToMicrocycleWithAI,
  onApplyMacrocycle,
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);

  const blueprint = phaseInfo?.blueprint;
  const primaryRace = phaseInfo?.primaryRace;
  const weeks = blueprint?.weeks || [];
  const currentWeek = blueprint?.currentWeek || weeks[0];
  const selectedWeek: MacrocycleWeek = weeks[selectedWeekIndex] || currentWeek;

  const handleUpdateWeekMicrocycle = (weekIndex: number, newType: MicrocycleType) => {
    if (!blueprint || !blueprint.weeks[weekIndex]) return;

    const updatedWeeks = [...blueprint.weeks];
    const targetWeek = { ...updatedWeeks[weekIndex] };
    targetWeek.microcycleType = newType;
    targetWeek.isRecoveryWeek = newType === "DESCARGA_ASIMILACION";

    if (newType === "DESCARGA_ASIMILACION") {
      targetWeek.microcycleLabel = "Descarga de Asimilación (3:1)";
      targetWeek.microcycleBadgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      targetWeek.targetTss = Math.round((targetWeek.targetTss || 350) * 0.7);
    } else if (newType === "IMPACTO_CHOQUE") {
      targetWeek.microcycleLabel = "🔥 Choque / Impacto";
      targetWeek.microcycleBadgeColor = "bg-orange-500/25 text-orange-300 border-orange-500/40";
      targetWeek.targetTss = Math.round((targetWeek.targetTss || 350) * 1.15);
    } else if (newType === "CARGA") {
      targetWeek.microcycleLabel = "Microciclo de Carga";
      targetWeek.microcycleBadgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
    }

    updatedWeeks[weekIndex] = targetWeek;
    const updatedBlueprint: MacrocycleBlueprint = {
      ...blueprint,
      weeks: updatedWeeks,
    };

    if (onApplyMacrocycle) {
      onApplyMacrocycle(updatedBlueprint, primaryRace || undefined, "WIZARD_CUSTOM");
    }
  };

  const selectedWeekPlan = selectedWeek
    ? generateWeekTemplate(selectedWeek, profile.run_ftp, profile.bike_ftp, weeklyAvailability, primaryRace?.distance as any)
    : [];

  const getDistanceLabel = (dist?: string) => {
    switch (dist) {
      case "42k":
        return "Maratón (42.195 km)";
      case "21k":
        return "Media Maratón (21.097 km)";
      case "10k":
        return "10K Ruta";
      case "5k":
        return "5K Velocidad";
      case "cycling_fondo":
        return "Gran Fondo Ciclismo";
      case "triathlon_703":
        return "Triatlón Media Distancia (70.3)";
      case "triathlon_1406":
        return "Triatlón Larga Distancia (140.6)";
      case "maintenance":
        return "Mantenimiento Adaptativo";
      case "base_building":
        return "Construcción de Base GPP";
      case "post_race_recovery":
        return "Recuperación Post-Carrera";
      case "injury_rehab":
        return "Retorno / Reacondicionamiento";
      default:
        return "Competición Objetivo";
    }
  };

  const getOffsetForWeek = (w: MacrocycleWeek): number => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const todayMonday = new Date(now.setDate(diff));
    todayMonday.setHours(0, 0, 0, 0);

    const weekMon = new Date(w.startDate + "T00:00:00");
    const diffTime = weekMon.getTime() - todayMonday.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));
  };

  if (!blueprint) {
    return (
      <div className="space-y-8 animate-fadeIn py-2">
        {/* Hero Onboarding Banner */}
        <div className="card-gradient rounded-3xl p-8 sm:p-10 border border-slate-800 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Arquitectura Fisiológica de Temporada PULSE AI PRO</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Diseña tu Macrociclo a Medida desde Cero
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              No tienes ningún macrociclo activo ni carreras asignadas. PULSE AI PRO utiliza tu telemetría biológica directa de <strong>Intervals.icu</strong> (Stryd CP, Bike FTP y modelo Banister) para calcular periodizaciones adaptativas con ratios de carga y asimilación <strong>3:1</strong> sin riesgo de lesión ni sobreentrenamiento.
            </p>
          </div>
        </div>

        {/* 3 Interactive Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pathway 1: Asistente Guiado Paso a Paso (Recomendado) */}
          <div className="card-gradient rounded-2xl p-6 border border-amber-500/40 flex flex-col justify-between space-y-5 shadow-xl hover:border-amber-500/70 transition group relative">
            <div className="absolute top-4 right-4">
              <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                Recomendado
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                <Zap className="h-6 w-6 text-black" />
              </div>

              <div>
                <h3 className="text-base font-black text-white group-hover:text-amber-400 transition">
                  1. Asistente con IA Paso a Paso
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Configura tu objetivo (ej. Maratón de Tokio 2027 a 29 semanas) y la IA dividirá tu temporada en semanas de mantenimiento previo y 16 semanas de preparación específica con tests Stryd CP y Bike FTP.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 py-3 text-xs font-black text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <span>Iniciar Asistente Inteligente</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Pathway 2: Añadir Carrera al Calendario */}
          <div className="card-gradient rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-5 shadow-xl hover:border-slate-700 transition group">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition">
                <Trophy className="h-6 w-6 text-cyan-400" />
              </div>

              <div>
                <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition">
                  2. Programar Carrera Objetivo
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Registra manualmente tus competiciones (Maratón, Media Maratón, 10K, Gran Fondo de Ciclismo o Triatlón) en el gestor de eventos con prioridad A, B o C.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenRaceSettings && onOpenRaceSettings()}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900 border border-slate-700 py-3 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition"
            >
              <Calendar className="h-4 w-4 text-cyan-400" />
              <span>Abrir Gestor de Carreras</span>
            </button>
          </div>

          {/* Pathway 3: Bloque de Mantenimiento & Consistencia */}
          <div className="card-gradient rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-5 shadow-xl hover:border-slate-700 transition group">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition">
                <Compass className="h-6 w-6 text-emerald-400" />
              </div>

              <div>
                <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition">
                  3. Bloque de Consistencia & Base
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  ¿Sin carrera a la vista? Activa un macrociclo de mantenimiento adaptativo o construcción de base aeróbica con tiradas seguras y preservación de tendones de Aquiles.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
            >
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>Activar Bloque de Consistencia</span>
            </button>
          </div>
        </div>

        {/* Feature Badges Footer */}
        <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/80 flex flex-wrap items-center justify-around gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Integración Bidireccional Intervals.icu
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Prescripción Stryd CP & Bike FTP
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Gobernanza Fisiológica 3:1 (Regeneración Miofibrilar)
          </span>
        </div>

        {/* Wizard Modal */}
        <MacrocycleWizardModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          profile={profile}
          physioStatus={physioStatus}
          apiKey={apiKey}
          geminiApiKey={geminiApiKey}
          selectedModel={selectedModel}
          weeklyAvailability={weeklyAvailability}
          onApplyMacrocycle={(newBlueprint, targetRace, source) => {
            if (onApplyMacrocycle) {
              onApplyMacrocycle(newBlueprint, targetRace, source);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Minimalista & Resumen Unificado */}
      <div className="card-gradient rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-black shadow-lg shadow-amber-500/20">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                Plan del Macrociclo & Periodización
              </h1>
              <p className="text-xs text-slate-400">
                {blueprint?.cycleTitle || "Periodización dinámica y prescripción adaptativa de la temporada"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {phaseInfo && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold border tracking-wide shadow-sm ${
                  phaseInfo.cycleBadgeColor || phaseInfo.badgeColor
                }`}
              >
                {phaseInfo.cycleBadgeLabel || phaseInfo.phaseLabel}
              </span>
            )}

            {/* Botón para Resetear / Borrar Plan Activo */}
            {onResetMacrocycle && (
              <button
                type="button"
                onClick={onResetMacrocycle}
                className="flex items-center space-x-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition"
                title="Borrar macrociclo activo y dejar todo en cero"
              >
                <span>🗑️ Borrar Plan</span>
              </button>
            )}

            {/* Botón Único Principal del Asistente */}
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 text-xs font-black text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <Zap className="h-4 w-4 text-black" />
              <span>Configurar Macrociclo (Paso a Paso)</span>
            </button>
          </div>
        </div>

        {/* Resumen de Carrera o Momento */}
        {primaryRace ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="md:col-span-2 rounded-xl bg-slate-950/80 p-4 border border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
                  <Flag className="h-3.5 w-3.5" />
                  OBJETIVO PRINCIPAL (PRIORIDAD A)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  📅 {primaryRace.date}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-white tracking-wide">
                  {primaryRace.name}
                </h2>
                <p className="text-xs text-slate-400">
                  {getDistanceLabel(primaryRace.distance)}
                  {primaryRace.goalTarget && ` • Meta: ${primaryRace.goalTarget}`}
                </p>
              </div>

              {blueprint && (
                <div className="text-xs text-slate-400 pt-1">
                  Inicio del plan: <strong className="text-slate-200 font-mono">{blueprint.startDate}</strong> ({blueprint.totalWeeks} semanas totales)
                </div>
              )}
            </div>

            {/* Countdown Box */}
            <div className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cuenta Regresiva
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                  {phaseInfo?.daysRemaining !== null ? phaseInfo?.daysRemaining : "—"}
                </span>
                <span className="text-xs font-bold text-slate-400">días</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Equivalente a <strong>{phaseInfo?.weeksRemaining || 0} semanas</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-300">
              🔵 <strong>Modo Activo:</strong> {blueprint?.cycleTitle || "Mantenimiento Adaptativo & Salud Articular"} ({blueprint?.totalWeeks || 8} semanas)
            </div>
            <span className="text-xs text-slate-500">Sin carrera programada</span>
          </div>
        )}
      </div>

      {/* 2. Timeline Interactivo & Previsualizador de Entrenamientos */}
      {blueprint && (
        <div className="space-y-4">
          <MacrocyclePreviewTimeline
            blueprint={blueprint}
            runFtp={profile.run_ftp}
            bikeFtp={profile.bike_ftp}
            weeklyAvailability={weeklyAvailability}
            distanceType={primaryRace?.distance as any}
            selectedWeekIndex={selectedWeekIndex}
            onSelectWeek={(idx) => setSelectedWeekIndex(idx)}
            onJumpToMicrocycle={onJumpToMicrocycleWithAI}
            onRecalibrateWeekWithAI={onJumpToMicrocycleWithAI}
            onUpdateWeekMicrocycle={handleUpdateWeekMicrocycle}
          />

          {/* 3. Botón de Salto al Microciclo Activo con la IA */}
          {selectedWeek && (
            <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="text-xs text-slate-300">
                🚀 ¿Quieres cargar y adaptar la <strong>Semana {selectedWeek.weekNumber} ({selectedWeek.formattedRange})</strong> en el Head Coach IA?
              </div>

              <button
                type="button"
                onClick={() => {
                  const offset = getOffsetForWeek(selectedWeek);
                  onJumpToMicrocycleWithAI(offset, selectedWeekPlan);
                }}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 px-5 py-2.5 text-xs font-black text-black shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-95 transition"
              >
                <Sparkles className="h-4 w-4" />
                <span>Cargar Semana {selectedWeek.weekNumber} en Microciclo Activo</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. Modal del Asistente Paso a Paso (Wizard) */}
      <MacrocycleWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        profile={profile}
        physioStatus={physioStatus}
        apiKey={apiKey}
        geminiApiKey={geminiApiKey}
        selectedModel={selectedModel}
        weeklyAvailability={weeklyAvailability}
        onApplyMacrocycle={(newBlueprint, targetRace, source) => {
          if (onApplyMacrocycle) {
            onApplyMacrocycle(newBlueprint, targetRace, source);
          }
        }}
      />
    </div>
  );
};
