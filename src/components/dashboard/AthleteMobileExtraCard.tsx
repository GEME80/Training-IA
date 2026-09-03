"use client";

import React from "react";
import { Footprints, Bike, Dumbbell, Waves, Zap, Heart } from "lucide-react";
import { DailyExecutedActivity } from "@/lib/intervals/types";
import { PlanItem } from "@/lib/gemini/engine";

interface AthleteMobileExtraCardProps {
  activity: DailyExecutedActivity;
  dateStr: string;
  dayName: string;
  onSelectWorkoutModal: (item: PlanItem) => void;
}

const renderActivityIcon = (type: string, name?: string) => {
  const t = (type || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (t.includes("run") || n.includes("carrera") || n.includes("run")) {
    return <Footprints className="h-4 w-4 text-amber-500" />;
  }
  if (t.includes("ride") || t.includes("bike") || n.includes("ciclismo") || n.includes("bike")) {
    return <Bike className="h-4 w-4 text-cyan-500" />;
  }
  if (t.includes("swim") || n.includes("nataci") || n.includes("swim")) {
    return <Waves className="h-4 w-4 text-sky-500" />;
  }
  return <Dumbbell className="h-4 w-4 text-purple-500" />;
};

export const AthleteMobileExtraCard: React.FC<AthleteMobileExtraCardProps> = ({
  activity: extra,
  dateStr,
  dayName,
  onSelectWorkoutModal,
}) => {
  const discipline =
    extra.type === "WeightTraining"
      ? "Fuerza"
      : extra.type === "Ride" || extra.type === "VirtualRide"
      ? "Ciclismo"
      : extra.type === "Run"
      ? "Carrera"
      : "Fuerza";

  return (
    <div
      onClick={() =>
        onSelectWorkoutModal({
          id: `extra-${extra.id}`,
          date: dateStr,
          formattedDate: dateStr.slice(5),
          day: dayName,
          discipline,
          workoutName: extra.name,
          durationMinutes: extra.movingTimeMin,
          tss: extra.tss,
          action: "MANTENER",
          justification: `Actividad adicional registrada en Intervals.icu (${extra.name}).`,
          workoutDoc: "",
        })
      }
      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 shadow-xs touch-bounce space-y-3 cursor-pointer hover:border-slate-400 transition"
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            {renderActivityIcon(extra.type, extra.name)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                {dayName} • {dateStr}
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-black uppercase">
                + Extra
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
              {extra.name}
            </h4>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/20">
          Ejecutado
        </span>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center font-mono">
        <div>
          <span className="text-[9px] uppercase text-slate-400 block font-sans">Tiempo / Dist.</span>
          <strong className="text-xs font-black text-slate-900 dark:text-white">
            {extra.movingTimeMin}m {extra.distanceKm ? `(${extra.distanceKm}k)` : ""}
          </strong>
        </div>

        <div>
          <span className="text-[9px] uppercase text-slate-400 block font-sans">Carga TSS</span>
          <strong className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-0.5">
            <Zap className="h-3 w-3 text-amber-500" />
            {extra.tss} TSS
          </strong>
        </div>

        <div>
          <span className="text-[9px] uppercase text-slate-400 block font-sans">Fisiología</span>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
            {extra.heartrate ? (
              <span className="text-rose-600 flex items-center gap-0.5">
                <Heart className="h-2.5 w-2.5 fill-rose-500" />
                {extra.heartrate}
              </span>
            ) : null}
            {extra.watts ? <span className="text-amber-600">⚡{extra.watts}W</span> : null}
            {!extra.heartrate && !extra.watts ? <span>{discipline}</span> : null}
          </div>
        </div>
      </div>

      <div className="pt-0.5 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400 font-medium">Actividad externa de Intervals.icu</span>
        <span className="text-xs font-bold text-cyan-600 flex items-center gap-0.5">
          Ver Detalle →
        </span>
      </div>
    </div>
  );
};
