import { AthleteProfile } from "../intervals/types";
import { PhysiologicalStatus, PhysiologicalEngine } from "../physiology/engine";
import { MacrocyclePhaseInfo } from "../physiology/macrocycle";
import {
  AgentDecisionOutput,
  PlanItem,
  WeeklyAvailabilityMap,
  DEFAULT_WEEKLY_AVAILABILITY,
  normalizeDisciplines,
  DisciplineType,
} from "./types";

/**
 * Generador determinístico de alta precisión con soporte multideporte y doble sesión por día.
 */
export function generateDeterministicAnalysis(
  profile: AthleteProfile,
  status: PhysiologicalStatus,
  weekDates: Array<{ day: string; date: string; formattedDate: string }>,
  macrocyclePhase?: MacrocyclePhaseInfo | null,
  availability: WeeklyAvailabilityMap = DEFAULT_WEEKLY_AVAILABILITY
): AgentDecisionOutput {
  const isFatigued = status.status === "OVERTRAINING_RISK" || status.status === "CAUTION";
  const runFtp = profile.run_ftp || 280;
  const bikeFtp = profile.bike_ftp || 200;
  const phase = macrocyclePhase?.phase || "MAINTENANCE";

  const macroTitle = macrocyclePhase?.primaryRace
    ? `Macrociclo: ${macrocyclePhase.phaseLabel} (${macrocyclePhase.weeksRemaining} sem para ${macrocyclePhase.primaryRace.name}).`
    : `Macrociclo: Mantenimiento General Adaptativo.`;

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const suggestedPlan: PlanItem[] = days.map((day, idx) => {
    const rawDiscList = normalizeDisciplines(availability[day]);
    const dateInfo = weekDates[idx] || { date: "", formattedDate: "" };

    // 0. Manejo de Doble Sesión (Múltiples deportes configurados para el mismo día)
    if (rawDiscList.length > 1) {
      const hasCarrera = rawDiscList.includes("Carrera");
      const hasFuerza = rawDiscList.includes("Fuerza");
      const hasCiclismo = rawDiscList.includes("Ciclismo");
      const hasNatacion = rawDiscList.includes("Natacion");

      // A. Carrera + Fuerza (Doble Sesión Clásica de Resistencia)
      if (hasCarrera && hasFuerza) {
        const runDur = isFatigued ? 35 : 45;
        const strengthDur = 20;
        const totalDur = runDur + strengthDur;
        const totalTss = Math.round(runDur * 0.72) + 18;

        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Carrera",
          workoutName: `Doble Sesión: Carrera Z2 (${runDur}m) + Fuerza Sóleo (${strengthDur}m)`,
          action: "MANTENER",
          durationMinutes: totalDur,
          tss: totalTss,
          powerTarget: `${Math.round(runFtp * 0.72)}W (72% CP) + Fuerza Funcional`,
          justification: "Doble estímulo coordinado: volumen aeróbico de carrera en Z2 más trabajo de fuerza y pliometría para protección de sóleo/Aquiles.",
          workoutDoc: `Bloque 1: Carrera Stryd (% CP)\nWarmup\n- 10m 65% FTP\n\nMain\n- ${runDur - 15}m 72% FTP\n\nCooldown\n- 5m 60% FTP\n\nBloque 2: Fuerza Sóleo & Pliometría (WeightTraining)\nWarmup\n- 5m Mobility\n\nMain\n- 15m Pliometría Sóleo, Gemelo & Core`,
          isRestDay: false,
        };
      }

      // B. Ciclismo + Carrera (Transición Brick de Triatlón / Multideporte)
      if (hasCiclismo && hasCarrera) {
        const bikeDur = isFatigued ? 40 : 50;
        const runDur = 20;
        const totalDur = bikeDur + runDur;
        const totalTss = Math.round(bikeDur * 0.65) + Math.round(runDur * 0.80);

        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Ciclismo",
          workoutName: `Transición Brick: Ciclismo Z2 (${bikeDur}m) + Carrera a Pie (${runDur}m)`,
          action: "MANTENER",
          durationMinutes: totalDur,
          tss: totalTss,
          powerTarget: `Bici: ${Math.round(bikeFtp * 0.68)}W (68% FTP) • Carrera: ${Math.round(runFtp * 0.78)}W (78% CP)`,
          justification: "Entrenamiento de transición brick para adaptación neuromuscular a la carrera con pre-fatiga de pedaleo.",
          workoutDoc: `Bloque 1: Ciclismo Z2 (% FTP)\nWarmup\n- 10m 55% FTP\n\nMain\n- ${bikeDur - 15}m 68% FTP\n\nCooldown\n- 5m 50% FTP\n\nBloque 2: Carrera de Transición Stryd (% CP)\nMain\n- ${runDur - 5}m 78% FTP\n\nCooldown\n- 5m 60% FTP`,
          isRestDay: false,
        };
      }

      // C. Ciclismo + Fuerza
      if (hasCiclismo && hasFuerza) {
        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Ciclismo",
          workoutName: `Doble Sesión: Ciclismo Z2 (50m) + Fuerza Core & Tren Inferior (20m)`,
          action: "MANTENER",
          durationMinutes: 70,
          tss: 55,
          powerTarget: `${Math.round(bikeFtp * 0.65)}W (65% FTP) + Fuerza`,
          justification: "Volumen aeróbico sin impacto articular combinado con estabilidad lumbopélvica de core.",
          workoutDoc: `Bloque 1: Ciclismo Z2 (% FTP)\nWarmup\n- 10m 55% FTP\n\nMain\n- 35m 65% FTP\n\nCooldown\n- 5m 50% FTP\n\nBloque 2: Fuerza y Movilidad (WeightTraining)\nMain\n- 20m Core, Glúteo Medio & Foam Roller`,
          isRestDay: false,
        };
      }

      // D. Natación + Carrera / Ciclismo
      if (hasNatacion) {
        const secDisc = hasCarrera ? "Carrera" : hasCiclismo ? "Ciclismo" : "Fuerza";
        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Natacion",
          workoutName: `Doble Sesión: Natación Aeróbica (35m) + ${secDisc} (40m)`,
          action: "MANTENER",
          durationMinutes: 75,
          tss: 60,
          justification: "Doble estímulo multideporte combinando hidrodinámica y resistencia terrestre.",
          workoutDoc: `Bloque 1: Natación Técnica\n- 35m Nado Z1-Z2 Mixto\n\nBloque 2: ${secDisc}\n- 40m Aeróbico Base`,
          isRestDay: false,
        };
      }
    }

    const disc: DisciplineType = rawDiscList[0] || "Carrera";

    // 1. Descanso
    if (disc === "Descanso") {
      return {
        day,
        date: dateInfo.date,
        formattedDate: dateInfo.formattedDate,
        discipline: "Descanso",
        workoutName: "Descanso Pasivo Total",
        action: "MANTENER",
        durationMinutes: 0,
        tss: 0,
        justification: "Recuperación pasiva y asimilación neurovegetativa.",
        isRestDay: true,
      };
    }

    // 2. Natación
    if (disc === "Natacion") {
      return {
        day,
        date: dateInfo.date,
        formattedDate: dateInfo.formattedDate,
        discipline: "Natacion",
        workoutName: "Natación Aeróbica & Técnica (45m)",
        action: "MANTENER",
        durationMinutes: 45,
        tss: 38,
        justification: "Estímulo cardiovascular hidrodinámico sin impacto osteoarticular.",
        workoutDoc: "Warmup\n- 200m Nado Suave Z1\n\nMain (6x 100m)\n- 100m Ritmo Aeróbico Medio c/20s desc\n\nCooldown\n- 100m Nado Espalda / Suave",
        isRestDay: false,
      };
    }

    // 3. Ciclismo
    if (disc === "Ciclismo") {
      const isLong = day === "Sábado" || day === "Domingo";
      const isPeakBuild = phase === "BUILD" || phase === "PEAK";
      const isBaseCadence = (phase === "BASE_1" || phase === "BASE_2") && !isLong;

      if (isBaseCadence) {
        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Ciclismo",
          workoutName: "Ciclismo Z2 con Variaciones de Cadencia (55m)",
          action: "MANTENER",
          durationMinutes: 55,
          tss: 45,
          powerTarget: `${Math.round(bikeFtp * 0.70)}W (70% FTP)`,
          justification: "Optimización de eficiencia biomecánica y cadencia (90-100 rpm).",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Ride", "Cadencia", 75, phase),
          isRestDay: false,
        };
      }

      const rideDuration = isLong ? (isPeakBuild ? "1h45m" : "1h15m") : "55m";
      const rideMins = isLong ? (isPeakBuild ? 105 : 75) : 55;
      return {
        day,
        date: dateInfo.date,
        formattedDate: dateInfo.formattedDate,
        discipline: "Ciclismo",
        workoutName: isLong
          ? `Fondo Resistencia Ciclismo (${rideDuration} Z2)`
          : "Ciclismo Z2 Base Aeróbica (55m)",
        action: "MANTENER",
        durationMinutes: rideMins,
        tss: Math.round(rideMins * 0.68),
        powerTarget: `${Math.round(bikeFtp * 0.65)}W (65% FTP)`,
        justification: "Volumen aeróbico mitocondrial sin impacto osteoarticular.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Ride", isLong ? "LONG_RUN" : "Z2_BASE", 65, phase),
        isRestDay: false,
      };
    }

    // 4. Fuerza
    if (disc === "Fuerza") {
      return {
        day,
        date: dateInfo.date,
        formattedDate: dateInfo.formattedDate,
        discipline: "Fuerza",
        workoutName: "Fuerza Sóleo / Pliometría Reactiva (30m)",
        action: "MANTENER",
        durationMinutes: 30,
        tss: 25,
        justification: "Optimización neuromuscular, rigidez del tendón de Aquiles y prevención de lesiones.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("WeightTraining", "STRENGTH"),
        isRestDay: false,
      };
    }

    // 5. Carrera por defecto
    const isQuality = day === "Martes" || day === "Jueves";
    const isLongRun = day === "Domingo" || day === "Sábado";
    const isFridayStrides = day === "Viernes" && (phase === "BASE_1" || phase === "BASE_2");

    if (isFridayStrides && !isFatigued) {
      return {
        day,
        date: dateInfo.date,
        formattedDate: dateInfo.formattedDate,
        discipline: "Carrera",
        workoutName: "Rodaje Z1-Z2 + 5 Strides Reactivos (45m)",
        action: "MANTENER",
        durationMinutes: 45,
        tss: 42,
        powerTarget: `${Math.round(runFtp * 0.72)}W + Strides @ 115% CP`,
        justification: "Estímulo de reactividad elástica del tendón de Aquiles y economía de zancada.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "Strides", 115, phase),
        isRestDay: false,
      };
    }

    if (isQuality && !isFatigued) {
      return {
        day,
        date: dateInfo.date,
        formattedDate: dateInfo.formattedDate,
        discipline: "Carrera",
        workoutName: "Series Umbral Stryd (4x6m @ 100% FTP)",
        action: "MANTENER",
        durationMinutes: 55,
        tss: 58,
        powerTarget: `${runFtp}W (100% CP)`,
        justification: "Estímulo de potencia crítica y tolerancia al lactato.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "THRESHOLD_INTERVALS", 100, phase),
        isRestDay: false,
      };
    }

    if (isLongRun && !isFatigued) {
      const longMins = phase === "PEAK" ? 105 : 75;
      return {
        day,
        date: dateInfo.date,
        formattedDate: dateInfo.formattedDate,
        discipline: "Carrera",
        workoutName: phase === "PEAK"
          ? "Fondo Específico Maratón Stryd (1h45m)"
          : "Tirada Larga Progresiva Stryd (1h15m)",
        action: "MANTENER",
        durationMinutes: longMins,
        tss: Math.round(longMins * 0.80),
        powerTarget: `${Math.round(runFtp * 0.78)}W (78% CP)`,
        justification: "Desarrollo de durabilidad y potencia específica de competición.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 80, phase),
        isRestDay: false,
      };
    }

    return {
      day,
      date: dateInfo.date,
      formattedDate: dateInfo.formattedDate,
      discipline: "Carrera",
      workoutName: isFatigued
        ? "Rodaje Suave Z1 Regenerativo Stryd (35m)"
        : "Rodaje Progresivo Z1-Z2 Stryd (45m)",
      action: isFatigued ? "MODIFICAR" : "MANTENER",
      durationMinutes: isFatigued ? 35 : 45,
      tss: isFatigued ? 26 : 38,
      powerTarget: `${Math.round(runFtp * 0.70)}W (70% CP)`,
      justification: isFatigued
        ? "Atenuación a Z1 para proteger tono parasimpático y acelerar recuperación."
        : "Rodaje aeróbico base para consistencia de fitness.",
      workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "RECOVERY", 70, phase),
      isRestDay: false,
    };
  });

  return {
    status: status.status,
    summaryHeadline: isFatigued
      ? `Fatiga acumulada (TSB: ${status.tsb.toFixed(1)}). Se modulan las cargas para acelerar la asimilación.`
      : `Estado adaptativo óptimo (${macroTitle}). Microciclo calibrado con estímulos variados.`,
    macrocyclePhase: macrocyclePhase?.phaseLabel,
    reasoningTree: [
      `1. Contexto de Temporada: ${macroTitle}`,
      `2. Multi-Disciplina: Soporte completo para días de doble sesión y transiciones brick.`,
      `3. Evaluación Banister: CTL=${status.ctl.toFixed(1)}, ATL=${status.atl.toFixed(1)}, TSB=${status.tsb.toFixed(1)}.`,
      `4. Matriz Base: ${Object.entries(availability).map(([d, disc]) => `${d}: ${Array.isArray(disc) ? disc.join("+") : disc}`).join(", ")}.`,
    ],
    modelUsed: "Motor Fisiológico Determinístico",
    suggestedPlan,
  };
}
