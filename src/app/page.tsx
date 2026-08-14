"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { PhysiologicalCards } from "@/components/PhysiologicalCards";
import { WeeklyPlanner } from "@/components/WeeklyPlanner";
import { AgentCommandCenter } from "@/components/AgentCommandCenter";
import { ProfileModal } from "@/components/ProfileModal";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { AgentDecisionOutput, PlanItem } from "@/lib/gemini/engine";
import { AthleteProfile } from "@/lib/intervals/types";

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

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [apiKeyCache, setApiKeyCache] = useState<string>("");

  // Carga y evaluación del microciclo
  const evaluateMicrocycle = useCallback(
    async (
      athleteId: string,
      apiKey?: string,
      runFtp?: number,
      bikeFtp?: number,
      offset: number = 0
    ) => {
      setIsEvaluating(true);
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
          }),
        });

        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
          setPhysioStatus(data.physioStatus);
          setAgentDecision(data.agentDecision);
          setActivePlan(data.agentDecision.suggestedPlan || []);
        }
      } catch (err) {
        console.error("Error al evaluar microciclo:", err);
      } finally {
        setIsEvaluating(false);
        setIsLoading(false);
      }
    },
    [profile.id, profile.run_ftp, profile.bike_ftp, apiKeyCache]
  );

  useEffect(() => {
    // Restaurar credenciales guardadas en el navegador en el montaje inicial
    const savedId = localStorage.getItem("sgea_athlete_id") || "i442091";
    const savedKey = localStorage.getItem("sgea_api_key") || "";
    const savedRunFtp = localStorage.getItem("sgea_run_ftp");
    const savedBikeFtp = localStorage.getItem("sgea_bike_ftp");

    if (savedKey) {
      setApiKeyCache(savedKey);
    }

    const runFtpVal = savedRunFtp ? Number(savedRunFtp) : 285;
    const bikeFtpVal = savedBikeFtp ? Number(savedBikeFtp) : 260;

    setProfile((prev) => ({
      ...prev,
      id: savedId,
      run_ftp: runFtpVal,
      bike_ftp: bikeFtpVal,
    }));

    evaluateMicrocycle(savedId, savedKey, runFtpVal, bikeFtpVal, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveSettings = async (data: {
    athleteId: string;
    apiKey?: string;
    runFtp: number;
    bikeFtp: number;
    focus: string;
  }) => {
    if (data.apiKey) {
      setApiKeyCache(data.apiKey);
      localStorage.setItem("sgea_api_key", data.apiKey);
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

    await evaluateMicrocycle(data.athleteId, data.apiKey, data.runFtp, data.bikeFtp, weekOffset);
  };

  const handleWeekChange = async (newOffset: number) => {
    setWeekOffset(newOffset);
    await evaluateMicrocycle(profile.id, apiKeyCache, profile.run_ftp, profile.bike_ftp, newOffset);
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
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRefresh={() => evaluateMicrocycle(profile.id, apiKeyCache, profile.run_ftp, profile.bike_ftp, weekOffset)}
          isLoading={isEvaluating}
        />

        {/* Main Content Area */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
          {/* Top Banner / Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 p-6 border border-slate-800 shadow-xl athletic-glow">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  ● Sistema Adaptativo Activo
                </span>
                <span className="text-xs text-slate-400 font-mono">Modo On-Demand</span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Panel Fisiológico & Control de Carga
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Periodización dinámica integrada con Intervals.icu, Stryd Running Power y Garmin.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800 text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Dispositivo Principal</p>
                <p className="text-xs font-bold text-emerald-400">Stryd Footpod + Garmin</p>
              </div>
            </div>
          </div>

          {/* Physiological Cards Grid */}
          <PhysiologicalCards
            status={physioStatus}
            runFtp={profile.run_ftp ?? 285}
            bikeFtp={profile.bike_ftp ?? 260}
          />

          {/* Agent Command Center & Reasoning Tree */}
          <AgentCommandCenter
            decision={agentDecision}
            onReevaluate={() => evaluateMicrocycle(profile.id, apiKeyCache, profile.run_ftp, profile.bike_ftp, weekOffset)}
            onSyncIntervals={handleSyncToIntervals}
            isEvaluating={isEvaluating}
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
        <p>SGEA Training Platform • Ecosistema Google Cloud & Firebase • Intervals.icu REST API v1</p>
      </footer>

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        athleteId={profile.id}
        runFtp={profile.run_ftp ?? 285}
        bikeFtp={profile.bike_ftp ?? 260}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
