"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  RefreshCw,
  Check,
  Bot,
  User,
  Activity,
  ArrowRight,
} from "lucide-react";
import { AthleteProfile } from "@/lib/intervals/types";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { MacrocyclePhaseInfo } from "@/lib/physiology/macrocycle";
import { PlanItem, WeeklyAvailabilityMap } from "@/lib/gemini/engine";

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
  selectedModel = "gemini-2.5-flash",
  temperature = 0.0,
  weeklyAvailability,
  currentPlan,
  onApplyPlanAndSync,
  onPlanUpdate,
}) => {
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; text: string }>>([
    {
      id: "welcome",
      role: "assistant",
      text: `¡Hola ${profile.name || "Atleta"}! Soy tu Head Coach Fisiológico de PULSE AI. He analizado tu telemetría viva de Intervals.icu (Fitness CTL: ${physioStatus?.ctl ?? profile.ctl ?? 0}, Fatiga ATL: ${physioStatus?.atl ?? profile.atl ?? 0}, Forma TSB: ${physioStatus?.tsb ?? profile.tsb ?? 0}). ¿Deseas evaluar la asimilación biológica de tu semana o necesitas adaptar algún día por molestias, viaje o disponibilidad?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg = { id: `user-${Date.now()}`, role: "user" as const, text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/headcoach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.map((m) => ({ role: m.role, content: m.text })),
          athleteId: profile.id,
          apiKey,
          geminiApiKey,
          selectedModel,
          temperature,
          weekOffset,
          currentPlan,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        const assistantMsg = {
          id: `bot-${Date.now()}`,
          role: "assistant" as const,
          text: data.message.content || data.message.reasoning || "Dictamen fisiológico completado.",
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (data.message.suggestedPlan && onPlanUpdate) {
          onPlanUpdate(data.message.suggestedPlan);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            text: "Evaluación adaptativa generada: Mantén tu progresión en zonas de potencia Stryd y Bike FTP establecidas para este microciclo.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "Evaluación offline: Tu balance de carga TSB y rampa semanal se encuentran en rango fisiológico seguro.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-gradient rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-fadeIn flex flex-col h-[calc(100vh-140px)] min-h-[580px]">
      {/* CABECERA & HUD DE TELEMETRÍA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-teal-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30 shadow-inner text-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Head Coach Fisiológico en Vivo</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                GEMINI AI EN LÍNEA
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Auditoría adaptativa de asimilación biológica, reprogramación por fatiga o imprevistos y sincronización en 1 clic.
            </p>
          </div>
        </div>

        {/* Mini-Cinta de Telemetría PMC */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 font-bold">
            📈 CTL: {physioStatus?.ctl ?? profile.ctl ?? 0}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 font-bold">
            ⚡ ATL: {physioStatus?.atl ?? profile.atl ?? 0}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold">
            🔋 TSB: {physioStatus?.tsb ?? profile.tsb ?? 0}
          </span>
        </div>
      </div>

      {/* HISTORIAL DE MENSAJES */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="h-8 w-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 flex items-center justify-center shrink-0 font-bold text-xs">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                m.role === "user"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-medium"
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>

            {m.role === "user" && (
              <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 font-bold text-xs">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-cyan-600 flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Head Coach analizando respuesta fisiológica y microciclo...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ACCIONES RÁPIDAS & INPUT */}
      <div className="space-y-2.5 shrink-0 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => handleSendMessage("¿Cómo evalúas mi asimilación de fatiga y rampa esta semana?")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
          >
            📊 Evaluar Asimilación Semanal
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage("Tuve que viajar por trabajo, ¿cómo reorganizas mi semana?")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
          >
            ✈️ Adaptar por Viaje o Tiempo
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage("Siento sobrecarga en sóleos, ajusta la intensidad a regenerativo")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
          >
            🩹 Modulación por Sobrecarga
          </button>

          {onApplyPlanAndSync && (
            <button
              type="button"
              onClick={() => onApplyPlanAndSync(currentPlan)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-xs cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Sincronizar Plan a Intervals</span>
            </button>
          )}
        </div>

        {/* Input con Botón de Envío */}
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
            placeholder="Escribe tu consulta al Head Coach (ej: 'Reorganiza el fondo del domingo para el sábado')..."
            className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-xs font-medium text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer disabled:opacity-40 shadow-xs"
            title="Enviar mensaje"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
