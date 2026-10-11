"use client";

import React from "react";
import { X, Maximize2, Minimize2, Footprints, Bike, Dumbbell, Waves, Moon } from "lucide-react";
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
  snapPoint: SheetSnapPoint;
  onToggleSnap: () => void;
  onClose: () => void;
  progressSummaryBar?: React.ReactNode;
}

export function getDisciplineIcon(discipline: string) {
  if (discipline === "Descanso" || discipline === "Off") return <Moon className="h-4 w-4 text-slate-400 shrink-0" />;
  if (discipline === "Fuerza") return <Dumbbell className="h-4 w-4 text-purple-500 shrink-0" />;
  if (discipline === "Ciclismo") return <Bike className="h-4 w-4 text-sky-400 shrink-0" />;
  if (discipline === "Natacion" || discipline === "Natación") return <Waves className="h-4 w-4 text-teal-400 shrink-0" />;
  return <Footprints className="h-4 w-4 text-amber-500 shrink-0" />;
}

export function getDisciplineBadgeClass(discipline: string) {
  if (discipline === "Natacion" || discipline === "Natación") return "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800";
  if (discipline === "Ciclismo") return "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
  if (discipline === "Fuerza") return "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
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
  snapPoint,
  onToggleSnap,
  onClose,
  progressSummaryBar,
}) => {
  const icon = getDisciplineIcon(workout.discipline);
  const badgeClass = getDisciplineBadgeClass(workout.discipline);

  const compliancePercent = executedTss && plannedTss && plannedTss > 0
    ? Math.round((executedTss / plannedTss) * 100)
    : undefined;

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md select-none">
      {/* 1. Manija táctil de arrastre (Drag Handle) */}
      <div
        className="w-full flex justify-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing group"
        onClick={onToggleSnap}
        title={snapPoint === "PEEK" ? "Arrastra o toca para expandir a 90%" : "Arrastra o toca para comprimir a 38%"}
      >
        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400 dark:group-hover:bg-slate-600 transition" />
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
                {isExtraActivity ? "Extra" : workout.discipline}
              </span>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-[190px] sm:max-w-[320px]">
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
            onClick={onToggleSnap}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={snapPoint === "PEEK" ? "Expandir a pantalla completa" : "Comprimir"}
          >
            {snapPoint === "PEEK" ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
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
          highlightColor="text-purple-600 dark:text-purple-400"
        />

        <StatCard
          label="Volumen"
          value={durationMin ? `${Math.round(durationMin)}m` : "—"}
          subValue={distanceKm ? `${distanceKm.toFixed(1)} km` : "Tiempo"}
          badge={{ text: "General", variant: "neutral" }}
          highlightColor="text-slate-900 dark:text-white"
        />
      </div>

      {/* 4. Única Barra Destacada de Progreso General (Solo en modo PEEK) */}
      {snapPoint === "PEEK" && progressSummaryBar && (
        <div className="px-3.5 sm:px-5 pb-2 pt-0.5">
          {progressSummaryBar}
        </div>
      )}
    </div>
  );
};
