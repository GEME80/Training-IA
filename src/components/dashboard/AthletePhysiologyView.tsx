"use client";

import React, { useState, useEffect } from "react";
import { User, Check, Zap, CalendarDays, Radio } from "lucide-react";
import { WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, DisciplineType, normalizeDisciplines } from "@/lib/gemini/engine";
import { RunningTrainingMode } from "@/lib/db/types";
import { parsePaceToSeconds } from "@/lib/physiology/runningWorkoutAdapter";
import { AthleteProfileHeroCard } from "../profile/AthleteProfileHeroCard";
import { AthleteZonesViewer } from "../profile/AthleteZonesViewer";
import { AthleteEditProfileModal, AthleteProfileFormData } from "../profile/AthleteEditProfileModal";
import { ProfileAvailabilityTab } from "../profile/ProfileAvailabilityTab";
import { AthleteIntervalsConnectionCard } from "../profile/AthleteIntervalsConnectionCard";
import { AthleteCollapsibleSection } from "../profile/AthleteCollapsibleSection";
import { QuickThresholdModal, EditableThresholdMetric } from "../profile/QuickThresholdModal";
import { AthletePhysiologyViewProps } from "./AthletePhysiologyView.types";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    if (disc === "Descanso") {
      updated = ["Descanso"];
    } else {
      const withoutRest = current.filter((d: DisciplineType) => d !== "Descanso");
      updated = withoutRest.includes(disc) ? withoutRest.filter((d) => d !== disc) : [...withoutRest, disc];
      if (updated.length === 0) updated = ["Descanso"];
    }
    const newMap: WeeklyAvailabilityMap = { ...weeklyAvailability, [dayKey]: updated };
    setWeeklyAvailability(newMap);
  };

  const handleSaveAvailability = async (mapToSave: WeeklyAvailabilityMap) => {
    setWeeklyAvailability(mapToSave);
    if (onUpdateAvailability) await onUpdateAvailability(mapToSave);
    else await onSave({ weeklyAvailability: mapToSave });
    showNotification("Matriz semanal guardada con éxito en la base de datos.");
  };

  const handleResetCanonical = async () => {
    const canonical: WeeklyAvailabilityMap = {
      Lunes: ["Descanso"], Martes: ["Carrera"], Miércoles: ["Ciclismo"], Jueves: ["Fuerza"],
      Viernes: ["Carrera", "Fuerza"], Sábado: ["Ciclismo"], Domingo: ["Carrera"],
    };
    setWeeklyAvailability(canonical);
    if (onUpdateAvailability) await onUpdateAvailability(canonical);
    else await onSave({ weeklyAvailability: canonical });
    showNotification("Matriz restablecida a la configuración canónica recomendada.");
  };

  const handleSaveModalData = async (data: AthleteProfileFormData) => {
    if (data.displayName) setAthleteName(data.displayName);
    if (data.runFtp !== undefined) setRunFtp(data.runFtp);
    if (data.bikeFtp !== undefined) setBikeFtp(data.bikeFtp);
    if (data.weightKg !== undefined) setWeightKg(data.weightKg);
    if (data.heightCm !== undefined) setHeightCm(data.heightCm);
    if (data.birthDate) setBirthDate(data.birthDate);
    if (data.gender) setGender(data.gender);
    if (data.lthr !== undefined) setLthr(data.lthr);
    if (data.restingHR !== undefined) setRestingHR(data.restingHR);
    if (data.maxHR !== undefined) setMaxHR(data.maxHR);
    if (data.hasRunningPowerMeter !== undefined) setHasRunningPowerMeter(data.hasRunningPowerMeter);
    if (data.runningTrainingMode) setRunningTrainingMode(data.runningTrainingMode);
    if (data.runThresholdPaceStr) setRunThresholdPaceStr(data.runThresholdPaceStr);
    if (data.runThresholdPaceSecPerKm !== undefined) setRunThresholdPaceSecPerKm(data.runThresholdPaceSecPerKm);
    if (data.intervalsAthleteId) setAthleteId(data.intervalsAthleteId);
    if (data.apiKey) setApiKey(data.apiKey);

    await onSave({ ...data, weeklyAvailability });
    showNotification("Perfil y umbrales guardados con éxito");
  };

  const handleToggleRunningMode = async (newMode: RunningTrainingMode) => {
    const hasPower = newMode === "POWER";
    setRunningTrainingMode(newMode);
    setHasRunningPowerMeter(hasPower);
    await onSave({
      runningTrainingMode: newMode,
      hasRunningPowerMeter: hasPower,
      runFtp,
      bikeFtp,
      weightKg,
      heightCm,
      birthDate,
      gender,
      lthr,
      restingHR,
      maxHR,
      runThresholdPaceStr,
      runThresholdPaceSecPerKm,
      displayName: athleteName,
      weeklyAvailability,
    });
    showNotification(
      `Modo de carrera cambiado a: ${newMode === "POWER" ? "⚡ Potencia Stryd" : "⏱️❤️ Híbrido (Ritmo + FC)"}`
    );
  };

  const handleUpdateThreshold = async (
    metric: "RUN_PACE" | "RUN_FTP" | "BIKE_FTP" | "LTHR",
    val: string | number
  ) => {
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
      runFtp: rFtp,
      bikeFtp: bFtp,
      lthr: hLthr,
      restingHR,
      maxHR,
      weightKg,
      heightCm,
      birthDate,
      gender,
      displayName: athleteName,
      runThresholdPaceStr: pStr,
      runThresholdPaceSecPerKm: pSec,
      hasRunningPowerMeter,
      runningTrainingMode,
      weeklyAvailability,
    });
    showNotification("Umbral actualizado y sincronizado.");
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-sky-500" />
            Perfil del Atleta & Fisiología
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Parámetros antropométricos, potencia crítica Stryd, FTP de ciclismo, ritmo umbral y zonas.
          </p>
        </div>
        {successMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono animate-fadeIn">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* 1. HERO ATHLETE CARD */}
      <AthleteProfileHeroCard
        athleteName={athleteName}
        email={email}
        calculatedAge={calculatedAge}
        birthDate={birthDate}
        gender={gender}
        weightKg={weightKg}
        heightCm={heightCm}
        runFtp={runFtp}
        bikeFtp={bikeFtp}
        lthr={lthr}
        restingHR={restingHR}
        maxHR={maxHR}
        hasRunningPowerMeter={hasRunningPowerMeter}
        runningTrainingMode={runningTrainingMode}
        runThresholdPaceStr={runThresholdPaceStr}
        runThresholdPaceSecPerKm={runThresholdPaceSecPerKm}
        onOpenEditModal={() => setIsEditModalOpen(true)}
        onToggleMode={handleToggleRunningMode}
        onEditThreshold={(m) => setQuickEditMetric(m)}
      />

      {/* 2. VISOR MULTI-DEPORTE DE ZONAS */}
      <AthleteCollapsibleSection
        id="section-zones"
        title="Zonas de Entrenamiento & Ritmos"
        subtitle={hasRunningPowerMeter ? "Potencia Stryd CP, Ciclismo FTP y Frecuencia Cardíaca (LTHR)" : "Ritmo Umbral (Z1-Z6), Ciclismo FTP y Frecuencia Cardíaca (LTHR)"}
        icon={Zap}
        iconColor="text-amber-500"
        defaultOpenMobile={true}
        summaryBadge={
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold border border-amber-500/20">
            {hasRunningPowerMeter ? `${runFtp}W CP` : `${runThresholdPaceStr}/km`} • {bikeFtp > 0 ? `${bikeFtp}W FTP` : "Sin FTP"}
          </span>
        }
      >
        <AthleteZonesViewer
          runFtp={runFtp}
          bikeFtp={bikeFtp}
          lthr={lthr || 0}
          maxHR={maxHR || 0}
          hasRunningPowerMeter={hasRunningPowerMeter}
          runningTrainingMode={runningTrainingMode}
          runThresholdPaceStr={runThresholdPaceStr}
          runThresholdPaceSecPerKm={runThresholdPaceSecPerKm}
          onUpdateThreshold={handleUpdateThreshold}
          suggestedBikeFtp={suggestedBikeFtp}
          suggestedRunPace={suggestedRunPace}
          onApplySuggestion={onApplySuggestion || (async (sug) => {
            if (sug.metric === "BIKE_FTP") await handleUpdateThreshold("BIKE_FTP", Number(sug.suggestedValue));
            else if (sug.metric === "RUN_PACE") await handleUpdateThreshold("RUN_PACE", String(sug.suggestedValue));
          })}
          onDismissSuggestion={onDismissSuggestion}
        />
      </AthleteCollapsibleSection>

      {/* 3. MATRIZ SEMANAL */}
      <AthleteCollapsibleSection
        id="section-availability"
        title="Matriz Semanal de Disponibilidad"
        subtitle="Distribución de días de carrera, rodillo, gimnasio y descansos fisiológicos"
        icon={CalendarDays}
        iconColor="text-emerald-500"
        summaryBadge={<span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/20">7 días</span>}
      >
        <ProfileAvailabilityTab weeklyAvailability={weeklyAvailability} onToggleDayDiscipline={handleToggleDayDiscipline} onSaveAvailability={handleSaveAvailability} onResetToCanonical={handleResetCanonical} />
      </AthleteCollapsibleSection>

      {/* 4. CONEXIÓN INTERVALS */}
      <AthleteCollapsibleSection
        id="section-intervals"
        title="Conexión Intervals"
        subtitle="Telemetría en vivo, credenciales AES-256 y sincronización deportiva"
        icon={Radio}
        iconColor="text-sky-500"
        summaryBadge={
          isLiveConnected || !!apiKey ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/20">
              🟢 ACTIVA{athleteId ? ` (${athleteId})` : ""}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold border border-rose-500/20">
              🔴 DESCONECTADO
            </span>
          )
        }
      >
        <AthleteIntervalsConnectionCard athleteId={athleteId} hasApiKey={isLiveConnected || !!apiKey} onOpenEditModal={() => setIsEditModalOpen(true)} onTestConnection={onTestConnection} />
      </AthleteCollapsibleSection>

      {/* 5. MODAL DE EDICIÓN */}
      <AthleteEditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{
          displayName: athleteName, email, birthDate, gender, weightKg, heightCm,
          runFtp, bikeFtp, lthr, restingHR, maxHR,
          hasRunningPowerMeter, runningTrainingMode, runThresholdPaceStr, runThresholdPaceSecPerKm,
          intervalsAthleteId: athleteId, apiKey,
        }}
        onSave={handleSaveModalData}
      />

      {/* 6. MODAL DE EDICIÓN RÁPIDA DE UMBRAL */}
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
