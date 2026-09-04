"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, RefreshCw, Activity, CheckCircle2 } from "lucide-react";
import { AthleteProfile } from "@/lib/intervals/types";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { MacrocyclePhaseInfo } from "@/lib/physiology/macrocycle";
import { PlanItem, WeeklyAvailabilityMap, getWeekDates } from "@/lib/gemini/engine";
import { HeadCoachWeekSelector } from "./headcoach/HeadCoachWeekSelector";
import { HeadCoachQuickActions } from "./headcoach/HeadCoachQuickActions";
import { HeadCoachMessageItem, HeadCoachMessageData } from "./headcoach/HeadCoachMessageItem";

interface AthleteHeadCoachViewProps {
  profile: AthleteProfile;
  physioStatus: PhysiologicalStatus | null;
  macrocyclePhase: MacrocyclePhaseInfo | null;
  weekOffset: number;
  weekNumber: number;
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
  weekOffset,
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
  const [activeWeekNumber, setActiveWeekNumber] = useState<number>(weekNumber || 1);
  const [isApplying, setIsApplying] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const initialWelcomeText = `¡Saludos, ${profile.name || "Atleta"}! Soy tu Head Coach Fisiológico de PULSE.

Tengo en pantalla tu telemetría en vivo: Fitness CTL ${physioStatus?.ctl?.toFixed(1) ?? "—"}, Fatiga ATL ${physioStatus?.atl?.toFixed(1) ?? "—"} y TSB ${physioStatus?.tsb !== undefined ? (physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1)) : "—"}${physioStatus?.currentHrv ? ` (HRV ${physioStatus.currentHrv} ms)` : ""}.

Estamos enfocados en el **Microciclo de la Semana ${activeWeekNumber}** (${macrocyclePhase?.phaseLabel || "Construcción"}).

¿Cómo sientes las piernas tras las actividades de estos días o requieres adaptar el microciclo por viaje, molestia o tiempo?`;

  const [messages, setMessages] = useState<HeadCoachMessageData[]>([
    {
      id: "welcome",
      role: "assistant",
      text: initialWelcomeText,
      timestamp: "En vivo",
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (weekNumber && weekNumber !== activeWeekNumber) {
      setActiveWeekNumber(weekNumber);
    }
  }, [weekNumber]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: HeadCoachMessageData = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!textToSend) setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/headcoach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({ role: m.role, content: m.text })),
          athleteId: profile.id,
          apiKey,
          uid,
          email,
          customGeminiKey: geminiApiKey,
          selectedModel,
          temperature,
          weekOffset: activeWeekNumber - (weekNumber || 1) + weekOffset,
          weekNumber: activeWeekNumber,
          currentPlan,
          dailyExecutedActivities,
          runFtp: profile.run_ftp,
          bikeFtp: profile.bike_ftp,
          isInitialAudit: false,
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
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

  const weekDates = getWeekDates(activeWeekNumber - (weekNumber || 1) + weekOffset);
  const startStr = weekDates[0]?.formattedDate;
  const endStr = weekDates[6]?.formattedDate;

  return (
    <div className="card-gradient rounded-3xl p-3 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4 animate-fadeIn flex flex-col h-[calc(100dvh-175px)] md:h-[calc(100vh-140px)] min-h-[520px]">
      {/* CABECERA ATLÉTICA PRO & SEMÁFORO PMC */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-xs border border-emerald-400/40">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Head Coach Fisiológico
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                EN VIVO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Especialista en modulación adaptativa de microciclos, fatiga y asimilación biológica.
            </p>
          </div>
        </div>

        {/* Mini-Cinta de Telemetría PMC */}
        <div className="flex items-center gap-1.5 text-xs font-mono overflow-x-auto no-scrollbar">
          <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 font-bold shrink-0">
            📈 CTL: {physioStatus?.ctl?.toFixed(1) ?? profile.ctl ?? 0}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 font-bold shrink-0">
            ⚡ ATL: {physioStatus?.atl?.toFixed(1) ?? profile.atl ?? 0}
          </span>
          <span className={`px-2.5 py-1 rounded-xl font-bold border shrink-0 ${
            (physioStatus?.tsb ?? 0) >= 5
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
              : (physioStatus?.tsb ?? 0) < -20
              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300"
              : "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300"
          }`}>
            🔋 TSB: {physioStatus?.tsb !== undefined ? (physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1)) : 0}
          </span>
        </div>
      </div>

      {/* Selector Táctico de Microciclos (Semana en curso vs siguiente) */}
      <div className="shrink-0">
        <HeadCoachWeekSelector
          currentWeekNumber={weekNumber || 1}
          selectedWeekNumber={activeWeekNumber}
          totalWeeks={macrocyclePhase?.blueprint?.totalWeeks || 16}
          onSelectWeek={(wNum) => setActiveWeekNumber(wNum)}
          startDateStr={startStr}
          endDateStr={endStr}
          phaseLabel={macrocyclePhase?.phaseLabel}
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

      {/* ACCIONES RÁPIDAS & INPUT */}
      <div className="space-y-2 shrink-0 pt-2 border-t border-slate-200 dark:border-slate-800">
        <HeadCoachQuickActions
          onSelectAction={(prompt) => handleSendMessage(prompt)}
          isLoading={isLoading}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe a tu Head Coach (ej: 'Reorganiza el microciclo porque viajo miércoles y jueves')..."
            className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-xs font-medium text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold transition cursor-pointer disabled:opacity-40 shadow-xs"
            title="Enviar mensaje"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
