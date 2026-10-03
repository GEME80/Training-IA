"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AthleteProfile, AthleteWellness, CalendarEvent, DailyExecutedMap, DEFAULT_VISIBLE_METRICS } from "@/lib/intervals/types";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { isMasterAdminEmail } from "@/lib/env";
import { UserStorage, purgeLegacyGlobalStorage } from "@/lib/storage/userStorage";
import { computePMCHistoricalSummary, PMCHistoricalSummary } from "@/lib/physiology/pmcEngine";

interface UseAthleteTelemetryProps {
  user: any;
  userProfile: any;
  userStorage: UserStorage;
  refreshProfile?: () => Promise<void>;
  onLiveConnectedChange?: (connected: boolean) => void;
  isReadOnly?: boolean;
}

export function useAthleteTelemetry({
  user,
  userProfile,
  userStorage,
  refreshProfile,
  onLiveConnectedChange,
  isReadOnly = false,
}: UseAthleteTelemetryProps) {
  const isSuper = isMasterAdminEmail(userProfile?.email || user?.email) && !isReadOnly;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [apiKeyCache, setApiKeyCache] = useState<string>(""), [geminiKeyCache, setGeminiKeyCache] = useState<string>("");
  const [visibleMetrics, setVisibleMetrics] = useState<string[]>(userProfile?.visibleMetrics || DEFAULT_VISIBLE_METRICS);
  const [wellnessHistory, setWellnessHistory] = useState<AthleteWellness[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [weeklyExecutedTss, setWeeklyExecutedTss] = useState<number>(0);
  const [dailyExecutedActivities, setDailyExecutedActivities] = useState<DailyExecutedMap>({});
  const [physioStatus, setPhysioStatus] = useState<PhysiologicalStatus | null>(null);
  const [recentFtpCalibration, setRecentFtpCalibration] = useState<any>(null);
  const [recentPaceCalibration, setRecentPaceCalibration] = useState<any>(null);
  const [recentRunPowerCalibration, setRecentRunPowerCalibration] = useState<any>(null);

  const lastFetchTimestampRef = useRef<number>(0);
  const lastPersistedProfileRef = useRef<string>("");

  const persistProfileToApi = useCallback(async (body: Record<string, any>) => {
    if (isReadOnly) return;
    const serialized = JSON.stringify(body);
    if (serialized === lastPersistedProfileRef.current) return;
    try {
      lastPersistedProfileRef.current = serialized;
      await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: serialized });
    } catch (e) { console.warn("Aviso al persistir perfil en API:", e); }
  }, [isReadOnly]);

  const latestWellness = useMemo(() => {
    if (!wellnessHistory?.length) return null;
    const reversed = [...wellnessHistory].reverse();
    return reversed.find((w) => w.sleepQuality !== undefined || w.sleepSecs !== undefined || w.hrv !== undefined || w.restingHR !== undefined) || reversed[0];
  }, [wellnessHistory]);

  const historicalSummary: PMCHistoricalSummary = useMemo(() => {
    return computePMCHistoricalSummary(wellnessHistory);
  }, [wellnessHistory]);

  const [profile, setProfile] = useState<AthleteProfile>(() => {
    const hasPwr = userProfile?.hasRunningPowerMeter ?? (userProfile?.runFtp ? userProfile.runFtp > 0 : (Number(userStorage.getItem("run_ftp")) || 0) > 0);
    return {
      id: userProfile?.intervalsAthleteId || "", name: userProfile?.displayName || user?.displayName || "Atleta",
      ctl: 0, atl: 0, tsb: 0, rampRate: 0,
      restingHR: userProfile?.restingHR ?? (Number(userStorage.getItem("resting_hr")) || undefined),
      lthr: userProfile?.lthr ?? (Number(userStorage.getItem("lthr")) || undefined), maxHR: userProfile?.maxHR ?? (Number(userStorage.getItem("max_hr")) || undefined),
      run_ftp: userProfile?.runFtp || 0, bike_ftp: userProfile?.bikeFtp || 0,
      hasRunningPowerMeter: hasPwr, runningTrainingMode: userProfile?.runningTrainingMode || (hasPwr ? "POWER" : "PACE"),
      runThresholdPaceStr: userProfile?.runThresholdPaceStr || userStorage.getItem("run_threshold_pace_str") || "4:45",
      runThresholdPaceSecPerKm: userProfile?.runThresholdPaceSecPerKm || Number(userStorage.getItem("run_threshold_pace_sec")) || 285,
      swimCssStr: userProfile?.swimCssStr || userStorage.getItem("swim_css_str") || "1:45",
      swimCssSecPer100m: userProfile?.swimCssSecPer100m || Number(userStorage.getItem("swim_css_sec")) || 105,
      weight: userProfile?.weightKg, heightCm: userProfile?.heightCm,
      gender: userProfile?.gender ?? (userStorage.getItem("gender") as "M" | "F" | "OTHER" | null) ?? undefined,
      birthDate: userProfile?.birthDate, visibleMetrics: userProfile?.visibleMetrics,
      planPrice: userProfile?.planPrice, planCurrency: userProfile?.planCurrency,
      billingStatus: userProfile?.billingStatus, billingCycleDay: userProfile?.billingCycleDay,
      paymentReference: userProfile?.paymentReference,
    };
  });

  const refreshTelemetry = useCallback(
    async (athleteId?: string, apiKey?: string, runFtp?: number, bikeFtp?: number, forceRefresh: boolean = false) => {
      const targetAthleteId = athleteId || profile.id || userProfile?.intervalsAthleteId || "";
      const targetApiKey = apiKey || apiKeyCache || "";

      if (!isSuper && targetAthleteId.toLowerCase() === "i442091") { setIsLiveConnected(false); return; }
      if (!targetAthleteId && !targetApiKey && !userProfile?.encryptedApiKey && !userProfile?.hasApiKey) { setIsLiveConnected(false); return; }

      const now = Date.now();
      if (!forceRefresh && lastFetchTimestampRef.current && (now - lastFetchTimestampRef.current < 180000)) return;

      try {
        setIsRefreshingTelemetry(true);
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            athleteId: targetAthleteId, apiKey: targetApiKey, uid: user?.uid,
            email: user?.email || userProfile?.email || "",
            customRunFtp: runFtp || profile.run_ftp, customBikeFtp: bikeFtp || profile.bike_ftp, skipAI: true,
          }),
        });

        if (!res.ok) { setIsLiveConnected(false); return; }

        const data = await res.json();
        if (data.success) {
          lastFetchTimestampRef.current = Date.now();
          if (data.isLive !== undefined) {
            setIsLiveConnected(Boolean(data.isLive));
            if (onLiveConnectedChange) onLiveConnectedChange(Boolean(data.isLive));
          }
          if (typeof data.executedWeeklyTss === "number") setWeeklyExecutedTss(data.executedWeeklyTss);
          if (data.dailyExecutedActivities) setDailyExecutedActivities(data.dailyExecutedActivities);
          if (Array.isArray(data.wellness)) setWellnessHistory(data.wellness);
          if (Array.isArray(data.events)) setCalendarEvents(data.events);
          if (data.recentFtpCalibration) setRecentFtpCalibration(data.recentFtpCalibration);
          if (data.recentPaceCalibration) setRecentPaceCalibration(data.recentPaceCalibration);
          if (data.recentRunPowerCalibration) setRecentRunPowerCalibration(data.recentRunPowerCalibration);

          const p = data.profile || {};
          const [resBike, resRun] = [p.bike_ftp || bikeFtp || profile.bike_ftp, p.run_ftp || runFtp || profile.run_ftp];
          const [resLthr, resRhr, resMax] = [p.lthr ?? profile.lthr, p.restingHR ?? profile.restingHR, p.maxHR ?? profile.maxHR];

          const syncFields: Array<[string, any]> = [
            ["bike_ftp", p.bike_ftp], ["run_ftp", p.run_ftp], ["lthr", p.lthr], ["resting_hr", p.restingHR],
            ["max_hr", p.maxHR], ["weight_kg", p.weight], ["height_cm", p.heightCm], ["gender", p.gender],
            ["swim_css_str", p.swimCssStr], ["swim_css_sec", p.swimCssSecPer100m],
          ];
          syncFields.forEach(([k, v]) => { if (v) userStorage.setItem(k, String(v)); });

          setProfile((prev) => ({
            ...prev, ...p, weight: prev.weight ?? p.weight, heightCm: prev.heightCm ?? p.heightCm,
            gender: prev.gender ?? p.gender, birthDate: prev.birthDate ?? p.birthDate,
            lthr: resLthr ?? prev.lthr, restingHR: resRhr ?? prev.restingHR, maxHR: resMax ?? prev.maxHR,
            name: p.name && p.name !== "Atleta" ? p.name : (prev.name && prev.name !== "Atleta" ? prev.name : userProfile?.displayName || user?.displayName || "Atleta"),
            run_ftp: resRun, bike_ftp: resBike,
            swimCssStr: p.swimCssStr || userStorage.getItem("swim_css_str") || prev.swimCssStr,
            swimCssSecPer100m: p.swimCssSecPer100m || Number(userStorage.getItem("swim_css_sec")) || prev.swimCssSecPer100m,
            runThresholdPaceStr: p.runThresholdPaceStr || userStorage.getItem("run_threshold_pace_str") || prev.runThresholdPaceStr,
            runThresholdPaceSecPerKm: p.runThresholdPaceSecPerKm || Number(userStorage.getItem("run_threshold_pace_sec")) || prev.runThresholdPaceSecPerKm,
          }));

          setPhysioStatus(data.physioStatus);
        }
      } catch (err) {
        console.error("Error al refrescar telemetría:", err);
      } finally {
        setIsRefreshingTelemetry(false);
      }
    },
    [profile.id, profile.run_ftp, profile.bike_ftp, apiKeyCache, isSuper, onLiveConnectedChange, user?.email, user?.uid, userProfile?.displayName, userProfile?.email, userProfile?.encryptedApiKey, userProfile?.intervalsAthleteId, userStorage]
  );

  const handleSaveSettings = async (data: any) => {
    if (isReadOnly) return;
    const athleteIdToUse = data.intervalsAthleteId || data.athleteId;
    const storageKeys: Array<[string, any]> = [
      ["athlete_id", athleteIdToUse], ["display_name", data.displayName], ["run_ftp", data.runFtp], ["bike_ftp", data.bikeFtp],
      ["height_cm", data.heightCm], ["weight_kg", data.weightKg], ["gender", data.gender], ["birth_date", data.birthDate],
      ["lthr", data.lthr], ["resting_hr", data.restingHR], ["max_hr", data.maxHR],
      ["has_running_power_meter", data.hasRunningPowerMeter], ["running_training_mode", data.runningTrainingMode],
      ["run_threshold_pace_str", data.runThresholdPaceStr], ["run_threshold_pace_sec", data.runThresholdPaceSecPerKm],
      ["swim_css_str", data.swimCssStr], ["swim_css_sec", data.swimCssSecPer100m],
    ];
    storageKeys.forEach(([k, v]) => { if (v !== undefined && v !== null) userStorage.setItem(k, String(v)); });

    setProfile((prev) => ({
      ...prev, id: athleteIdToUse || prev.id, name: data.displayName || prev.name,
      run_ftp: data.runFtp ?? prev.run_ftp, bike_ftp: data.bikeFtp ?? prev.bike_ftp,
      heightCm: data.heightCm ?? prev.heightCm, weight: data.weightKg ?? prev.weight,
      gender: data.gender ?? prev.gender, birthDate: data.birthDate ?? prev.birthDate,
      lthr: data.lthr ?? prev.lthr, restingHR: data.restingHR ?? prev.restingHR, maxHR: data.maxHR ?? prev.maxHR,
      hasRunningPowerMeter: data.hasRunningPowerMeter ?? prev.hasRunningPowerMeter,
      runningTrainingMode: data.runningTrainingMode || prev.runningTrainingMode,
      runThresholdPaceStr: data.runThresholdPaceStr || prev.runThresholdPaceStr,
      runThresholdPaceSecPerKm: data.runThresholdPaceSecPerKm ?? prev.runThresholdPaceSecPerKm,
      swimCssStr: data.swimCssStr || prev.swimCssStr, swimCssSecPer100m: data.swimCssSecPer100m ?? prev.swimCssSecPer100m,
    }));

    if (data.apiKey) { setApiKeyCache(data.apiKey); userStorage.setItem("intervals_api_key", data.apiKey); }
    if (data.geminiApiKey) { setGeminiKeyCache(data.geminiApiKey); userStorage.setItem("custom_gemini_key", data.geminiApiKey); }
    if (data.visibleMetrics) { setVisibleMetrics(data.visibleMetrics); userStorage.setJSON("visible_metrics", data.visibleMetrics); }

    const effWeight = data.weightKg ?? profile.weight, effHeight = data.heightCm ?? profile.heightCm;
    const effRunFtp = data.runFtp ?? profile.run_ftp, effBikeFtp = data.bikeFtp ?? profile.bike_ftp;
    const targetApiKey = data.apiKey || apiKeyCache || userStorage.getItem("intervals_api_key") || "";

    await persistProfileToApi({
      uid: user?.uid || "", email: user?.email || userProfile?.email || "",
      displayName: data.displayName || profile.name || user?.displayName || userProfile?.displayName,
      intervalsAthleteId: athleteIdToUse || profile.id, rawApiKey: targetApiKey,
      runFtp: effRunFtp, bikeFtp: effBikeFtp, lthr: data.lthr ?? profile.lthr, restingHR: data.restingHR ?? profile.restingHR, maxHR: data.maxHR ?? profile.maxHR,
      hasRunningPowerMeter: data.hasRunningPowerMeter ?? profile.hasRunningPowerMeter, runningTrainingMode: data.runningTrainingMode || profile.runningTrainingMode,
      runThresholdPaceStr: data.runThresholdPaceStr || profile.runThresholdPaceStr, runThresholdPaceSecPerKm: data.runThresholdPaceSecPerKm ?? profile.runThresholdPaceSecPerKm,
      swimCssStr: data.swimCssStr || profile.swimCssStr, swimCssSecPer100m: data.swimCssSecPer100m ?? profile.swimCssSecPer100m,
      weightKg: effWeight, heightCm: effHeight, birthDate: data.birthDate || profile.birthDate, gender: data.gender || profile.gender,
      weeklyAvailability: data.weeklyAvailability, visibleMetrics: data.visibleMetrics || visibleMetrics,
    });

    if (athleteIdToUse || profile.id || user?.uid) {
      try {
        await fetch("/api/sync-settings", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            athleteId: athleteIdToUse || profile.id, apiKey: targetApiKey || undefined, uid: user?.uid, email: user?.email || userProfile?.email || "",
            runFtp: effRunFtp, bikeFtp: effBikeFtp, swimCssSecPer100m: data.swimCssSecPer100m ?? profile.swimCssSecPer100m,
            weightKg: effWeight, birthDate: data.birthDate || profile.birthDate, gender: data.gender || profile.gender,
            lthr: data.lthr ?? profile.lthr, restingHR: data.restingHR ?? profile.restingHR, maxHR: data.maxHR ?? profile.maxHR,
          }),
        });
      } catch (syncErr) { console.warn("Aviso al sincronizar hacia Intervals.icu:", syncErr); }
    }

    if (refreshProfile) { try { await refreshProfile(); } catch (authErr) { console.warn("Aviso al refrescar perfil en AuthContext:", authErr); } }
    await refreshTelemetry(athleteIdToUse || profile.id, targetApiKey || data.apiKey, effRunFtp, effBikeFtp, true);
  };

  const handleToggleMetric = async (id: string) => {
    let updated = visibleMetrics.includes(id) ? visibleMetrics.filter((m) => m !== id) : [...visibleMetrics, id];
    if (updated.length === 0) updated = ["ctl"];
    setVisibleMetrics(updated);
    if (isReadOnly) return;
    userStorage.setJSON("visible_metrics", updated);
    await handleSaveSettings({ visibleMetrics: updated });
  };

  const handleOnboardingSuccess = async (data: { athleteId: string; apiKey: string; athleteName?: string; runFtp?: number; bikeFtp?: number }) => {
    if (isReadOnly) return;
    setApiKeyCache(data.apiKey);
    userStorage.setItem("intervals_api_key", data.apiKey);
    userStorage.setItem("athlete_id", data.athleteId);
    userStorage.setItem("onboarding_welcomed", "true");
    if (data.runFtp) userStorage.setItem("run_ftp", data.runFtp.toString());
    if (data.bikeFtp) userStorage.setItem("bike_ftp", data.bikeFtp.toString());

    setProfile((prev) => ({
      ...prev, id: data.athleteId, name: data.athleteName || prev.name,
      run_ftp: data.runFtp || prev.run_ftp, bike_ftp: data.bikeFtp || prev.bike_ftp,
    }));

    if (user?.uid) {
      await persistProfileToApi({
        uid: user.uid, email: user.email, displayName: data.athleteName || user.displayName,
        intervalsAthleteId: data.athleteId, rawApiKey: data.apiKey, runFtp: data.runFtp, bikeFtp: data.bikeFtp,
      });
    }

    setIsOnboardingOpen(false);
    setIsLiveConnected(true);
    if (onLiveConnectedChange) onLiveConnectedChange(true);
    refreshTelemetry(data.athleteId, data.apiKey, data.runFtp, data.bikeFtp, true);
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      purgeLegacyGlobalStorage();

      let storedAthleteId =
        userProfile?.intervalsAthleteId || userStorage.getItem("athlete_id") ||
        (isSuper ? (process.env.NEXT_PUBLIC_INTERVALS_ATHLETE_ID || process.env.NEXT_PUBLIC_DEFAULT_ATHLETE_ID || "i442091") : "");

      if (!isSuper && storedAthleteId.toLowerCase() === "i442091") {
        storedAthleteId = "";
        userStorage.removeItem("athlete_id");
      }

      const storedApiKey = userStorage.getItem("intervals_api_key") || (isSuper ? (process.env.NEXT_PUBLIC_INTERVALS_API_KEY || "") : "");
      const storedGeminiKey = userStorage.getItem("custom_gemini_key") || "";

      if (storedApiKey) userStorage.setItem("intervals_api_key", storedApiKey);
      if (storedAthleteId) userStorage.setItem("athlete_id", storedAthleteId);
      else userStorage.removeItem("athlete_id");

      setApiKeyCache(storedApiKey);
      setGeminiKeyCache(storedGeminiKey);

      const stored = {
        weight: userStorage.getItem("weight_kg"), height: userStorage.getItem("height_cm"),
        gender: userStorage.getItem("gender") as "M" | "F" | "OTHER" | null, birthDate: userStorage.getItem("birth_date"),
        runFtp: userProfile?.runFtp ?? (Number(userStorage.getItem("run_ftp")) || 0),
        bikeFtp: userProfile?.bikeFtp ?? (Number(userStorage.getItem("bike_ftp")) || 0),
        lthr: userProfile?.lthr ?? (Number(userStorage.getItem("lthr")) || undefined),
        restingHR: userProfile?.restingHR ?? (Number(userStorage.getItem("resting_hr")) || undefined),
        maxHR: userProfile?.maxHR ?? (Number(userStorage.getItem("max_hr")) || undefined),
      };

      const resolvedRunFtp = !isSuper && stored.runFtp === 327 ? 0 : stored.runFtp;
      const resolvedBikeFtp = !isSuper && stored.bikeFtp === 240 ? 0 : stored.bikeFtp;
      const hasPwr = userProfile?.hasRunningPowerMeter ?? (resolvedRunFtp > 0);

      setProfile((prev) => ({
        ...prev, id: storedAthleteId, run_ftp: resolvedRunFtp, bike_ftp: resolvedBikeFtp, hasRunningPowerMeter: hasPwr,
        runningTrainingMode: userProfile?.runningTrainingMode || (hasPwr ? "POWER" : "PACE"),
        runThresholdPaceStr: userProfile?.runThresholdPaceStr || userStorage.getItem("run_threshold_pace_str") || prev.runThresholdPaceStr || "4:45",
        runThresholdPaceSecPerKm: userProfile?.runThresholdPaceSecPerKm || Number(userStorage.getItem("run_threshold_pace_sec")) || prev.runThresholdPaceSecPerKm || 285,
        swimCssStr: userProfile?.swimCssStr || userStorage.getItem("swim_css_str") || prev.swimCssStr || "1:45",
        swimCssSecPer100m: userProfile?.swimCssSecPer100m || Number(userStorage.getItem("swim_css_sec")) || prev.swimCssSecPer100m || 105,
        weight: stored.weight ? Number(stored.weight) : userProfile?.weightKg ?? prev.weight,
        heightCm: stored.height ? Number(stored.height) : userProfile?.heightCm ?? prev.heightCm,
        gender: stored.gender || (userProfile?.gender ?? prev.gender), birthDate: stored.birthDate || (userProfile?.birthDate ?? prev.birthDate),
        lthr: stored.lthr ?? prev.lthr, restingHR: stored.restingHR ?? prev.restingHR, maxHR: stored.maxHR ?? prev.maxHR,
      }));

      setIsLoading(false);

      if (storedAthleteId || storedApiKey || userProfile?.encryptedApiKey || userProfile?.hasApiKey) {
        refreshTelemetry(storedAthleteId, storedApiKey, resolvedRunFtp, resolvedBikeFtp, true);
      } else {
        setIsLiveConnected(false);
        if (!userStorage.getItem("onboarding_welcomed") && !isSuper && !isReadOnly) {
          setIsOnboardingOpen(true);
          userStorage.setItem("onboarding_welcomed", "true");
        }
      }
    };

    init();
  }, [user?.uid, userProfile?.intervalsAthleteId, userProfile?.weightKg, userProfile?.heightCm, userProfile?.gender, userProfile?.birthDate, userProfile?.encryptedApiKey, userProfile?.hasApiKey, userProfile?.hasRunningPowerMeter, userProfile?.runningTrainingMode, userProfile?.runThresholdPaceStr, userProfile?.runThresholdPaceSecPerKm, userProfile?.swimCssStr, userProfile?.swimCssSecPer100m, isSuper, userStorage, refreshTelemetry]);

  // Heartbeat de auto-recuperación
  useEffect(() => {
    if (isLiveConnected || isLoading) return;
    if (!profile.id && !apiKeyCache && !userProfile?.encryptedApiKey && !userProfile?.hasApiKey) return;

    let retries = 0;
    const interval = setInterval(async () => {
      if (++retries >= 5) clearInterval(interval);
      await refreshTelemetry(profile.id, apiKeyCache, profile.run_ftp, profile.bike_ftp, true);
    }, 10000);
    return () => clearInterval(interval);
  }, [isLiveConnected, isLoading, profile.id, apiKeyCache, profile.run_ftp, profile.bike_ftp, refreshTelemetry, userProfile?.encryptedApiKey]);
  return {
    profile, setProfile, physioStatus, setPhysioStatus, wellnessHistory, latestWellness, historicalSummary,
    weeklyExecutedTss, dailyExecutedActivities, calendarEvents, setCalendarEvents, isLiveConnected, setIsLiveConnected,
    isRefreshingTelemetry, isLoading, apiKeyCache, geminiKeyCache, visibleMetrics, recentFtpCalibration, setRecentFtpCalibration,
    recentPaceCalibration, setRecentPaceCalibration, recentRunPowerCalibration, setRecentRunPowerCalibration,
    isOnboardingOpen, setIsOnboardingOpen, refreshTelemetry, handleToggleMetric, handleSaveSettings, handleOnboardingSuccess,
  };
}
