"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, RefreshCw, Activity, CheckCircle2 } from "lucide-react";
import { AthleteProfile } from "@/lib/intervals/types";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { MacrocycleBlueprint, MacrocyclePhaseInfo, getOffsetForWeek } from "@/lib/physiology/macrocycle";
import { resolveCurrentWeekIndex } from "@/lib/physiology/macrocycleSync";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { PlanItem, WeeklyAvailabilityMap, getWeekDates } from "@/lib/gemini/engine";
import { HeadCoachWeekSelector } from "./headcoach/HeadCoachWeekSelector";
import { HeadCoachQuickActions, QuickActionOptions } from "./headcoach/HeadCoachQuickActions";
import { HeadCoachTemporaryMatrixModal } from "./headcoach/HeadCoachTemporaryMatrixModal";
import { HeadCoachMessageItem, HeadCoachMessageData } from "./headcoach/HeadCoachMessageItem";
import { HeadCoachHeader } from "./headcoach/HeadCoachHeader";

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
  weekOffset = 0,
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
  const [isApplying, setIsApplying] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [temporaryAvailability, setTemporaryAvailability] = useState<WeeklyAvailabilityMap | null>(null);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);

  const selectedWeekIdx = Math.max(0, activeWeekNumber - 1);
  const selectedWeekData = effectiveBlueprint?.weeks?.[selectedWeekIdx];
  const activePhaseLabel = selectedWeekData?.phase || macrocyclePhase?.phaseLabel || "Construcción";

  const plannedWeekTss = (Array.isArray(currentPlan) && currentPlan.length > 0)
    ? currentPlan.reduce((acc, p) => acc + (p?.tss || 0), 0)
    : (selectedWeekData?.targetTss || 350);
  const executedWeekTss = Object.values(dailyExecutedActivities || {}).reduce(
    (acc: number, item: any) => acc + (item?.icu_training_load || item?.tss || item?.totalTss || 0),
    0
  );
  const compliancePct = plannedWeekTss > 0
    ? Math.round((executedWeekTss / plannedWeekTss) * 100)
    : 0;

  const getWelcomeText = (wNum: number, phase: string) => {
    const tsbStr = physioStatus?.tsb !== undefined
      ? (physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1))
      : "—";
    const hrvStr = physioStatus?.currentHrv ? ` • HRV ${physioStatus.currentHrv} ms` : "";
    const progressStatus = compliancePct >= 100
      ? `Progreso Semanal: ${compliancePct}% (${executedWeekTss} / ${plannedWeekTss} TSS) — ¡Objetivo semanal completado al 100%! Carga asimilada con éxito.`
      : compliancePct > 0
      ? `Progreso Semanal: ${compliancePct}% (${executedWeekTss} / ${plannedWeekTss} TSS acumulados).`
      : `Progreso Semanal: 0% (${plannedWeekTss} TSS objetivo en calendario).`;

    return `¡Saludos, ${profile.name || "Atleta"}! Soy tu Head Coach Fisiológico de PULSE.

Telemetría en Vivo: CTL ${physioStatus?.ctl?.toFixed(1) ?? "—"} • ATL ${physioStatus?.atl?.toFixed(1) ?? "—"} • TSB ${tsbStr}${hrvStr}.

Fase Activa: **Microciclo de la Semana ${wNum}** (${phase}).
${progressStatus}

Usa la consola de control táctico a continuación para auditar la semana, confirmar continuidad o consultar las pautas de tu sesión.`;
  };

  const [messages, setMessages] = useState<HeadCoachMessageData[]>([
    {
      id: "welcome",
      role: "assistant",
      text: getWelcomeText(weekNumber && weekNumber > 0 ? weekNumber : realCurrentWeekNumber, activePhaseLabel),
      timestamp: "En vivo",
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sincronizar semana activa cuando cambia el macrociclo o weekNumber por navegación
  useEffect(() => {
    if (weekNumber && weekNumber > 0) {
      setActiveWeekNumber(weekNumber);
    } else if (realCurrentWeekNumber && realCurrentWeekNumber > 0) {
      setActiveWeekNumber(realCurrentWeekNumber);
    }
  }, [weekNumber, realCurrentWeekNumber]);

  // Actualizar el saludo inicial si aún no se ha iniciado la conversación
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "welcome") {
        return [{ ...prev[0], text: getWelcomeText(activeWeekNumber, activePhaseLabel) }];
      }
      return prev;
    });
  }, [activeWeekNumber, activePhaseLabel, profile.name, physioStatus?.ctl, physioStatus?.atl, physioStatus?.tsb, physioStatus?.currentHrv, executedWeekTss, plannedWeekTss, compliancePct]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string, options?: QuickActionOptions) => {
    const text = (textToSend || "").trim();
    if (!text || isLoading) return;

    const userMsg: HeadCoachMessageData = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      const calculatedOffset = selectedWeekData
        ? getOffsetForWeek(selectedWeekData)
        : (activeWeekNumber - realCurrentWeekNumber);

      const effectivePlanForWeek = (activeWeekNumber === realCurrentWeekNumber && currentPlan && currentPlan.length > 0)
        ? currentPlan
        : selectedWeekData
        ? generateWeekTemplate(
            selectedWeekData,
            profile.run_ftp,
            profile.bike_ftp,
            (temporaryAvailability as any) || (effectiveBlueprint?.availabilitySnapshot as any) || weeklyAvailability,
            (effectiveBlueprint?.distanceType as any) || "MARATON_42K",
            profile.ctl
          )
        : currentPlan;

      const res = await fetch("/api/headcoach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({ role: m.role, content: m.text })),
          athleteId: profile.id, apiKey, uid, email, customGeminiKey: geminiApiKey,
          selectedModel, temperature, weekOffset: calculatedOffset, weekNumber: activeWeekNumber,
          currentPlan: effectivePlanForWeek, dailyExecutedActivities,
          runFtp: profile.run_ftp, bikeFtp: profile.bike_ftp, weight: profile.weight,
          height: profile.heightCm, birthDate: profile.birthDate, gender: profile.gender,
          restingHR: profile.restingHR, maxHR: profile.maxHR, lthr: profile.lthr,
          isInitialAudit: false,
          temporaryAvailability: temporaryAvailability || undefined,
          targetTssAdjustmentPct: options?.targetTssAdjustmentPct,
          isWeekKickoffAudit: options?.isWeekKickoffAudit,
        }),
      });

      const data = await res.json();
      if (data.success && (data.reply || data.suggestedPlan)) {
        const assistantMsg: HeadCoachMessageData = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          text: data.reply || "Microciclo evaluado y calibrado a tus parámetros.",
          suggestedPlan: data.suggestedPlan || null,
          targetWeekNumber: data.targetWeekNumber || activeWeekNumber,
          modelUsed: data.modelUsed,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          reasoning: data.reasoning || null,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (data.suggestedPlan && onPlanUpdate) {
          onPlanUpdate(data.suggestedPlan);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            text: data.error || "Evaluación offline: Mantén tu progresión en zonas de potencia Stryd y Bike FTP establecidas para este microciclo.",
            timestamp: "Offline",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "No se pudo conectar con el motor de IA. Tu balance TSB se encuentra en rango fisiológico estable.",
          timestamp: "Offline",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAndSync = async (planToSync?: PlanItem[]) => {
    const finalPlan = planToSync || currentPlan;
    if (!onApplyPlanAndSync || !finalPlan || finalPlan.length === 0) return;

    setIsApplying(true);
    setSyncFeedback(null);
    try {
      await onApplyPlanAndSync(finalPlan);
      setSyncFeedback("¡Microciclo sincronizado exitosamente con Intervals.icu!");
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (e: any) {
      setSyncFeedback(`Error al sincronizar: ${e.message || "Verifica credenciales"}`);
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyTemporaryMatrix = (tempAvail: WeeklyAvailabilityMap) => {
    setTemporaryAvailability(tempAvail);
    handleSendMessage("He configurado una matriz de deportes temporal para esta semana. Adapta el microciclo distribuyendo los estímulos según esta nueva disponibilidad.");
  };

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

      {/* HISTORIAL DE MENSAJES CON CARDS DE MICROCICLO */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2">
        {messages.map((m) => (
          <HeadCoachMessageItem
            key={m.id}
            message={m}
            weekNumber={activeWeekNumber}
            onApplyAndSync={handleApplyAndSync}
            isApplying={isApplying}
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

      {/* CONSOLA DE CONTROL TÁCTICO GUIADA (FINOPS & CONSULTAS ESTRUCTURADAS) */}
      <div className="shrink-0 pt-2 border-t border-slate-200 dark:border-slate-800">
        <HeadCoachQuickActions
          onSelectAction={(prompt, opts) => handleSendMessage(prompt, opts)}
          onOpenTemporaryMatrix={() => setIsMatrixModalOpen(true)}
          isLoading={isLoading}
        />
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
