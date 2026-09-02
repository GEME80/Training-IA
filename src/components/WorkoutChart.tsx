"use client";

import React from "react";

export interface IntervalSegment {
  durationMins: number;
  intensityPercent: number;
  label?: string;
}

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
    const minsMatch = raw.match(/(\d+)\s*m/i);
    const secsMatch = raw.match(/(\d+)\s*s/i);
    const hoursMatch = raw.match(/(\d+)\s*h/i);

    let total = 0;
    if (hoursMatch) total += parseInt(hoursMatch[1], 10) * 60;
    if (minsMatch) total += parseInt(minsMatch[1], 10);
    if (secsMatch) total += Math.max(0.2, parseInt(secsMatch[1], 10) / 60);
    return total > 0 ? total : 5;
  };

  const parseIntensity = (raw: string): number => {
    const pctMatch = raw.match(/(\d+)\s*%/);
    if (pctMatch) return parseInt(pctMatch[1], 10);
    const rangeMatch = raw.match(/(\d+)\s*-\s*(\d+)\s*%/);
    if (rangeMatch) return (parseInt(rangeMatch[1], 10) + parseInt(rangeMatch[2], 10)) / 2;
    if (/z1|recup|f[aá]cil/i.test(raw)) return 60;
    if (/z2|aer[oó]b|base/i.test(raw)) return 72;
    if (/z3|tempo|sweetspot/i.test(raw)) return 85;
    if (/z4|umbral|threshold/i.test(raw)) return 98;
    if (/z5|vo2|acelerac/i.test(raw)) return 112;
    return 70;
  };

  for (const line of lines) {
    const repeatMatch = line.match(/^(\d+)x\s*$/i);
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

    if (line.startsWith("-")) {
      const segText = line.replace(/^-+\s*/, "").trim();
      const dur = parseDuration(segText);
      const intensity = parseIntensity(segText);
      const seg: IntervalSegment = {
        durationMins: dur,
        intensityPercent: intensity,
        label: segText,
      };

      if (inRepeatBlock) {
        repeatBuffer.push(seg);
      } else {
        segments.push(seg);
      }
    }
  }

  if (inRepeatBlock && repeatBuffer.length > 0) {
    for (let r = 0; r < repeatCount; r++) {
      segments.push(...repeatBuffer);
    }
  }

  const totalMins = segments.reduce((sum, s) => sum + s.durationMins, 0);

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
  className?: string;
}

export const WorkoutChart: React.FC<WorkoutChartProps> = ({
  workoutDoc,
  discipline,
  className = "",
}) => {
  const { segments, totalMins } = parseWorkoutDoc(workoutDoc);

  if (segments.length === 0 || discipline === "Descanso") {
    return null;
  }

  const getSegmentColor = (intensity: number) => {
    if (intensity <= 65) return "#34d399"; // Verde suave Z1 (Recovery)
    if (intensity <= 80) return "#10b981"; // Verde intenso Z2 (Aeróbico)
    if (intensity <= 92) return "#facc15"; // Amarillo Sweetspot/Tempo Z3
    if (intensity <= 104) return "#fb923c"; // Naranja Umbral Z4
    return "#f87171"; // Rojo VO2max Z5 / Anaeróbico
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
              title={`${seg.durationMins >= 1 ? `${Math.round(seg.durationMins)}m` : `${Math.round(seg.durationMins * 60)}s`} @ ${seg.intensityPercent}%`}
            />
          );
        })}
      </div>
    </div>
  );
};
