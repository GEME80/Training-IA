"use client";

import React from "react";
import { X, Maximize2, Minimize2, Footprints, Bike, Dumbbell, Waves, Moon } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";

interface WorkoutBottomSheetHeroProps {
  workout: PlanItem;
  isExtraActivity?: boolean;
  executedTss?: number;
  plannedTss?: number;
  durationMin?: number;
  distanceKm?: number;
  targetLabel?: string;
  sheetState: "HALF" | "FULL";
  onToggleSheet: () => void;
  onClose: () => void;
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
  sheetState,
  onToggleSheet,
  onClose,
}) => {
  const icon = getDisciplineIcon(workout.discipline);
  const badgeClass = getDisciplineBadgeClass(workout.discipline);

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      {/* 1. Manija táctil de arrastre (Drag Handle) */}
      <div
        className="w-full flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing group"
        onClick={onToggleSheet}
        title={sheetState === "HALF" ? "Arrastra o toca para expandir" : "Arrastra o toca para comprimir"}
      >
        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400 dark:group-hover:bg-slate-600 transition" />
      </div>

      {/* 2. Cabecera Minimalista: Icono + Disciplina + Fecha + Acciones */}
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
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[340px]">
                {workout.workoutName.replace(/\[.*?\]\s*/g, "")}
              </h3>
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">
              {workout.day} • {workout.formattedDate || workout.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleSheet}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={sheetState === "HALF" ? "Expandir a pantalla completa" : "Comprimir a mitad"}
          >
            {sheetState === "HALF" ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
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

      {/* 3. Hero Cards: Resumen Ejecutivo 3 Tarjetas Maestras */}
      <div className="grid grid-cols-3 gap-2 px-3.5 sm:px-5 py-2">
        {/* Card 1: Carga */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-1.5 sm:p-2 text-center border border-slate-100 dark:border-slate-800/80">
          <span className="text-[8.5px] uppercase font-bold text-slate-400 block tracking-wider font-sans">Carga TSS</span>
          <span className="text-xs sm:text-base font-black font-mono text-amber-600 dark:text-amber-400 leading-tight block mt-0.5 truncate">
            ⚡ {executedTss !== undefined ? executedTss : "—"}
            <span className="text-[10px] font-normal text-slate-400"> / {plannedTss || 0}</span>
          </span>
        </div>

        {/* Card 2: Volumen */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-1.5 sm:p-2 text-center border border-slate-100 dark:border-slate-800/80">
          <span className="text-[8.5px] uppercase font-bold text-slate-400 block tracking-wider font-sans">Volumen</span>
          <span className="text-xs sm:text-base font-black font-mono text-slate-900 dark:text-white leading-tight block mt-0.5 truncate">
            {durationMin ? `${Math.round(durationMin)}m` : "—"}
            {distanceKm ? <span className="text-[10px] font-normal text-slate-400"> • {distanceKm.toFixed(1)}k</span> : ""}
          </span>
        </div>

        {/* Card 3: Objetivo */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-1.5 sm:p-2 text-center border border-slate-100 dark:border-slate-800/80">
          <span className="text-[8.5px] uppercase font-bold text-slate-400 block tracking-wider font-sans">Objetivo</span>
          <span className="text-xs sm:text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 leading-tight block mt-0.5 truncate">
            🎯 {targetLabel || "Z2 Fondo"}
          </span>
        </div>
      </div>
    </div>
  );
};
