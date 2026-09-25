"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Activity, CheckCircle2 } from "lucide-react";
import { AthleteProfile } from "@/lib/intervals/types";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { MacrocycleBlueprint, MacrocyclePhaseInfo } from "@/lib/physiology/macrocycle";
import { resolveCurrentWeekIndex } from "@/lib/physiology/macrocycleSync";
import { PlanItem, WeeklyAvailabilityMap, getWeekDates } from "@/lib/gemini/engine";
import { HeadCoachWeekSelector } from "./headcoach/HeadCoachWeekSelector";
import { HeadCoachTemporaryMatrixModal } from "./headcoach/HeadCoachTemporaryMatrixModal";
import { HeadCoachMessageItem } from "./headcoach/HeadCoachMessageItem";
import { HeadCoachHeader } from "./headcoach/HeadCoachHeader";
import { useHeadCoachChat } from "./headcoach/useHeadCoachChat";

interface AthleteHeadCoachViewProps {
  profile: AthleteProfile;
  physioStatus: PhysiologicalStatus | null;
  macrocyclePhase: MacrocyclePhaseInfo | null;
  blueprint?: MacrocycleBlueprint | null;
  weekOffset?: number;
  weekNumber?: number;
  apiKey?: string;
  geminiApiKey?: string;
  selectedModel?: string;
  temperature?: number;
  weeklyAvailability?: WeeklyAvailabilityMap;
  currentPlan: PlanItem[];
  dailyExecutedActivities?: Record<string, any>;
  uid?: string;
  email?: string;
  onApplyPlanAndSync?: (plan?: PlanItem[]) => Promise<void>;
  onPlanUpdate?: (updatedPlan: PlanItem[]) => void;
}

export const AthleteHeadCoachView: React.FC<AthleteHeadCoachViewProps> = ({
  profile,
  physioStatus,
  macrocyclePhase,
  blueprint,
  weekNumber,
  apiKey,
  geminiApiKey,
  selectedModel = "gemini-3.5-flash",
  temperature = 0.0,
  weeklyAvailability,
  currentPlan,
  dailyExecutedActivities = {},
  uid,
  email,
  onApplyPlanAndSync,
  onPlanUpdate,
}) => {
  const effectiveBlueprint = blueprint || macrocyclePhase?.blueprint || null;
  const currentWeekIdx = effectiveBlueprint?.weeks && effectiveBlueprint.weeks.length > 0
    ? resolveCurrentWeekIndex(effectiveBlueprint.weeks)
    : 0;
  const realCurrentWeekNumber = effectiveBlueprint?.weeks?.[currentWeekIdx]?.weekNumber ?? (currentWeekIdx + 1);

  const [activeWeekNumber, setActiveWeekNumber] = useState<number>(() => {
    return weekNumber && weekNumber > 0 ? weekNumber : realCurrentWeekNumber;
  });

  const selectedWeekIdx = Math.max(0, activeWeekNumber - 1);
  const selectedWeekData = effectiveBlueprint?.weeks?.[selectedWeekIdx];
  const activePhaseLabel = selectedWeekData?.phase || macrocyclePhase?.phaseLabel || "Construcción";

  useEffect(() => {
    if (weekNumber && weekNumber > 0) {
      setActiveWeekNumber(weekNumber);
    } else if (realCurrentWeekNumber && realCurrentWeekNumber > 0) {
      setActiveWeekNumber(realCurrentWeekNumber);
    }
  }, [weekNumber, realCurrentWeekNumber]);

  const {
    messages,
    isLoading,
    isApplying,
    syncFeedback,
    isMatrixModalOpen,
    temporaryAvailability,
    messagesEndRef,
    setIsMatrixModalOpen,
    handleApplyAndSync,
    handleSelectSmartAction,
    handleApplyTemporaryMatrix,
  } = useHeadCoachChat({
    profile,
    physioStatus,
    macrocyclePhase,
    effectiveBlueprint,
    activeWeekNumber,
    realCurrentWeekNumber,
    selectedWeekData,
    weeklyAvailability,
    currentPlan,
    dailyExecutedActivities,
    apiKey,
    geminiApiKey,
    selectedModel,
    temperature,
    uid,
    email,
    onApplyPlanAndSync,
    onPlanUpdate,
  });

  let startStr: string | undefined;
  let endStr: string | undefined;

  if (selectedWeekData?.startDate && selectedWeekData?.endDate) {
    const sD = new Date(selectedWeekData.startDate + "T00:00:00");
    const eD = new Date(selectedWeekData.endDate + "T00:00:00");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    startStr = `${sD.getDate()} ${months[sD.getMonth()]}`;
    endStr = `${eD.getDate()} ${months[eD.getMonth()]}`;
  } else {
    const weekDates = getWeekDates(activeWeekNumber - realCurrentWeekNumber);
    startStr = weekDates[0]?.formattedDate;
    endStr = weekDates[6]?.formattedDate;
  }

  return (
    <div className="card-gradient rounded-3xl p-3 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4 animate-fadeIn flex flex-col h-[calc(100dvh-175px)] md:h-[calc(100vh-140px)] min-h-[520px]">
      {/* CABECERA ATLÉTICA PRO & SEMÁFORO PMC */}
      <HeadCoachHeader physioStatus={physioStatus} profile={profile} />

      {/* Selector Táctico de Microciclos (Semana en curso vs siguiente) */}
      <div className="shrink-0">
        <HeadCoachWeekSelector
          currentWeekNumber={realCurrentWeekNumber}
          selectedWeekNumber={activeWeekNumber}
          totalWeeks={effectiveBlueprint?.totalWeeks || macrocyclePhase?.blueprint?.totalWeeks || 16}
          onSelectWeek={(wNum) => setActiveWeekNumber(wNum)}
          startDateStr={startStr}
          endDateStr={endStr}
          phaseLabel={activePhaseLabel}
        />
      </div>

      {/* FEEDBACK DE SINCRONIZACIÓN */}
      {syncFeedback && (
        <div className="shrink-0 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{syncFeedback}</span>
          </div>
        </div>
      )}

      {/* HISTORIAL DE MENSAJES CON CARDS DE MICROCICLO Y SMART REPLIES */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2">
        {messages.map((m) => (
          <HeadCoachMessageItem
            key={m.id}
            message={m}
            weekNumber={activeWeekNumber}
            onApplyAndSync={handleApplyAndSync}
            isApplying={isApplying}
            onSelectQuickReply={(qr) => handleSelectSmartAction(qr)}
            onSelectSmartAction={handleSelectSmartAction}
          />
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2 shadow-xs">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Head Coach analizando actividades ejecutadas, fatiga y microciclo...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* MODAL MATRIZ TEMPORAL (SOLO ESTA SEMANA) */}
      <HeadCoachTemporaryMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        weekNumber={activeWeekNumber}
        initialAvailability={(temporaryAvailability as any) || (effectiveBlueprint?.availabilitySnapshot as any) || weeklyAvailability || {}}
        onApplyTemporaryMatrix={handleApplyTemporaryMatrix}
        isLoading={isLoading}
      />
    </div>
  );
};
