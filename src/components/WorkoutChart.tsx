"use client";

import React from "react";
import { Dumbbell } from "lucide-react";

export interface IntervalSegment {
  durationMins: number;
  intensityPercent: number;
  label?: string;
}

export interface StrengthExercise {
  reps: string;
  name: string;
  raw: string;
}

export interface StrengthCircuitInfo {
  rounds: number;
  circuitTitle: string;
  warmupMins: number;
  cooldownMins: number;
  exercises: StrengthExercise[];
  totalMins: number;
}

export function isStrengthDoc(doc?: string, discipline?: string): boolean {
  if (discipline) {
    const d = discipline.toLowerCase();
    return d === "fuerza" || d === "weighttraining" || d === "gym" || d === "fortalecimiento";
  }
  if (!doc) return false;
  // Si contiene prescripción de potencia (% FTP, % CP, vatios) o ritmo de carrera/bici, NUNCA es fuerza
  if (/% ftp|% cp|pace|ritmo|w\/kg|\bftp\b|\bcp\b/i.test(doc)) return false;
  // Solo es fuerza si contiene bloques explícitos de circuito/fuerza sin potencia
  return /(?:circuito|bloque)[^\n]*\(\d+\s*rondas?\)|(?:rondas?|estaciones).*sentadilla|plancha.*face-pull/i.test(doc);
}

export function parseStrengthDoc(doc?: string, workoutName?: string): StrengthCircuitInfo {
  if (!doc || doc.trim().length === 0) {
    return { rounds: 3, circuitTitle: "Circuito Funcional", warmupMins: 5, cooldownMins: 5, exercises: [], totalMins: 35 };
  }

  const titleMinsMatch = (workoutName || doc).match(/\((\d+)\s*m(?:in)?\)/i);
  const totalMins = titleMinsMatch ? parseInt(titleMinsMatch[1], 10) : 35;

  const roundsMatch = doc.match(/\((\d+)\s*rondas?\)/i) || doc.match(/(\d+)\s*rondas?/i);
  const rounds = roundsMatch ? parseInt(roundsMatch[1], 10) : 3;

  const circuitTitleMatch = doc.match(/(?:Circuito|Bloque)\s+([^\n(]+)/i);
  const circuitTitle = circuitTitleMatch ? circuitTitleMatch[0].trim() : "Circuito Estructural";

  const lines = doc.split("\n").map((l) => l.trim()).filter(Boolean);
  const exercises: StrengthExercise[] = [];

  for (const line of lines) {
    if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
      const clean = line.replace(/^[-•*]+\s*/, "").trim();
      const repMatch = clean.match(/^(\d+\s*[xs]|\d+\s*reps?|\d+\s*seg)\s+(.*)$/i);
      if (repMatch) {
        const reps = repMatch[1].trim();
        const fullName = repMatch[2].trim();
        const shortName = fullName.replace(/\s*\([^)]*\)/g, "").split(/\s+/).slice(0, 2).join(" ");
        exercises.push({
          reps,
          name: shortName || fullName,
          raw: clean,
        });
      }
    }
  }

  return {
    rounds,
    circuitTitle,
    warmupMins: 5,
    cooldownMins: 5,
    exercises,
    totalMins,
  };
}

export function parseWorkoutDoc(doc?: string, discipline?: string): {
  segments: IntervalSegment[];
  totalMins: number;
  estimatedTss: number;
} {
  if (!doc || doc.trim().length === 0) {
    return { segments: [], totalMins: 0, estimatedTss: 0 };
  }

  if (isStrengthDoc(doc, discipline)) {
    const stInfo = parseStrengthDoc(doc);
    return {
      segments: [],
      totalMins: stInfo.totalMins,
      estimatedTss: Math.round(stInfo.totalMins * 0.72),
    };
  }

  const lines = doc.split("\n").map((l) => l.trim()).filter(Boolean);
  const segments: IntervalSegment[] = [];

  let repeatCount = 1;
  let inRepeatBlock = false;
  let repeatBuffer: IntervalSegment[] = [];
  let inIgnoredSection = false;

  const parseDuration = (raw: string): number => {
    const isSwim = /nataci|swim/i.test(discipline || "") || /nado|crol|espalda|braza/i.test(raw);
    const minsMatch = raw.match(/(\d+)\s*m(?:in)?/i);
    const secsMatch = raw.match(/(\d+)\s*s/i);
    const hoursMatch = raw.match(/(\d+)\s*h/i);

    let total = 0;
    if (hoursMatch) total += parseInt(hoursMatch[1], 10) * 60;
    if (minsMatch) {
      const val = parseInt(minsMatch[1], 10);
      if (isSwim && val >= 25) {
        total += Math.max(0.5, Math.round((val / 50) * 10) / 10);
      } else {
        total += Math.min(val, 120);
      }
    }
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
    if (/activaci[oó]n neuromuscular|estrategia nutricional|pulse fueling/i.test(line)) {
      inIgnoredSection = true;
      continue;
    }
    if (/^(?:warmup|main|cooldown|calentamiento|principal|series|bloque|enfriamiento|recuperaci[oó]n|interval)/i.test(line)) {
      inIgnoredSection = false;
    }
    if (inIgnoredSection) {
      continue;
    }
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
    // Escala Oficial Stryd (CP):
    // Z1 Fácil / Recuperación (65-80% CP): Verde Esmeralda
    // Z2 Moderado / Aeróbico (80-90% CP): Amarillo / Dorado
    // Z3 Umbral (90-100% CP): Naranja
    // Z4 Intervalo / VO2max (100-115% CP): Rojo
    // Z5 Repetición / Anaeróbico (>115% CP): Púrpura
    if (intensity <= 65) return "#34d399"; // Verde suave recuperación activa (<65%)
    if (intensity <= 80) return "#10b981"; // Stryd Zona 1: Fácil (65 - 80% CP)
    if (intensity <= 90) return "#facc15"; // Stryd Zona 2: Moderado (80 - 90% CP)
    if (intensity <= 100) return "#fb923c"; // Stryd Zona 3: Umbral (90 - 100% CP)
    if (intensity <= 115) return "#ef4444"; // Stryd Zona 4: Intervalo (100 - 115% CP)
    return "#a855f7"; // Stryd Zona 5: Repetición (>115% CP)
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
              title={`${seg.durationMins >= 1 ? `${Math.round(seg.durationMins)}m` : `${Math.round(seg.durationMins * 60)}s`} @ ${seg.intensityPercent}%${athleteFtp && athleteFtp > 0 ? ` (${Math.round((athleteFtp * seg.intensityPercent) / 100)}W)` : ""}`}
            />
          );
        })}
      </div>
    </div>
  );
};
