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
}

export function useAthleteTelemetry({
  user,
  userProfile,
  userStorage,
  refreshProfile,
  onLiveConnectedChange,
}: UseAthleteTelemetryProps) {
  const isSuper = isMasterAdminEmail(userProfile?.email || user?.email);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  const [apiKeyCache, setApiKeyCache] = useState<string>("");
  const [geminiKeyCache, setGeminiKeyCache] = useState<string>("");
  const [visibleMetrics, setVisibleMetrics] = useState<string[]>(
    userProfile?.visibleMetrics || DEFAULT_VISIBLE_METRICS
  );

  const [wellnessHistory, setWellnessHistory] = useState<AthleteWellness[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [weeklyExecutedTss, setWeeklyExecutedTss] = useState<number>(0);
  const [dailyExecutedActivities, setDailyExecutedActivities] = useState<DailyExecutedMap>({});
  const [physioStatus, setPhysioStatus] = useState<PhysiologicalStatus | null>(null);

  // FinOps & Resiliencia SWR: timestamps de caché y snapshots en memoria
  const lastFetchTimestampRef = useRef<number>(0);
  const lastPersistedProfileRef = useRef<string>("");

  const persistProfileToApi = useCallback(async (body: Record<string, any>) => {
    const serialized = JSON.stringify(body);
    if (serialized === lastPersistedProfileRef.current) return;
    try {
      lastPersistedProfileRef.current = serialized;
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: serialized,
      });
    } catch (e) {
      console.warn("Aviso al persistir perfil en API:", e);
    }
  }, []);

  const latestWellness = useMemo(() => {
    if (!wellnessHistory?.length) return null;
    const reversed = [...wellnessHistory].reverse();
    return reversed.find((w) => w.sleepQuality !== undefined || w.sleepSecs !== undefined || w.hrv !== undefined || w.restingHR !== undefined) || reversed[0];
  }, [wellnessHistory]);

  const historicalSummary: PMCHistoricalSummary = useMemo(() => {
    return computePMCHistoricalSummary(wellnessHistory);
  }, [wellnessHistory]);

  const [profile, setProfile] = useState<AthleteProfile>(() => ({
    id: userProfile?.intervalsAthleteId || "",
    name: userProfile?.displayName || user?.displayName || "Atleta",
    ctl: 0,
    atl: 0,
    tsb: 0,
    rampRate: 0,
    restingHR: userProfile?.restingHR ?? (Number(userStorage.getItem("resting_hr")) || undefined),
    lthr: userProfile?.lthr ?? (Number(userStorage.getItem("lthr")) || undefined),
    maxHR: userProfile?.maxHR ?? (Number(userStorage.getItem("max_hr")) || undefined),
    run_ftp: userProfile?.runFtp || 0,
    bike_ftp: userProfile?.bikeFtp || 0,
    weight: userProfile?.weightKg,
    heightCm: userProfile?.heightCm,
    gender: userProfile?.gender ?? (userStorage.getItem("gender") as "M" | "F" | "OTHER" | null) ?? undefined,
    birthDate: userProfile?.birthDate,
    visibleMetrics: userProfile?.visibleMetrics,
  }));

  const refreshTelemetry = useCallback(
    async (athleteId?: string, apiKey?: string, runFtp?: number, bikeFtp?: number, forceRefresh: boolean = false) => {
      const targetAthleteId = athleteId || profile.id || userProfile?.intervalsAthleteId || "";
      const targetApiKey = apiKey || apiKeyCache || "";

      if (!isSuper && targetAthleteId.toLowerCase() === "i442091") { setIsLiveConnected(false); return; }
      if (!targetAthleteId && !targetApiKey && !userProfile?.encryptedApiKey) { setIsLiveConnected(false); return; }

      // Disponibilidad SWR: Si se consultó hace menos de 3 min y no es forzado, reusar estado
      const now = Date.now();
      if (!forceRefresh && lastFetchTimestampRef.current && (now - lastFetchTimestampRef.current < 180000)) {
        return;
      }

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

          const p = data.profile || {};
          const [resBike, resRun] = [p.bike_ftp || bikeFtp || profile.bike_ftp, p.run_ftp || runFtp || profile.run_ftp];
          const [resLthr, resRhr, resMax] = [p.lthr ?? profile.lthr, p.restingHR ?? profile.restingHR, p.maxHR ?? profile.maxHR];

          const syncFields: Array<[string, any]> = [
            ["bike_ftp", p.bike_ftp], ["run_ftp", p.run_ftp], ["lthr", p.lthr], ["resting_hr", p.restingHR],
            ["max_hr", p.maxHR], ["weight_kg", p.weight], ["height_cm", p.heightCm], ["gender", p.gender]
          ];
          syncFields.forEach(([k, v]) => { if (v) userStorage.setItem(k, String(v)); });

          setProfile((prev) => ({
            ...prev, ...p,
            weight: prev.weight ?? p.weight, heightCm: prev.heightCm ?? p.heightCm,
            gender: prev.gender ?? p.gender, birthDate: prev.birthDate ?? p.birthDate,
            lthr: resLthr ?? prev.lthr, restingHR: resRhr ?? prev.restingHR, maxHR: resMax ?? prev.maxHR,
            name: p.name && p.name !== "Atleta" ? p.name : (prev.name && prev.name !== "Atleta" ? prev.name : userProfile?.displayName || user?.displayName || "Atleta"),
            run_ftp: resRun, bike_ftp: resBike,
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
    const athleteIdToUse = data.intervalsAthleteId || data.athleteId;
    const setters: Array<[string, any, (v: any) => void]> = [
      ["athlete_id", athleteIdToUse, (v) => setProfile((p) => ({ ...p, id: v }))],
      ["display_name", data.displayName, (v) => setProfile((p) => ({ ...p, name: v }))],
      ["run_ftp", data.runFtp, (v) => setProfile((p) => ({ ...p, run_ftp: v }))],
      ["bike_ftp", data.bikeFtp, (v) => setProfile((p) => ({ ...p, bike_ftp: v }))],
      ["height_cm", data.heightCm, (v) => setProfile((p) => ({ ...p, heightCm: v }))],
      ["weight_kg", data.weightKg, (v) => setProfile((p) => ({ ...p, weight: v }))],
      ["gender", data.gender, (v) => setProfile((p) => ({ ...p, gender: v }))],
      ["birth_date", data.birthDate, (v) => setProfile((p) => ({ ...p, birthDate: v }))],
      ["lthr", data.lthr, (v) => setProfile((p) => ({ ...p, lthr: v }))],
      ["resting_hr", data.restingHR, (v) => setProfile((p) => ({ ...p, restingHR: v }))],
      ["max_hr", data.maxHR, (v) => setProfile((p) => ({ ...p, maxHR: v }))],
    ];
    setters.forEach(([k, v, set]) => { if (v !== undefined && v !== null) { userStorage.setItem(k, String(v)); set(v); } });

    if (data.apiKey) { setApiKeyCache(data.apiKey); userStorage.setItem("intervals_api_key", data.apiKey); }
    if (data.geminiApiKey) { setGeminiKeyCache(data.geminiApiKey); userStorage.setItem("custom_gemini_key", data.geminiApiKey); }
    if (data.visibleMetrics) { setVisibleMetrics(data.visibleMetrics); userStorage.setJSON("visible_metrics", data.visibleMetrics); }

    const effectiveWeight = data.weightKg !== undefined ? data.weightKg : profile.weight;
    const effectiveHeight = data.heightCm !== undefined ? data.heightCm : profile.heightCm;
    const effectiveRunFtp = data.runFtp || profile.run_ftp;
    const effectiveBikeFtp = data.bikeFtp || profile.bike_ftp;
    const effectiveBirth = data.birthDate || profile.birthDate;
    const effectiveGender = data.gender || profile.gender;
    const targetApiKey = data.apiKey || apiKeyCache || userStorage.getItem("intervals_api_key") || "";

    await persistProfileToApi({
      uid: user?.uid || "", email: user?.email || userProfile?.email || "",
      displayName: data.displayName || profile.name || user?.displayName || userProfile?.displayName,
      intervalsAthleteId: athleteIdToUse || profile.id, rawApiKey: targetApiKey,
      runFtp: effectiveRunFtp, bikeFtp: effectiveBikeFtp,
      lthr: data.lthr !== undefined ? data.lthr : profile.lthr,
      restingHR: data.restingHR !== undefined ? data.restingHR : profile.restingHR,
      maxHR: data.maxHR !== undefined ? data.maxHR : profile.maxHR,
      weightKg: effectiveWeight, heightCm: effectiveHeight, birthDate: effectiveBirth, gender: effectiveGender,
      weeklyAvailability: data.weeklyAvailability, visibleMetrics: data.visibleMetrics || visibleMetrics,
    });

    // Sincronizar hacia Intervals.icu esperando confirmación antes de refrescar
    if (athleteIdToUse || profile.id || user?.uid) {
      try {
        await fetch("/api/sync-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            athleteId: athleteIdToUse || profile.id, apiKey: targetApiKey || undefined,
            uid: user?.uid, email: user?.email || userProfile?.email || "",
            runFtp: effectiveRunFtp, bikeFtp: effectiveBikeFtp,
            weightKg: effectiveWeight, birthDate: effectiveBirth, gender: effectiveGender,
            lthr: data.lthr !== undefined ? data.lthr : profile.lthr,
            restingHR: data.restingHR !== undefined ? data.restingHR : profile.restingHR,
            maxHR: data.maxHR !== undefined ? data.maxHR : profile.maxHR,
          }),
        });
      } catch (syncErr) {
        console.warn("Aviso al sincronizar hacia Intervals.icu:", syncErr);
      }
    }

    if (refreshProfile) {
      try { await refreshProfile(); } catch (authErr) { console.warn("Aviso al refrescar perfil en AuthContext:", authErr); }
    }
    await refreshTelemetry(athleteIdToUse || profile.id, targetApiKey || data.apiKey, effectiveRunFtp, effectiveBikeFtp, true);
  };

  const handleToggleMetric = async (id: string) => {
    let updated = visibleMetrics.includes(id) ? visibleMetrics.filter((m) => m !== id) : [...visibleMetrics, id];
    if (updated.length === 0) updated = ["ctl"];
    setVisibleMetrics(updated);
    userStorage.setJSON("visible_metrics", updated);
    await handleSaveSettings({ visibleMetrics: updated });
  };

  const handleOnboardingSuccess = async (data: { athleteId: string; apiKey: string; athleteName?: string; runFtp?: number; bikeFtp?: number }) => {
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

      setProfile((prev) => ({
        ...prev, id: storedAthleteId, run_ftp: resolvedRunFtp, bike_ftp: resolvedBikeFtp,
        weight: stored.weight ? Number(stored.weight) : userProfile?.weightKg ?? prev.weight,
        heightCm: stored.height ? Number(stored.height) : userProfile?.heightCm ?? prev.heightCm,
        gender: stored.gender || (userProfile?.gender ?? prev.gender),
        birthDate: stored.birthDate || (userProfile?.birthDate ?? prev.birthDate),
        lthr: stored.lthr ?? prev.lthr, restingHR: stored.restingHR ?? prev.restingHR, maxHR: stored.maxHR ?? prev.maxHR,
      }));

      setIsLoading(false);

      if (storedAthleteId || storedApiKey || userProfile?.encryptedApiKey) {
        refreshTelemetry(storedAthleteId, storedApiKey, resolvedRunFtp, resolvedBikeFtp, true);
      } else {
        setIsLiveConnected(false);
        if (!userStorage.getItem("onboarding_welcomed") && !isSuper) {
          setIsOnboardingOpen(true);
          userStorage.setItem("onboarding_welcomed", "true");
        }
      }
    };

    init();
  }, [user?.uid, userProfile?.intervalsAthleteId, userProfile?.weightKg, userProfile?.heightCm, userProfile?.gender, userProfile?.birthDate, userProfile?.encryptedApiKey, isSuper, userStorage, refreshTelemetry]);

  // Heartbeat de auto-recuperación
  useEffect(() => {
    if (isLiveConnected || isLoading) return;
    if (!profile.id && !apiKeyCache && !userProfile?.encryptedApiKey) return;

    let retries = 0;
    const interval = setInterval(async () => {
      if (retries >= 5) { clearInterval(interval); return; }
      retries++;
      await refreshTelemetry(profile.id, apiKeyCache, profile.run_ftp, profile.bike_ftp, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [isLiveConnected, isLoading, profile.id, apiKeyCache, profile.run_ftp, profile.bike_ftp, refreshTelemetry, userProfile?.encryptedApiKey]);

  return {
    profile, setProfile, physioStatus, setPhysioStatus, wellnessHistory, latestWellness, historicalSummary,
    weeklyExecutedTss, dailyExecutedActivities, calendarEvents, setCalendarEvents, isLiveConnected, setIsLiveConnected,
    isRefreshingTelemetry, isLoading, apiKeyCache, geminiKeyCache, visibleMetrics,
    isOnboardingOpen, setIsOnboardingOpen, refreshTelemetry, handleToggleMetric, handleSaveSettings, handleOnboardingSuccess,
  };
}
