import { PlanItem, WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY } from "../gemini/engine";
import { PhysiologicalEngine } from "./engine";
import { MacrocycleWeek, MacrocycleBlueprint } from "./macrocycle";

/**
 * Genera la plantilla de microciclo de 7 días (Lunes a Domingo) específica y diferenciada
 * para cualquier semana del macrociclo a partir de los indicadores físicos del atleta.
 */
export function generateWeekTemplate(
  week: MacrocycleWeek,
  runFtp: number = 285,
  bikeFtp: number = 260,
  availability: WeeklyAvailabilityMap = DEFAULT_WEEKLY_AVAILABILITY
): PlanItem[] {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const weekStart = new Date(week.startDate + "T00:00:00");
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const weekNumber = week.weekNumber;
  const countdown = week.countdownWeeks;
  const phase = week.phase;
  const microType = week.microcycleType;

  return days.map((day, idx) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + idx);
    const dateStr = d.toISOString().split("T")[0];
    const formattedDate = `${d.getDate()} ${months[d.getMonth()]}`;

    const disc = availability[day] || "Carrera";

    // 1. Descanso
    if (disc === "Descanso") {
      return {
        day,
        date: dateStr,
        formattedDate,
        discipline: "Descanso",
        workoutName: "Descanso Pasivo Total",
        action: "MANTENER",
        justification: "Recuperación biológica, descanso neuromuscular y asimilación.",
        isRestDay: true,
      };
    }

    // 2. Fuerza
    if (disc === "Fuerza") {
      const isTaper = phase === "TAPER" || phase === "RACE_WEEK";
      return {
        day,
        date: dateStr,
        formattedDate,
        discipline: "Fuerza",
        workoutName: isTaper
          ? "Movilidad Articular & Activación Neural (20m)"
          : "Fuerza Sóleo / Pliometría Reactiva & Prevención Aquiles",
        action: "MANTENER",
        justification: isTaper
          ? "Mantenimiento del tono neuromuscular sin generar fatiga residual."
          : "Optimización de rigidez elástica (tendón de Aquiles) y fuerza excéntrica de sóleo.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("WeightTraining", "STRENGTH"),
        isRestDay: false,
      };
    }

    // 3. Ciclismo
    if (disc === "Ciclismo") {
      const isWeekend = day === "Sábado" || day === "Domingo";

      if (phase === "RACE_WEEK") {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Ciclismo",
          workoutName: "Ciclismo Regenerativo Suave (30m Z1)",
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * 0.50)}W (50% FTP)`,
          justification: "Soltura cardiovascular sin impacto previo al día de carrera.",
          workoutDoc: "Warmup\n- 10m 45% FTP\n\nMain\n- 15m 50% FTP\n\nCooldown\n- 5m 40% FTP",
          isRestDay: false,
        };
      }

      if (phase === "TAPER") {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Ciclismo",
          workoutName: "Ciclismo Z2 Ligero (45m)",
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * 0.60)}W (60% FTP)`,
          justification: "Mantenimiento aeróbico con descarga de volumen.",
          workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 25m 60% FTP\n\nCooldown\n- 10m 45% FTP",
          isRestDay: false,
        };
      }

      if (phase === "BUILD" || phase === "PEAK") {
        if (isWeekend) {
          const isPeak = phase === "PEAK" && microType === "IMPACTO_CHOQUE";
          const dur = isPeak ? "1h45m" : "1h30m";
          return {
            day,
            date: dateStr,
            formattedDate,
            discipline: "Ciclismo",
            workoutName: `Fondo Resistencia Ciclismo (${dur} Z2)`,
            action: "MANTENER",
            powerTarget: `${Math.round(bikeFtp * 0.65)}W (65% FTP)`,
            justification: "Volumen mitocondrial de alta durabilidad sin impacto articular.",
            workoutDoc: `Warmup\n- 15m 55% FTP\n\nMain\n- ${dur} 65% FTP\n\nCooldown\n- 10m 50% FTP`,
            isRestDay: false,
          };
        }

        // Entre semana: Sweetspot / Tempo
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Ciclismo",
          workoutName: "Ciclismo Sweetspot (3x8m @ 85% FTP)",
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * 0.85)}W (85% FTP)`,
          justification: "Densidad de potencia aeróbica y estímulo glucolítico controlado.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 8m 85% FTP\n- 3m 55% FTP\n\nCooldown\n- 10m 50% FTP",
          isRestDay: false,
        };
      }

      // Base / Mantenimiento
      if (isWeekend) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Ciclismo",
          workoutName: "Fondo Aeróbico Ciclismo Z2 (1h15m)",
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * 0.65)}W (65% FTP)`,
          justification: "Base mitocondrial aeróbica.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\nMain\n- 55m 65% FTP\n\nCooldown\n- 10m 50% FTP",
          isRestDay: false,
        };
      }

      return {
        day,
        date: dateStr,
        formattedDate,
        discipline: "Ciclismo",
        workoutName: "Ciclismo Z2 con Variaciones de Cadencia (55m)",
        action: "MANTENER",
        powerTarget: `${Math.round(bikeFtp * 0.70)}W (70% FTP)`,
        justification: "Eficiencia de pedaleo a 95-105 rpm.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Ride", "Cadencia", 75, phase),
        isRestDay: false,
      };
    }

    // 4. Carrera por defecto (Stryd Power CP)
    const isTuesday = day === "Martes";
    const isFriday = day === "Viernes";
    const isSunday = day === "Domingo" || day === "Sábado";

    // A. SEMANA DE CARRERA (RACE WEEK)
    if (phase === "RACE_WEEK") {
      if (isSunday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "🏆 COMPETICIÓN OBJETIVO: MARATÓN (42.195 km)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.80)}W (80% CP Ritmo Maratón)`,
          justification: "¡Día del evento principal! Ejecución a potencia constante Stryd.",
          workoutDoc: "Warmup\n- 10m 70% FTP\n\nMain\n- 42.195km 80% FTP\n\nCooldown\n- 5m 50% FTP",
          isRestDay: false,
        };
      }
      if (isTuesday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "Activación Pre-Carrera (25m + 3 Strides)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.70)}W + Strides @ 105% CP`,
          justification: "Despertar neuromuscular previo al evento sin generar fatiga.",
          workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 10m 72% FTP\n\n3x\n- 20s 105% FTP\n- 40s 55% FTP\n\nCooldown\n- 5m 60% FTP",
          isRestDay: false,
        };
      }
      return {
        day,
        date: dateStr,
        formattedDate,
        discipline: "Carrera",
        workoutName: "Trote Suave de Soltura Z1 (20m)",
        action: "MANTENER",
        powerTarget: `${Math.round(runFtp * 0.65)}W (65% CP)`,
        justification: "Mantener piernas sueltas y tono parasimpático.",
        workoutDoc: "Warmup\n- 5m 60% FTP\n\nMain\n- 10m 65% FTP\n\nCooldown\n- 5m 55% FTP",
        isRestDay: false,
      };
    }

    // B. TAPERING (SEMANAS 14-15)
    if (phase === "TAPER") {
      if (isSunday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "Rodaje de Puesta a Punto Z1-Z2 (45m)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.70)}W (70% CP)`,
          justification: "Descarga de volumen para maximizar el TSB y supercompensar.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 70, "TAPER"),
          isRestDay: false,
        };
      }
      if (isTuesday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "Toques a Ritmo Maratón (35m con 3x2m @ 82% CP)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.82)}W (82% CP)`,
          justification: "Recordatorio neuromuscular de ritmo maratón con bajo volumen.",
          workoutDoc: "Warmup\n- 10m 68% FTP\n\n3x\n- 2m 82% FTP\n- 2m 65% FTP\n\nCooldown\n- 10m 62% FTP",
          isRestDay: false,
        };
      }
      return {
        day,
        date: dateStr,
        formattedDate,
        discipline: "Carrera",
        workoutName: "Rodaje Regenerativo Suave (35m Z1)",
        action: "MANTENER",
        powerTarget: `${Math.round(runFtp * 0.68)}W (68% CP)`,
        justification: "Oxigenación y recuperación activa.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "RECOVERY", 68, "TAPER"),
        isRestDay: false,
      };
    }

    // C. PICO / PEAK (SEMANAS 11-13 - FONDOS ESPECÍFICOS MARATÓN)
    if (phase === "PEAK") {
      if (isSunday) {
        const isImpact = microType === "IMPACTO_CHOQUE";
        const longDuration = isImpact ? (countdown === 5 ? "1h45m" : "1h55m") : "1h15m";
        const targetTssLong = isImpact ? 110 : 70;

        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: isImpact
            ? `🔥 Fondo Clave Maratón Stryd (${longDuration} con Bloques @ 80% CP)`
            : "Rodaje Largo de Asimilación Z2 (1h15m)",
          action: "MANTENER",
          powerTarget: isImpact ? `${Math.round(runFtp * 0.80)}W (80% CP Ritmo Maratón)` : `${Math.round(runFtp * 0.74)}W (74% CP)`,
          justification: isImpact
            ? "Simulación biomecánica y energética específica de 28-32km de maratón."
            : "Asimilación intermedia para evitar fatiga crónica residual.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 80, "PEAK"),
          isRestDay: false,
        };
      }

      if (isTuesday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "Series de Potencia Crítica Stryd (5x4m @ 102% CP)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 1.02)}W (102% CP)`,
          justification: "Optimización de consumo de oxígeno y economía a velocidad de umbral.",
          workoutDoc: "Warmup\n- 15m 70% FTP\n\n5x\n- 4m 102% FTP\n- 2m30s 65% FTP\n\nCooldown\n- 10m 62% FTP",
          isRestDay: false,
        };
      }

      return {
        day,
        date: dateStr,
        formattedDate,
        discipline: "Carrera",
        workoutName: "Rodaje Aeróbico Z2 + 4 Strides (45m)",
        action: "MANTENER",
        powerTarget: `${Math.round(runFtp * 0.72)}W + Strides @ 110% CP`,
        justification: "Mantenimiento del volumen semanal con reactividad de tobillo.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "Strides", 110, "PEAK"),
        isRestDay: false,
      };
    }

    // D. CONSTRUCCIÓN / BUILD (SEMANAS 5-10 - SERIES DE UMBRAL & DURABILIDAD)
    if (phase === "BUILD") {
      if (isSunday) {
        const isRecovery = microType === "DESCARGA_ASIMILACION";
        const longDuration = isRecovery ? "1h10m" : (weekNumber >= 8 ? "1h30m" : "1h20m");

        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: isRecovery
            ? "Tirada Larga de Asimilación 3:1 (1h10m Z2)"
            : `Tirada Larga Progresiva Stryd (${longDuration})`,
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.76)}W (76% CP)`,
          justification: isRecovery
            ? "Consolidación de adaptaciones y recuperación de fibras musculares."
            : "Extensión progresiva de la durabilidad y economía de zancada.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 78, "BUILD"),
          isRestDay: false,
        };
      }

      if (isTuesday) {
        const reps = weekNumber >= 8 ? "4x8m" : "4x6m";
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: `Series Umbral Stryd Z4 (${reps} @ 100% CP)`,
          action: "MANTENER",
          powerTarget: `${runFtp}W (100% CP / Umbral)`,
          justification: "Elevación de la potencia crítica y tolerancia al aclaramiento de lactato.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "THRESHOLD_INTERVALS", 100, "BUILD"),
          isRestDay: false,
        };
      }

      if (isFriday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "Rodaje Z1-Z2 + 5 Strides Reactivos (45m)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.72)}W + Strides @ 115% CP`,
          justification: "Reactividad neuromuscular previa al fin de semana.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "Strides", 115, "BUILD"),
          isRestDay: false,
        };
      }

      return {
        day,
        date: dateStr,
        formattedDate,
        discipline: "Carrera",
        workoutName: "Rodaje Progresivo Aeróbico Z2 (45m)",
        action: "MANTENER",
        powerTarget: `${Math.round(runFtp * 0.73)}W (73% CP)`,
        justification: "Volumen base para acumulación de fitness.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "Z2_BASE", 73, "BUILD"),
        isRestDay: false,
      };
    }

    // E. BASE AERÓBICA I & II (SEMANAS 1-4)
    if (phase === "BASE_1" || phase === "BASE_2") {
      if (isSunday) {
        const isRecovery = microType === "DESCARGA_ASIMILACION";
        const longDuration = isRecovery ? "55m" : (phase === "BASE_2" ? "1h15m" : "1h05m");

        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: isRecovery
            ? "Rodaje Suave de Asimilación Base (55m Z2)"
            : `Tirada Larga Progresiva Base (${longDuration})`,
          action: "MANTENER",
          powerTarget: isRecovery ? `${Math.round(runFtp * 0.72)}W` : `${Math.round(runFtp * 0.75)}W (75% CP)`,
          justification: isRecovery
            ? "Semana 3:1 de asimilación biológica para refrescar el TSB."
            : "Desarrollo mitocondrial y volumen controlado de base aeróbica.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 75, phase),
          isRestDay: false,
        };
      }

      if (isTuesday) {
        if (phase === "BASE_2" && weekNumber === 3) {
          return {
            day,
            date: dateStr,
            formattedDate,
            discipline: "Carrera",
            workoutName: "Tempo Aeróbico Z3 Stryd (2x10m @ 86% CP)",
            action: "MANTENER",
            powerTarget: `${Math.round(runFtp * 0.86)}W (86% CP)`,
            justification: "Estímulo de capacidad aeróbica extensiva sin generar estrés glucolítico.",
            workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "Tempo", 86, phase),
            isRestDay: false,
          };
        }

        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "Fartlek de Cuestas Cortas Stryd (6x45s @ 96% CP)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.96)}W (96% CP en cuesta)`,
          justification: "Reclutamiento de unidades motoras rápidas y fuerza específica sin acidosis láctica.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "Cuestas", 96, phase),
          isRestDay: false,
        };
      }

      if (isFriday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "Rodaje Z1-Z2 + 4 Strides Reactivos (45m)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.72)}W + Strides @ 110% CP`,
          justification: "Activación elástica de sóleo y tendón de Aquiles.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "Strides", 110, phase),
          isRestDay: false,
        };
      }

      return {
        day,
        date: dateStr,
        formattedDate,
        discipline: "Carrera",
        workoutName: "Rodaje Progresivo Z1-Z2 Stryd (45m)",
        action: "MANTENER",
        powerTarget: `${Math.round(runFtp * 0.70)}W (70% CP)`,
        justification: "Rodaje aeróbico base para acondicionamiento capilar.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "RECOVERY", 70, phase),
        isRestDay: false,
      };
    }

    // F. MANTENIMIENTO GENERAL ADAPTATIVO (O PRE-MARATÓN)
    if (isSunday) {
      return {
        day,
        date: dateStr,
        formattedDate,
        discipline: "Carrera",
        workoutName: "Rodaje Largo Aeróbico Z2 (55m)",
        action: "MANTENER",
        powerTarget: `${Math.round(runFtp * 0.74)}W (74% CP)`,
        justification: "Consistencia aeróbica y economía de carrera sin castigo biomecánico excesivo.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 74, "MAINTENANCE"),
        isRestDay: false,
      };
    }

    if (isTuesday) {
      return {
        day,
        date: dateStr,
        formattedDate,
        discipline: "Carrera",
        workoutName: "Rodaje Progresivo con Toques Z3 Stryd (45m)",
        action: "MANTENER",
        powerTarget: `${Math.round(runFtp * 0.85)}W (85% CP)`,
        justification: "Estímulo neuromuscular controlado sin acumular fatiga residual.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "Z2_BASE", 85, "MAINTENANCE"),
        isRestDay: false,
      };
    }

    return {
      day,
      date: dateStr,
      formattedDate,
      discipline: "Carrera",
      workoutName: "Rodaje Progresivo Z1-Z2 Stryd (45m)",
      action: "MANTENER",
      powerTarget: `${Math.round(runFtp * 0.70)}W (70% CP)`,
      justification: "Rodaje aeróbico base para consistencia de fitness.",
      workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "RECOVERY", 70, "MAINTENANCE"),
      isRestDay: false,
    };
  });
}
