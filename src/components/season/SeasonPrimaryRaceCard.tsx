"use client";

import React from "react";
import { Trophy, Clock, Calendar, Target, Trash2 } from "lucide-react";
import { TargetRace } from "@/lib/physiology/macrocycle";

interface SeasonPrimaryRaceCardProps {
  primaryRace: TargetRace;
  weeksLeft: number | null;
  onDeleteRace: (id: string) => void;
}

export const SeasonPrimaryRaceCard: React.FC<SeasonPrimaryRaceCardProps> = ({
  primaryRace,
  weeksLeft,
  onDeleteRace,
}) => {
  return (
    <div className="rounded-2xl border-2 border-amber-400/80 dark:border-amber-500/60 bg-gradient-to-tr from-amber-50/70 via-white to-amber-50/30 dark:from-amber-950/25 dark:via-slate-900 dark:to-slate-900 p-4 space-y-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] tracking-wide font-mono shadow-xs">
          <Trophy className="h-3 w-3" />
          OBJETIVO PRINCIPAL (A)
        </span>

        {weeksLeft !== null && (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300">
            <Clock className="h-3 w-3 text-amber-500" />
            Faltan {weeksLeft} sem.
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white capitalize">
            {primaryRace.name}
          </h3>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              {primaryRace.date}
            </span>
            <span>•</span>
            <span className="font-bold text-slate-900 dark:text-slate-200 uppercase">
              {primaryRace.distance}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDeleteRace(primaryRace.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
          title="Eliminar objetivo principal"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          Meta: <strong className="text-slate-900 dark:text-white">{primaryRace.goalTarget || "Pico de forma óptimo"}</strong>
        </span>
        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
          Prioridad Máxima
        </span>
      </div>
    </div>
  );
};
