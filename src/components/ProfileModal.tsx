"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Sliders,
  Link as LinkIcon,
  Calendar,
  Activity,
  CheckCircle2,
} from "lucide-react";
import {
  WeeklyAvailabilityMap,
  DEFAULT_WEEKLY_AVAILABILITY,
  DisciplineType,
  normalizeDisciplines,
} from "@/lib/gemini/engine";
import { GeminiModelDto } from "@/app/api/gemini/models/route";
import { DEFAULT_VISIBLE_METRICS } from "@/lib/intervals/types";

import { ProfileConnectionsTab } from "./profile/ProfileConnectionsTab";
import { ProfileAvailabilityTab } from "./profile/ProfileAvailabilityTab";
import { ProfilePhysiologyTab } from "./profile/ProfilePhysiologyTab";

export type ProfileModalTab = "connections" | "availability" | "physiology";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
  runFtp: number;
  bikeFtp: number;
  initialBirthDate?: string;
  initialGender?: "M" | "F" | "OTHER";
  initialVisibleMetrics?: string[];
  initialTab?: ProfileModalTab | "intervals" | "ai";
  weeklyAvailability?: WeeklyAvailabilityMap;
  ctl?: number;
  atl?: number;
  tsb?: number;
  onSave: (data: {
    athleteId: string;
    apiKey?: string;
    birthDate?: string;
    gender?: "M" | "F" | "OTHER";
    runFtp: number;
    bikeFtp: number;
    weightKg?: number;
    restingHR?: number;
    maxHR?: number;
    lthr?: number;
    focus: string;
    geminiApiKey?: string;
    selectedModel?: string;
    coachProfile?: string;
    customPrompt?: string;
    weeklyAvailability?: WeeklyAvailabilityMap;
    visibleMetrics?: string[];
  }) => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  athleteId: initialAthleteId,
  runFtp: initialRunFtp,
  bikeFtp: initialBikeFtp,
  initialBirthDate,
  initialGender,
  initialVisibleMetrics,
  initialTab = "connections",
  weeklyAvailability: initialWeeklyAvailability,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileModalTab>(
    initialTab === "intervals" || initialTab === "ai" ? "connections" : initialTab
  );

  const [athleteId, setAthleteId] = useState<string>(initialAthleteId);
  const [apiKey, setApiKey] = useState<string>("");
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [temperature, setTemperature] = useState<number>(0.0);
  const [fallbackModels] = useState<string[]>(["gemini-2.0-flash", "gemini-1.5-pro"]);
  const [enableGrounding] = useState<boolean>(false);
  const [coachProfile, setCoachProfile] = useState<string>("olympic");
  const [customPrompt] = useState<string>("");

  const [birthDate, setBirthDate] = useState<string>(initialBirthDate || "1988-05-15");
  const [gender, setGender] = useState<"M" | "F" | "OTHER">(initialGender || "M");
  const [runFtp, setRunFtp] = useState<number>(initialRunFtp || 0);
  const [bikeFtp, setBikeFtp] = useState<number>(initialBikeFtp || 0);
  const [weightKg, setWeightKg] = useState<number>(84);
  const [restingHR, setRestingHR] = useState<number>(46);
  const [lthr, setLthr] = useState<number>(168);
  const [maxHR, setMaxHR] = useState<number>(185);

  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailabilityMap>(
    initialWeeklyAvailability || DEFAULT_WEEKLY_AVAILABILITY
  );
  const [visibleMetrics, setVisibleMetrics] = useState<string[]>(
    initialVisibleMetrics || DEFAULT_VISIBLE_METRICS
  );

  const [saving, setSaving] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [availableModels, setAvailableModels] = useState<GeminiModelDto[]>([]);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);

  const calculatedAge = useMemo(() => {
    if (!birthDate) return 38;
    const dob = new Date(birthDate);
    if (isNaN(dob.getTime())) return 38;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    return age > 0 ? age : 38;
  }, [birthDate]);

  const tanakaMaxHR = useMemo(() => Math.round(208 - 0.7 * calculatedAge), [calculatedAge]);

  const relativePower = useMemo(() => {
    if (runFtp > 0 && weightKg > 0) return (runFtp / weightKg).toFixed(2);
    return null;
  }, [runFtp, weightKg]);

  const fetchGeminiModels = async (forceRefresh = false) => {
    setLoadingModels(true);
    try {
      const res = await fetch(`/api/gemini/models?refresh=${forceRefresh ? "true" : "false"}`);
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          setAvailableModels(data.models);
        }
      }
    } catch {
      // Ignorar errores de red en polling de modelos
    } finally {
      setLoadingModels(false);
    }
  };

  const handleTestConnection = async () => {
    if (!athleteId || !apiKey) {
      setToastMessage("Por favor ingresa tu Athlete ID y API Key de Intervals.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setTestingConnection(true);
    try {
      const res = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, apiKey }),
      });
      const data = await res.json();
      if (data.success) {
        const detectedResting = data.restingHR || data.athlete?.icu_resting_hr;
        const detectedWeight = data.weight || data.athlete?.weight || data.athlete?.icu_weight;
        const detectedRunFtp = data.runFtp || data.athlete?.icu_running_ftp || data.athlete?.run_ftp;
        const detectedBikeFtp = data.bikeFtp || data.athlete?.icu_ftp || data.athlete?.bike_ftp;
        const detectedLthr = data.lthr || data.athlete?.lthr;
        const detectedMaxHr = data.maxHR || data.athlete?.max_hr || data.athlete?.maxHR;

        if (detectedResting) setRestingHR(detectedResting);
        if (detectedWeight) setWeightKg(detectedWeight);
        if (detectedRunFtp) setRunFtp(detectedRunFtp);
        if (detectedBikeFtp) setBikeFtp(detectedBikeFtp);
        if (detectedLthr) setLthr(detectedLthr);
        if (detectedMaxHr) setMaxHR(detectedMaxHr);

        const name = data.athleteName || data.athlete?.name || "Atleta";
        setToastMessage(`✓ Conexión exitosa con Intervals.icu (${name})`);
      } else {
        setToastMessage(`Error de conexión: ${data.error || "Credenciales inválidas"}`);
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch {
      setToastMessage("Error de red al probar conexión con Intervals.icu.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const storedApiKey = localStorage.getItem("sgea_intervals_api_key");
      const storedAthleteId = localStorage.getItem("sgea_intervals_athlete_id");
      const storedBirthDate = localStorage.getItem("sgea_birthdate");
      const storedGender = localStorage.getItem("sgea_gender");
      const storedRunFtp = localStorage.getItem("sgea_run_ftp");
      const storedWeight = localStorage.getItem("sgea_athlete_weight");
      const storedBikeFtp = localStorage.getItem("sgea_bike_ftp");
      const storedResting = localStorage.getItem("sgea_resting_hr");
      const storedMaxHR = localStorage.getItem("sgea_max_hr");
      const storedLthr = localStorage.getItem("sgea_lthr");
      const storedGeminiKey = localStorage.getItem("sgea_custom_gemini_key");
      const storedModel = localStorage.getItem("sgea_selected_model");
      const storedTemp = localStorage.getItem("sgea_temperature");
      const storedCoach = localStorage.getItem("sgea_coach_profile");
      const storedAvail = localStorage.getItem("sgea_weekly_availability");
      const storedVisibleMetrics = localStorage.getItem("sgea_visible_metrics");

      if (storedApiKey) setApiKey(storedApiKey);
      if (storedAthleteId) setAthleteId(storedAthleteId);
      else if (initialAthleteId) setAthleteId(initialAthleteId);

      if (storedBirthDate) setBirthDate(storedBirthDate);
      else if (initialBirthDate) setBirthDate(initialBirthDate);

      if (storedGender && (storedGender === "M" || storedGender === "F" || storedGender === "OTHER")) {
        setGender(storedGender as "M" | "F" | "OTHER");
      } else if (initialGender) setGender(initialGender);

      if (storedRunFtp) setRunFtp(Number(storedRunFtp));
      else if (initialRunFtp) setRunFtp(initialRunFtp);

      if (storedWeight) setWeightKg(Number(storedWeight));
      if (storedBikeFtp) setBikeFtp(Number(storedBikeFtp));
      else if (initialBikeFtp) setBikeFtp(initialBikeFtp);

      if (storedResting) setRestingHR(Number(storedResting));
      if (storedMaxHR) setMaxHR(Number(storedMaxHR));
      if (storedLthr) setLthr(Number(storedLthr));

      if (storedGeminiKey) setGeminiApiKey(storedGeminiKey);
      if (storedModel) setSelectedModel(storedModel);
      if (storedTemp) setTemperature(Number(storedTemp));
      if (storedCoach) setCoachProfile(storedCoach);

      if (storedAvail) {
        try {
          const parsed = JSON.parse(storedAvail);
          if (parsed && typeof parsed === "object") setWeeklyAvailability(parsed);
        } catch {}
      } else if (initialWeeklyAvailability) {
        setWeeklyAvailability(initialWeeklyAvailability);
      }

      if (storedVisibleMetrics) {
        try {
          const parsed = JSON.parse(storedVisibleMetrics);
          if (Array.isArray(parsed) && parsed.length > 0) setVisibleMetrics(parsed);
        } catch {}
      } else if (initialVisibleMetrics) {
        setVisibleMetrics(initialVisibleMetrics);
      }

      fetchGeminiModels();
    }
  }, [isOpen, initialAthleteId, initialRunFtp, initialBikeFtp, initialBirthDate, initialGender, initialWeeklyAvailability, initialVisibleMetrics]);

  const handleToggleDayDiscipline = (dayKey: string, disc: DisciplineType) => {
    setWeeklyAvailability((prev) => {
      const currentList = normalizeDisciplines(prev[dayKey]);
      if (disc === "Descanso") {
        return { ...prev, [dayKey]: ["Descanso"] };
      }
      let nextList = currentList.filter((d) => d !== "Descanso") as DisciplineType[];
      if (nextList.includes(disc)) {
        nextList = nextList.filter((d) => d !== disc) as DisciplineType[];
        if (nextList.length === 0) nextList = ["Descanso"];
      } else {
        nextList.push(disc);
      }
      return { ...prev, [dayKey]: nextList };
    });
  };

  const handleToggleMetric = (id: string) => {
    setVisibleMetrics((prev) => {
      const next = prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id];
      localStorage.setItem("sgea_visible_metrics", JSON.stringify(next));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem("sgea_intervals_api_key", apiKey);
      localStorage.setItem("sgea_intervals_athlete_id", athleteId);
      localStorage.setItem("sgea_birthdate", birthDate);
      localStorage.setItem("sgea_gender", gender);
      localStorage.setItem("sgea_run_ftp", runFtp.toString());
      localStorage.setItem("sgea_athlete_weight", weightKg.toString());
      localStorage.setItem("sgea_bike_ftp", bikeFtp.toString());
      localStorage.setItem("sgea_resting_hr", restingHR.toString());
      localStorage.setItem("sgea_max_hr", maxHR.toString());
      localStorage.setItem("sgea_lthr", lthr.toString());
      localStorage.setItem("sgea_custom_gemini_key", geminiApiKey);
      localStorage.setItem("sgea_selected_model", selectedModel);
      localStorage.setItem("sgea_temperature", temperature.toString());
      localStorage.setItem("sgea_fallback_models", JSON.stringify(fallbackModels));
      localStorage.setItem("sgea_enable_grounding", enableGrounding ? "true" : "false");
      localStorage.setItem("sgea_coach_profile", coachProfile);
      localStorage.setItem("sgea_custom_prompt", customPrompt);
      localStorage.setItem("sgea_weekly_availability", JSON.stringify(weeklyAvailability));
      localStorage.setItem("sgea_visible_metrics", JSON.stringify(visibleMetrics));

      await onSave({
        athleteId,
        apiKey: apiKey || undefined,
        birthDate,
        gender,
        runFtp,
        weightKg,
        bikeFtp,
        restingHR,
        maxHR,
        lthr,
        focus: "BUILD",
        geminiApiKey: geminiApiKey || undefined,
        selectedModel,
        coachProfile,
        customPrompt,
        weeklyAvailability,
        visibleMetrics,
      });

      setToastMessage("¡Configuración y parámetros guardados correctamente!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 700);
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      setToastMessage("Error al guardar cambios.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="card-gradient rounded-3xl p-5 sm:p-7 max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between animate-scaleUp overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 border border-amber-500/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Ajustes del Atleta & Fisiología
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Conexiones, disponibilidad semanal y parámetros fisiológicos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 3 Pestañas Estructuradas */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 px-2 sm:px-4 shrink-0 text-center">
          <button
            type="button"
            onClick={() => setActiveTab("connections")}
            className={`py-3 px-1.5 text-[11px] sm:text-xs font-black border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "connections"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-white/50 dark:bg-slate-900/50"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>1. Conexiones</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("availability")}
            className={`py-3 px-1.5 text-[11px] sm:text-xs font-black border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "availability"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-white/50 dark:bg-slate-900/50"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>2. Semana Tipo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("physiology")}
            className={`py-3 px-1.5 text-[11px] sm:text-xs font-black border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "physiology"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-white/50 dark:bg-slate-900/50"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            <span>3. Fisiología</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[75vh]">
          {activeTab === "connections" && (
            <ProfileConnectionsTab
              athleteId={athleteId}
              setAthleteId={setAthleteId}
              apiKey={apiKey}
              setApiKey={setApiKey}
              geminiApiKey={geminiApiKey}
              setGeminiApiKey={setGeminiApiKey}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              temperature={temperature}
              setTemperature={setTemperature}
              coachProfile={coachProfile}
              setCoachProfile={setCoachProfile}
              testingConnection={testingConnection}
              onTestConnection={handleTestConnection}
              availableModels={availableModels}
              loadingModels={loadingModels}
              onRefreshModels={() => fetchGeminiModels(true)}
            />
          )}

          {activeTab === "availability" && (
            <ProfileAvailabilityTab
              weeklyAvailability={weeklyAvailability}
              onToggleDayDiscipline={handleToggleDayDiscipline}
            />
          )}

          {activeTab === "physiology" && (
            <ProfilePhysiologyTab
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              calculatedAge={calculatedAge}
              gender={gender}
              setGender={setGender}
              runFtp={runFtp}
              setRunFtp={setRunFtp}
              bikeFtp={bikeFtp}
              setBikeFtp={setBikeFtp}
              weightKg={weightKg}
              setWeightKg={setWeightKg}
              relativePower={relativePower}
              restingHR={restingHR}
              setRestingHR={setRestingHR}
              lthr={lthr}
              setLthr={setLthr}
              maxHR={maxHR}
              setMaxHR={setMaxHR}
              tanakaMaxHR={tanakaMaxHR}
              visibleMetrics={visibleMetrics}
              onToggleMetric={handleToggleMetric}
            />
          )}

          {/* Botonera de Guardar */}
          <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 hover:brightness-105 px-6 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4 text-slate-950" />
              <span>{saving ? "Guardando..." : "Guardar Ajustes Fisiológicos"}</span>
            </button>
          </div>
        </form>

        {/* Toast Notificación */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-black text-slate-950 shadow-xl animate-fadeIn flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-slate-950" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
