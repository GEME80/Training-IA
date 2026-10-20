"use client";

import React from "react";
import { X, Footprints, Bike, Dumbbell, Waves, Moon, Trophy } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { StatCard } from "./StatCard";

export type SheetSnapPoint = "PEEK" | "EXPANDED";

interface WorkoutBottomSheetHeroProps {
  workout: PlanItem;
  isExtraActivity?: boolean;
  executedTss?: number;
  plannedTss?: number;
  durationMin?: number;
  distanceKm?: number;
  targetLabel?: string;
  snapPoint?: SheetSnapPoint;
  onToggleSnap?: () => void;
  onClose: () => void;
  progressSummaryBar?: React.ReactNode;
}

export function getDisciplineIcon(discipline: string) {
  if (discipline === "Descanso" || discipline === "Off") return <Moon className="h-4 w-4 text-slate-400 shrink-0" />;
  if (discipline === "Fuerza") return <Dumbbell className="h-4 w-4 text-emerald-500 shrink-0" />;
  if (discipline === "Ciclismo") return <Bike className="h-4 w-4 text-sky-400 shrink-0" />;
  if (discipline === "Natacion" || discipline === "Natación") return <Waves className="h-4 w-4 text-teal-400 shrink-0" />;
  if (discipline === "Triatlón" || discipline === "Triatlon") return <Trophy className="h-4 w-4 text-indigo-500 shrink-0" />;
  return <Footprints className="h-4 w-4 text-amber-500 shrink-0" />;
}

export function getDisciplineBadgeClass(discipline: string) {
  if (discipline === "Natacion" || discipline === "Natación") return "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800";
  if (discipline === "Ciclismo") return "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
  if (discipline === "Fuerza") return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  if (discipline === "Triatlón" || discipline === "Triatlon") return "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
  return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
}

export const WorkoutBottomSheetHero: React.FC<WorkoutBottomSheetHeroProps> = ({
  workout,
  isExtraActivity,
  executedTss,
  plannedTss,
  durationMin,
  distanceKm,
  targetLabel,
  onClose,
}) => {
  const isTriathlon =
    (workout.activityType as string) === "Triatlón" ||
    (workout.activityType as string) === "Triatlon" ||
    (workout.discipline as string) === "Triatlón" ||
    (workout.discipline as string) === "Triatlon" ||
    /triatl|ironman|70\.3|140\.6/i.test(workout.workoutName || "") ||
    /sector 1:\s*nataci/i.test(workout.workoutDoc || "");
  const effectiveDiscipline = isTriathlon ? "Triatlón" : workout.discipline;
  const icon = getDisciplineIcon(effectiveDiscipline);
  const badgeClass = getDisciplineBadgeClass(effectiveDiscipline);

  const compliancePercent = executedTss && plannedTss && plannedTss > 0
    ? Math.round((executedTss / plannedTss) * 100)
    : undefined;

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md select-none">
      {/* 1. Manija táctil de arrastre decorativa */}
      <div className="w-full flex justify-center pt-2.5 pb-1">
        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
      </div>

      {/* 2. Cabecera Minimalista: Icono + Título + Duración + Acciones */}
      <div className="flex items-center justify-between px-3.5 sm:px-5 py-1.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${badgeClass} shrink-0`}>
                {isExtraActivity ? "Extra" : effectiveDiscipline}
              </span>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-[210px] sm:max-w-[340px]">
                {workout.workoutName.replace(/\[.*?\]\s*/g, "")}
              </h3>
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">
              {workout.day} • {workout.formattedDate || workout.date} {durationMin ? `• ${Math.round(durationMin)} mins` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3. Grid Horizontal de 3 Tarjetas KPI Maestras */}
      <div className="grid grid-cols-3 gap-2 px-3.5 sm:px-5 py-2">
        <StatCard
          label="Carga TSS"
          value={executedTss !== undefined ? `⚡ ${executedTss}` : "—"}
          subValue={plannedTss ? `Plan: ${plannedTss} TSS` : undefined}
          badge={compliancePercent ? { text: `${compliancePercent}%`, variant: compliancePercent >= 90 ? "success" : "warning" } : undefined}
          highlightColor="text-amber-600 dark:text-amber-400"
        />

        <StatCard
          label="Eficacia"
          value={targetLabel || "Z2 Fondo"}
          subValue="Objetivo"
          badge={{ text: "Óptimo", variant: "info" }}
          highlightColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          label="Volumen"
          value={durationMin ? `${Math.round(durationMin)}m` : "—"}
          subValue={distanceKm ? `${distanceKm.toFixed(1)} km` : "Tiempo"}
          badge={{ text: "General", variant: "neutral" }}
          highlightColor="text-slate-900 dark:text-white"
        />
      </div>
    </div>
  );
};
