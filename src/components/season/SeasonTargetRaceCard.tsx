"use client";

import React from "react";
import { Flag, Trophy, Calendar, Plus, Clock, Target } from "lucide-react";
import { TargetRace } from "@/lib/physiology/macrocycle";

interface SeasonTargetRaceCardProps {
  primaryRace: TargetRace | null;
  targetRacesCount: number;
  onOpenAddRace: () => void;
  onViewAllRaces: () => void;
}

export const SeasonTargetRaceCard: React.FC<SeasonTargetRaceCardProps> = ({
  primaryRace,
  targetRacesCount,
  onOpenAddRace,
  onViewAllRaces,
}) => {
  const getWeeksRemaining = (dateStr: string): number | null => {
    if (!dateStr) return null;
    const raceDate = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const diffTime = raceDate.getTime() - today.getTime();
    if (diffTime <= 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  };

  const weeksLeft = primaryRace?.date ? getWeeksRemaining(primaryRace.date) : null;

  if (!primaryRace) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px] font-bold">
            <Trophy className="h-3 w-3" />
            Sin Carrera Objetivo
          </span>
        </div>

        <div>
          <h4 className="text-xs font-black text-slate-900 dark:text-white">
            Define tu Meta de Competición
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 leading-relaxed">
            Registra tu Maratón o 21K para sincronizar los picos de forma y el Taper en tu calendario.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddRace}
          className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 transition cursor-pointer shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Planificar Carrera Principal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 font-mono text-[10px] font-black border border-sky-500/20">
          <Trophy className="h-3 w-3 text-sky-600 dark:text-sky-400" />
          OBJETIVO PRINCIPAL (A)
        </span>
        {weeksLeft !== null && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            <Clock className="h-3 w-3 text-sky-500" />
            {weeksLeft > 0 ? `Faltan ${weeksLeft} sem.` : "¡Semana de Carrera!"}
          </span>
        )}
      </div>

      <div>
        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
          {primaryRace.name}
        </h4>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
          <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          <span>{primaryRace.date} • {primaryRace.distance?.toUpperCase() || "42K"}</span>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-1.5 truncate">
          <Target className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span className="text-slate-500 text-[11px]">Meta:</span>
          <strong className="text-slate-900 dark:text-white text-[11px] truncate">{primaryRace.goalTarget || "Pico óptimo"}</strong>
        </div>
        <button
          type="button"
          onClick={onViewAllRaces}
          className="text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline shrink-0 pl-2 cursor-pointer"
        >
          {targetRacesCount} carreras →
        </button>
      </div>
    </div>
  );
};
