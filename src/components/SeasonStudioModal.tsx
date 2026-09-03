"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Calendar,
  Layers,
  Target,
} from "lucide-react";
import {
  TargetRace,
  MacrocycleBlueprint,
  SeasonPlanItem,
  getNextMondayAfterDate,
} from "@/lib/physiology/macrocycle";
import { MacrocycleDistanceType } from "@/lib/physiology/macrocycleLibrary";
import { WeeklyAvailabilityMap } from "@/lib/gemini/engine";
import { generateCustomMacrocycleBlueprint } from "@/lib/physiology/macrocycleGenerator";

import { useAuth } from "@/context/AuthContext";
import { getUserStorage } from "@/lib/storage/userStorage";

import {
  SeasonPlanGeneratorTab,
  GoalTemplateType,
} from "./season/SeasonPlanGeneratorTab";
import { SeasonRacesTab } from "./season/SeasonRacesTab";

export type SeasonStudioTab = "races" | "plan_generator";
export type { GoalTemplateType };

interface SeasonStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SeasonStudioTab;
  athleteId: string;
  runFtp?: number;
  bikeFtp?: number;
  ctl?: number;
  atl?: number;
  tsb?: number;
  weeklyAvailability?: WeeklyAvailabilityMap;
  initialTargetRaces?: TargetRace[];
  initialSeasonPlans?: SeasonPlanItem[];
  onSaveTargetRaces?: (races: TargetRace[]) => void;
  onSaveSeasonPlans?: (plans: SeasonPlanItem[]) => void;
  onApplyPlan?: (newBlueprint: MacrocycleBlueprint, options?: { mode: "CHAIN" | "REPLACE" }) => void;
  onRegenerateMacrocycle?: (newBlueprint: MacrocycleBlueprint, options?: { mode: "CHAIN" | "REPLACE" }) => void;
  onStartAICoachPlanCreator?: (sportHint?: string) => void;
}

export const SeasonStudioModal: React.FC<SeasonStudioModalProps> = ({
  isOpen,
  onClose,
  initialTab = "plan_generator",
  runFtp = 0,
  bikeFtp = 0,
  ctl = 0,
  weeklyAvailability,
  initialTargetRaces = [],
  initialSeasonPlans = [],
  onSaveTargetRaces,
  onSaveSeasonPlans,
  onApplyPlan,
  onRegenerateMacrocycle,
}) => {
  const { user } = useAuth();
  const userStorage = useMemo(() => getUserStorage(user?.uid), [user?.uid]);
  const [activeTab, setActiveTab] = useState<SeasonStudioTab>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // 1. Estado de Carreras
  const [targetRaces, setTargetRaces] = useState<TargetRace[]>(initialTargetRaces);
  const [newRaceName, setNewRaceName] = useState("");
  const [newRaceDate, setNewRaceDate] = useState("");
  const [newRaceDistance, setNewRaceDistance] = useState<TargetRace["distance"]>("42k");
  const [newRacePriority, setNewRacePriority] = useState<"A" | "B" | "C">("A");
  const [newRaceGoal, setNewRaceGoal] = useState("");

  useEffect(() => {
    if (initialTargetRaces && initialTargetRaces.length > 0) {
      setTargetRaces(initialTargetRaces);
    } else {
      const stored = userStorage.getJSON<TargetRace[]>("target_races");
      if (stored && Array.isArray(stored)) {
        setTargetRaces(stored);
      }
    }
  }, [initialTargetRaces, isOpen, userStorage]);

  // 2. Estado del Generador de Planes
  const [seasonPlans, setSeasonPlans] = useState<SeasonPlanItem[]>(initialSeasonPlans);
  const [currentPlanStep, setCurrentPlanStep] = useState<number>(1);
  const [selectedGoalTemplate, setSelectedGoalTemplate] = useState<GoalTemplateType>("MARATON_42K");
  const [chainMode, setChainMode] = useState<"CHAIN" | "REPLACE">("CHAIN");
  const [progressionRate, setProgressionRate] = useState<"ESTANDAR" | "CONSERVADOR">("ESTANDAR");

  useEffect(() => {
    if (initialSeasonPlans && initialSeasonPlans.length > 0) {
      setSeasonPlans(initialSeasonPlans);
    } else {
      const stored = userStorage.getJSON<SeasonPlanItem[]>("season_plans");
      if (stored && Array.isArray(stored)) {
        setSeasonPlans(stored);
      }
    }
  }, [initialSeasonPlans, isOpen, userStorage]);

  // Fechas del plan
  const defaultNextMonday = useMemo(() => {
    if (seasonPlans.length > 0) {
      const latestPlan = seasonPlans[seasonPlans.length - 1];
      return getNextMondayAfterDate(latestPlan.endDate);
    }
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() + (day === 0 ? 1 : 8 - day);
    const mon = new Date(today.setDate(diff));
    return mon.toISOString().split("T")[0];
  }, [seasonPlans]);

  const [startDate, setStartDate] = useState<string>(defaultNextMonday);
  const [endDate, setEndDate] = useState<string>("");
  const [planPreviewData, setPlanPreviewData] = useState<MacrocycleBlueprint | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const primaryRace = useMemo(() => {
    return targetRaces.find((r) => r.priority === "A") || targetRaces[0];
  }, [targetRaces]);

  const calculateDefaultEndDate = (startStr: string, weeks: number): string => {
    if (!startStr) return "";
    const s = new Date(startStr);
    const e = new Date(s.getTime() + (weeks * 7 - 1) * 24 * 60 * 60 * 1000);
    return e.toISOString().split("T")[0];
  };

  const handleSelectGoalTemplate = (template: GoalTemplateType) => {
    setSelectedGoalTemplate(template);
    let weeks = 16;
    if (template === "MEDIA_MARATON_21K") weeks = 12;
    if (template === "TRIATLON_703") weeks = 16;
    if (template === "BASE_BUILD") weeks = 10;
    if (template === "MANTENIMIENTO") weeks = 8;

    const computedStart = defaultNextMonday;
    setStartDate(computedStart);

    if (template === "MARATON_42K" && primaryRace?.date) {
      setEndDate(primaryRace.date);
    } else {
      setEndDate(calculateDefaultEndDate(computedStart, weeks));
    }

    setCurrentPlanStep(2);
  };

  const handleToggleChainMode = (mode: "CHAIN" | "REPLACE") => {
    setChainMode(mode);
    if (mode === "CHAIN" && seasonPlans.length > 0) {
      const latest = seasonPlans[seasonPlans.length - 1];
      const nextMon = getNextMondayAfterDate(latest.endDate);
      setStartDate(nextMon);
      setEndDate(calculateDefaultEndDate(nextMon, 12));
    } else {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() + (day === 0 ? 1 : 8 - day);
      const mon = new Date(today.setDate(diff)).toISOString().split("T")[0];
      setStartDate(mon);
      setEndDate(calculateDefaultEndDate(mon, 12));
    }
  };

  const handleGenerateAIPreview = () => {
    if (!startDate || !endDate) return;
    setIsRegenerating(true);

    const distanceMap: Record<GoalTemplateType, MacrocycleDistanceType> = {
      MARATON_42K: "42k",
      MEDIA_MARATON_21K: "21k",
      TRIATLON_703: "triathlon_703",
      BASE_BUILD: "base_building",
      MANTENIMIENTO: "maintenance",
    };

    const generated = generateCustomMacrocycleBlueprint({
      distanceType: distanceMap[selectedGoalTemplate] || "42k",
      startDate,
      endDate,
      periodization: progressionRate === "CONSERVADOR" ? "2:1" : "3:1",
      primaryRace: primaryRace || null,
      athleteMetrics: {
        ctl,
        runFtp,
        bikeFtp,
        weeklyAvailability,
      },
    });

    setPlanPreviewData(generated);
    setCurrentPlanStep(3);
    setIsRegenerating(false);
  };

  const handleApplyAndConfirmPlan = () => {
    if (!planPreviewData) return;
    setIsRegenerating(true);

    const newSeasonItem: SeasonPlanItem = {
      id: `plan-${Date.now()}`,
      planName: planPreviewData.cycleTitle,
      goalType: selectedGoalTemplate,
      blueprint: planPreviewData,
      startDate: planPreviewData.startDate,
      endDate: endDate || calculateDefaultEndDate(planPreviewData.startDate, planPreviewData.totalWeeks),
      totalWeeks: planPreviewData.totalWeeks,
      status: "ACTIVE",
      orderIndex: seasonPlans.length,
      createdAt: new Date().toISOString(),
    };

    let updatedPlans: SeasonPlanItem[] = [];
    if (chainMode === "REPLACE" || seasonPlans.length === 0) {
      updatedPlans = [newSeasonItem];
    } else {
      updatedPlans = [...seasonPlans, newSeasonItem];
    }

    setSeasonPlans(updatedPlans);
    userStorage.setJSON("season_plans", updatedPlans);
    if (onSaveSeasonPlans) onSaveSeasonPlans(updatedPlans);

    if (onApplyPlan) {
      onApplyPlan(planPreviewData, { mode: chainMode });
    } else if (onRegenerateMacrocycle) {
      onRegenerateMacrocycle(planPreviewData, { mode: chainMode });
    }

    setIsRegenerating(false);
    onClose();
  };

  const handleAddRace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRaceName.trim() || !newRaceDate) return;

    const newRace: TargetRace = {
      id: `race-${Date.now()}`,
      name: newRaceName.trim(),
      date: newRaceDate,
      distance: newRaceDistance,
      priority: newRacePriority,
      goalTarget: newRaceGoal.trim() || undefined,
    };

    let updated: TargetRace[] = [];
    if (newRacePriority === "A") {
      updated = [newRace, ...targetRaces.filter((r) => r.priority !== "A")];
    } else {
      updated = [...targetRaces, newRace];
    }

    setTargetRaces(updated);
    userStorage.setJSON("target_races", updated);
    if (onSaveTargetRaces) onSaveTargetRaces(updated);

    setNewRaceName("");
    setNewRaceDate("");
    setNewRaceGoal("");
  };

  const handleDeleteRace = (id: string) => {
    const updated = targetRaces.filter((r) => r.id !== id);
    setTargetRaces(updated);
    userStorage.setJSON("target_races", updated);
    if (onSaveTargetRaces) onSaveTargetRaces(updated);
  };

  const handleDeleteSeasonPlan = (id: string) => {
    const updated = seasonPlans.filter((p) => p.id !== id);
    setSeasonPlans(updated);
    userStorage.setJSON("season_plans", updated);
    if (onSaveSeasonPlans) onSaveSeasonPlans(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="card-gradient rounded-3xl p-5 sm:p-7 max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[92vh] flex flex-col justify-between animate-scaleUp overflow-hidden">
        {/* CABECERA DEL MODAL */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-teal-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30 shadow-inner">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Estudio de Temporada & Generador de Planes</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 font-bold">
                  PULSE AI STUDIO
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Planifica tus carreras objetivo, encadena macrociclos sin superposición y genera tus programas con IA.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* NAVEGACIÓN ENTRE 2 PESTAÑAS */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("plan_generator")}
            className={`pb-2.5 px-4 text-xs font-black transition cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "plan_generator"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>1. Generador & Cadena de Planes ({seasonPlans.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("races")}
            className={`pb-2.5 px-4 text-xs font-black transition cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "races"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Target className="h-4 w-4" />
            <span>2. Carreras & Objetivos ({targetRaces.length})</span>
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 text-slate-800 dark:text-slate-200 text-xs">
          {activeTab === "plan_generator" && (
            <SeasonPlanGeneratorTab
              currentPlanStep={currentPlanStep}
              setCurrentPlanStep={setCurrentPlanStep}
              selectedGoalTemplate={selectedGoalTemplate}
              onSelectGoalTemplate={handleSelectGoalTemplate}
              seasonPlans={seasonPlans}
              chainMode={chainMode}
              onToggleChainMode={handleToggleChainMode}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              progressionRate={progressionRate}
              setProgressionRate={setProgressionRate}
              planPreviewData={planPreviewData}
              isRegenerating={isRegenerating}
              onGenerateAIPreview={handleGenerateAIPreview}
              onApplyAndConfirmPlan={handleApplyAndConfirmPlan}
              onDeleteSeasonPlan={handleDeleteSeasonPlan}
            />
          )}

          {activeTab === "races" && (
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
          )}
        </div>

        {/* PIE DEL MODAL */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <Layers className="h-4 w-4 text-cyan-500" />
            <span>PULSE AI Multi-Plan Season Engine</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer"
          >
            Cerrar Estudio
          </button>
        </div>
      </div>
    </div>
  );
};
