"use client";

import React, { useState } from "react";
import { Sparkles, Check, Target, ChevronDown, ChevronUp } from "lucide-react";
import { TargetRace, MacrocycleBlueprint, SeasonPlanItem } from "@/lib/physiology/macrocycle";
import { WeeklyAvailabilityMap } from "@/lib/gemini/engine";
import { generateCustomMacrocycleBlueprint } from "@/lib/physiology/macrocycleGenerator";
import { SeasonActivePlanCard } from "../season/SeasonActivePlanCard";
import { SeasonAIGenerator } from "../season/SeasonAIGenerator";
import { SeasonRacesTab } from "../season/SeasonRacesTab";
import { PMCHistoricalSummary } from "@/lib/physiology/pmcEngine";

interface AthleteSeasonStudioViewProps {
  athleteId: string;
  runFtp?: number; bikeFtp?: number; lthr?: number; ctl?: number;
  weightKg?: number; heightCm?: number; birthDate?: string; gender?: "M" | "F" | "OTHER";
  restingHR?: number; maxHR?: number;
  runningTrainingMode?: "POWER" | "PACE";
  weeklyAvailability?: WeeklyAvailabilityMap;
  historicalMetrics?: PMCHistoricalSummary;
  targetRaces: TargetRace[];
  seasonPlans: SeasonPlanItem[];
  onSaveTargetRaces: (races: TargetRace[]) => void;
  onSaveSeasonPlans: (plans: SeasonPlanItem[]) => void;
  onApplyPlan?: (newBlueprint: MacrocycleBlueprint, options?: { mode: "CHAIN" | "REPLACE" }) => void;
  onPersistAvailability?: (map: Record<string, string[]>) => Promise<void>;
  onNavigateToDashboard?: () => void;
  onNavigateToProfile?: () => void;
  onOpenHeadCoach?: () => void;
  onDeleteActivePlan?: () => void;
}

export const AthleteSeasonStudioView: React.FC<AthleteSeasonStudioViewProps> = ({
  athleteId, runFtp = 0, bikeFtp = 0, lthr = 0, ctl = 0, weightKg, heightCm, birthDate,
  gender, restingHR, maxHR, runningTrainingMode, weeklyAvailability, historicalMetrics, targetRaces, seasonPlans,
  onSaveTargetRaces, onSaveSeasonPlans, onApplyPlan, onPersistAvailability,
  onNavigateToDashboard, onNavigateToProfile, onOpenHeadCoach, onDeleteActivePlan,
}) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activePlan = React.useMemo(() => seasonPlans.find((p) => p.status === "ACTIVE") || seasonPlans[0] || null, [seasonPlans]);
  const [isDesignSectionOpen, setIsDesignSectionOpen] = useState<boolean>(!activePlan);

  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(() => {
    const aRace = targetRaces.find((r) => r.priority === "A");
    return aRace ? aRace.id : targetRaces.length > 0 ? targetRaces[0].id : null;
  });

  const primaryRace = React.useMemo(() => {
    if (selectedRaceId) {
      const found = targetRaces.find((r) => r.id === selectedRaceId);
      if (found) return found;
    }
    return targetRaces.find((r) => r.priority === "A") || (targetRaces.length > 0 ? targetRaces[0] : null);
  }, [targetRaces, selectedRaceId]);

  const [newRaceName, setNewRaceName] = useState("");
  const [newRaceDate, setNewRaceDate] = useState("");
  const [newRaceDistance, setNewRaceDistance] = useState<TargetRace["distance"]>("42k");
  const [newRacePriority, setNewRacePriority] = useState<"A" | "B" | "C">("A");
  const [newRaceGoal, setNewRaceGoal] = useState("");

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleOpenDesigner = () => { setIsDesignSectionOpen(true); };

  const handleAddRace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRaceName || !newRaceDate) return;
    const newRace: TargetRace = {
      id: "race_" + Date.now(), name: newRaceName, date: newRaceDate,
      distance: newRaceDistance, priority: newRacePriority, goalTarget: newRaceGoal || "Pico de forma óptimo",
    };
    onSaveTargetRaces([...targetRaces, newRace]);
    setSelectedRaceId(newRace.id);
    setNewRaceName(""); setNewRaceDate(""); setNewRaceGoal("");
    showNotification("¡Carrera guardada en tu temporada!");
  };

  const handleAddNewRaceInline = (race: TargetRace) => {
    onSaveTargetRaces([...targetRaces, race]);
    setSelectedRaceId(race.id);
    showNotification(`Carrera "${race.name}" guardada como objetivo.`);
  };

  const handleDeleteRace = (id: string) => {
    onSaveTargetRaces(targetRaces.filter((r) => r.id !== id));
    if (selectedRaceId === id) setSelectedRaceId(null);
    showNotification("Carrera eliminada");
  };

  const handleGenerateAIPlan = async (userPrompt: string, weeksCount: number, primaryDiscipline: string) => {
    setIsGeneratingAI(true);
    try {
      const today = new Date();
      const diff = today.getDate() + (today.getDay() === 0 ? 1 : 8 - today.getDay());
      const startDate = new Date(today.setDate(diff)).toISOString().split("T")[0];
      const isMaint = /manten|salud|health|longev/i.test(primaryDiscipline + userPrompt);
      const isBase = /base|gpp|pretemporada/i.test(primaryDiscipline + userPrompt);
      const isTri = /triat|triath/i.test(primaryDiscipline);
      const isTrail = /trail|ultra|monta/i.test(primaryDiscipline);
      const isCycling = /cicl|bici|fondo|bike/i.test(primaryDiscipline);
      const distType = isMaint ? "maintenance" : isBase ? "base_building" : isTri ? "triathlon_703" : isTrail ? "trail_50k" : isCycling ? "cycling_fondo" : "42k";

      const blueprint = generateCustomMacrocycleBlueprint({
        distanceType: distType, startDate, weeksCount, customGoal: userPrompt,
        primaryRace: (distType === "maintenance" || distType === "base_building") ? undefined : (primaryRace || undefined),
        athleteMetrics: { ctl, runFtp, bikeFtp, lthr, weightKg, heightCm, gender, restingHR, maxHR, weeklyAvailability, historicalMetrics, runningTrainingMode },
      });

      if (onApplyPlan) onApplyPlan(blueprint, { mode: "REPLACE" });
      const lastWeek = blueprint.weeks[blueprint.weeks.length - 1];
      const newPlanItem: SeasonPlanItem = {
        id: "plan_" + Date.now(), planName: userPrompt, goalType: distType.toUpperCase(),
        startDate: blueprint.startDate, endDate: lastWeek ? lastWeek.endDate : startDate,
        totalWeeks: weeksCount, status: "ACTIVE", orderIndex: 0, createdAt: new Date().toISOString(), blueprint,
      };
      onSaveSeasonPlans([newPlanItem]);
      setIsDesignSectionOpen(false);
      showNotification("¡Macrociclo personalizado activado como Plan Vigente!");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyDirectBlueprint = (blueprint: MacrocycleBlueprint, title: string) => {
    if (onApplyPlan) onApplyPlan(blueprint, { mode: "REPLACE" });
    const lastWeek = blueprint.weeks[blueprint.weeks.length - 1];
    const newPlanItem: SeasonPlanItem = {
      id: "plan_" + Date.now(), planName: title || blueprint.cycleTitle || "Macrociclo Personalizado",
      goalType: blueprint.mode, startDate: blueprint.startDate, endDate: lastWeek ? lastWeek.endDate : blueprint.startDate,
      totalWeeks: blueprint.weeks.length, status: "ACTIVE", orderIndex: 0, createdAt: new Date().toISOString(), blueprint,
    };
    onSaveSeasonPlans([newPlanItem]);
    setIsDesignSectionOpen(false);
    showNotification(`¡Macrociclo "${newPlanItem.planName}" activado!`);
  };

  const handleDeleteActivePlan = () => {
    if (onDeleteActivePlan) onDeleteActivePlan();
    setIsDesignSectionOpen(true);
    showNotification("Macrociclo eliminado. Puedes diseñar un nuevo plan.");
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* 1. ENCABEZADO */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-500" /> Mi Temporada & Planificación
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Diseña tu macrociclo, gestiona carreras y activa tu plan de entrenamiento.</p>
        </div>
        {successMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono animate-fadeIn">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* 2. GRID PRINCIPAL (2 Columnas Equilibradas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLUMNA IZQUIERDA: Plan Activo y Diseñador IA */}
        <div className="lg:col-span-7 space-y-4">
          <SeasonActivePlanCard
            activePlan={activePlan}
            primaryRace={primaryRace}
            seasonPlansCount={seasonPlans.length}
            onNavigateToDashboard={onNavigateToDashboard}
            onOpenHeadCoach={onOpenHeadCoach}
            onOpenDesigner={handleOpenDesigner}
            onDeletePlan={handleDeleteActivePlan}
          />

          {/* Wizard / Diseñador Inteligente */}
          <div className="space-y-3">
            {activePlan && !isDesignSectionOpen ? (
              <button
                type="button"
                onClick={() => setIsDesignSectionOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Diseñar Nuevo Macrociclo</p>
                    <p className="text-[10px] text-slate-400 font-mono">Wizard IA paso a paso · Adaptado a tu fisiología</p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition" />
              </button>
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden animate-fadeIn">
                {/* Header de la sección de diseño */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                      Diseñador Inteligente de Macrociclos
                    </span>
                  </div>
                  {activePlan && (
                    <button
                      type="button"
                      onClick={() => setIsDesignSectionOpen(false)}
                      className="text-[11px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-0.5 cursor-pointer"
                    >
                      Cerrar <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="p-4 sm:p-5">
                  <SeasonAIGenerator
                    athleteId={athleteId}
                    weeklyAvailability={weeklyAvailability}
                    primaryRace={primaryRace}
                    targetRaces={targetRaces}
                    onSelectPrimaryRace={(r) => setSelectedRaceId(r ? r.id : null)}
                    onAddNewRace={handleAddNewRaceInline}
                    ctl={ctl} runFtp={runFtp} bikeFtp={bikeFtp} lthr={lthr}
                    weightKg={weightKg} heightCm={heightCm} birthDate={birthDate}
                    gender={gender} restingHR={restingHR} maxHR={maxHR}
                    historicalMetrics={historicalMetrics}
                    runningTrainingMode={runningTrainingMode}
                    onGenerateAIPlan={handleGenerateAIPlan}
                    onApplyDirectBlueprint={handleApplyDirectBlueprint}
                    onNavigateToProfile={onNavigateToProfile}
                    onPersistAvailability={onPersistAvailability}
                    isGenerating={isGeneratingAI}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Mis Competiciones & Objetivos (Siempre al lado) */}
        <div className="lg:col-span-5 space-y-4">
          <SeasonRacesTab
            targetRaces={targetRaces}
            newRaceName={newRaceName}
            setNewRaceName={setNewRaceName}
            newRaceDate={newRaceDate}
            setNewRaceDate={setNewRaceDate}
            newRaceDistance={newRaceDistance}
            setNewRaceDistance={setNewRaceDistance}
            newRacePriority={newRacePriority}
            setNewRacePriority={setNewRacePriority}
            newRaceGoal={newRaceGoal}
            setNewRaceGoal={setNewRaceGoal}
            onAddRace={handleAddRace}
            onDeleteRace={handleDeleteRace}
          />
        </div>
      </div>
    </div>
  );
};

