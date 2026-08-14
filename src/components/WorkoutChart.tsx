"use client";

import React from "react";

export interface IntervalSegment {
  durationMins: number;
  intensityPercent: number;
  label?: string;
}

/**
 * Parsea el texto en sintaxis de Intervals.icu y extrae los segmentos individuales de tiempo e intensidad.
 */
export function parseWorkoutDoc(doc?: string): {
  segments: IntervalSegment[];
  totalMins: number;
  estimatedTss: number;
} {
  if (!doc || doc.trim().length === 0) {
    return { segments: [], totalMins: 0, estimatedTss: 0 };
  }

  const lines = doc.split("\n").map((l) => l.trim()).filter(Boolean);
  const segments: IntervalSegment[] = [];

  let repeatCount = 1;
  let inRepeatBlock = false;
  let repeatBuffer: IntervalSegment[] = [];

  const parseDuration = (raw: string): number => {
    let total = 0;
    const hourMatch = raw.match(/(\d+)h/i);
    if (hourMatch) total += parseInt(hourMatch[1], 10) * 60;
    const minMatch = raw.match(/(\d+)m/i);
    if (minMatch) total += parseInt(minMatch[1], 10);
    const secMatch = raw.match(/(\d+)s/i);
    if (secMatch) total += parseInt(secMatch[1], 10) / 60;
    return total > 0 ? total : 5;
  };

  const parseIntensity = (raw: string): number => {
    const match = raw.match(/(\d+)%/);
    if (match) return parseInt(match[1], 10);
    return 70; // Fallback
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detectar bloque de repetición (ej. "4x", "5x", "repeat 4")
    const repeatMatch = line.match(/^(\d+)x$/i) || line.match(/^repeat\s+(\d+)$/i);
    if (repeatMatch) {
      if (inRepeatBlock && repeatBuffer.length > 0) {
        for (let r = 0; r < repeatCount; r++) {
          segments.push(...repeatBuffer);
        }
        repeatBuffer = [];
      }
      repeatCount = parseInt(repeatMatch[1], 10);
      inRepeatBlock = true;
      continue;
    }

    // Si encontramos una nueva sección principal no indentada ("Cooldown", "Main"), cerramos bloque de repetición previo
    if (inRepeatBlock && !line.startsWith("-") && !line.startsWith("•")) {
      for (let r = 0; r < repeatCount; r++) {
        segments.push(...repeatBuffer);
      }
      repeatBuffer = [];
      inRepeatBlock = false;
      repeatCount = 1;
    }

    // Línea de intervalo con bullet
    if (line.startsWith("-") || line.startsWith("•")) {
      const dur = parseDuration(line);
      const intensity = parseIntensity(line);
      const seg: IntervalSegment = { durationMins: dur, intensityPercent: intensity };

      if (inRepeatBlock) {
        repeatBuffer.push(seg);
      } else {
        segments.push(seg);
      }
    }
  }

  // Vaciar buffer si el texto terminó dentro de un bloque repeat
  if (inRepeatBlock && repeatBuffer.length > 0) {
    for (let r = 0; r < repeatCount; r++) {
      segments.push(...repeatBuffer);
    }
  }

  const totalMins = segments.reduce((sum, s) => sum + s.durationMins, 0);

  // Estimación de TSS según modelo de Coggan / Banister
  const estimatedTss = Math.round(
    segments.reduce((sum, s) => {
      const hours = s.durationMins / 60;
      const intensityFactor = s.intensityPercent / 100;
      return sum + hours * Math.pow(intensityFactor, 2) * 100;
    }, 0)
  );

  return { segments, totalMins: Math.round(totalMins), estimatedTss };
}

interface WorkoutChartProps {
  workoutDoc?: string;
  discipline: string;
}

export const WorkoutChart: React.FC<WorkoutChartProps> = ({
  workoutDoc,
  discipline,
}) => {
  const { segments, totalMins, estimatedTss } = parseWorkoutDoc(workoutDoc);

  if (segments.length === 0 || discipline === "Descanso" || discipline === "Fuerza") {
    return null;
  }

  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h${m < 10 ? "0" + m : m}m` : `${h}h`;
    }
    return `${mins}m`;
  };

  const getSegmentColor = (intensity: number) => {
    if (intensity < 65) return "#10b981"; // Verde Z1
    if (intensity <= 78) return "#06b6d4"; // Cyan Z2
    if (intensity <= 92) return "#3b82f6"; // Azul Z3 Tempo
    if (intensity <= 104) return "#f59e0b"; // Ámbar Z4 Umbral
    return "#ef4444"; // Rojo Z5 VO2max
  };

  const maxIntensity = Math.max(...segments.map((s) => s.intensityPercent), 110);
  const chartHeight = 44;

  return (
    <div className="mt-2 rounded-lg bg-slate-950/90 p-2 border border-slate-800/80 space-y-1 overflow-hidden">
      {/* Header with duration and estimated TSS in single line */}
      <div className="flex items-center justify-between text-[10px] font-mono leading-none">
        <span className="font-bold text-white">
          ⏱️ {formatDuration(totalMins)}
        </span>
        <span className="text-slate-400">
          <strong className="text-emerald-400">{estimatedTss} TSS</strong>
        </span>
      </div>

      {/* Stepped Profile Bar Chart */}
      <div
        className="relative flex items-end w-full rounded bg-slate-900/90 p-1 gap-[2px] overflow-hidden border border-slate-800"
        style={{ height: `${chartHeight}px` }}
      >
        {segments.map((seg, idx) => {
          const widthPercent = (seg.durationMins / totalMins) * 100;
          // Normalizar altura entre 25% y 95%
          const heightPercent = Math.max(25, (seg.intensityPercent / maxIntensity) * 95);
          const color = getSegmentColor(seg.intensityPercent);

          return (
            <div
              key={idx}
              className="group/seg relative rounded-t-[2px] transition-all hover:brightness-125"
              style={{
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                backgroundColor: color,
                minWidth: "3px",
              }}
              title={`${seg.durationMins}m @ ${seg.intensityPercent}% FTP`}
            />
          );
        })}
      </div>

      {/* Interval breakdown summary */}
      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
        <span>{segments.length} bloques</span>
        <span className="text-emerald-400">Stryd % FTP</span>
      </div>
    </div>
  );
};
