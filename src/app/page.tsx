"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { NavigationTabs, NavigationTabType } from "@/components/NavigationTabs";
import { MacrocycleView } from "@/components/MacrocycleView";
import { PhysiologicalCards } from "@/components/PhysiologicalCards";
import { SeasonPlannerCard } from "@/components/SeasonPlannerCard";
import { WeeklyPlanner } from "@/components/WeeklyPlanner";
import { AgentCommandCenter } from "@/components/AgentCommandCenter";
import { ProfileModal } from "@/components/ProfileModal";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import {
  AgentDecisionOutput,
  PlanItem,
  WeeklyAvailabilityMap,
  DEFAULT_WEEKLY_AVAILABILITY,
} from "@/lib/gemini/engine";
import { AthleteProfile } from "@/lib/intervals/types";
import { MacrocyclePhaseInfo, TargetRace, MacrocycleBlueprint, calculateMacrocyclePhase } from "@/lib/physiology/macrocycle";

export default function HomePage() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavigationTabType>("macrocycle");
  const [profile, setProfile] = useState<AthleteProfile>({
    id: "i442091",
    name: "Germán Morales",
    ctl: 68.4,
    atl: 84.2,
    tsb: -15.8,
    rampRate: 4.5,
    restingHR: 46,
    run_ftp: 285,
    bike_ftp: 260,
  });

  const [physioStatus, setPhysioStatus] = useState<PhysiologicalStatus | null>(null);
  const [agentDecision, setAgentDecision] = useState<AgentDecisionOutput | null>(null);
  const [activePlan, setActivePlan] = useState<PlanItem[]>([]);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [targetRaces, setTargetRaces] = useState<TargetRace[]>([]);
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailabilityMap>(DEFAULT_WEEKLY_AVAILABILITY);
  const [macrocyclePhase, setMacrocyclePhase] = useState<MacrocyclePhaseInfo | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<"intervals" | "availability" | "races" | "ai">("intervals");

  // Credenciales y configuraciones cacheadas
  const [apiKeyCache, setApiKeyCache] = useState<string>("");
  const [geminiKeyCache, setGeminiKeyCache] = useState<string>("");
  const [selectedModelCache, setSelectedModelCache] = useState<string>("gemini-flash-latest");
  const [customPromptCache, setCustomPromptCache] = useState<string>("");

  // 1. Carga de Telemetría (Rápido, sin invocar IA)
  const refreshTelemetry = useCallback(
    async (
      athleteId?: string,
      apiKey?: string,
      runFtp?: number,
      bikeFtp?: number,
      offset: number = weekOffset,
      racesList: TargetRace[] = targetRaces,
      availability: WeeklyAvailabilityMap = weeklyAvailability
    ) => {
      setIsRefreshingTelemetry(true);
      try {
        const effectiveApiKey = apiKey || apiKeyCache;
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            athleteId: athleteId || profile.id,
            apiKey: effectiveApiKey,
            customRunFtp: runFtp || profile.run_ftp,
            customBikeFtp: bikeFtp || profile.bike_ftp,
            weekOffset: offset,
            targetRaces: racesList,
            weeklyAvailability: availability,
            skipAI: true,
          }),
        });

        if (!res.ok) return;

        const data = await res.json();
        if (data.success) {
          if (data.isLive !== undefined) {
            setIsLiveConnected(Boolean(data.isLive));
          }
          setProfile((prev) => ({
            ...prev,
            ...data.profile,
            run_ftp: runFtp || data.profile?.run_ftp || prev.run_ftp,
            bike_ftp: bikeFtp || data.profile?.bike_ftp || prev.bike_ftp,
          }));
          setPhysioStatus(data.physioStatus);
          setMacrocyclePhase(data.macrocyclePhase);

          if (data.agentDecision && !agentDecision) {
            setAgentDecision(data.agentDecision);
            setActivePlan(data.agentDecision.suggestedPlan || []);
          }
        }
      } catch (err) {
        console.error("Error al actualizar telemetría:", err);
      } finally {
        setIsRefreshingTelemetry(false);
      }
    },
    [apiKeyCache, profile.id, profile.run_ftp, profile.bike_ftp, weekOffset, targetRaces, weeklyAvailability, agentDecision]
  );

  // 2. Invocación Explícita de Inteligencia Artificial (Al pulsar botón de IA)
  const generateAIPlan = async (offset: number = weekOffset) => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: profile.id,
          apiKey: apiKeyCache,
          customGeminiKey: geminiKeyCache,
          selectedModel: selectedModelCache,
          customDirectives: customPromptCache,
          customRunFtp: profile.run_ftp,
          customBikeFtp: profile.bike_ftp,
          weekOffset: offset,
          targetRaces,
          weeklyAvailability,
          skipAI: false,
        }),
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.success) {
        setProfile((prev) => ({
          ...prev,
          ...data.profile,
          run_ftp: profile.run_ftp || data.profile?.run_ftp,
          bike_ftp: profile.bike_ftp || data.profile?.bike_ftp,
        }));
        setPhysioStatus(data.physioStatus);
        setAgentDecision(data.agentDecision);
        setActivePlan(data.agentDecision?.suggestedPlan || []);
        setMacrocyclePhase(data.macrocyclePhase);
      }
    } catch (err) {
      console.error("Error al invocar IA de Gemini:", err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Cargar estado inicial al montar la aplicación
  useEffect(() => {
    const savedApiKey = localStorage.getItem("sgea_intervals_api_key") || "";
    const savedGeminiKey = localStorage.getItem("sgea_gemini_api_key") || "";
    const savedModel = localStorage.getItem("sgea_selected_model") || "gemini-flash-latest";
    const savedDirectives = localStorage.getItem("sgea_custom_prompt") || "";
    const savedAthleteId = localStorage.getItem("sgea_athlete_id") || "i442091";
    const savedRunFtp = Number(localStorage.getItem("sgea_run_ftp")) || 285;
    const savedBikeFtp = Number(localStorage.getItem("sgea_bike_ftp")) || 260;

    let savedRaces: TargetRace[] = [];
    try {
      const racesStr = localStorage.getItem("sgea_target_races");
      if (racesStr) savedRaces = JSON.parse(racesStr);
    } catch {
      // Ignorar fallback
    }

    // Carrera de maratón por defecto si está vacío para inicializar el cronograma de 16 semanas
    if (savedRaces.length === 0) {
      savedRaces = [
        {
          id: "race-valencia-2026",
          name: "Maratón de Valencia 2026",
          date: "2026-12-06",
          distance: "42k",
          priority: "A",
          goalTarget: "Sub-3h00m (280W Stryd)",
        },
      ];
      localStorage.setItem("sgea_target_races", JSON.stringify(savedRaces));
    }

    let savedAvailability = DEFAULT_WEEKLY_AVAILABILITY;
    try {
      const availStr = localStorage.getItem("sgea_weekly_availability");
      if (availStr) savedAvailability = JSON.parse(availStr);
    } catch {
      // Fallback
    }

    setApiKeyCache(savedApiKey);
    setGeminiKeyCache(savedGeminiKey);
    setSelectedModelCache(savedModel);
    setCustomPromptCache(savedDirectives);
    setTargetRaces(savedRaces);
    setWeeklyAvailability(savedAvailability);

    const calculatedPhase = calculateMacrocyclePhase(savedRaces);
    setMacrocyclePhase(calculatedPhase);

    setProfile((prev) => ({
      ...prev,
      id: savedAthleteId,
      run_ftp: savedRunFtp,
      bike_ftp: savedBikeFtp,
    }));

    setIsLoading(false);
    setIsMounted(true);
    refreshTelemetry(savedAthleteId, savedApiKey, savedRunFtp, savedBikeFtp, 0, savedRaces, savedAvailability);
  }, []);

  const handleSaveSettings = async (data: {
    athleteId: string;
    apiKey?: string;
    runFtp: number;
    bikeFtp: number;
    focus: string;
    geminiApiKey?: string;
    selectedModel?: string;
    customPrompt?: string;
    targetRaces?: TargetRace[];
    weeklyAvailability?: WeeklyAvailabilityMap;
  }) => {
    if (data.apiKey) localStorage.setItem("sgea_intervals_api_key", data.apiKey);
    localStorage.setItem("sgea_athlete_id", data.athleteId);
    if (data.geminiApiKey) localStorage.setItem("sgea_gemini_api_key", data.geminiApiKey);
    if (data.selectedModel) localStorage.setItem("sgea_selected_model", data.selectedModel);
    if (data.customPrompt) localStorage.setItem("sgea_custom_prompt", data.customPrompt);
    if (data.runFtp) localStorage.setItem("sgea_run_ftp", data.runFtp.toString());
    if (data.bikeFtp) localStorage.setItem("sgea_bike_ftp", data.bikeFtp.toString());
    if (data.targetRaces) {
      localStorage.setItem("sgea_target_races", JSON.stringify(data.targetRaces));
      setTargetRaces(data.targetRaces);
      setMacrocyclePhase(calculateMacrocyclePhase(data.targetRaces));
    }
    if (data.weeklyAvailability) {
      localStorage.setItem("sgea_weekly_availability", JSON.stringify(data.weeklyAvailability));
      setWeeklyAvailability(data.weeklyAvailability);
    }

    setApiKeyCache(data.apiKey || "");
    setGeminiKeyCache(data.geminiApiKey || "");
    setSelectedModelCache(data.selectedModel || "gemini-flash-latest");
    setCustomPromptCache(data.customPrompt || "");

    setProfile((prev) => ({
      ...prev,
      id: data.athleteId,
      run_ftp: data.runFtp || prev.run_ftp,
      bike_ftp: data.bikeFtp || prev.bike_ftp,
    }));

    await refreshTelemetry(
      data.athleteId,
      data.apiKey,
      data.runFtp,
      data.bikeFtp,
      weekOffset,
      data.targetRaces || targetRaces,
      data.weeklyAvailability || weeklyAvailability
    );
  };

  const handleWeekChange = (newOffset: number) => {
    setWeekOffset(newOffset);
    refreshTelemetry(
      profile.id,
      apiKeyCache,
      profile.run_ftp,
      profile.bike_ftp,
      newOffset,
      targetRaces,
      weeklyAvailability
    );
  };

  const handleJumpToMicrocycleWithAI = (newOffset: number, templatePlan?: PlanItem[]) => {
    setWeekOffset(newOffset);
    if (templatePlan) {
      setActivePlan(templatePlan);
    }
    setActiveTab("microcycle");
    generateAIPlan(newOffset);
  };

  const handlePlanUpdate = (updatedPlan: PlanItem[]) => {
    setActivePlan(updatedPlan);
  };

  const handleSyncToIntervals = async () => {
    const planToSync = activePlan.length > 0 ? activePlan : agentDecision?.suggestedPlan;
    if (!planToSync) return;

    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: profile.id,
          apiKey: apiKeyCache || "sample-api-key",
          plan: planToSync,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Fallo en la sincronización");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTabChange = (tab: NavigationTabType) => {
    if (tab === "settings") {
      setSettingsTab("intervals");
      setIsSettingsOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleApplyMacrocycle = async (
    blueprint: MacrocycleBlueprint,
    primaryRace?: TargetRace,
    source: "AI_GENERATED" | "WIZARD_CUSTOM" = "WIZARD_CUSTOM"
  ) => {
    let updatedRaces: TargetRace[] = [];
    if (primaryRace) {
      // Reemplazar carrera principal o añadir
      updatedRaces = [
        primaryRace,
        ...targetRaces.filter((r) => r.id !== primaryRace.id && r.priority !== "A"),
      ];
    } else {
      updatedRaces = [];
    }

    localStorage.setItem("sgea_target_races", JSON.stringify(updatedRaces));
    setTargetRaces(updatedRaces);

    const newPhaseInfo = calculateMacrocyclePhase(updatedRaces);
    // Asignar el blueprint personalizado directamente
    newPhaseInfo.blueprint = blueprint;
    setMacrocyclePhase(newPhaseInfo);

    // 1. Guardar en Base de Datos Firestore a través de la API
    try {
      await fetch("/api/macrocycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: profile.id,
          blueprint,
          primaryRace: primaryRace || blueprint.primaryRace,
          source,
        }),
      });
    } catch (dbErr) {
      console.warn("Aviso al persistir macrociclo en Firestore:", dbErr);
    }

    // 2. Refrescar telemetría
    await refreshTelemetry(
      profile.id,
      apiKeyCache,
      profile.run_ftp,
      profile.bike_ftp,
      weekOffset,
      updatedRaces,
      weeklyAvailability
    );
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
      <div>
        {/* Navigation / Header */}
        <Header
          athleteName={profile.name || "Germán Morales"}
          athleteId={profile.id}
          onOpenSettings={() => {
            setSettingsTab("intervals");
            setIsSettingsOpen(true);
          }}
          onRefresh={() => refreshTelemetry(profile.id, apiKeyCache, profile.run_ftp, profile.bike_ftp, weekOffset)}
          isLoading={isRefreshingTelemetry}
          isLiveConnected={isLiveConnected}
        />

        {/* Top Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          primaryRaceName={macrocyclePhase?.primaryRace?.name}
          macrocyclePhaseLabel={macrocyclePhase?.phaseLabel}
          isEvaluating={isGeneratingAI}
        />

        {/* Main Content Area */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
          {!isMounted ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
              <span className="text-xs font-bold text-slate-400">Cargando periodización y telemetría SGEA...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: MASTER MACROCYCLE PLAN */}
              {activeTab === "macrocycle" && (
                <MacrocycleView
                  phaseInfo={macrocyclePhase}
                  races={targetRaces}
                  profile={profile}
                  physioStatus={physioStatus}
                  apiKey={apiKeyCache}
                  geminiApiKey={geminiKeyCache}
                  selectedModel={selectedModelCache}
                  weeklyAvailability={weeklyAvailability}
                  onJumpToMicrocycleWithAI={handleJumpToMicrocycleWithAI}
                  onApplyMacrocycle={handleApplyMacrocycle}
                />
              )}

              {/* TAB 2: ACTIVE MICROCYCLE & AI COACH */}
              {activeTab === "microcycle" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Season & Target Race Planner Card */}
                  <SeasonPlannerCard
                    phaseInfo={macrocyclePhase}
                    races={targetRaces}
                    onOpenRaceSettings={() => {
                      setSettingsTab("races");
                      setIsSettingsOpen(true);
                    }}
                    onSelectWeek={handleWeekChange}
                    currentWeekOffset={weekOffset}
                  />

                  {/* Physiological Telemetry Cards Grid */}
                  <PhysiologicalCards
                    status={physioStatus}
                    runFtp={profile.run_ftp ?? 285}
                    bikeFtp={profile.bike_ftp ?? 260}
                  />

                  {/* Agent Command Center (AI On-Demand) */}
                  <AgentCommandCenter
                    decision={agentDecision}
                    onReevaluate={() => generateAIPlan(weekOffset)}
                    isEvaluating={isGeneratingAI}
                  />

                  {/* 7-Day Weekly Interactive Matrix */}
                  {agentDecision && (
                    <WeeklyPlanner
                      initialPlan={activePlan.length > 0 ? activePlan : agentDecision.suggestedPlan}
                      runFtp={profile.run_ftp ?? 285}
                      bikeFtp={profile.bike_ftp ?? 260}
                      weekOffset={weekOffset}
                      onWeekChange={handleWeekChange}
                      onPlanUpdate={handlePlanUpdate}
                      onSyncIntervals={handleSyncToIntervals}
                      isSyncing={isSyncing}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-4 text-center text-xs text-slate-400">
        <p>SGEA Training Platform • Google Cloud Vertex AI & Firebase • Intervals.icu REST API v1</p>
      </footer>

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        athleteId={profile.id}
        runFtp={profile.run_ftp ?? 285}
        bikeFtp={profile.bike_ftp ?? 260}
        initialTab={settingsTab}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
