"use client";

import React from "react";
import { Dumbbell } from "lucide-react";
import { sanitizeWorkoutDoc } from "@/lib/physiology/workoutSyntaxSanitizer";

export {
  type IntervalSegment,
  type StrengthExercise,
  type StrengthCircuitInfo,
  isStrengthDoc,
  parseStrengthDoc,
  parseWorkoutDoc,
} from "@/lib/physiology/workoutDocParser";
import {
  type StrengthCircuitInfo,
  isStrengthDoc,
  parseStrengthDoc,
  parseWorkoutDoc,
} from "@/lib/physiology/workoutDocParser";

export const StrengthCircuitView: React.FC<{ info: StrengthCircuitInfo; className?: string }> = ({
  info,
  className = "",
}) => {
  const displayExercises = info.exercises.length > 0 ? info.exercises.slice(0, 4) : [];

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-purple-50/90 via-indigo-50/60 to-purple-50/90 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-purple-200/90 dark:border-purple-800/60 p-1.5 flex flex-col justify-between select-none ${className}`}
    >
      <div className="flex items-center justify-between gap-1 mb-1 leading-none">
        <div className="flex items-center gap-1 text-[10px] font-mono font-black text-purple-900 dark:text-purple-200">
          <Dumbbell className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>{info.rounds} Rondas</span>
        </div>
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-purple-200/80 dark:bg-purple-900/60 text-purple-950 dark:text-purple-200 leading-none">
          {info.exercises.length > 0 ? `${info.exercises.length} Estaciones` : "Circuito"}
        </span>
      </div>

      {displayExercises.length > 0 ? (
        <div className="flex items-stretch gap-1 w-full">
          {displayExercises.map((ex, idx) => (
            <div
              key={idx}
              className="flex-1 min-w-0 rounded bg-white/95 dark:bg-slate-900/90 border border-purple-200 dark:border-purple-800/80 px-1 py-0.5 text-center shadow-2xs group/station transition hover:border-purple-400"
              title={ex.raw}
            >
              <span className="text-[9px] font-mono font-black text-purple-700 dark:text-purple-300 block truncate leading-tight">
                {ex.reps}
              </span>
              <span className="text-[8px] font-medium text-slate-600 dark:text-slate-300 block truncate leading-tight">
                {ex.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[10px] font-mono text-purple-700 dark:text-purple-300 text-center py-0.5">
          Movilidad • {info.rounds} Rondas • Enfriamiento
        </div>
      )}
    </div>
  );
};

interface WorkoutChartProps {
  workoutDoc?: string;
  discipline: string;
  className?: string;
  athleteFtp?: number;
}

export const WorkoutChart: React.FC<WorkoutChartProps> = ({
  workoutDoc,
  discipline,
  className = "",
  athleteFtp,
}) => {
  if (discipline === "Descanso") {
    return null;
  }

  if (isStrengthDoc(workoutDoc, discipline)) {
    const info = parseStrengthDoc(workoutDoc);
    return <StrengthCircuitView info={info} className={className} />;
  }

  const { segments, totalMins } = parseWorkoutDoc(workoutDoc, discipline);

  if (segments.length === 0) {
    return null;
  }

  const getSegmentColor = (intensity: number) => {
    if (intensity <= 65) return "#34d399";
    if (intensity <= 80) return "#10b981";
    if (intensity <= 90) return "#facc15";
    if (intensity <= 100) return "#fb923c";
    return intensity <= 115 ? "#ef4444" : "#a855f7";
  };

  const maxIntensity = Math.max(...segments.map((s) => s.intensityPercent), 115);
  const chartHeight = 36;

  return (
    <div className={`relative w-full overflow-hidden rounded bg-slate-100/60 dark:bg-slate-800/40 p-1 ${className}`}>
      {/* Línea horizontal de referencia al 100% (FTP / CP) */}
      <div
        className="absolute left-0 right-0 border-b border-dashed border-slate-300 dark:border-slate-600 z-0 pointer-events-none"
        style={{ bottom: `${(100 / maxIntensity) * chartHeight}px` }}
      />

      {/* Stepped Profile Bar Chart estilo Intervals.icu */}
      <div
        className="relative flex items-end w-full h-[36px] gap-[1px] z-10"
        style={{ height: `${chartHeight}px` }}
      >
        {segments.map((seg, idx) => {
          const widthPercent = (seg.durationMins / totalMins) * 100;
          const heightPercent = Math.max(18, (seg.intensityPercent / maxIntensity) * 100);
          const color = getSegmentColor(seg.intensityPercent);

          const cleanLabel = athleteFtp && athleteFtp > 0 && seg.label
            ? seg.label.replace(/\s*\(\d+(?:-\d+)?\s*w\)/gi, "").trim()
            : seg.label;
          const tooltip = cleanLabel
            ? `${cleanLabel}${athleteFtp && athleteFtp > 0 && !cleanLabel.includes("/km") && !cleanLabel.includes("bpm") ? ` (${Math.round((athleteFtp * seg.intensityPercent) / 100)}W)` : ""}`
            : `${seg.durationMins >= 1 ? `${Math.round(seg.durationMins)}m` : `${Math.round(seg.durationMins * 60)}s`} @ ${seg.intensityPercent}%${athleteFtp && athleteFtp > 0 ? ` (${Math.round((athleteFtp * seg.intensityPercent) / 100)}W)` : ""}`;

          return (
            <div
              key={idx}
              className="group/seg relative rounded-t-[1px] transition-all hover:brightness-110"
              style={{
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                backgroundColor: color,
                minWidth: "2px",
              }}
              title={tooltip}
            />
          );
        })}
      </div>
    </div>
  );
};
