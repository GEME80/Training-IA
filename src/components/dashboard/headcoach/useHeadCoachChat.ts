"use client";

import { useState, useEffect, useRef } from "react";
import { AthleteProfile } from "@/lib/intervals/types";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { MacrocycleBlueprint, MacrocyclePhaseInfo, getOffsetForWeek } from "@/lib/physiology/macrocycle";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { PlanItem, WeeklyAvailabilityMap } from "@/lib/gemini/engine";
import { HeadCoachMessageData } from "./HeadCoachMessageItem";
import { SmartActionItem } from "@/lib/ai/headcoach/types";

export interface QuickActionOptions {
  targetTssAdjustmentPct?: number;
  temporaryAvailability?: WeeklyAvailabilityMap;
  isWeekKickoffAudit?: boolean;
}

export const INITIAL_SMART_ACTIONS: SmartActionItem[] = [
  { label: "Ver detalle de mi estado", icon: "activity", variant: "secondary" },
  { label: "Reorganizar", icon: "calendar-sync", variant: "secondary" },
  { label: "Siento mucha fatiga hoy", icon: "trending-down", variant: "secondary" },
  { label: "El plan está muy suave", icon: "trending-up", variant: "secondary" },
];

export interface UseHeadCoachChatProps {
  profile: AthleteProfile;
  physioStatus: PhysiologicalStatus | null;
  macrocyclePhase: MacrocyclePhaseInfo | null;
  effectiveBlueprint: MacrocycleBlueprint | null;
  activeWeekNumber: number;
  realCurrentWeekNumber: number;
  selectedWeekData?: any;
  weeklyAvailability?: WeeklyAvailabilityMap;
  currentPlan: PlanItem[];
  dailyExecutedActivities?: Record<string, any>;
  apiKey?: string;
  geminiApiKey?: string;
  selectedModel?: string;
  temperature?: number;
  uid?: string;
  email?: string;
  onApplyPlanAndSync?: (plan?: PlanItem[]) => Promise<void>;
  onPlanUpdate?: (updatedPlan: PlanItem[]) => void;
}

export function useHeadCoachChat({
  profile,
  effectiveBlueprint,
  activeWeekNumber,
  realCurrentWeekNumber,
  selectedWeekData,
  weeklyAvailability,
  currentPlan,
  dailyExecutedActivities = {},
  apiKey,
  geminiApiKey,
  selectedModel = "gemini-3.5-flash",
  temperature = 0.0,
  uid,
  email,
  onApplyPlanAndSync,
  onPlanUpdate,
}: UseHeadCoachChatProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [temporaryAvailability, setTemporaryAvailability] = useState<WeeklyAvailabilityMap | null>(null);
  const [previousPlanSnapshot, setPreviousPlanSnapshot] = useState<PlanItem[] | null>(null);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getWelcomeText = (name?: string) => {
    const firstName = (name || "Atleta").trim().split(" ")[0];
    return `Hola ${firstName}, tu balance de recuperación (TSB) está en rango óptimo hoy y vienes con un 100% de adherencia. ¿En qué te puedo ayudar con tu microciclo de esta semana?`;
  };

  const [messages, setMessages] = useState<HeadCoachMessageData[]>([
    {
      id: "welcome",
      role: "assistant",
      text: getWelcomeText(profile.name),
      timestamp: "Ahora",
      smartActions: INITIAL_SMART_ACTIONS,
    },
  ]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "welcome") {
        return [{ ...prev[0], text: getWelcomeText(profile.name) }];
      }
      return prev;
    });
  }, [profile.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
          restingHR: profile.restingHR, maxHR: profile.maxHR, lthr: profile.lthr, isInitialAudit: false,
          temporaryAvailability: options?.temporaryAvailability || temporaryAvailability || undefined,
          targetTssAdjustmentPct: options?.targetTssAdjustmentPct, isWeekKickoffAudit: options?.isWeekKickoffAudit,
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
          quickReplies: data.quickReplies || null,
          smartActions: data.smartActions || (data.quickReplies?.map((qr: string) => ({ label: qr })) || null),
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

    setPreviousPlanSnapshot([...(currentPlan || [])]);
    setIsApplying(true);
    setSyncFeedback(null);
    try {
      await onApplyPlanAndSync(finalPlan);
      setSyncFeedback("¡Microciclo sincronizado exitosamente con Intervals.icu!");
      setTimeout(() => setSyncFeedback(null), 4000);

      const successMsg: HeadCoachMessageData = {
        id: `sync-${Date.now()}`,
        role: "assistant",
        text: "¡Microciclo actualizado con éxito! Tus sesiones ya están sincronizadas. Que tengas un excelente entrenamiento.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        smartActions: [
          {
            label: "Deshacer cambios",
            variant: "tertiary",
            icon: "undo",
            actionType: "undo_changes",
          },
        ],
      };
      setMessages((prev) => [...prev, successMsg]);
    } catch (e: any) {
      setSyncFeedback(`Error al sincronizar: ${e.message || "Verifica credenciales"}`);
    } finally {
      setIsApplying(false);
    }
  };

  const handleUndoChanges = async () => {
    if (!previousPlanSnapshot || previousPlanSnapshot.length === 0) return;
    setIsApplying(true);
    try {
      if (onPlanUpdate) onPlanUpdate(previousPlanSnapshot);
      if (onApplyPlanAndSync) await onApplyPlanAndSync(previousPlanSnapshot);
      setSyncFeedback("Cambios deshechos. Tu plan original ha sido restaurado.");
      setTimeout(() => setSyncFeedback(null), 4000);

      const restoreMsg: HeadCoachMessageData = {
        id: `restore-${Date.now()}`,
        role: "assistant",
        text: "Cambios deshechos. Tu plan original ha sido restaurado con éxito.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        smartActions: INITIAL_SMART_ACTIONS,
      };
      setMessages((prev) => [...prev, restoreMsg]);
      setPreviousPlanSnapshot(null);
    } catch (e: any) {
      setSyncFeedback(`Error al restaurar: ${e.message || "Error al revertir"}`);
    } finally {
      setIsApplying(false);
    }
  };

  const handleSelectSmartAction = (action: SmartActionItem | string) => {
    const rawLabel = typeof action === "string" ? action : action.label;
    const actionType = typeof action === "string" ? undefined : action.actionType;

    if (actionType === "undo_changes" || /deshacer/i.test(rawLabel)) {
      handleUndoChanges();
      return;
    }

    if (actionType === "open_matrix_modal" || /matriz temporal/i.test(rawLabel)) {
      setIsMatrixModalOpen(true);
      return;
    }

    if (/^reorganizar$/i.test(rawLabel.trim())) {
      const reorgPromptMsg: HeadCoachMessageData = {
        id: `reorg-prompt-${Date.now()}`,
        role: "assistant",
        text: "Para reorganizar tu microciclo sin alterar tu planificación habitual, configuremos tu disponibilidad temporal. ¿Qué días deseas entrenar cada disciplina y cuáles necesitas de descanso?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        smartActions: [
          {
            label: "Configurar Matriz Temporal",
            variant: "primary",
            icon: "sliders",
            actionType: "open_matrix_modal",
          },
          {
            label: "Mantener plan original",
            variant: "secondary",
            icon: "x",
          },
        ],
      };
      setMessages((prev) => [...prev, reorgPromptMsg]);
      setIsMatrixModalOpen(true);
      return;
    }

    if (/confirmar nuevo calendario|aprobar ajuste|aplicar mayor carga/i.test(rawLabel)) {
      const lastSuggested = [...messages].reverse().find((m) => m.suggestedPlan && m.suggestedPlan.length > 0);
      if (lastSuggested?.suggestedPlan) {
        handleApplyAndSync(lastSuggested.suggestedPlan);
        return;
      }
    }

    if (/descartar/i.test(rawLabel)) {
      const discardMsg: HeadCoachMessageData = {
        id: `discard-${Date.now()}`,
        role: "assistant",
        text: "Entendido, descartamos la propuesta y mantenemos tu microciclo tal como estaba previsto.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        smartActions: INITIAL_SMART_ACTIONS,
      };
      setMessages((prev) => [...prev, discardMsg]);
      return;
    }

    handleSendMessage(rawLabel);
  };

  const handleApplyTemporaryMatrix = (tempAvail: WeeklyAvailabilityMap) => {
    setTemporaryAvailability(tempAvail);
    handleSendMessage(
      "He configurado una matriz de deportes temporal para esta semana. Adapta el microciclo distribuyendo los estímulos según esta nueva disponibilidad.",
      { temporaryAvailability: tempAvail }
    );
  };

  return {
    messages,
    isLoading,
    isApplying,
    syncFeedback,
    isMatrixModalOpen,
    temporaryAvailability,
    messagesEndRef,
    setIsMatrixModalOpen,
    handleSendMessage,
    handleApplyAndSync,
    handleUndoChanges,
    handleSelectSmartAction,
    handleApplyTemporaryMatrix,
  };
}
