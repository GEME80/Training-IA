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
import { MacrocyclePhaseInfo, TargetRace, MacrocycleWeek, MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
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

          <div className="flex items-center space-x-3">
            {phaseInfo && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold border tracking-wide shadow-sm ${
                  phaseInfo.cycleBadgeColor || phaseInfo.badgeColor
                }`}
              >
                {phaseInfo.cycleBadgeLabel || phaseInfo.phaseLabel}
              </span>
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
