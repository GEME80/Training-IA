"use client";

import React from "react";
import {
  Activity,
  Zap,
  Heart,
  Sliders,
  Check,
} from "lucide-react";
import { AVAILABLE_METRIC_INDICATORS } from "@/lib/intervals/types";

interface ProfilePhysiologyTabProps {
  birthDate: string;
  setBirthDate: (v: string) => void;
  calculatedAge: number;
  gender: "M" | "F" | "OTHER";
  setGender: (v: "M" | "F" | "OTHER") => void;
  runFtp: number;
  setRunFtp: (v: number) => void;
  bikeFtp: number;
  setBikeFtp: (v: number) => void;
  weightKg: number;
  setWeightKg: (v: number) => void;
  relativePower: string | null;
  restingHR: number;
  setRestingHR: (v: number) => void;
  lthr: number;
  setLthr: (v: number) => void;
  maxHR: number;
  setMaxHR: (v: number) => void;
  tanakaMaxHR: number;
  visibleMetrics: string[];
  onToggleMetric: (id: string) => void;
}

export const ProfilePhysiologyTab: React.FC<ProfilePhysiologyTabProps> = ({
  birthDate,
  setBirthDate,
  calculatedAge,
  gender,
  setGender,
  runFtp,
  setRunFtp,
  bikeFtp,
  setBikeFtp,
  weightKg,
  setWeightKg,
  relativePower,
  restingHR,
  setRestingHR,
  lthr,
  setLthr,
  maxHR,
  setMaxHR,
  tanakaMaxHR,
  visibleMetrics,
  onToggleMetric,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Tarjeta 0: Datos Demográficos */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
              0. Datos Demográficos & Fisiológicos
            </h3>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            🎂 {calculatedAge} Años
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono text-slate-900 dark:text-white shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              Género
            </label>
            <div className="grid grid-cols-3 gap-1.5 mt-1">
              {[
                { id: "M", label: "Hombre" },
                { id: "F", label: "Mujer" },
                { id: "OTHER", label: "Otro" },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGender(g.id as "M" | "F" | "OTHER")}
                  className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    gender === g.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-950 font-black shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta 1: Potencia Stryd & Ciclismo */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
              1. Umbrales de Potencia (Stryd CP & Ciclismo FTP)
            </h3>
          </div>
          {relativePower && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
              ⚡ {relativePower} W/kg
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              Stryd Potencia Crítica (CP)
            </label>
            <div className="relative mt-1">
              <input
                type="number"
                min="0"
                max="600"
                value={runFtp || ""}
                onChange={(e) => setRunFtp(Number(e.target.value))}
                placeholder="247"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pr-8 text-xs font-mono font-bold text-slate-900 dark:text-white shadow-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">W</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              FTP Ciclismo (W)
            </label>
            <div className="relative mt-1">
              <input
                type="number"
                min="0"
                max="600"
                value={bikeFtp || ""}
                onChange={(e) => setBikeFtp(Number(e.target.value))}
                placeholder="220"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pr-8 text-xs font-mono font-bold text-slate-900 dark:text-white shadow-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">W</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              Peso Corporal (kg)
            </label>
            <div className="relative mt-1">
              <input
                type="number"
                step="0.1"
                min="30"
                max="200"
                value={weightKg || ""}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                placeholder="84.0"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pr-9 text-xs font-mono font-bold text-slate-900 dark:text-white shadow-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta 2: Frecuencia Cardíaca */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-rose-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
              2. Frecuencia Cardíaca (Reposo, Umbral y Máxima)
            </h3>
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono font-bold">
            Tanaka FC Max: {tanakaMaxHR} bpm
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              FC Reposo (bpm)
            </label>
            <input
              type="number"
              min="30"
              max="100"
              value={restingHR || ""}
              onChange={(e) => setRestingHR(Number(e.target.value))}
              placeholder="46"
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              FC Umbral LTHR (bpm)
            </label>
            <input
              type="number"
              min="100"
              max="220"
              value={lthr || ""}
              onChange={(e) => setLthr(Number(e.target.value))}
              placeholder="168"
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              FC Máxima (bpm)
            </label>
            <input
              type="number"
              min="120"
              max="230"
              value={maxHR || ""}
              onChange={(e) => setMaxHR(Number(e.target.value))}
              placeholder="185"
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Tarjeta 3: Selector Modular de Métricas Visibles */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-cyan-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
              3. Tarjetas de Telemetría Visibles en tu Dashboard
            </h3>
          </div>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold font-mono">
            {visibleMetrics.length} Activas
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AVAILABLE_METRIC_INDICATORS.map((metric) => {
            const isChecked = visibleMetrics.includes(metric.id);
            return (
              <button
                key={metric.id}
                type="button"
                onClick={() => onToggleMetric(metric.id)}
                className={`p-2 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  isChecked
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-950 font-bold shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                }`}
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <span>{metric.icon}</span>
                  <span className="text-[11px] truncate">{metric.name}</span>
                </div>
                {isChecked && <Check className="h-3 w-3 shrink-0 ml-1 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
