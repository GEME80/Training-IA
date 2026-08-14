"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { PhysiologicalCards } from "@/components/PhysiologicalCards";
import { SeasonPlannerCard } from "@/components/SeasonPlannerCard";
import { WeeklyPlanner } from "@/components/WeeklyPlanner";
import { AgentCommandCenter } from "@/components/AgentCommandCenter";
import { ProfileModal } from "@/components/ProfileModal";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { AgentDecisionOutput, PlanItem } from "@/lib/gemini/engine";
import { AthleteProfile } from "@/lib/intervals/types";
import { MacrocyclePhaseInfo, TargetRace, calculateMacrocyclePhase } from "@/lib/physiology/macrocycle";

export default function HomePage() {
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
  const [macrocyclePhase, setMacrocyclePhase] = useState<MacrocyclePhaseInfo | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<"intervals" | "races" | "ai">("intervals");

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
      racesList: TargetRace[] = targetRaces
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
            customRunFtp: runFtp || profile.run_ftp || 285,
            customBikeFtp: bikeFtp || profile.bike_ftp || 260,
            weekOffset: offset,
            targetRaces: racesList,
            skipAI: true, // Actualización rápida de telemetría sin consumo de tokens
          }),
        });

        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
          setPhysioStatus(data.physioStatus);
          setMacrocyclePhase(data.macrocyclePhase);
          if (!agentDecision) {
            setAgentDecision(data.agentDecision);
            setActivePlan(data.agentDecision.suggestedPlan || []);
          }
        }
      } catch (err) {
        console.error("Error al actualizar telemetría:", err);
      } finally {
        setIsRefreshingTelemetry(false);
        setIsLoading(false);
      }
    },
    [profile.id, profile.run_ftp, profile.bike_ftp, apiKeyCache, weekOffset, targetRaces, agentDecision]
  );

  // 2. Inferencia y Planificación con IA (Bajo Demanda al pulsar botón)
  const generateAIPlan = useCallback(
    async (offset: number = weekOffset) => {
      setIsGeneratingAI(true);
      try {
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            athleteId: profile.id,
            apiKey: apiKeyCache,
            customRunFtp: profile.run_ftp || 285,
            customBikeFtp: profile.bike_ftp || 260,
            weekOffset: offset,
            geminiApiKey: geminiKeyCache,
            selectedModel: selectedModelCache,
            customPrompt: customPromptCache,
            targetRaces,
            skipAI: false, // Disparar inferencia completa de Gemini
          }),
        });

        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
          setPhysioStatus(data.physioStatus);
          setMacrocyclePhase(data.macrocyclePhase);
          setAgentDecision(data.agentDecision);
          setActivePlan(data.agentDecision.suggestedPlan || []);
        }
      } catch (err) {
        console.error("Error al generar plan con IA:", err);
      } finally {
        setIsGeneratingAI(false);
      }
    },
    [profile.id, profile.run_ftp, profile.bike_ftp, apiKeyCache, geminiKeyCache, selectedModelCache, customPromptCache, targetRaces, weekOffset]
  );

  useEffect(() => {
    // Restaurar credenciales y carreras guardadas en el navegador
    const savedId = localStorage.getItem("sgea_athlete_id") || "i442091";
    const savedKey = localStorage.getItem("sgea_api_key") || "";
    const savedGeminiKey = localStorage.getItem("sgea_gemini_key") || "";
    const savedModel = localStorage.getItem("sgea_gemini_model") || "gemini-2.5-flash";
    const savedPrompt = localStorage.getItem("sgea_custom_prompt") || "";
    const savedRunFtp = localStorage.getItem("sgea_run_ftp");
    const savedBikeFtp = localStorage.getItem("sgea_bike_ftp");
    const savedRaces = localStorage.getItem("sgea_target_races");

    if (savedKey) setApiKeyCache(savedKey);
    if (savedGeminiKey) setGeminiKeyCache(savedGeminiKey);
    if (savedModel) setSelectedModelCache(savedModel);
    if (savedPrompt) setCustomPromptCache(savedPrompt);

    let parsedRaces: TargetRace[] = [];
    if (savedRaces) {
      try {
        parsedRaces = JSON.parse(savedRaces);
        setTargetRaces(parsedRaces);
      } catch {
        // Keep empty
      }
    }

    const runFtpVal = savedRunFtp ? Number(savedRunFtp) : 285;
    const bikeFtpVal = savedBikeFtp ? Number(savedBikeFtp) : 260;

    setProfile((prev) => ({
      ...prev,
      id: savedId,
      run_ftp: runFtpVal,
      bike_ftp: bikeFtpVal,
    }));

    setMacrocyclePhase(calculateMacrocyclePhase(parsedRaces));
    refreshTelemetry(savedId, savedKey, runFtpVal, bikeFtpVal, 0, parsedRaces);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }) => {
    if (data.apiKey) {
      setApiKeyCache(data.apiKey);
      localStorage.setItem("sgea_api_key", data.apiKey);
    }
    if (data.geminiApiKey) {
      setGeminiKeyCache(data.geminiApiKey);
      localStorage.setItem("sgea_gemini_key", data.geminiApiKey);
    }
    if (data.selectedModel) {
      setSelectedModelCache(data.selectedModel);
      localStorage.setItem("sgea_gemini_model", data.selectedModel);
    }
    if (data.customPrompt !== undefined) {
      setCustomPromptCache(data.customPrompt);
      localStorage.setItem("sgea_custom_prompt", data.customPrompt);
    }
    if (data.targetRaces) {
      setTargetRaces(data.targetRaces);
      setMacrocyclePhase(calculateMacrocyclePhase(data.targetRaces));
      localStorage.setItem("sgea_target_races", JSON.stringify(data.targetRaces));
    }

    localStorage.setItem("sgea_athlete_id", data.athleteId);
    localStorage.setItem("sgea_run_ftp", String(data.runFtp));
    localStorage.setItem("sgea_bike_ftp", String(data.bikeFtp));

    setProfile((prev) => ({
      ...prev,
      id: data.athleteId,
      run_ftp: data.runFtp,
      bike_ftp: data.bikeFtp,
    }));

    await refreshTelemetry(
      data.athleteId,
      data.apiKey,
      data.runFtp,
      data.bikeFtp,
      weekOffset,
      data.targetRaces || targetRaces
    );
  };

  const handleWeekChange = async (newOffset: number) => {
    setWeekOffset(newOffset);
    await refreshTelemetry(profile.id, apiKeyCache, profile.run_ftp, profile.bike_ftp, newOffset);
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
        />

        {/* Main Content Area */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
          {/* Season Planner & Macrocycle Card */}
          <SeasonPlannerCard
            phaseInfo={macrocyclePhase}
            races={targetRaces}
            onOpenRaceSettings={() => {
              setSettingsTab("races");
              setIsSettingsOpen(true);
            }}
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
            onSyncIntervals={handleSyncToIntervals}
            isEvaluating={isGeneratingAI}
            isSyncing={isSyncing}
          />

          {/* 7-Day Weekly Interactive Matrix */}
          {agentDecision && (
            <WeeklyPlanner
              initialPlan={agentDecision.suggestedPlan}
              runFtp={profile.run_ftp ?? 285}
              bikeFtp={profile.bike_ftp ?? 260}
              weekOffset={weekOffset}
              onWeekChange={handleWeekChange}
              onPlanUpdate={handlePlanUpdate}
            />
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
