"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { WeeklyAvailabilityMap } from "@/lib/gemini/engine";
import { TargetRace, MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { generateCustomMacrocycleBlueprint } from "@/lib/physiology/macrocycleGenerator";

import { SeasonWizardStep1Target } from "./wizard/SeasonWizardStep1Target";
import { SeasonWizardStep2Disciplines } from "./wizard/SeasonWizardStep2Disciplines";
import { SeasonWizardStep3Physiology } from "./wizard/SeasonWizardStep3Physiology";
import { SeasonWizardStep4Preview } from "./wizard/SeasonWizardStep4Preview";

interface SeasonAIGeneratorProps {
  athleteId?: string;
  weeklyAvailability?: WeeklyAvailabilityMap;
  primaryRace?: TargetRace | null;
  targetRaces?: TargetRace[];
  onSelectPrimaryRace?: (race: TargetRace | null) => void;
  onAddNewRace?: (race: TargetRace) => void;
  ctl?: number;
  runFtp?: number;
  bikeFtp?: number;
  lthr?: number;
  onGenerateAIPlan: (userPrompt: string, weeksCount: number, primaryDiscipline: string) => Promise<void>;
  onApplyDirectBlueprint?: (blueprint: MacrocycleBlueprint, planTitle: string) => void;
  onNavigateToProfile?: () => void;
  isGenerating: boolean;
}

export const SeasonAIGenerator: React.FC<SeasonAIGeneratorProps> = ({
  athleteId = "",
  weeklyAvailability,
  primaryRace,
  targetRaces = [],
  onSelectPrimaryRace,
  onAddNewRace,
  ctl = 0,
  runFtp = 0,
  bikeFtp = 0,
  lthr = 165,
  onGenerateAIPlan,
  onApplyDirectBlueprint,
  onNavigateToProfile,
  isGenerating,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);

  const [planTitle, setPlanTitle] = useState(
    primaryRace ? `Macrociclo para ${primaryRace.name} (${primaryRace.distance?.toUpperCase()})` : "Macrociclo de Temporada"
  );
  const [targetDistance, setTargetDistance] = useState<string>(primaryRace?.distance || "42k");
  const [customDistanceText, setCustomDistanceText] = useState<string>("");
  const [isCustomDistance, setIsCustomDistance] = useState<boolean>(false);
  const [startDateMode, setStartDateMode] = useState<"CURRENT_WEEK" | "NEXT_WEEK" | "CUSTOM">("CURRENT_WEEK");
  const [customStartDate, setCustomStartDate] = useState<string>("");

  const [weeksCount, setWeeksCount] = useState<number>(() => {
    if (!primaryRace?.date) return 16;
    const raceDate = new Date(primaryRace.date + "T00:00:00");
    const diff = raceDate.getTime() - new Date().getTime();
    if (diff <= 0) return 16;
    const w = Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
    return Math.max(4, Math.min(w, 40));
  });

  React.useEffect(() => {
    if (primaryRace) {
      setPlanTitle(`Macrociclo para ${primaryRace.name} (${primaryRace.distance?.toUpperCase()})`);
      setTargetDistance(primaryRace.distance || "42k");
      if (primaryRace.date) {
        const raceDate = new Date(primaryRace.date + "T00:00:00");
        const diff = raceDate.getTime() - new Date().getTime();
        if (diff > 0) {
          const w = Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
          setWeeksCount(Math.max(4, Math.min(w, 40)));
        }
      }
    }
  }, [primaryRace]);

  const [trainingApproach, setTrainingApproach] = useState<string>("Entrenamiento Cruzado");
  const [periodization, setPeriodization] = useState<"2:1" | "3:1" | "CONTINUO">("2:1");
  const [customPromptText, setCustomPromptText] = useState<string>("");
  const [localWeeklyAvailability, setLocalWeeklyAvailability] = useState<WeeklyAvailabilityMap>(
    weeklyAvailability || {
      Lunes: ["Descanso"], Martes: ["Carrera"], Miércoles: ["Carrera", "Fuerza"],
      Jueves: ["Carrera", "Fuerza"], Viernes: ["Carrera", "Fuerza"], Sábado: ["Ciclismo"], Domingo: ["Carrera"],
    }
  );

  const [generatedBlueprint, setGeneratedBlueprint] = useState<MacrocycleBlueprint | null>(null);
  const [aiNotes, setAiNotes] = useState<string[]>([]);

  const steps = [
    { num: 1, label: "Objetivo" }, { num: 2, label: "Disciplinas" },
    { num: 3, label: "Fisiología" }, { num: 4, label: "Preview IA" },
  ];

  const getResolvedStartDate = (): string => {
    if (startDateMode === "CUSTOM" && customStartDate) return customStartDate;
    const now = new Date();
    const currentDay = now.getDay();
    if (startDateMode === "NEXT_WEEK") {
      const diff = now.getDate() + (currentDay === 0 ? 1 : 8 - currentDay);
      return new Date(now.setDate(diff)).toISOString().split("T")[0];
    }
    const diff = now.getDate() - (currentDay === 0 ? 6 : currentDay - 1);
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
  };

  const resolveDistTypeFromWizard = (dist: string, approach?: string): any => {
    const d = (dist || "").toLowerCase();
    const a = (approach || "").toLowerCase();
    if (d.includes("sprint") || d.includes("olimp") || d === "triathlon_short") return "triathlon_short";
    if (d.includes("140.6") || d.includes("1406") || d.includes("full") || d.includes("iron") || d === "triathlon_1406" || a.includes("iron")) return "triathlon_1406";
    if (d.includes("triat") || d === "triathlon_703" || d.includes("70.3") || d.includes("703") || a.includes("triat")) return "triathlon_703";
    if (d.includes("bici") || d.includes("cicli") || d.includes("fondo") || d === "cycling_fondo" || a.includes("cicli")) return "cycling_fondo";
    if (d.includes("trail") || d.includes("ultra") || d === "trail_50k" || a.includes("trail")) return "trail_50k";
    if (d.includes("21")) return "21k";
    if (d.includes("10")) return "10k";
    if (d.includes("5")) return "5k";
    if (d.includes("maint") || a.includes("mantenimiento")) return "maintenance";
    return "42k";
  };

  const handleGenerateAI = async () => {
    setIsGeneratingPlan(true);
    setCurrentStep(4);

    try {
      const startDate = getResolvedStartDate();
      const distType = resolveDistTypeFromWizard(targetDistance, trainingApproach);

      const storedApiKey = typeof localStorage !== "undefined" ? localStorage.getItem("sgea_intervals_api_key") || "" : "";
      try {
        const res = await fetch("/api/macrocycles/generate-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            athleteId,
            apiKey: storedApiKey,
            runFtp,
            bikeFtp,
            wizardConfig: {
              targetDistance: distType,
              weeksCount,
              startDate,
              hasRace: !!primaryRace,
              raceName: primaryRace?.name || planTitle,
              raceDate: primaryRace?.date || "",
              raceDistance: distType,
              raceGoal: primaryRace?.goalTarget || "Pico de forma óptimo",
              trainingApproach,
              periodization,
              customPrompt: customPromptText,
              weeklyAvailability: localWeeklyAvailability,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.aiResult?.blueprint) {
            setGeneratedBlueprint(data.aiResult.blueprint);
            setAiNotes(data.aiResult.reasoningNotes || [
              `Periodización adaptada al objetivo ${planTitle} (${weeksCount} semanas).`,
              `Ratio ${periodization === "2:1" ? "Preventivo (2:1)" : "Estándar (3:1)"} con asimilación biológica programada.`,
              `Alineado con tu Matriz Semanal de Disponibilidad y zonas de potencia.`,
            ]);
            return;
          }
        }
      } catch (err) {
        console.warn("Aviso: fallback de macrociclo:", err);
      }

      const bp = generateCustomMacrocycleBlueprint({
        distanceType: distType,
        startDate,
        weeksCount,
        customGoal: `${planTitle}. Enfoque: ${trainingApproach}.`,
        periodization: periodization as any,
        primaryRace: primaryRace || undefined,
        athleteMetrics: { ctl, runFtp, bikeFtp, lthr, weeklyAvailability: localWeeklyAvailability },
      });

      setGeneratedBlueprint(bp);
      setAiNotes([
        `Macrociclo periodizado en ${weeksCount} semanas para ${planTitle}.`,
        `Estructurado con ritmo ${periodization === "2:1" ? "Preventivo (2:1)" : "Estándar (3:1)"}.`,
        `Adaptado a tus zonas de potencia Stryd y FTP.`,
      ]);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleApplyMacrocycle = () => {
    if (generatedBlueprint && onApplyDirectBlueprint) {
      onApplyDirectBlueprint(generatedBlueprint, planTitle);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
      {/* 1. CABECERA & NAVEGADOR DE PASOS */}
      <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Diseñador de Macrociclos con IA</h3>
              <p className="text-[11px] text-slate-400 font-mono">Paso {currentStep} de 4 • {steps[currentStep - 1]?.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isGeneratingPlan || isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs font-mono transition cursor-pointer shadow-sm animate-pulse hover:animate-none"
              title="Generar macrociclo de inmediato con la IA"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isGeneratingPlan || isGenerating ? "Generando..." : "⚡ Generar con IA Ahora"}</span>
            </button>
            <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Motor v3.2
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
          {steps.map((s) => {
            const isDone = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num === 4 && !generatedBlueprint) handleGenerateAI();
                  else setCurrentStep(s.num as any);
                }}
                className={`py-1.5 px-2 rounded-xl text-center font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  isCurrent
                    ? "bg-emerald-500 text-white font-black shadow-xs ring-2 ring-emerald-500/30"
                    : isDone
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : <span>{s.num}.</span>}
                <span className="truncate hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CUERPO DINÁMICO */}
      {currentStep === 1 && (
        <SeasonWizardStep1Target
          primaryRace={primaryRace || null}
          targetRaces={targetRaces}
          onSelectPrimaryRace={onSelectPrimaryRace}
          onAddNewRace={onAddNewRace}
          targetDistance={targetDistance}
          onChangeDistance={setTargetDistance}
          customDistanceText={customDistanceText}
          onChangeCustomDistanceText={setCustomDistanceText}
          isCustomDistance={isCustomDistance}
          onToggleCustomDistance={setIsCustomDistance}
          weeksCount={weeksCount}
          onChangeWeeksCount={setWeeksCount}
          planTitle={planTitle}
          onChangePlanTitle={setPlanTitle}
          startDateMode={startDateMode}
          onChangeStartDateMode={setStartDateMode}
          customStartDate={customStartDate}
          onChangeCustomStartDate={setCustomStartDate}
        />
      )}

      {currentStep === 2 && (
        <SeasonWizardStep2Disciplines
          trainingApproach={trainingApproach}
          onChangeTrainingApproach={setTrainingApproach}
          weeklyAvailability={localWeeklyAvailability}
          onChangeWeeklyAvailability={(newMap) => {
            setLocalWeeklyAvailability(newMap);
            try { localStorage.setItem("sgea_weekly_availability", JSON.stringify(newMap)); } catch {}
          }}
          onNavigateToProfile={onNavigateToProfile}
        />
      )}

      {currentStep === 3 && (
        <SeasonWizardStep3Physiology
          ctl={ctl}
          runFtp={runFtp}
          bikeFtp={bikeFtp}
          lthr={lthr}
          periodization={periodization}
          onChangePeriodization={setPeriodization}
          customPromptText={customPromptText}
          onChangeCustomPromptText={setCustomPromptText}
          onGeneratePlan={handleGenerateAI}
          isGenerating={isGeneratingPlan || isGenerating}
        />
      )}

      {currentStep === 4 && (
        <SeasonWizardStep4Preview
          blueprint={generatedBlueprint}
          planTitle={planTitle}
          trainingApproach={trainingApproach}
          periodization={periodization}
          aiNotes={aiNotes}
          onApplyMacrocycle={handleApplyMacrocycle}
          onGoBack={() => setCurrentStep(3)}
          isGenerating={isGeneratingPlan || isGenerating}
        />
      )}

      {/* 3. BOTONES DE NAVEGACIÓN INFERIORES */}
      {currentStep < 4 && (
        <div className="flex items-center justify-between pt-2">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer flex items-center space-x-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Anterior</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            {currentStep < 3 && (
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGeneratingPlan || isGenerating}
                className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold text-xs font-mono transition cursor-pointer border border-emerald-500/30 flex items-center space-x-1"
                title="Saltar configuración avanzada y generar con IA de inmediato"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>Generar Directo (1 Clic)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (currentStep === 3) handleGenerateAI();
                else setCurrentStep((prev) => (prev + 1) as any);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs font-mono transition cursor-pointer shadow-md flex items-center space-x-1.5"
            >
              <span>{currentStep === 3 ? "Generar con IA" : "Siguiente"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
