"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Trophy,
  HeartPulse,
  Calendar,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  Layers,
  ArrowRight,
  Zap,
  Activity,
  Footprints,
  Bike,
  ShieldCheck,
  Compass,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  WizardPlanConfig,
  calculateRaceTimeline,
  generateWizardMacrocycle,
  formatDate,
  getMonday,
} from "@/lib/physiology/macrocycleWizard";
import { MacrocycleBlueprint, TargetRace } from "@/lib/physiology/macrocycle";
import { MacrocyclePreviewTimeline } from "./MacrocyclePreviewTimeline";
import { WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY } from "@/lib/gemini/engine";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { AthleteProfile } from "@/lib/intervals/types";
import { AIMacrocycleResponse } from "@/lib/gemini/macrocycleAI";

interface MacrocycleWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AthleteProfile;
  physioStatus: PhysiologicalStatus | null;
  apiKey?: string;
  geminiApiKey?: string;
  selectedModel?: string;
  weeklyAvailability?: WeeklyAvailabilityMap;
  onApplyMacrocycle: (blueprint: MacrocycleBlueprint, primaryRace?: TargetRace, source?: "AI_GENERATED" | "WIZARD_CUSTOM") => void;
}

export const MacrocycleWizardModal: React.FC<MacrocycleWizardModalProps> = ({
  isOpen,
  onClose,
  profile,
  physioStatus,
  apiKey,
  geminiApiKey,
  selectedModel = "gemini-2.5-flash",
  weeklyAvailability = DEFAULT_WEEKLY_AVAILABILITY,
  onApplyMacrocycle,
}) => {
  // Estado del paso actual en el Wizard (1 a 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Paso 1 & 2: Tipo de Plan y Detalles
  const [hasRace, setHasRace] = useState<boolean>(true);
  const [raceName, setRaceName] = useState<string>("Maratón de Tokio 2027");
  const [raceDistance, setRaceDistance] = useState<any>("42k");
  const [raceDate, setRaceDate] = useState<string>("2027-03-07");
  const [raceGoal, setRaceGoal] = useState<string>("Sub-3h00m (280W Stryd)");

  const [athleteMoment, setAthleteMoment] = useState<any>("maintenance");
  const [momentWeeks, setMomentWeeks] = useState<number>(8);

  // Paso 3: Estrategia de Puente Pre-Temporada
  const [bridgeStrategy, setBridgeStrategy] = useState<"MAINTENANCE" | "BASE_GPP" | "EXTENDED_SPECIFIC">("MAINTENANCE");

  // Modalidad de Intensidad Rector (Potencia, FC, Ritmo o RPE)
  const [intensityMetric, setIntensityMetric] = useState<"POWER" | "HEART_RATE" | "PACE" | "RPE">("POWER");

  // Paso 5: Estado de Generación con IA
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIMacrocycleResponse | null>(null);

  // Cálculo de línea de tiempo
  const timeline = useMemo(() => {
    if (!hasRace || !raceDate) return null;
    return calculateRaceTimeline(raceDate, new Date(), 16);
  }, [hasRace, raceDate]);

  // Configuración acumulada del Wizard
  const wizardConfig: WizardPlanConfig = useMemo(() => {
    return {
      hasRace,
      raceName,
      raceDistance,
      raceDate,
      raceGoal,
      athleteMoment,
      bridgeStrategy,
      weeksCount: hasRace ? undefined : momentWeeks,
    };
  }, [hasRace, raceName, raceDistance, raceDate, raceGoal, athleteMoment, bridgeStrategy, momentWeeks]);

  // Blueprint base generado
  const currentBlueprint: MacrocycleBlueprint = useMemo(() => {
    if (aiResult?.blueprint) return aiResult.blueprint;
    return generateWizardMacrocycle(wizardConfig);
  }, [wizardConfig, aiResult]);

  // Ejecutar generación con IA
  const handleGenerateWithAI = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/macrocycles/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: profile.id,
          apiKey,
          customGeminiKey: geminiApiKey,
          selectedModel,
          wizardConfig,
          runFtp: profile.run_ftp,
          bikeFtp: profile.bike_ftp,
        }),
      });

      if (!res.ok) throw new Error("Error en la llamada de IA");

      const data = await res.json();
      if (data.success && data.aiResult) {
        setAiResult(data.aiResult);
      }
    } catch (err) {
      console.error("Error al generar macrociclo con IA:", err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleFinishAndSave = () => {
    const finalBlueprint = aiResult?.blueprint || currentBlueprint;
    const finalRace = finalBlueprint.primaryRace || undefined;
    onApplyMacrocycle(finalBlueprint, finalRace, aiResult ? "AI_GENERATED" : "WIZARD_CUSTOM");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="card-gradient relative w-full max-w-5xl rounded-2xl border border-slate-700 bg-slate-950 p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                Asistente de Macrociclos & Periodización de Temporada
              </h2>
              <p className="text-xs text-slate-400">
                Paso {currentStep} de 5 • Configuración guiada adaptativa según tu calendario y telemetría
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          {[
            { num: 1, label: "Objetivo" },
            { num: 2, label: hasRace ? "Carrera" : "Momento" },
            { num: 3, label: hasRace && timeline?.hasPreSeasonBridge ? "Puente Mantenimiento" : "Línea Temporal" },
            { num: 4, label: "Telemetría Intervals" },
            { num: 5, label: "Plan con IA & Previsualización" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex-1 flex items-center gap-2 py-1 border-b-2 transition ${
                currentStep === s.num
                  ? "border-amber-400 text-amber-300 font-bold"
                  : currentStep > s.num
                  ? "border-emerald-500 text-emerald-400"
                  : "border-slate-800 text-slate-500"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                  currentStep === s.num
                    ? "bg-amber-400 text-black"
                    : currentStep > s.num
                    ? "bg-emerald-500 text-black"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {s.num}
              </span>
              <span className="text-[11px] hidden sm:inline truncate">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ========================================================= */}
        {/* PASO 1: ¿Tienes una carrera objetivo programada? */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-white">
              ¿Cuál es tu enfoque principal para esta temporada?
            </h3>
            <p className="text-xs text-slate-400">
              Indícanos si estás preparando una competición específica o si prefieres un bloque de acondicionamiento/mantenimiento.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setHasRace(true)}
                className={`rounded-2xl p-5 border text-left transition-all space-y-3 flex flex-col justify-between ${
                  hasRace
                    ? "bg-slate-900 border-amber-400 ring-2 ring-amber-400/30 shadow-xl"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">🏆</span>
                    {hasRace && <CheckCircle2 className="h-5 w-5 text-amber-400" />}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3">
                    1. Tengo una Carrera / Competición Objetivo
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Maratón (Tokio, Valencia, etc.), Media Maratón, 10K, 5K, Gran Fondo Ciclismo o Triatlón.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-amber-400 pt-2 border-t border-slate-800">
                  Plan específico de 16 semanas + puente previo de mantenimiento ➔
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHasRace(false)}
                className={`rounded-2xl p-5 border text-left transition-all space-y-3 flex flex-col justify-between ${
                  !hasRace
                    ? "bg-slate-900 border-blue-400 ring-2 ring-blue-400/30 shadow-xl"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">🧘‍♂️</span>
                    {!hasRace && <CheckCircle2 className="h-5 w-5 text-blue-400" />}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3">
                    2. No tengo carrera próxima (Momento del Atleta)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Mantenimiento Adaptativo, Construcción de Base Pura (GPP), Recuperación Post-Carrera o Retorno tras Lesión.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-blue-400 pt-2 border-t border-slate-800">
                  Preservación de Fitness (CTL), salud articular y balance neurovegetativo ➔
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 2: Detalles de la Carrera o Momento del Atleta */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            {hasRace ? (
              <>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  Detalles de tu Competición Objetivo
                </h3>
                <p className="text-xs text-slate-400">
                  Configura los datos clave del evento para calcular la periodización y fecha de inicio del ciclo.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300">Nombre de la Carrera</label>
                    <input
                      type="text"
                      value={raceName}
                      onChange={(e) => setRaceName(e.target.value)}
                      placeholder="Ej. Maratón de Tokio 2027"
                      className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">Distancia / Disciplina</label>
                    <select
                      value={raceDistance}
                      onChange={(e) => setRaceDistance(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="42k">Maratón (42.195 km)</option>
                      <option value="21k">Media Maratón (21.097 km)</option>
                      <option value="10k">10K Ruta / Pista</option>
                      <option value="5k">5K Velocidad</option>
                      <option value="cycling_fondo">Gran Fondo Ciclismo</option>
                      <option value="triathlon_703">Triatlón Media Distancia (70.3)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-teal-400" />
                      Fecha de la Carrera
                    </label>
                    <input
                      type="date"
                      value={raceDate}
                      onChange={(e) => setRaceDate(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">Meta / Objetivo de Rendimiento</label>
                    <input
                      type="text"
                      value={raceGoal}
                      onChange={(e) => setRaceGoal(e.target.value)}
                      placeholder="Ej. Sub-3h00m, 280W Stryd, Completar"
                      className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-blue-400" />
                  Selecciona tu Momento / Estado de Forma
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    { id: "maintenance", title: "Mantenimiento Adaptativo", desc: "TSB neutro (~0), tiradas ≤55m y cero fatiga residual.", icon: "🧘‍♂️" },
                    { id: "base_building", title: "Construcción de Base Pura (GPP)", desc: "Capilarización, volumen aeróbico Z2 y neurofuerza en cuestas.", icon: "🧱" },
                    { id: "post_race_recovery", title: "Recuperación Post-Carrera (Deload)", desc: "Reparación muscular, estabilización del HRV y soltura suave.", icon: "🌱" },
                    { id: "injury_rehab", title: "Retorno / Reacondicionamiento", desc: "Protocolo CaCo (Caminar-Correr) con carga gradual <10%/sem.", icon: "🩹" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setAthleteMoment(m.id as any)}
                      className={`text-left rounded-xl p-4 border transition-all ${
                        athleteMoment === m.id
                          ? "bg-slate-900 border-blue-400 ring-2 ring-blue-400/30"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <h4 className="text-xs font-bold text-white mt-2">{m.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{m.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="pt-3">
                  <label className="text-xs font-bold text-slate-300">
                    Duración del Bloque ({momentWeeks} semanas):
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={16}
                    value={momentWeeks}
                    onChange={(e) => setMomentWeeks(Number(e.target.value))}
                    className="w-full accent-blue-400 mt-2 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 3: Análisis Temporal & Puente de Mantenimiento Previo */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            {hasRace && timeline ? (
              <>
                <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      📅 Línea de Tiempo hacia {raceName}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {timeline.daysUntilRace} días restantes (~{timeline.totalWeeksUntilRace} semanas)
                    </span>
                  </div>

                  <p className="text-sm text-slate-200">
                    Para la distancia <strong>{raceDistance.toUpperCase()}</strong>, el ciclo específico de entrenamiento estructurado consta de <strong>16 semanas</strong> y comenzará el <strong>{timeline.kickoffDateStr}</strong>.
                  </p>
                </div>

                {timeline.hasPreSeasonBridge ? (
                  <div className="card-gradient rounded-2xl p-5 border border-amber-500/30 space-y-4 shadow-xl">
                    <div className="flex items-center space-x-2.5 text-amber-300 font-bold text-sm">
                      <Compass className="h-5 w-5 text-amber-400" />
                      <span>Puente de Mantenimiento Pre-Competición ({timeline.weeksUntilKickoff} semanas)</span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Faltan <strong>{timeline.weeksUntilKickoff} semanas</strong> antes de arrancar el bloque de 16 semanas. ¿Cómo deseas estructurar tu entrenamiento durante este período previo?
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setBridgeStrategy("MAINTENANCE")}
                        className={`text-left rounded-xl p-4 border transition-all ${
                          bridgeStrategy === "MAINTENANCE"
                            ? "bg-slate-900 border-amber-400 ring-2 ring-amber-400/30"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Opción 1: Mantenimiento Aeróbico Adaptativo (Recomendado)</span>
                          {bridgeStrategy === "MAINTENANCE" && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                          Consolidación de base aeróbica, estabilidad de carga (CTL) y consistencia semanal con carreras continuas en Z1-Z2 y toques de potencia neuromuscular sin fatiga residual hasta el {timeline.kickoffDateStr}.
                        </p>
                        <div className="mt-2 text-[10px] font-mono text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded w-fit border border-amber-500/20">
                          Estructura: 3 Carrera + 1 Ciclismo + 1 Fuerza + 2 Descanso
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBridgeStrategy("BASE_GPP")}
                        className={`text-left rounded-xl p-4 border transition-all ${
                          bridgeStrategy === "BASE_GPP"
                            ? "bg-slate-900 border-teal-400 ring-2 ring-teal-400/30"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Opción 2: Construcción de Base General (GPP)</span>
                          {bridgeStrategy === "BASE_GPP" && <CheckCircle2 className="h-4 w-4 text-teal-400" />}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                          Progresión ascendente de volumen aeróbico polarizado, desarrollo mitocondrial y fuerza específica en cuestas para elevar el CTL de partida antes del bloque específico.
                        </p>
                        <div className="mt-2 text-[10px] font-mono text-teal-300/80 bg-teal-500/10 px-2 py-0.5 rounded w-fit border border-teal-500/20">
                          Estructura: Progresión de Volumen + Descargas 3:1
                        </div>
                      </button>
                    </div>

                    {/* Explicación de la Transición Fisiológica */}
                    <div className="rounded-xl bg-slate-950/80 p-3.5 border border-amber-500/20 text-xs text-slate-300 flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Dinámica de Transición PULSE AI PRO:</strong> Al activar este plan, tu macrociclo rector actual será el <strong>Plan de Mantenimiento ({timeline.weeksUntilKickoff} semanas)</strong> para mantenerte en forma óptima. El <strong>{new Date(new Date(timeline.kickoffDateStr + "T00:00:00").getTime() - 86400000).toISOString().split("T")[0]}</strong> (el día antes del inicio), el Head Coach IA auditará tu nuevo nivel de fitness (CTL y Stryd CP) en Intervals.icu y construirá el <strong>Plan Específico de Maratón</strong> adaptado a tu condición física de ese momento.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800 text-xs text-slate-300">
                    ✅ Tu carrera está dentro del rango óptimo de 16 semanas. El ciclo de preparación específica iniciará de inmediato.
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl bg-slate-900 p-4 border border-slate-800 text-xs text-slate-300">
                Línea de tiempo configurada para <strong>{momentWeeks} semanas</strong> de bloque no competitivo.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 4: Diagnóstico Fisiológico en Vivo (Intervals.icu) */}
        {/* ========================================================= */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Telemetría Fisiológica del Atleta (Intervals.icu)
            </h3>
            <p className="text-xs text-slate-400">
              Estos son los indicadores biológicos que el Head Coach IA utilizará para calcular tu rampa de sobrecarga sin riesgo de lesión:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Fitness (CTL)</span>
                <p className="text-lg font-black text-cyan-400 mt-1">{physioStatus?.ctl.toFixed(1) || profile.ctl}</p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Fatiga (ATL)</span>
                <p className="text-lg font-black text-amber-400 mt-1">{physioStatus?.atl.toFixed(1) || profile.atl}</p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Forma (TSB)</span>
                <p className="text-lg font-black text-emerald-400 mt-1">{physioStatus?.tsb.toFixed(1) || profile.tsb}</p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Ramp Rate</span>
                <p className="text-lg font-black text-teal-400 mt-1">+{physioStatus?.rampRate.toFixed(1) || profile.rampRate}</p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Stryd CP</span>
                <p className="text-lg font-black text-amber-300 mt-1">{profile.run_ftp ? `${profile.run_ftp}W` : "—"}</p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Bike FTP</span>
                <p className="text-lg font-black text-cyan-300 mt-1">{profile.bike_ftp ? `${profile.bike_ftp}W` : "—"}</p>
              </div>
            </div>

            {/* Selector de Modalidad de Intensidad */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-white">
                🎯 Modalidad de Intensidad Rector (¿Cómo deseas que la IA prescriba tus sesiones?)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIntensityMetric("POWER")}
                  className={`p-3 rounded-2xl border text-left transition-all space-y-1 cursor-pointer ${
                    intensityMetric === "POWER"
                      ? "bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/30 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">⚡ Potencia</span>
                    {intensityMetric === "POWER" && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">Vatios exactos (% Stryd CP / % FTP)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setIntensityMetric("HEART_RATE")}
                  className={`p-3 rounded-2xl border text-left transition-all space-y-1 cursor-pointer ${
                    intensityMetric === "HEART_RATE"
                      ? "bg-rose-500/15 border-rose-400 ring-2 ring-rose-400/30 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300">💓 Frecuencia Cardíaca</span>
                    {intensityMetric === "HEART_RATE" && <CheckCircle2 className="h-4 w-4 text-rose-400" />}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">Zonas de pulso (% LTHR / Z1-Z5)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setIntensityMetric("PACE")}
                  className={`p-3 rounded-2xl border text-left transition-all space-y-1 cursor-pointer ${
                    intensityMetric === "PACE"
                      ? "bg-cyan-500/15 border-cyan-400 ring-2 ring-cyan-400/30 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">⏱️ Ritmo / Velocidad</span>
                    {intensityMetric === "PACE" && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">Minutos por kilómetro (min/km)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setIntensityMetric("RPE")}
                  className={`p-3 rounded-2xl border text-left transition-all space-y-1 cursor-pointer ${
                    intensityMetric === "RPE"
                      ? "bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-400/30 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">🧠 Sensaciones (RPE)</span>
                    {intensityMetric === "RPE" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">Esfuerzo percibido (Escala 1-10)</p>
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
              <span>
                <strong>Gobernanza Fisiológica:</strong> La IA asegurará que el incremento de carga semanal nunca supere los <strong>+6.0 CTL/semana</strong> y programará semanas de descarga <strong>3:1</strong> para regeneración miofibrilar.
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 5: Generación con IA & Previsualización Completa */}
        {/* ========================================================= */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fadeIn">
            {/* AI Control Banner */}
            <div className="card-gradient rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    {aiResult?.reasoningHeadline || "Periodización Fisiológica con Inteligencia Artificial"}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Modelo activo: <strong className="text-slate-200">{aiResult?.modelUsed || selectedModel}</strong> • {currentBlueprint.totalWeeks} Semanas totales calculadas
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateWithAI}
                disabled={isGeneratingAI}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2.5 text-xs font-black text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <Zap className="h-4 w-4 text-black" />
                )}
                <span>{isGeneratingAI ? "Analizando con IA..." : "Personalizar con IA"}</span>
              </button>
            </div>

            {/* AI Reasoning Notes */}
            {aiResult?.reasoningNotes && aiResult.reasoningNotes.length > 0 && (
              <div className="rounded-xl bg-slate-900/90 p-4 border border-amber-500/30 text-xs space-y-2">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">
                  🧠 Árbol de Razonamiento del Head Coach IA:
                </span>
                <ul className="space-y-1 text-slate-300">
                  {aiResult.reasoningNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Visual Timeline & Day-by-Day Preview */}
            <MacrocyclePreviewTimeline
              blueprint={currentBlueprint}
              runFtp={profile.run_ftp}
              bikeFtp={profile.bike_ftp}
              weeklyAvailability={weeklyAvailability}
              distanceType={raceDistance}
            />
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Anterior</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-2.5 text-xs font-black text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
              >
                <span>Continuar</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishAndSave}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-2.5 text-xs font-black text-black shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Guardar & Activar en Base de Datos</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
