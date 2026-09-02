"use client";

import React, { useState } from "react";
import { BookOpen, Sparkles, Check, Target, ChevronDown, ChevronUp } from "lucide-react";
import { TargetRace, MacrocycleBlueprint, SeasonPlanItem } from "@/lib/physiology/macrocycle";
import { WeeklyAvailabilityMap } from "@/lib/gemini/engine";
import { generateCustomMacrocycleBlueprint } from "@/lib/physiology/macrocycleGenerator";
import { SeasonActivePlanCard } from "../season/SeasonActivePlanCard";
import { SeasonProgramLibrary, ProgramTemplate, PROGRAM_TEMPLATES } from "../season/SeasonProgramLibrary";
import { SeasonAIGenerator } from "../season/SeasonAIGenerator";
import { SeasonRacesTab } from "../season/SeasonRacesTab";

interface AthleteSeasonStudioViewProps {
  athleteId: string;
  runFtp?: number;
  bikeFtp?: number;
  lthr?: number;
  ctl?: number;
  weeklyAvailability?: WeeklyAvailabilityMap;
  targetRaces: TargetRace[];
  seasonPlans: SeasonPlanItem[];
  onSaveTargetRaces: (races: TargetRace[]) => void;
  onSaveSeasonPlans: (plans: SeasonPlanItem[]) => void;
  onApplyPlan?: (newBlueprint: MacrocycleBlueprint, options?: { mode: "CHAIN" | "REPLACE" }) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToProfile?: () => void;
  onOpenHeadCoach?: () => void;
  onDeleteActivePlan?: () => void;
}

export const AthleteSeasonStudioView: React.FC<AthleteSeasonStudioViewProps> = ({
  athleteId,
  runFtp = 313,
  bikeFtp = 238,
  lthr = 168,
  ctl = 0,
  weeklyAvailability,
  targetRaces,
  seasonPlans,
  onSaveTargetRaces,
  onSaveSeasonPlans,
  onApplyPlan,
  onNavigateToDashboard,
  onNavigateToProfile,
  onOpenHeadCoach,
  onDeleteActivePlan,
}) => {
  const [leftTab, setLeftTab] = useState<"ai_designer" | "library">("ai_designer");
  const [selectedProgramKey, setSelectedProgramKey] = useState<string>("MARATON_42K");
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

  const handleOpenDesigner = () => {
    setIsDesignSectionOpen(true);
    setLeftTab("ai_designer");
  };

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
    showNotification(`¡Carrera "${race.name}" vinculada!`);
  };

  const handleDeleteRace = (id: string) => {
    onSaveTargetRaces(targetRaces.filter((r) => r.id !== id));
    if (selectedRaceId === id) setSelectedRaceId(null);
    showNotification("Carrera eliminada");
  };

  const handleConfirmProgram = (prog: ProgramTemplate) => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() + (day === 0 ? 1 : 8 - day);
    const startDate = new Date(today.setDate(diff)).toISOString().split("T")[0];

    const blueprint = generateCustomMacrocycleBlueprint({
      distanceType: (prog.discipline === "Triatlón" ? "triathlon_703" : prog.discipline === "Carrera" ? "42k" : "maintenance"),
      startDate, weeksCount: prog.weeks, customGoal: prog.name, primaryRace: primaryRace || undefined,
      athleteMetrics: { ctl, runFtp, bikeFtp, weeklyAvailability },
    });

    if (onApplyPlan) onApplyPlan(blueprint, { mode: "REPLACE" });
    const lastWeek = blueprint.weeks[blueprint.weeks.length - 1];
    const newPlanItem: SeasonPlanItem = {
      id: "plan_" + Date.now(), planName: prog.name, goalType: prog.key,
      startDate: blueprint.startDate, endDate: lastWeek ? lastWeek.endDate : startDate,
      totalWeeks: prog.weeks, status: "ACTIVE", orderIndex: 0, createdAt: new Date().toISOString(), blueprint,
    };
    onSaveSeasonPlans([newPlanItem]);
    showNotification(`¡Programa "${prog.name}" activado en el calendario!`);
  };

  const handleGenerateAIPlan = async (userPrompt: string, weeksCount: number, primaryDiscipline: string) => {
    setIsGeneratingAI(true);
    try {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() + (day === 0 ? 1 : 8 - day);
      const startDate = new Date(today.setDate(diff)).toISOString().split("T")[0];

      const blueprint = generateCustomMacrocycleBlueprint({
        distanceType: (primaryDiscipline.toLowerCase().includes("triatl") ? "triathlon_703" : "42k"),
        startDate, weeksCount, customGoal: userPrompt, primaryRace: primaryRace || undefined,
        athleteMetrics: { ctl, runFtp, bikeFtp, weeklyAvailability },
      });

      if (onApplyPlan) onApplyPlan(blueprint, { mode: "REPLACE" });
      const lastWeek = blueprint.weeks[blueprint.weeks.length - 1];
      const newPlanItem: SeasonPlanItem = {
        id: "plan_" + Date.now(), planName: userPrompt, goalType: "CUSTOM_MACROCYCLE",
        startDate: blueprint.startDate, endDate: lastWeek ? lastWeek.endDate : startDate,
        totalWeeks: weeksCount, status: "ACTIVE", orderIndex: 0, createdAt: new Date().toISOString(), blueprint,
      };
      onSaveSeasonPlans([newPlanItem]);
      showNotification("¡Macrociclo generado y aplicado!");
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
          <p className="text-xs text-slate-500 dark:text-slate-400">Controla tu macrociclo activo, carreras objetivo y programas de entrenamiento.</p>
        </div>
        {successMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono animate-fadeIn">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* 2. GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
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

          <div className="space-y-3 pt-1">
            {activePlan && !isDesignSectionOpen ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3.5 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Diseñar Nuevo Macrociclo o Explorar Biblioteca</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Modifica tu planificación o explora los {PROGRAM_TEMPLATES.length} programas oficiales.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDesignSectionOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-mono font-bold text-xs hover:bg-slate-800 transition cursor-pointer shadow-xs whitespace-nowrap flex items-center gap-1"
                >
                  <span>Desplegar</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setLeftTab("ai_designer")}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        leftTab === "ai_designer"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Diseñar con IA</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeftTab("library")}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        leftTab === "library"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Biblioteca ({PROGRAM_TEMPLATES.length})</span>
                    </button>
                  </div>

                  {activePlan && (
                    <button
                      type="button"
                      onClick={() => setIsDesignSectionOpen(false)}
                      className="text-[11px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Plegar</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {leftTab === "library" ? (
                  <SeasonProgramLibrary
                    selectedProgramKey={selectedProgramKey}
                    onSelectProgram={(prog) => setSelectedProgramKey(prog.key)}
                    onConfirmProgram={handleConfirmProgram}
                  />
                ) : (
                  <SeasonAIGenerator
                    athleteId={athleteId}
                    weeklyAvailability={weeklyAvailability}
                    primaryRace={primaryRace}
                    targetRaces={targetRaces}
                    onSelectPrimaryRace={(r) => setSelectedRaceId(r ? r.id : null)}
                    onAddNewRace={handleAddNewRaceInline}
                    ctl={ctl}
                    runFtp={runFtp}
                    bikeFtp={bikeFtp}
                    lthr={lthr}
                    onGenerateAIPlan={handleGenerateAIPlan}
                    onApplyDirectBlueprint={handleApplyDirectBlueprint}
                    onNavigateToProfile={onNavigateToProfile}
                    isGenerating={isGeneratingAI}
                  />
                )}
              </div>
            )}
          </div>
        </div>

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
