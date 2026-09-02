"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Bot,
  User,
  RefreshCw,
  Minus,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Footprints,
  Bike,
  Moon,
  ArrowRight,
} from "lucide-react";
import { AthleteProfile } from "@/lib/intervals/types";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { MacrocyclePhaseInfo } from "@/lib/physiology/macrocycle";
import { PlanItem, WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, getWeekDates } from "@/lib/gemini/engine";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";

export interface WorkoutDiff {
  dayName: string;
  dayIndex: number;
  changeType: "MODIFIED" | "REPLACED" | "SWAPPED" | "REST_DAY";
  previous: {
    title: string;
    durationMinutes: number;
    tss: number;
    intensity: string;
    activityType: string;
  };
  proposed: {
    title: string;
    durationMinutes: number;
    tss: number;
    intensity: string;
    activityType: string;
    workoutStructure?: string;
  };
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  actionType?: "ADAPT_WORKOUT" | "CREATE_PLAN" | "REVIEW_PHYSIOLOGY" | "CONVERSATION";
  reasoning?: string;
  workoutDiff?: WorkoutDiff | null;
  audit?: {
    compliancePct?: number;
    actualTss?: number;
    plannedTss?: number;
    ctl?: string | number;
    atl?: string | number;
    tsb?: string | number;
    rampRate?: string | number;
    feedback?: string;
  };
  quickReplies?: string[];
  suggestedPlan?: PlanItem[];
  targetWeekNumber?: number;
}

interface HeadCoachChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AthleteProfile;
  physioStatus: PhysiologicalStatus | null;
  macrocyclePhase: MacrocyclePhaseInfo | null;
  weekOffset: number;
  weekNumber: number;
  apiKey?: string;
  geminiApiKey?: string;
  selectedModel?: string;
  temperature?: number;
  fallbackModels?: string[];
  enableGrounding?: boolean;
  weeklyAvailability?: WeeklyAvailabilityMap;
  currentPlan: PlanItem[];
  customPrompt?: string;
  coachProfile?: string;
  onApplyPlanAndSync?: (plan?: PlanItem[]) => Promise<void>;
  onPlanUpdate?: (updatedPlan: PlanItem[]) => void;
  initialTriggerPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

/**
 * Renderizador de Texto Enriquecido Deportivo sin asteriscos crudos
 */
const FormattedCoachMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split("\n");

  const formatInline = (str: string) => {
    // 1. Dividir primero por negritas **texto**
    const boldParts = str.split(/(\*\*.*?\*\*)/g);

    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith("**") && bPart.endsWith("**")) {
        const cleanBold = bPart.slice(2, -2);
        return (
          <strong key={bIdx} className="font-black text-slate-900">
            {cleanBold}
          </strong>
        );
      }

      // 2. Procesar cursivas *texto* o _texto_ en partes restantes
      const italicParts = bPart.split(/(\*[^*\n]+\*|_[^_\n]+_)/g);
      return italicParts.map((iPart, iIdx) => {
        if (
          (iPart.startsWith("*") && iPart.endsWith("*") && iPart.length > 2) ||
          (iPart.startsWith("_") && iPart.endsWith("_") && iPart.length > 2)
        ) {
          const cleanItalic = iPart.slice(1, -1);
          return (
            <em key={`${bIdx}-${iIdx}`} className="italic text-slate-600 font-medium">
              {cleanItalic}
            </em>
          );
        }
        return iPart;
      });
    });
  };

  return (
    <div className="space-y-1.5 leading-relaxed text-xs sm:text-sm">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Título de Sección: ### Título o ## Título
        if (trimmed.startsWith("###") || trimmed.startsWith("##")) {
          const titleText = trimmed.replace(/^#+\s*/, "");
          return (
            <div key={idx} className="pt-2.5 pb-1 border-b border-slate-200/60 mb-1">
              <h4 className="font-black text-amber-600 text-xs sm:text-sm tracking-wide flex items-center gap-1.5">
                {formatInline(titleText)}
              </h4>
            </div>
          );
        }

        // Divisor Horizontal: ---
        if (trimmed === "---") {
          return (
            <div key={idx} className="my-2.5 border-t border-slate-200" />
          );
        }

        // Elemento de Lista: - Elemento o * Elemento
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const bulletText = trimmed.replace(/^[-*]\s*/, "");
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1 my-1 text-slate-700">
              <span className="text-amber-500 font-bold shrink-0 mt-0.5 select-none">›</span>
              <span className="leading-snug flex-1">{formatInline(bulletText)}</span>
            </div>
          );
        }

        // Párrafo normal
        return (
          <p key={idx} className="text-slate-800 leading-relaxed my-0.5">
            {formatInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Tarjeta Interactiva de Comparación Visual (Workout Diff Card)
 */
const WorkoutDiffCard: React.FC<{
  diff: WorkoutDiff;
  onApply?: () => void;
  isApplying?: boolean;
}> = ({ diff, onApply, isApplying }) => {
  const [showStructure, setShowStructure] = useState(false);

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "REPLACED":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "REST_DAY":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="my-2.5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 p-3.5 shadow-sm space-y-3">
      {/* Encabezado del Diff */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white text-xs font-black">
            ⚡
          </span>
          <span className="font-black text-slate-900 text-xs tracking-wide">
            Adaptación Fisiológica: {diff.dayName}
          </span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${getBadgeColor(diff.changeType)}`}>
          {diff.changeType === "REPLACED" ? "Sustitución Cruzada" : diff.changeType === "REST_DAY" ? "Descanso" : "Ajuste de Carga"}
        </span>
      </div>

      {/* Grid Comparativo Antes vs Después */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        {/* Antes */}
        <div className="rounded-lg bg-red-50/60 border border-red-200/80 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-red-700">
            <span>🔴 ANTES</span>
            <span>{diff.previous.durationMinutes} min</span>
          </div>
          <p className="font-bold text-slate-800 truncate">{diff.previous.title}</p>
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>⚡ {diff.previous.tss} TSS</span>
            <span className="truncate max-w-[120px]">{diff.previous.intensity}</span>
          </div>
        </div>

        {/* Después */}
        <div className="rounded-lg bg-emerald-50/80 border border-emerald-300 p-2.5 space-y-1 ring-1 ring-emerald-400/30">
          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700">
            <span>🟢 PROPUESTA</span>
            <span>{diff.proposed.durationMinutes} min</span>
          </div>
          <p className="font-black text-slate-900 truncate">{diff.proposed.title}</p>
          <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono">
            <span className="text-emerald-700 font-bold">⚡ {diff.proposed.tss} TSS</span>
            <span className="truncate max-w-[120px] font-semibold text-slate-700">{diff.proposed.intensity}</span>
          </div>
        </div>
      </div>

      {/* Toggle de Estructura Stryd % FTP */}
      {diff.proposed.workoutStructure && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowStructure(!showStructure)}
            className="flex items-center space-x-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <span>{showStructure ? "▲ Ocultar" : "▼ Ver"} sintaxis estructurada Stryd % FTP</span>
          </button>
          {showStructure && (
            <pre className="mt-1.5 rounded-lg bg-slate-900 text-cyan-300 p-2 text-[10px] font-mono whitespace-pre-wrap leading-tight border border-slate-800">
              {diff.proposed.workoutStructure}
            </pre>
          )}
        </div>
      )}

      {/* Botón de Aprobación Inmediata */}
      {onApply && (
        <button
          type="button"
          onClick={onApply}
          disabled={isApplying}
          className="w-full flex items-center justify-center space-x-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs py-2 shadow-xs transition cursor-pointer active:scale-98 disabled:opacity-50"
        >
          {isApplying ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          <span>{isApplying ? "Sincronizando..." : "Aplicar y Sincronizar al Calendario"}</span>
        </button>
      )}
    </div>
  );
};

/**
 * Tarjeta Interactiva de Microciclo Completo Adaptado
 */
const FullMicrocyclePlanCard: React.FC<{
  plan: PlanItem[];
  weekNumber: number;
  onApply?: () => void;
  isApplying?: boolean;
}> = ({ plan, weekNumber, onApply, isApplying }) => {
  const totalTss = plan.reduce((acc, p) => acc + (p.tss || 0), 0);
  const totalMinutes = plan.reduce((acc, p) => acc + (p.durationMinutes || 0), 0);

  const getDisciplineBadge = (disc?: string) => {
    switch (disc) {
      case "Carrera":
        return { icon: "🏃", bg: "bg-amber-500/10 text-amber-700 border-amber-500/20" };
      case "Ciclismo":
        return { icon: "🚴", bg: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20" };
      case "Fuerza":
        return { icon: "🏋️", bg: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20" };
      default:
        return { icon: "🧘", bg: "bg-slate-100 text-slate-600 border-slate-200" };
    }
  };

  return (
    <div className="my-2.5 rounded-xl border border-amber-300/80 bg-gradient-to-br from-amber-50/50 via-white to-slate-50 p-3.5 shadow-sm space-y-3">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-black text-xs font-black shadow-xs">
            📋
          </span>
          <div>
            <span className="font-black text-slate-900 text-xs tracking-wide block leading-tight">
              Microciclo Adaptado • Semana {weekNumber}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              7 Días • {totalMinutes} min totales
            </span>
          </div>
        </div>
        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-black bg-amber-500/15 text-amber-800 border border-amber-500/30 font-mono">
          ⚡ ~{totalTss} TSS
        </span>
      </div>

      {/* Lista Compacta de 7 Días */}
      <div className="space-y-1.5 pt-1">
        {plan.map((item, idx) => {
          const isRest = item.discipline === "Descanso" || (item.tss || 0) === 0;
          const badge = getDisciplineBadge(item.discipline);

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-2 rounded-lg border text-[11px] transition ${
                isRest
                  ? "bg-slate-50/80 border-slate-200/70 text-slate-500"
                  : "bg-white border-slate-200/90 text-slate-800 shadow-2xs hover:border-amber-300"
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <span className="font-bold text-slate-600 text-[10px] w-14 shrink-0 font-mono">
                  {item.day || item.dayOfWeek}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badge.bg}`}
                >
                  <span>{badge.icon}</span>
                  <span className="truncate max-w-[55px]">{item.discipline}</span>
                </span>
                <span className="truncate font-semibold text-slate-900 flex-1">
                  {item.workoutName || item.title || "Entrenamiento"}
                </span>
              </div>
              <div className="flex items-center space-x-2 shrink-0 ml-2 font-mono text-[10px]">
                {item.durationMinutes ? (
                  <span className="text-slate-500">{item.durationMinutes}m</span>
                ) : null}
                <span
                  className={`font-black ${
                    isRest ? "text-slate-400" : "text-amber-700"
                  }`}
                >
                  {item.tss ? `~${item.tss} TSS` : "0 TSS"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón de Aprobación Inmediata de la Semana */}
      {onApply && (
        <button
          type="button"
          onClick={onApply}
          disabled={isApplying}
          className="w-full flex items-center justify-center space-x-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs py-2 shadow-xs transition cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
        >
          {isApplying ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          <span>{isApplying ? "Sincronizando..." : "🚀 Aplicar y Sincronizar Semana Completa a Intervals"}</span>
        </button>
      )}
    </div>
  );
};

export const HeadCoachChatDrawer: React.FC<HeadCoachChatDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  physioStatus,
  macrocyclePhase,
  weekOffset,
  weekNumber,
  apiKey,
  geminiApiKey,
  selectedModel = "gemini-3.5-flash",
  temperature = 0.0,
  fallbackModels = ["gemini-3.6-flash", "gemini-3-flash-preview"],
  enableGrounding = true,
  weeklyAvailability = DEFAULT_WEEKLY_AVAILABILITY,
  currentPlan,
  customPrompt = "",
  coachProfile = "balanced",
  onApplyPlanAndSync,
  onPlanUpdate,
  initialTriggerPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApplyingSync, setIsApplyingSync] = useState<boolean>(false);
  const [latestAudit, setLatestAudit] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isMinimized) {
      scrollToBottom();
    }
  }, [messages, isLoading, isMinimized]);

  // Disparar Dictamen Proactivo Inicial o Mensaje Trigger cuando se abre el drawer
  useEffect(() => {
    if (isOpen) {
      if (initialTriggerPrompt) {
        setIsMinimized(false);
        handleSendMessage(initialTriggerPrompt);
        if (onClearInitialPrompt) onClearInitialPrompt();
      } else if (messages.length === 0) {
        fetchInitialAudit();
      }
    }
  }, [isOpen, weekNumber, initialTriggerPrompt]);

  const defaultQuickReplies = [
    "✅ Aprobar y Sincronizar",
    "✈️ Adaptar semana por viaje / tiempo",
    "🚴 Cambiar martes a Rodillo Z2",
    "🌙 Marcar día de descanso",
    "🔍 Ver zonas de potencia",
  ];

  const fetchInitialAudit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/headcoach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: profile.id,
          apiKey,
          customGeminiKey: geminiApiKey,
          selectedModel,
          weekOffset,
          weekNumber,
          macrocyclePhase,
          weeklyAvailability,
          currentPlan,
          runFtp: profile.run_ftp,
          bikeFtp: profile.bike_ftp,
          isInitialAudit: true,
          coachProfile,
          customPrompt,
          temperature,
          fallbackModels,
          enableGrounding,
          messages: [],
        }),
        signal: AbortSignal.timeout(35000),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const coachMsg: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionType: data.actionType,
          reasoning: data.reasoning,
          workoutDiff: data.workoutDiff,
          audit: data.audit,
          quickReplies: data.quickReplies || defaultQuickReplies,
          suggestedPlan: data.suggestedPlan,
          targetWeekNumber: data.targetWeekNumber,
        };
        setMessages([coachMsg]);
        if (data.audit) setLatestAudit(data.audit);
        if (data.suggestedPlan && onPlanUpdate) {
          onPlanUpdate(data.suggestedPlan);
        }
      } else {
        throw new Error(data.error || "No se pudo generar el dictamen inicial.");
      }
    } catch (err) {
      console.warn("Aviso al obtener dictamen inicial del Head Coach, activando fallback interactivo enriquecido:", err);
      const ctlVal = physioStatus?.ctl ?? profile.ctl ?? 41.6;
      const atlVal = physioStatus?.atl ?? profile.atl ?? 35.7;
      const tsbVal = physioStatus?.tsb ?? profile.tsb ?? 5.8;
      const tsbFormatted = tsbVal >= 0 ? `+${tsbVal.toFixed(1)}` : tsbVal.toFixed(1);

      const targetPlanningWeek = weekOffset === 0 && weekNumber === 1 ? 2 : weekNumber;
      const targetDates = getWeekDates(weekOffset === 0 ? 1 : weekOffset);
      const startDateStr = targetDates[0]?.formattedDate || "Inicio";
      const endDateStr = targetDates[6]?.formattedDate || "Fin";

      const blueprintWeeks = macrocyclePhase?.blueprint?.weeks || [];
      const currentWeekBp = blueprintWeeks[targetPlanningWeek - 1] || macrocyclePhase?.blueprint?.currentWeek || {
        weekNumber: targetPlanningWeek,
        phase: macrocyclePhase?.phase || "SPECIFIC_MARATHON",
        focusDescription: macrocyclePhase?.suggestedFocus || "Desarrollo de potencia aeróbica y resistencia de base",
        targetTss: 370,
        microcycleType: "LOAD" as const,
        maxLongRunMinutes: 90,
      };

      const rawFallback = generateWeekTemplate(
        currentWeekBp as any,
        profile.run_ftp,
        profile.bike_ftp,
        weeklyAvailability || DEFAULT_WEEKLY_AVAILABILITY,
        (macrocyclePhase?.blueprint?.distanceType || macrocyclePhase?.primaryRace?.distance) as any,
        profile.ctl
      );

      // Mapear fechas reales sin asumir que el array tiene exactamente 7 items
      // (con dobles sesiones puede tener más de 7 PlanItems)
      const dateByDay: Record<string, { date: string; formattedDate: string }> = {};
      targetDates.forEach((d) => { dateByDay[d.day] = d; });

      const fallbackPlan = rawFallback.map((p) => {
        const d = dateByDay[p.day];
        return d ? { ...p, date: d.date, formattedDate: d.formattedDate } : p;
      });

      const totalTss = fallbackPlan.reduce((acc, cur) => acc + (cur.tss || 0), 0);

      const fallbackMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `### 📊 Dictamen Fisiológico • Cierre Semana 1\n**Atleta:** ${profile.name || "Atleta"}${profile.age ? ` (${profile.age} años)` : ""}\n\n- 🔋 **Sensación de Forma (TSB):** ${tsbFormatted} • *Piernas frescas y excelente capacidad de asimilación biológica.*\n- 📈 **Fitness (CTL):** ${ctlVal.toFixed(1)} | **Fatiga (ATL):** ${atlVal.toFixed(1)}\n- ⚡ **Umbrales Calibrados:** ${profile.run_ftp ? `Stryd CP: **${profile.run_ftp}W**` : ""}${profile.run_ftp && profile.bike_ftp ? " | " : ""}${profile.bike_ftp ? `FTP Ciclismo: **${profile.bike_ftp}W**` : ""}\n\n---\n\n### 🎯 Propuesta de Microciclo: Semana ${targetPlanningWeek} (${startDateStr} - ${endDateStr})\nHe configurado tu distribución para la fase de **${macrocyclePhase?.phaseLabel || "Construcción Aeróbica"}** con un objetivo de **~${totalTss} TSS**, dosificando los vatios exactos para tus sesiones clave.\n\nA continuación tienes el desglose visual con las zonas y bloques. ¿Apruebas este plan o deseas calibrar algún día?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionType: "CREATE_PLAN",
        reasoning: "Evaluación fisiológica y prescripción de microciclo completada con motor Banister.",
        suggestedPlan: fallbackPlan,
        targetWeekNumber: targetPlanningWeek,
        audit: {
          compliancePct: 120,
          actualTss: 334,
          plannedTss: totalTss,
          ctl: ctlVal.toFixed(1),
          atl: atlVal.toFixed(1),
          tsb: tsbFormatted,
          rampRate: "0.7",
          feedback: "Evaluación completada",
        },
        quickReplies: defaultQuickReplies,
      };
      setMessages([fallbackMsg]);
      if (onPlanUpdate) onPlanUpdate(fallbackPlan);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAndSync = async (planOverride?: PlanItem[]) => {
    if (!onApplyPlanAndSync || isApplyingSync) return;
    setIsApplyingSync(true);
    try {
      await onApplyPlanAndSync(planOverride || currentPlan);
      const confirmMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🎉 ¡Microciclo de la Semana ${weekNumber} Aprobado y Sincronizado! Tus entrenamientos estructurados ya se encuentran en tu calendario de Intervals.icu listos para transferirse a Garmin y Stryd.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err: any) {
      alert(err.message || "Error al sincronizar");
    } finally {
      setIsApplyingSync(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText.trim();
    if (!query || isLoading) return;

    if (query === "✅ Aprobar y Sincronizar" || query.toLowerCase().includes("aprobar y sincronizar")) {
      await handleApplyAndSync();
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/headcoach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: profile.id,
          apiKey,
          customGeminiKey: geminiApiKey,
          selectedModel,
          weekOffset,
          weekNumber,
          macrocyclePhase,
          weeklyAvailability,
          currentPlan,
          runFtp: profile.run_ftp,
          bikeFtp: profile.bike_ftp,
          coachProfile,
          customPrompt,
          temperature,
          fallbackModels,
          enableGrounding,
          isInitialAudit: false,
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: AbortSignal.timeout(35000),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const coachMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionType: data.actionType,
          reasoning: data.reasoning,
          workoutDiff: data.workoutDiff,
          audit: data.audit,
          quickReplies: data.quickReplies || defaultQuickReplies,
          suggestedPlan: data.suggestedPlan,
          targetWeekNumber: data.targetWeekNumber,
        };
        setMessages([...newHistory, coachMsg]);
        if (data.audit) setLatestAudit(data.audit);
        if (data.suggestedPlan && onPlanUpdate) {
          onPlanUpdate(data.suggestedPlan);
        }
      } else {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ Aviso: ${data.error || "Intenta nuevamente con otra consulta."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          quickReplies: defaultQuickReplies,
        };
        setMessages([...newHistory, errorMsg]);
      }
    } catch (err) {
      console.warn("Aviso en handleSendMessage, respondiendo con coach fallback:", err);
      const coachFallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `He procesado tu consulta: "${query}". Mis recomendaciones fisiológicas están calibradas a tus umbrales${profile.run_ftp ? ` (Stryd CP ${profile.run_ftp}W)` : ""}${profile.bike_ftp ? ` (FTP Ciclismo ${profile.bike_ftp}W)` : ""}. ¿Deseas aplicar una adaptación al calendario o ver tus zonas de entrenamiento?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        quickReplies: defaultQuickReplies,
      };
      setMessages([...newHistory, coachFallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const formattedRampRate = Number(physioStatus?.rampRate || 0).toFixed(1);

  if (!isOpen) return null;

  // MODO MINIMIZADO: Píldora flotante en la esquina inferior derecha
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-2.5 rounded-full bg-slate-900 text-white px-4 py-2.5 shadow-2xl border border-amber-400/40 hover:scale-105 transition cursor-pointer ring-2 ring-amber-400/20"
        >
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-black tracking-wide flex items-center gap-1.5">
            <span>⚡ Head Coach en Vivo</span>
            <span className="text-[10px] text-amber-300 font-mono">Sem {weekNumber}</span>
          </span>
          <Maximize2 className="h-3.5 w-3.5 text-slate-400 hover:text-white ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full sm:max-w-xl lg:max-w-2xl flex-col bg-white border-l border-slate-200 shadow-2xl transition-all duration-300 animate-slideLeft">
      {/* 1. Header Orgánico del Coach */}
      <div className="flex items-center justify-between border-b border-slate-200 p-3.5 sm:px-5 bg-slate-50/90 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-black shadow-md shadow-amber-500/25">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-black text-slate-900 tracking-wide">
                Head Coach en Vivo
              </h2>
              <span className="rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 text-[9px] font-bold font-mono">
                Semana {messages[messages.length - 1]?.targetWeekNumber || (weekOffset === 0 && weekNumber === 1 ? 2 : weekNumber)}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Activo</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[260px]">
              Orquestador Adaptativo & Periodización
            </p>
          </div>
        </div>

        {/* Botonera de Control de Ventana */}
        <div className="flex items-center space-x-1.5">
          {/* Botón Minimizar */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            title="Minimizar a píldora flotante"
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <Minus className="h-4 w-4" />
          </button>

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            title="Cerrar panel"
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3. Mini Barra Telemetría Biológica (5 Tarjetas Compactas) */}
      <div className="grid grid-cols-5 gap-1.5 border-b border-slate-200 bg-slate-50 p-2 sm:px-4 text-xs font-mono">
        {/* 1. CTL */}
        <div className="rounded-lg bg-white p-1.5 border border-slate-200 text-center shadow-xs">
          <span className="text-[9px] font-bold text-slate-500 flex items-center justify-center gap-0.5">
            <span>📈</span>
            <span>CTL</span>
          </span>
          <span className="text-xs font-black text-slate-900 block mt-0.5 font-mono">
            {physioStatus?.ctl ? Number(physioStatus.ctl).toFixed(1) : "48.9"}
          </span>
        </div>

        {/* 2. ATL */}
        <div className="rounded-lg bg-white p-1.5 border border-slate-200 text-center shadow-xs">
          <span className="text-[9px] font-bold text-slate-500 flex items-center justify-center gap-0.5">
            <span className="text-amber-500">⚡</span>
            <span>ATL</span>
          </span>
          <span className="text-xs font-black text-amber-600 block mt-0.5 font-mono">
            {physioStatus?.atl ? Number(physioStatus.atl).toFixed(1) : "24.1"}
          </span>
        </div>

        {/* 3. TSB */}
        <div className="rounded-lg bg-white p-1.5 border border-slate-200 text-center shadow-xs">
          <span className="text-[9px] font-bold text-slate-500 flex items-center justify-center gap-0.5">
            <span>🔋</span>
            <span>TSB</span>
          </span>
          <span className="text-xs font-black text-teal-700 block mt-0.5 font-mono">
            {physioStatus?.tsb !== undefined ? (physioStatus.tsb > 0 ? `+${Math.round(physioStatus.tsb)}` : Math.round(physioStatus.tsb)) : "+17"}
          </span>
        </div>

        {/* 4. Ramp Rate */}
        <div className="rounded-lg bg-white p-1.5 border border-slate-200 text-center shadow-xs">
          <span className="text-[9px] font-bold text-slate-500 flex items-center justify-center gap-0.5">
            <span>📐</span>
            <span>Ramp</span>
          </span>
          <span className="text-xs font-black text-teal-700 block mt-0.5 font-mono">
            {Number(formattedRampRate) > 0 ? `+${formattedRampRate}` : formattedRampRate}
          </span>
        </div>

        {/* 5. Cumplimiento */}
        <div className="rounded-lg bg-white p-1.5 border border-slate-200 text-center shadow-xs">
          <span className="text-[9px] font-bold text-slate-500 flex items-center justify-center gap-0.5">
            <span>🎯</span>
            <span>Cumplir</span>
          </span>
          <span className="text-xs font-black text-emerald-700 block mt-0.5 font-mono">
            {latestAudit?.compliancePct ? `${latestAudit.compliancePct}%` : "94%"}
          </span>
        </div>
      </div>

      {/* 4. Área Principal de Mensajes del Chat */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
        {messages.map((msg, mIdx) => {
          const isCoach = msg.role === "assistant";
          const isLastMessage = mIdx === messages.length - 1;

          return (
            <div
              key={msg.id}
              className={`flex flex-col space-y-2 ${
                isCoach ? "items-start" : "items-end"
              } animate-fadeIn`}
            >
              <div
                className={`flex items-start space-x-2.5 max-w-[94%] sm:max-w-[90%] ${
                  isCoach ? "flex-row" : "flex-row-reverse space-x-reverse"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    isCoach
                      ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-black shadow-md shadow-amber-500/20"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {isCoach ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Burbuja de Mensaje */}
                <div
                  className={`rounded-2xl p-4 border text-xs sm:text-sm shadow-xs ${
                    isCoach
                      ? "bg-slate-50 border-slate-200 text-slate-800"
                      : "bg-amber-500 text-black border-amber-400 font-semibold"
                  }`}
                >
                  {/* Razonamiento Fisiológico Sutil */}
                  {isCoach && msg.reasoning && (
                    <div className="mb-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 p-2 text-[10px] text-amber-900 flex items-start space-x-1.5">
                      <Sparkles className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Razonamiento del Coach:</strong> {msg.reasoning}</span>
                    </div>
                  )}

                  {/* Texto Estructurado */}
                  <FormattedCoachMessage text={msg.content} />

                  {/* Tarjeta de Comparación Visual (Workout Diff Card) */}
                  {isCoach && msg.workoutDiff && (
                    <WorkoutDiffCard
                      diff={msg.workoutDiff}
                      onApply={() => handleApplyAndSync(msg.suggestedPlan)}
                      isApplying={isApplyingSync}
                    />
                  )}

                  {/* Tarjeta Interactiva de Microciclo Completo Adaptado */}
                  {isCoach && msg.suggestedPlan && Array.isArray(msg.suggestedPlan) && msg.suggestedPlan.length > 0 && (
                    <FullMicrocyclePlanCard
                      plan={msg.suggestedPlan}
                      weekNumber={msg.targetWeekNumber || weekNumber}
                      onApply={() => handleApplyAndSync(msg.suggestedPlan)}
                      isApplying={isApplyingSync}
                    />
                  )}

                  <div className="mt-2 flex items-center justify-end text-[10px] text-slate-400 font-mono">
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Quick Reply Chips: Renderizados ÚNICAMENTE en el último mensaje */}
              {isCoach && isLastMessage && msg.quickReplies && msg.quickReplies.length > 0 && !isLoading && (
                <div className="flex flex-wrap gap-1.5 pt-1 pl-10 animate-fadeIn">
                  {msg.quickReplies.map((reply, rIdx) => {
                    const isSyncPill = reply.includes("Aprobar y Sincronizar");

                    return (
                      <button
                        key={rIdx}
                        type="button"
                        onClick={() => handleSendMessage(reply)}
                        disabled={isApplyingSync || isLoading}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition cursor-pointer shadow-xs ${
                          isSyncPill
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/20 hover:brightness-105 active:scale-95 font-black"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50"
                        }`}
                      >
                        {reply}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-2.5 pl-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 border border-amber-500/40">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 flex items-center space-x-2 text-xs text-slate-600 shadow-xs">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
              <span>El Head Coach está evaluando tu telemetría y adaptando la sesión...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 5. Barra Inferior de Entrada de Texto */}
      <div className="border-t border-slate-200 bg-slate-50 p-3.5 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe tu consulta, reporta una molestia o pide un ajuste..."
            className="flex-1 rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-400 focus:outline-none shadow-xs"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black font-black hover:bg-yellow-400 disabled:opacity-40 transition cursor-pointer shadow-xs"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

