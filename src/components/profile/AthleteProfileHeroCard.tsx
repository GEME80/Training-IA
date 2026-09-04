"use client";

import React from "react";
import { Footprints, Bike, HeartPulse, Moon, Edit3, Zap, Activity } from "lucide-react";

interface AthleteProfileHeroCardProps {
  athleteName: string;
  email?: string;
  calculatedAge?: number;
  birthDate?: string;
  gender?: "M" | "F" | "OTHER";
  weightKg?: number;
  heightCm?: number;
  runFtp?: number;
  bikeFtp?: number;
  lthr?: number;
  restingHR?: number;
  maxHR?: number;
  onOpenEditModal: () => void;
}

export const AthleteProfileHeroCard: React.FC<AthleteProfileHeroCardProps> = ({
  athleteName,
  email = "",
  calculatedAge,
  birthDate,
  gender,
  weightKg,
  heightCm,
  runFtp = 0,
  bikeFtp = 0,
  lthr,
  restingHR,
  maxHR,
  onOpenEditModal,
}) => {
  const relativeRunPower = weightKg && weightKg > 0 && runFtp && runFtp > 0 ? (runFtp / weightKg).toFixed(2) : "—";
  const relativeBikePower = weightKg && weightKg > 0 && bikeFtp && bikeFtp > 0 ? (bikeFtp / weightKg).toFixed(2) : "—";
  const bmi = weightKg && weightKg > 0 && heightCm && heightCm > 0 ? (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1) : "—";
  const genderLabel = gender === "F" ? "Mujer" : gender === "M" ? "Hombre" : "Atleta";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs relative overflow-hidden">
      {/* Glow de Fondo Sutil */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-500/5 blur-2xl pointer-events-none" />

      {/* Cabecera del Atleta & Datos Demográficos */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
            {(athleteName || "AT").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {athleteName || "Atleta"}
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/20">
                PRO ATHLETE
              </span>
              {email && (
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  • {email}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 pt-0.5">
              <span>{calculatedAge && calculatedAge > 0 ? `${calculatedAge} años` : "Edad sin configurar"} {gender ? `(${genderLabel})` : ""}</span>
              <span>•</span>
              <span>{weightKg && weightKg > 0 ? `${weightKg} kg` : "— kg"}</span>
              <span>•</span>
              <span>{heightCm && heightCm > 0 ? `${heightCm} cm` : "— cm"}</span>
              <span>•</span>
              <span className="text-slate-400">IMC {bmi}</span>
            </div>
          </div>
        </div>

        {/* Botón de Editar */}
        <button
          type="button"
          onClick={onOpenEditModal}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer shadow-xs"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Editar Perfil & Umbrales</span>
        </button>
      </div>

      {/* KPI Strip: 4 Umbrales Principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* 1. Stryd CP */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Footprints className="h-3.5 w-3.5 text-amber-500" />
              Stryd CP (Run)
            </span>
            <span className="text-[10px] font-mono text-amber-600 font-bold">⚡ {relativeRunPower} W/kg</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {runFtp && runFtp > 0 ? (
                <>
                  {runFtp} <span className="text-xs text-slate-400 font-sans">W</span>
                </>
              ) : (
                <span className="text-slate-400 font-medium text-base">— W</span>
              )}
            </span>
            <span className="text-[9px] font-mono text-slate-400">Potencia Crítica</span>
          </div>
        </div>

        {/* 2. Bike FTP */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Bike className="h-3.5 w-3.5 text-sky-500" />
              Ciclismo FTP
            </span>
            <span className="text-[10px] font-mono text-sky-600 font-bold">⚡ {relativeBikePower} W/kg</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {bikeFtp && bikeFtp > 0 ? (
                <>
                  {bikeFtp} <span className="text-xs text-slate-400 font-sans">W</span>
                </>
              ) : (
                <span className="text-slate-400 font-medium text-base">— W</span>
              )}
            </span>
            <span className="text-[9px] font-mono text-slate-400">Umbral Funcional</span>
          </div>
        </div>

        {/* 3. LTHR FC Umbral */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
              FC Umbral (LTHR)
            </span>
            <span className="text-[10px] font-mono text-rose-600 font-bold">{maxHR && maxHR > 0 ? `Máx ${maxHR}` : "Sin Máx"}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {lthr && lthr > 0 ? (
                <>
                  {lthr} <span className="text-xs text-slate-400 font-sans">bpm</span>
                </>
              ) : (
                <span className="text-slate-400 font-medium text-base">— bpm</span>
              )}
            </span>
            <span className="text-[9px] font-mono text-slate-400">Lactato Z4</span>
          </div>
        </div>

        {/* 4. FC Reposo */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              FC Reposo
            </span>
            <span className="text-[10px] font-mono text-indigo-600 font-bold">Vagal</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {restingHR && restingHR > 0 ? (
                <>
                  {restingHR} <span className="text-xs text-slate-400 font-sans">bpm</span>
                </>
              ) : (
                <span className="text-slate-400 font-medium text-base">— bpm</span>
              )}
            </span>
            <span className="text-[9px] font-mono text-slate-400">Recuperación</span>
          </div>
        </div>
      </div>
    </div>
  );
};
