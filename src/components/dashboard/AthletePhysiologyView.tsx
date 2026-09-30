"use client";

import React, { useState, useEffect } from "react";
import { User, Check, Zap, CalendarDays, Radio } from "lucide-react";
import { WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, DisciplineType, normalizeDisciplines } from "@/lib/gemini/engine";
import { RunningTrainingMode } from "@/lib/db/types";
import { parsePaceToSeconds } from "@/lib/physiology/runningWorkoutAdapter";
import { AthleteZonesTab } from "../profile/AthleteZonesTab";
import { AthleteBioProfileTab } from "../profile/AthleteBioProfileTab";
import { AthleteIntervalsTab } from "../profile/AthleteIntervalsTab";
import { ProfileAvailabilityTab } from "../profile/ProfileAvailabilityTab";
import { QuickThresholdModal, EditableThresholdMetric } from "../profile/QuickThresholdModal";
import { AthletePhysiologyViewProps } from "./AthletePhysiologyView.types";

export type AthleteViewTab = "zones" | "profile" | "availability" | "intervals";

export const AthletePhysiologyView: React.FC<AthletePhysiologyViewProps> = ({
  athleteId: initialAthleteId = "", athleteName: initialAthleteName = "Atleta", email = "",
  runFtp: initialRunFtp = 0, bikeFtp: initialBikeFtp = 0, weightKg: initialWeight, heightCm: initialHeight,
  birthDate: initialBirthDate = "", gender: initialGender, restingHR: initialRestingHR, lthr: initialLthr, maxHR: initialMaxHR,
  hasRunningPowerMeter: initialHasPower, runningTrainingMode: initialRunningMode,
  runThresholdPaceStr: initialThresholdPaceStr, runThresholdPaceSecPerKm: initialThresholdPaceSec,
  apiKey: initialApiKey = "", ctl, atl, tsb, weeklyAvailability: initialAvailability, isLiveConnected = false,
  suggestedBikeFtp, suggestedRunPace, onApplySuggestion, onDismissSuggestion,
  onTestConnection, onSave, onUpdateAvailability,
}) => {
  const [activeTab, setActiveTab] = useState<AthleteViewTab>("zones");
  const [quickEditMetric, setQuickEditMetric] = useState<EditableThresholdMetric | null>(null);
  const [athleteId, setAthleteId] = useState<string>(initialAthleteId);
  const [athleteName, setAthleteName] = useState<string>(initialAthleteName);
  const [runFtp, setRunFtp] = useState<number>(initialRunFtp || 0);
  const [bikeFtp, setBikeFtp] = useState<number>(initialBikeFtp || 0);
  const [weightKg, setWeightKg] = useState<number | undefined>(initialWeight);
  const [heightCm, setHeightCm] = useState<number | undefined>(initialHeight ? (initialHeight < 3 && initialHeight > 0 ? Math.round(initialHeight * 100) : Math.round(initialHeight)) : undefined);
  const [birthDate, setBirthDate] = useState<string>(initialBirthDate);
  const [gender, setGender] = useState<"M" | "F" | "OTHER" | undefined>(initialGender);
  const [apiKey, setApiKey] = useState<string>(initialApiKey);
  const [restingHR, setRestingHR] = useState<number | undefined>(initialRestingHR);
  const [lthr, setLthr] = useState<number | undefined>(initialLthr);
  const [maxHR, setMaxHR] = useState<number | undefined>(initialMaxHR);
  const [hasRunningPowerMeter, setHasRunningPowerMeter] = useState<boolean>(initialHasPower ?? (initialRunFtp > 0));
  const [runningTrainingMode, setRunningTrainingMode] = useState<RunningTrainingMode>(initialRunningMode || (initialRunFtp > 0 ? "POWER" : "HYBRID"));
  const [runThresholdPaceStr, setRunThresholdPaceStr] = useState<string>(initialThresholdPaceStr || "4:45");
  const [runThresholdPaceSecPerKm, setRunThresholdPaceSecPerKm] = useState<number>(initialThresholdPaceSec || 285);
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailabilityMap>(initialAvailability || DEFAULT_WEEKLY_AVAILABILITY);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialAvailability) setWeeklyAvailability(initialAvailability);
    if (initialAthleteId) setAthleteId(initialAthleteId);
    if (initialApiKey !== undefined) setApiKey(initialApiKey);
    if (initialAthleteName) setAthleteName(initialAthleteName);
    if (initialRunFtp !== undefined) setRunFtp(initialRunFtp);
    if (initialBikeFtp !== undefined) setBikeFtp(initialBikeFtp);
    if (initialWeight !== undefined) setWeightKg(initialWeight);
    if (initialHeight !== undefined) setHeightCm(initialHeight < 3 && initialHeight > 0 ? Math.round(initialHeight * 100) : Math.round(initialHeight));
    if (initialBirthDate) setBirthDate(initialBirthDate);
    if (initialGender) setGender(initialGender);
    if (initialRestingHR !== undefined) setRestingHR(initialRestingHR);
    if (initialLthr !== undefined) setLthr(initialLthr);
    if (initialMaxHR !== undefined) setMaxHR(initialMaxHR);
    if (initialHasPower !== undefined) setHasRunningPowerMeter(initialHasPower);
    if (initialRunningMode !== undefined) setRunningTrainingMode(initialRunningMode);
    if (initialThresholdPaceStr !== undefined) setRunThresholdPaceStr(initialThresholdPaceStr);
    if (initialThresholdPaceSec !== undefined) setRunThresholdPaceSecPerKm(initialThresholdPaceSec);
  }, [initialAvailability, initialAthleteId, initialApiKey, initialAthleteName, initialRunFtp, initialBikeFtp, initialWeight, initialHeight, initialBirthDate, initialGender, initialRestingHR, initialLthr, initialMaxHR, initialHasPower, initialRunningMode, initialThresholdPaceStr, initialThresholdPaceSec]);

  const calculatedAge = React.useMemo(() => {
    if (!birthDate) return undefined;
    const diff = Date.now() - new Date(birthDate).getTime();
    if (isNaN(diff) || diff <= 0) return undefined;
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }, [birthDate]);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleToggleDayDiscipline = (dayKey: string, disc: DisciplineType) => {
    const current = normalizeDisciplines(weeklyAvailability[dayKey]);
    let updated: DisciplineType[] = [];
    if (disc === "Descanso") updated = ["Descanso"];
    else {
      const withoutRest = current.filter((d: DisciplineType) => d !== "Descanso");
      updated = withoutRest.includes(disc) ? withoutRest.filter((d) => d !== disc) : [...withoutRest, disc];
      if (updated.length === 0) updated = ["Descanso"];
    }
    setWeeklyAvailability({ ...weeklyAvailability, [dayKey]: updated });
  };

  const handleSaveAvailability = async (mapToSave: WeeklyAvailabilityMap) => {
    setWeeklyAvailability(mapToSave);
    if (onUpdateAvailability) await onUpdateAvailability(mapToSave);
    else await onSave({ weeklyAvailability: mapToSave });
    showNotification("Matriz semanal guardada con éxito.");
  };

  const handleResetCanonical = async () => {
    const canonical: WeeklyAvailabilityMap = {
      Lunes: ["Descanso"], Martes: ["Carrera"], Miércoles: ["Ciclismo"], Jueves: ["Fuerza"],
      Viernes: ["Carrera", "Fuerza"], Sábado: ["Ciclismo"], Domingo: ["Carrera"],
    };
    setWeeklyAvailability(canonical);
    if (onUpdateAvailability) await onUpdateAvailability(canonical);
    else await onSave({ weeklyAvailability: canonical });
    showNotification("Matriz restablecida a la configuración recomendada.");
  };

  const handleSaveBio = async (bioData: { displayName: string; birthDate?: string; gender?: "M" | "F" | "OTHER"; weightKg?: number; heightCm?: number }) => {
    setAthleteName(bioData.displayName);
    if (bioData.birthDate !== undefined) setBirthDate(bioData.birthDate);
    if (bioData.gender !== undefined) setGender(bioData.gender);
    if (bioData.weightKg !== undefined) setWeightKg(bioData.weightKg);
    if (bioData.heightCm !== undefined) setHeightCm(bioData.heightCm);

    await onSave({
      displayName: bioData.displayName, birthDate: bioData.birthDate, gender: bioData.gender,
      weightKg: bioData.weightKg, heightCm: bioData.heightCm,
      runFtp, bikeFtp, lthr, restingHR, maxHR, hasRunningPowerMeter, runningTrainingMode,
      runThresholdPaceStr, runThresholdPaceSecPerKm, intervalsAthleteId: athleteId, apiKey, weeklyAvailability,
    });
    showNotification("Perfil antropométrico guardado y sincronizado.");
  };

  const handleSaveIntervals = async (creds: { athleteId: string; apiKey: string }) => {
    setAthleteId(creds.athleteId);
    setApiKey(creds.apiKey);
    await onSave({
      intervalsAthleteId: creds.athleteId, apiKey: creds.apiKey,
      displayName: athleteName, birthDate, gender, weightKg, heightCm,
      runFtp, bikeFtp, lthr, restingHR, maxHR, hasRunningPowerMeter, runningTrainingMode,
      runThresholdPaceStr, runThresholdPaceSecPerKm, weeklyAvailability,
    });
    showNotification("Credenciales de Intervals.icu guardadas.");
  };

  const handleToggleRunningMode = async (newMode: RunningTrainingMode) => {
    const hasPower = newMode === "POWER";
    setRunningTrainingMode(newMode);
    setHasRunningPowerMeter(hasPower);
    await onSave({
      runningTrainingMode: newMode, hasRunningPowerMeter: hasPower,
      runFtp, bikeFtp, weightKg, heightCm, birthDate, gender, lthr, restingHR, maxHR,
      runThresholdPaceStr, runThresholdPaceSecPerKm, displayName: athleteName, weeklyAvailability,
    });
    showNotification(`Modo cambiado a: ${newMode === "POWER" ? "Potencia Carrera" : "Híbrido (Ritmo + FC)"}`);
  };

  const handleUpdateThreshold = async (metric: "RUN_PACE" | "RUN_FTP" | "BIKE_FTP" | "LTHR", val: string | number) => {
    let pSec = runThresholdPaceSecPerKm;
    let pStr = runThresholdPaceStr;
    let rFtp = runFtp;
    let bFtp = bikeFtp;
    let hLthr = lthr;

    if (metric === "RUN_PACE") {
      pStr = String(val);
      pSec = parsePaceToSeconds(pStr);
      setRunThresholdPaceStr(pStr);
      setRunThresholdPaceSecPerKm(pSec);
    } else if (metric === "RUN_FTP") {
      rFtp = Number(val);
      setRunFtp(rFtp);
    } else if (metric === "BIKE_FTP") {
      bFtp = Number(val);
      setBikeFtp(bFtp);
    } else if (metric === "LTHR") {
      hLthr = Number(val);
      setLthr(hLthr);
    }

    await onSave({
      runFtp: rFtp, bikeFtp: bFtp, lthr: hLthr, restingHR, maxHR,
      weightKg, heightCm, birthDate, gender, displayName: athleteName,
      runThresholdPaceStr: pStr, runThresholdPaceSecPerKm: pSec,
      hasRunningPowerMeter, runningTrainingMode, weeklyAvailability,
    });
    showNotification("Umbral actualizado y sincronizado.");
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* 1. Header Principal */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-sky-500" />
            Perfil del Atleta & Fisiología
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de umbrales, biometría, matriz de disponibilidad y sincronización Intervals.icu.
          </p>
        </div>
        {successMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono animate-fadeIn">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* 2. Barra de Pestañas */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("zones")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === "zones"
              ? "bg-amber-500 text-slate-950 font-black shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>Zonas & Umbrales</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === "profile"
              ? "bg-sky-500 text-white font-black shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Perfil & Biometría</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("availability")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === "availability"
              ? "bg-emerald-500 text-white font-black shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          <span>Disponibilidad</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("intervals")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === "intervals"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Radio className="h-4 w-4 text-sky-500" />
          <span>Conexión Intervals</span>
          {isLiveConnected || !!apiKey ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          )}
        </button>
      </div>

      {/* 3. Contenido de Pestaña */}
      {activeTab === "zones" && (
        <AthleteZonesTab
          athleteName={athleteName} email={email} calculatedAge={calculatedAge} birthDate={birthDate}
          gender={gender} weightKg={weightKg} heightCm={heightCm} runFtp={runFtp} bikeFtp={bikeFtp}
          lthr={lthr} restingHR={restingHR} maxHR={maxHR} hasRunningPowerMeter={hasRunningPowerMeter}
          runningTrainingMode={runningTrainingMode} runThresholdPaceStr={runThresholdPaceStr}
          runThresholdPaceSecPerKm={runThresholdPaceSecPerKm} suggestedBikeFtp={suggestedBikeFtp}
          suggestedRunPace={suggestedRunPace} onNavigateToProfile={() => setActiveTab("profile")}
          onToggleMode={handleToggleRunningMode} onEditThreshold={(m) => setQuickEditMetric(m)}
          onUpdateThreshold={handleUpdateThreshold} onApplySuggestion={onApplySuggestion}
          onDismissSuggestion={onDismissSuggestion}
        />
      )}

      {activeTab === "profile" && (
        <div className="animate-fadeIn">
          <AthleteBioProfileTab
            athleteName={athleteName} email={email} birthDate={birthDate} gender={gender}
            weightKg={weightKg} heightCm={heightCm} onSaveBio={handleSaveBio}
          />
        </div>
      )}

      {activeTab === "availability" && (
        <div className="animate-fadeIn">
          <ProfileAvailabilityTab
            weeklyAvailability={weeklyAvailability} onToggleDayDiscipline={handleToggleDayDiscipline}
            onSaveAvailability={handleSaveAvailability} onResetToCanonical={handleResetCanonical}
          />
        </div>
      )}

      {activeTab === "intervals" && (
        <div className="animate-fadeIn">
          <AthleteIntervalsTab
            athleteId={athleteId} apiKey={apiKey} isLiveConnected={isLiveConnected}
            onSaveCredentials={handleSaveIntervals} onTestConnection={onTestConnection}
          />
        </div>
      )}

      {/* 4. Modal de Edición Rápida de Umbral [ ✎ Ajustar ] */}
      <QuickThresholdModal
        isOpen={Boolean(quickEditMetric)}
        metric={quickEditMetric}
        currentValue={
          quickEditMetric === "RUN_PACE" ? runThresholdPaceStr :
          quickEditMetric === "RUN_FTP" ? runFtp :
          quickEditMetric === "BIKE_FTP" ? bikeFtp :
          quickEditMetric === "LTHR" ? (lthr || 0) : ""
        }
        onClose={() => setQuickEditMetric(null)}
        onSave={async (m, v) => {
          await handleUpdateThreshold(m, v);
        }}
      />
    </div>
  );
};
