"use client";

import React from "react";

interface WorkoutBlockChartProps {
  discipline: string;
  durationMinutes: number;
  tss: number;
  intensity?: string;
  workoutStructure?: string;
}

interface BlockSegment {
  label: string;
  durationPct: number;
  intensityPct: number;
  zoneColor: string;
  zoneName: string;
}

/**
 * Genera una representación visual moderna de bloques de entrenamiento por zonas de potencia
 */
export const HeadCoachWorkoutBlockChart: React.FC<WorkoutBlockChartProps> = ({
  discipline,
  durationMinutes,
  tss,
  intensity = "",
  workoutStructure = "",
}) => {
  if (discipline === "Descanso" || durationMinutes <= 0) {
    return (
      <div className="h-7 w-full rounded-lg bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-[10px] font-mono text-slate-500">
        Descanso Pasivo • 0 TSS
      </div>
    );
  }

  // Parsear segmentos sintéticos o estructurados
  const parseSegments = (): BlockSegment[] => {
    const isQuality = /interval|series|umbral|tempo|vo2|fartlek|sweetspot/i.test(intensity) || tss >= 55;
    const isLongRun = durationMinutes >= 75;

    if (isQuality) {
      return [
        { label: "Calentamiento", durationPct: 20, intensityPct: 65, zoneColor: "bg-sky-400 dark:bg-sky-500", zoneName: "Z1-Z2" },
        { label: "Intervalos", durationPct: 15, intensityPct: 100, zoneColor: "bg-amber-500 dark:bg-amber-400", zoneName: "Z4" },
        { label: "Recuperación", durationPct: 8, intensityPct: 60, zoneColor: "bg-sky-400 dark:bg-sky-500", zoneName: "Z1" },
        { label: "Intervalos", durationPct: 15, intensityPct: 100, zoneColor: "bg-amber-500 dark:bg-amber-400", zoneName: "Z4" },
        { label: "Recuperación", durationPct: 8, intensityPct: 60, zoneColor: "bg-sky-400 dark:bg-sky-500", zoneName: "Z1" },
        { label: "Intervalos", durationPct: 15, intensityPct: 100, zoneColor: "bg-amber-500 dark:bg-amber-400", zoneName: "Z4" },
        { label: "Enfriamiento", durationPct: 19, intensityPct: 55, zoneColor: "bg-slate-400 dark:bg-slate-500", zoneName: "Z1" },
      ];
    }

    if (isLongRun) {
      return [
        { label: "Inicio suave", durationPct: 25, intensityPct: 68, zoneColor: "bg-emerald-500 dark:bg-emerald-400", zoneName: "Z2" },
        { label: "Bloque crucero", durationPct: 50, intensityPct: 76, zoneColor: "bg-teal-500 dark:bg-teal-400", zoneName: "Z2+" },
        { label: "Progresivo final", durationPct: 25, intensityPct: 82, zoneColor: "bg-amber-500 dark:bg-amber-400", zoneName: "Z3" },
      ];
    }

    // Carrera continua aeróbica o ciclismo base Z2
    return [
      { label: "Activación", durationPct: 15, intensityPct: 60, zoneColor: "bg-sky-400 dark:bg-sky-500", zoneName: "Z1" },
      { label: "Fondo aeróbico continuo", durationPct: 70, intensityPct: 72, zoneColor: "bg-emerald-500 dark:bg-emerald-400", zoneName: "Z2" },
      { label: "Soltura", durationPct: 15, intensityPct: 55, zoneColor: "bg-slate-400 dark:bg-slate-500", zoneName: "Z1" },
    ];
  };

  const segments = parseSegments();

  return (
    <div className="w-full space-y-1">
      {/* Contenedor de Barras Gráficas de Potencia */}
      <div className="h-8 w-full rounded-lg bg-slate-100 dark:bg-slate-900/90 p-1 flex items-end gap-0.5 overflow-hidden border border-slate-200/80 dark:border-slate-800">
        {segments.map((seg, sIdx) => (
          <div
            key={sIdx}
            style={{
              width: `${seg.durationPct}%`,
              height: `${Math.max(28, Math.min(100, (seg.intensityPct / 110) * 100))}%`,
            }}
            className={`${seg.zoneColor} rounded-xs transition-all hover:opacity-85 relative group`}
            title={`${seg.label} (${seg.zoneName}): ~${seg.intensityPct}%`}
          />
        ))}
      </div>

      {/* Leyenda minimalista de duración y zonas */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 px-0.5">
        <span>⏱️ {durationMinutes} min</span>
        <span>⚡ {tss} TSS</span>
        <span className="truncate max-w-[130px] font-semibold text-slate-700 dark:text-slate-300">
          {intensity || `${discipline} Z2`}
        </span>
      </div>
    </div>
  );
};
