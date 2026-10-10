"use client";

import React from "react";
import { Activity, ShieldCheck, Zap, Flame, Timer } from "lucide-react";

interface SeasonWizardStep3PhysiologyProps {
  ctl?: number;
  runFtp?: number;
  bikeFtp?: number;
  lthr?: number;
  weightKg?: number;
  heightCm?: number;
  birthDate?: string;
  gender?: "M" | "F" | "OTHER";
  restingHR?: number;
  maxHR?: number;
  runningTrainingMode?: "POWER" | "PACE";
  onChangeRunningTrainingMode?: (mode: "POWER" | "PACE") => void;
  periodization: "2:1" | "3:1" | "CONTINUO";
  onChangePeriodization: (p: "2:1" | "3:1" | "CONTINUO") => void;
  customPromptText: string;
  onChangeCustomPromptText: (t: string) => void;
  onGeneratePlan?: () => void;
  isGenerating?: boolean;
}

export const SeasonWizardStep3Physiology: React.FC<SeasonWizardStep3PhysiologyProps> = ({
  ctl = 0,
  runFtp = 0,
  bikeFtp = 0,
  lthr = 165,
  weightKg,
  heightCm,
  birthDate,
  gender,
  restingHR,
  maxHR,
  runningTrainingMode = "POWER",
  onChangeRunningTrainingMode,
  periodization,
  onChangePeriodization,
  customPromptText,
  onChangeCustomPromptText,
}) => {
  const wkgRun = weightKg && runFtp ? (runFtp / weightKg).toFixed(2) : undefined;
  const wkgBike = weightKg && bikeFtp ? (bikeFtp / weightKg).toFixed(2) : undefined;
  const bmi = weightKg && heightCm ? (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1) : undefined;
  const calculatedAge = React.useMemo(() => {
    if (!birthDate) return undefined;
    const diff = Date.now() - new Date(birthDate).getTime();
    return !isNaN(diff) && diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) : undefined;
  }, [birthDate]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. TELEMETRÍA FISIOLÓGICA & BIOMETRÍA DEL ATLETA */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-emerald-500" />
            Parámetros Biométricos & Umbrales Activos
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
            Intervals.icu + Perfil Cloud
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-400 block uppercase">Fitness CTL</span>
            <strong className="text-xs font-black text-slate-900 dark:text-white">
              {ctl > 0 ? ctl.toFixed(1) : "—"}
            </strong>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-400 block uppercase">Stryd CP</span>
            <strong className="text-xs font-black text-amber-600 dark:text-amber-400">
              {runFtp > 0 ? `${runFtp}W` : "—"}
            </strong>
            {wkgRun && <span className="block text-[9px] text-amber-500 font-bold">{wkgRun} W/kg</span>}
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-400 block uppercase">FTP Ciclismo</span>
            <strong className="text-xs font-black text-cyan-600 dark:text-cyan-400">
              {bikeFtp > 0 ? `${bikeFtp}W` : "—"}
            </strong>
            {wkgBike && <span className="block text-[9px] text-cyan-500 font-bold">{wkgBike} W/kg</span>}
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-400 block uppercase">LTHR (Umbral FC)</span>
            <strong className="text-xs font-black text-rose-600 dark:text-rose-400">
              {lthr > 0 ? `${lthr} bpm` : "—"}
            </strong>
            {restingHR && <span className="block text-[9px] text-slate-400">Reposo: {restingHR}</span>}
          </div>
        </div>

        {/* Fila secundaria: Antropometría (Peso, Altura, IMC, Edad) */}
        {(weightKg || heightCm || calculatedAge) && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>⚖️ <strong>{weightKg ? `${weightKg} kg` : "— kg"}</strong></span>
            <span>📏 <strong>{heightCm ? `${heightCm} cm` : "— cm"}</strong>{bmi ? ` (IMC ${bmi})` : ""}</span>
            <span>🎂 <strong>{calculatedAge ? `${calculatedAge} años` : "Edad sin definir"}</strong>{gender ? ` (${gender === "M" ? "H" : gender === "F" ? "M" : "O"})` : ""}</span>
            {maxHR && <span>❤️ Máx: <strong>{maxHR} bpm</strong></span>}
          </div>
        )}
      </div>

      {/* 2. MODALIDAD DE PRESCRIPCIÓN DE RUNNING (POTENCIA STRYD VS RITMO DE PASO) */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">
          Prescripción de Carrera: Potencia Stryd o Ritmo de Paso
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div
            onClick={() => onChangeRunningTrainingMode?.("POWER")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
              runningTrainingMode === "POWER"
                ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-500/20 shadow-xs"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                Potencia Stryd (CP {runFtp > 0 ? `${runFtp}W` : "Vatios"})
              </h4>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold text-[9px]">
                {runFtp > 0 ? "Stryd CP" : "Potenciómetro"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-mono">
              Prescripción 100% en vatios y % CP. Zonas exactas de potencia insensibles a pendientes, viento o terreno.
            </p>
          </div>

          <div
            onClick={() => onChangeRunningTrainingMode?.("PACE")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
              runningTrainingMode === "PACE"
                ? "border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 ring-2 ring-sky-500/20 shadow-xs"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Timer className="h-4 w-4 text-sky-500" />
                Ritmo de Paso (min/km)
              </h4>
              <span className="px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-700 dark:text-sky-300 font-mono font-bold text-[9px]">
                Ritmo Umbral
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-mono">
              Prescripción por ritmo de carrera (min/km) y zonas de paso calculadas a partir de tu ritmo umbral funcional.
            </p>
          </div>
        </div>
      </div>

      {/* 3. ESTRATEGIA DE PROGRESIÓN Y DESCANSO */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">
          Estrategia de Progresión y Descanso (Ratio de Carga)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div
            onClick={() => onChangePeriodization("2:1")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1 ${
              periodization === "2:1"
                ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Ritmo Preventivo (2:1)
              </h4>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[9px]">
                Recomendado
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-mono">
              2 semanas de carga progresiva + 1 semana suave de descarga y asimilación biológica. Máxima longevidad deportiva.
            </p>
          </div>

          <div
            onClick={() => onChangePeriodization("3:1")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1 ${
              periodization === "3:1"
                ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500" />
                Ritmo Estándar (3:1)
              </h4>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold text-[9px]">
                Clásico
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-mono">
              3 semanas de carga progresiva + 1 semana suave de asimilación. Progresión clásica de volumen para atletas adaptados.
            </p>
          </div>
        </div>
      </div>

      {/* 4. NOTAS O PREFERENCIAS ADICIONALES */}
      <div className="space-y-1">
        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">
          Directrices Específicas para el Head Coach IA (Opcional)
        </label>
        <textarea
          rows={2}
          value={customPromptText}
          onChange={(e) => onChangeCustomPromptText(e.target.value)}
          placeholder="Ej: Tiradas largas los domingos, series de umbral los martes, enfocar en economía de carrera..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-none font-mono"
        />
      </div>
    </div>
  );
};
