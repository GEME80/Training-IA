"use client";

import React, { useState, useEffect } from "react";
import { User, Check, Zap, CalendarDays, Radio } from "lucide-react";
import { WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, DisciplineType, normalizeDisciplines } from "@/lib/gemini/engine";
import { AthleteProfileHeroCard } from "../profile/AthleteProfileHeroCard";
import { AthleteZonesViewer } from "../profile/AthleteZonesViewer";
import { AthleteEditProfileModal } from "../profile/AthleteEditProfileModal";
import { ProfileAvailabilityTab } from "../profile/ProfileAvailabilityTab";
import { AthleteIntervalsConnectionCard } from "../profile/AthleteIntervalsConnectionCard";
import { AthleteCollapsibleSection } from "../profile/AthleteCollapsibleSection";

interface AthletePhysiologyViewProps {
  athleteId: string;
  athleteName?: string;
  email?: string;
  runFtp: number;
  bikeFtp: number;
  weightKg?: number;
  heightCm?: number;
  birthDate?: string;
  gender?: "M" | "F" | "OTHER";
  apiKey?: string;
  ctl: number;
  atl: number;
  tsb: number;
  weeklyAvailability: WeeklyAvailabilityMap;
  visibleMetrics?: string[];
  isLiveConnected?: boolean;
  onTestConnection?: (athleteId: string) => Promise<{ success: boolean; athleteName?: string; error?: string }>;
  onSave: (data: {
    displayName?: string;
    runFtp?: number;
    bikeFtp?: number;
    weeklyAvailability?: WeeklyAvailabilityMap;
    visibleMetrics?: string[];
    birthDate?: string;
    gender?: "M" | "F" | "OTHER";
    weightKg?: number;
    heightCm?: number;
    restingHR?: number;
    lthr?: number;
    maxHR?: number;
    intervalsAthleteId?: string;
    apiKey?: string;
  }) => Promise<void>;
}

export const AthletePhysiologyView: React.FC<AthletePhysiologyViewProps> = ({
  athleteId: initialAthleteId,
  athleteName: initialAthleteName = "German Morales",
  email = "german.morales@pulseai.pro",
  runFtp: initialRunFtp = 327,
  bikeFtp: initialBikeFtp = 240,
  weightKg: initialWeight = 84,
  heightCm: initialHeight = 178,
  birthDate: initialBirthDate = "1980-08-24",
  gender: initialGender = "M",
  apiKey: initialApiKey = "",
  ctl,
  atl,
  tsb,
  weeklyAvailability: initialAvailability,
  isLiveConnected = false,
  onTestConnection,
  onSave,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [athleteId, setAthleteId] = useState<string>(initialAthleteId);
  const [athleteName, setAthleteName] = useState<string>(initialAthleteName);
  const [runFtp, setRunFtp] = useState<number>(initialRunFtp || 327);
  const [bikeFtp, setBikeFtp] = useState<number>(initialBikeFtp || 240);
  const [weightKg, setWeightKg] = useState<number>(initialWeight);
  const [heightCm, setHeightCm] = useState<number>(initialHeight);
  const [birthDate, setBirthDate] = useState<string>(initialBirthDate);
  const [gender, setGender] = useState<"M" | "F" | "OTHER">(initialGender);
  const [apiKey, setApiKey] = useState<string>(initialApiKey);
  const [restingHR, setRestingHR] = useState<number>(45);
  const [lthr, setLthr] = useState<number>(168);
  const [maxHR, setMaxHR] = useState<number>(185);
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailabilityMap>(
    initialAvailability || DEFAULT_WEEKLY_AVAILABILITY
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialAvailability) {
      setWeeklyAvailability(initialAvailability);
    }
  }, [initialAvailability]);

  useEffect(() => {
    if (initialAthleteId) setAthleteId(initialAthleteId);
  }, [initialAthleteId]);

  useEffect(() => {
    if (initialApiKey !== undefined) setApiKey(initialApiKey);
  }, [initialApiKey]);

  useEffect(() => {
    if (initialAthleteName) setAthleteName(initialAthleteName);
  }, [initialAthleteName]);

  useEffect(() => {
    if (initialRunFtp) setRunFtp(initialRunFtp);
  }, [initialRunFtp]);

  useEffect(() => {
    if (initialBikeFtp) setBikeFtp(initialBikeFtp);
  }, [initialBikeFtp]);

  useEffect(() => {
    if (initialWeight) setWeightKg(initialWeight);
  }, [initialWeight]);

  useEffect(() => {
    if (initialHeight) setHeightCm(initialHeight);
  }, [initialHeight]);

  useEffect(() => {
    if (initialBirthDate) setBirthDate(initialBirthDate);
  }, [initialBirthDate]);

  useEffect(() => {
    if (initialGender) setGender(initialGender);
  }, [initialGender]);

  const calculatedAge = React.useMemo(() => {
    if (!birthDate) return 46;
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }, [birthDate]);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleToggleDayDiscipline = async (dayKey: string, disc: DisciplineType) => {
    const current = normalizeDisciplines(weeklyAvailability[dayKey]);
    let updated: DisciplineType[] = [];

    if (disc === "Descanso") {
      updated = ["Descanso"];
    } else {
      const withoutRest = current.filter((d: DisciplineType) => d !== "Descanso");
      if (withoutRest.includes(disc)) {
        updated = withoutRest.filter((d: DisciplineType) => d !== disc);
        if (updated.length === 0) updated = ["Descanso"];
      } else {
        updated = [...withoutRest, disc];
      }
    }

    const newMap: WeeklyAvailabilityMap = {
      ...weeklyAvailability,
      [dayKey]: updated,
    };

    setWeeklyAvailability(newMap);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("sgea_weekly_availability", JSON.stringify(newMap));
    }
    await onSave({ weeklyAvailability: newMap });
    showNotification("Matriz semanal guardada con éxito");
  };

  const handleSaveModalData = async (data: {
    displayName?: string;
    birthDate?: string;
    gender?: "M" | "F" | "OTHER";
    weightKg?: number;
    heightCm?: number;
    runFtp?: number;
    bikeFtp?: number;
    lthr?: number;
    restingHR?: number;
    maxHR?: number;
    intervalsAthleteId?: string;
    apiKey?: string;
  }) => {
    if (data.displayName) setAthleteName(data.displayName);
    if (data.runFtp) setRunFtp(data.runFtp);
    if (data.bikeFtp) setBikeFtp(data.bikeFtp);
    if (data.weightKg) setWeightKg(data.weightKg);
    if (data.heightCm) setHeightCm(data.heightCm);
    if (data.birthDate) setBirthDate(data.birthDate);
    if (data.gender) setGender(data.gender);
    if (data.lthr) setLthr(data.lthr);
    if (data.restingHR) setRestingHR(data.restingHR);
    if (data.maxHR) setMaxHR(data.maxHR);
    if (data.intervalsAthleteId) setAthleteId(data.intervalsAthleteId);
    if (data.apiKey) setApiKey(data.apiKey);

    await onSave({
      ...data,
      weeklyAvailability,
    });
    showNotification("Perfil y umbrales guardados con éxito");
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-sky-500" />
            Perfil del Atleta & Fisiología
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Parámetros antropométricos, potencia crítica Stryd, FTP de ciclismo, zonas y sincronización cloud.
          </p>
        </div>

        {successMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono animate-fadeIn">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* 1. HERO ATHLETE CARD PRO (Resumen de Biometría & Umbrales) */}
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
        onOpenEditModal={() => setIsEditModalOpen(true)}
      />

      {/* 2. VISOR MULTI-DEPORTE DE ZONAS (Intervals.icu & Stryd) */}
      <AthleteCollapsibleSection
        id="section-zones"
        title="Zonas de Entrenamiento & Ritmos"
        subtitle="Potencia Stryd CP, Ciclismo FTP y Frecuencia Cardíaca (LTHR)"
        icon={Zap}
        iconColor="text-amber-500"
        summaryBadge={
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold border border-amber-500/20">
            {runFtp}W CP • {bikeFtp}W FTP
          </span>
        }
      >
        <AthleteZonesViewer
          runFtp={runFtp}
          bikeFtp={bikeFtp}
          lthr={lthr}
          maxHR={maxHR}
        />
      </AthleteCollapsibleSection>

      {/* 3. MATRIZ SEMANAL DE DISPONIBILIDAD (Alineada al Dashboard) */}
      <AthleteCollapsibleSection
        id="section-availability"
        title="Matriz Semanal de Disponibilidad"
        subtitle="Distribución de días de carrera, rodillo, gimnasio y descansos fisiológicos"
        icon={CalendarDays}
        iconColor="text-emerald-500"
        summaryBadge={
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/20">
            7 días configurados
          </span>
        }
      >
        <ProfileAvailabilityTab
          weeklyAvailability={weeklyAvailability}
          onToggleDayDiscipline={handleToggleDayDiscipline}
        />
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
              🟢 ACTIVA ({athleteId || "i442091"})
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold border border-rose-500/20">
              🔴 DESCONECTADO
            </span>
          )
        }
      >
        <AthleteIntervalsConnectionCard
          athleteId={athleteId}
          hasApiKey={isLiveConnected || !!apiKey}
          onOpenEditModal={() => setIsEditModalOpen(true)}
          onTestConnection={onTestConnection}
        />
      </AthleteCollapsibleSection>

      {/* 5. MODAL DE EDICIÓN ATÓMICO */}
      <AthleteEditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{
          displayName: athleteName,
          email,
          birthDate,
          gender,
          weightKg,
          heightCm,
          runFtp,
          bikeFtp,
          lthr,
          restingHR,
          maxHR,
          intervalsAthleteId: athleteId,
          apiKey,
        }}
        onSave={handleSaveModalData}
      />
    </div>
  );
};
