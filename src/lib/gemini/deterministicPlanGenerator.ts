import { AthleteProfile } from "../intervals/types";
import { PhysiologicalStatus, PhysiologicalEngine } from "../physiology/engine";
import { MacrocyclePhaseInfo } from "../physiology/macrocycle";
import { resolveSpecializedStrengthWorkout } from "../physiology/specializedStrengthCoaches";
import { BIKE_TEST_RAMP } from "../ai/knowledge/testingProtocols";
import { adaptRunningPlanItem, resolveRunningMode } from "../physiology/runningWorkoutAdapter";
import {
  AgentDecisionOutput,
  PlanItem,
  WeeklyAvailabilityMap,
  DEFAULT_WEEKLY_AVAILABILITY,
  normalizeDisciplines,
  getDayDisciplines,
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
  const runningMode = resolveRunningMode(profile);
  const runFtp = runningMode === "POWER" ? (profile.run_ftp || 280) : 0;
  const bikeFtp = profile.bike_ftp || 200;
  const phase = macrocyclePhase?.phase || "MAINTENANCE";
  const isFtpTestWeek = !isFatigued && (macrocyclePhase?.blueprint?.currentWeek?.microcycleType === "TEST_CONTROL" || /test.*ftp|control.*ftp/i.test(`${macrocyclePhase?.guideline || ""} ${macrocyclePhase?.suggestedFocus || ""}`));
  const macroTitle = macrocyclePhase?.primaryRace ? `Macrociclo: ${macrocyclePhase.phaseLabel} (${macrocyclePhase.weeksRemaining} sem para ${macrocyclePhase.primaryRace.name}).` : `Macrociclo: Mantenimiento General Adaptativo.`;
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const suggestedPlan: PlanItem[] = days.map((day, idx) => {
    const rawDiscList = getDayDisciplines(availability, day);
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
          powerTarget: runFtp > 0 ? `${Math.round(runFtp * 0.72)}W (72% CP) + Fuerza Funcional` : `72% Pace + Fuerza Funcional`,
          justification: "Doble estímulo coordinado: volumen aeróbico de carrera en Z2 más trabajo de fuerza y pliometría para protección de sóleo/Aquiles.",
          workoutDoc: `Bloque 1: Carrera ${runFtp > 0 ? "Stryd (% CP)" : "(% Pace)"}\nWarmup\n- 10m ${runFtp > 0 ? "65% CP" : "65% Pace"}\n\nMain\n- ${runDur - 15}m ${runFtp > 0 ? "72% CP" : "72% Pace"}\n\nCooldown\n- 5m ${runFtp > 0 ? "60% CP" : "60% Pace"}\n\nBloque 2: Fuerza Sóleo & Pliometría (WeightTraining)\nWarmup\n- 5m Mobility\n\nMain\n- 15m Pliometría Sóleo, Gemelo & Core`,
          isRestDay: false,
        };
      }

      // B. Ciclismo + Carrera (Transición Brick de Triatlón / Multideporte)
      if (hasCiclismo && hasCarrera) {
        const isPeak = phase === "PEAK";
        const bikeDur = isFatigued ? 40 : (isPeak ? 65 : 50);
        const runDur = isFatigued ? 15 : (isPeak ? 25 : 20);
        const totalDur = bikeDur + runDur;
        const totalTss = Math.round(bikeDur * (isPeak ? 0.78 : 0.65)) + Math.round(runDur * 0.82);

        return {
          day, date: dateInfo.date, formattedDate: dateInfo.formattedDate, discipline: "Ciclismo",
          workoutName: isPeak
            ? `Transición Brick Cumbre: Ciclismo (${bikeDur}m) + Carrera a Pie (${runDur}m)`
            : `Transición Brick: Ciclismo Z2 (${bikeDur}m) + Carrera a Pie (${runDur}m)`,
          action: "MANTENER", durationMinutes: totalDur, tss: totalTss,
          powerTarget: `Bici: ${Math.round(bikeFtp * (isPeak ? 0.78 : 0.68))}W (${isPeak ? "78% FTP" : "68% FTP"}) • Carrera: ${runFtp > 0 ? `${Math.round(runFtp * 0.82)}W (82% CP)` : "82% Pace"}`,
          justification: isPeak
            ? "Transición neuromuscular cumbre de competición para adaptar la zancada sobre fatiga previa de pedaleo exigente."
            : "Entrenamiento de transición brick para adaptación neuromuscular a la carrera con pre-fatiga de pedaleo.",
          workoutDoc: `Bloque 1: Ciclismo ${isPeak ? "Potencia Ritmo Carrera" : "Z2"} (% FTP)\nWarmup\n- 10m 55% FTP\n\nMain\n- ${bikeDur - 15}m ${isPeak ? "78% FTP" : "68% FTP"}\n\nCooldown\n- 5m 50% FTP\n\nBloque 2: Carrera de Transición ${runFtp > 0 ? "Stryd (% CP)" : "(% Pace)"}\nMain\n- ${runDur - 5}m ${runFtp > 0 ? "82% CP" : "78% Pace"}\n\nCooldown\n- 5m ${runFtp > 0 ? "60% CP" : "60% Pace"}`,
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
          workoutDoc: `Bloque 1: Natación Técnica\nWarmup\n- 200m 70% Pace\nMain\n- 800m 85% Pace\nCooldown\n- 100m 60% Pace\n\nBloque 2: ${secDisc}\n- 40m Aeróbico Base`,
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
        workoutDoc: "Warmup\n- 200m 70% Pace\n\nMain\n6x\n- 100m 90% Pace\n- 20s recovery\n\nCooldown\n- 100m 60% Pace",
        isRestDay: false,
      };
    }

    // 3. Ciclismo
    if (disc === "Ciclismo") {
      if (isFtpTestWeek) {
        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Ciclismo",
          workoutName: "🧪 Ramp Test Oficial FTP en Rodillo (Modo ERG)",
          action: "MANTENER",
          durationMinutes: 40,
          tss: 52,
          powerTarget: `Calibración • Ramp Test ERG (+6%/min hasta fallo) (FTP: ${bikeFtp}W)`,
          justification: "Test escalonado en rodillo en modo ERG para calibrar tu FTP sin error de pacing. Cada minuto sube la carga hasta el fallo voluntario. FTP = 75% del último escalón.",
          workoutDoc: BIKE_TEST_RAMP.workoutDoc,
          isRestDay: false,
        };
      }

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

      const isPeakRide = phase === "PEAK";
      const rideDuration = isLong ? (isPeakBuild ? "1h45m" : "1h15m") : (isPeakRide ? "1h05m" : "55m");
      const rideMins = isLong ? (isPeakBuild ? 105 : 75) : (isPeakRide ? 65 : 55);
      return {
        day, date: dateInfo.date, formattedDate: dateInfo.formattedDate, discipline: "Ciclismo",
        workoutName: isLong
          ? `Fondo Resistencia Ciclismo (${rideDuration} Z2)`
          : (isPeakRide ? "Ciclismo Específico Ritmo de Competición (1h05m SweetSpot)" : "Ciclismo Z2 Base Aeróbica (55m)"),
        action: "MANTENER", durationMinutes: rideMins, tss: Math.round(rideMins * (isPeakRide ? 0.82 : 0.68)),
        powerTarget: isPeakRide && !isLong ? `${Math.round(bikeFtp * 0.88)}W (88% FTP SweetSpot)` : `${Math.round(bikeFtp * 0.65)}W (65% FTP)`,
        justification: isPeakRide && !isLong ? "Estímulo de potencia submáxima específica y densidad mitocondrial para el sector ciclista." : "Volumen aeróbico mitocondrial sin impacto osteoarticular.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Ride", isLong ? "LONG_RUN" : (isPeakRide ? "TEMPO" : "Z2_BASE"), isPeakRide && !isLong ? 88 : 65, phase),
        isRestDay: false,
      };
    }

    // 4. Fuerza
    if (disc === "Fuerza") {
      const distStr = macrocyclePhase?.primaryRace?.distance || "";
      const sportCat = distStr.includes("tri") ? "Triathlon" : distStr.includes("bike") || distStr.includes("cycl") ? "Cycling" : distStr.includes("trail") ? "Trail" : "Running";
      const st = resolveSpecializedStrengthWorkout({
        sportCategory: sportCat,
        phase,
        weekNumber: 1,
        isRecovery: isFatigued,
      });
      return {
        day,
        date: dateInfo.date,
        formattedDate: dateInfo.formattedDate,
        discipline: "Fuerza",
        workoutName: st.name,
        action: "MANTENER",
        durationMinutes: st.durationMin,
        tss: st.tss,
        powerTarget: st.focus,
        justification: st.justification,
        workoutDoc: st.workoutDoc,
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
        workoutName: "Carrera Continua Z1-Z2 + 5 Strides Reactivos (45m)",
        action: "MANTENER",
        durationMinutes: 45,
        tss: 42,
        powerTarget: runFtp > 0 ? `${Math.round(runFtp * 0.72)}W + Strides @ 115% CP` : `72% Pace + Strides @ 115% Pace`,
        justification: "Estímulo de reactividad elástica del tendón de Aquiles y economía de zancada.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "Strides", 115, phase),
        isRestDay: false,
      };
    }

    if (isQuality && !isFatigued) {
      const isPeak = phase === "PEAK";
      return {
        day, date: dateInfo.date, formattedDate: dateInfo.formattedDate, discipline: "Carrera",
        workoutName: isPeak
          ? (runFtp > 0 ? "Series Específicas Ritmo de Competición (5x1000m @ 105% CP)" : "Series Específicas Ritmo de Competición (5x1000m @ 105% Pace)")
          : (runFtp > 0 ? "Series Umbral Stryd (4x6m @ 100% FTP)" : "Series Umbral (4x6m @ 100% Pace)"),
        action: "MANTENER", durationMinutes: isPeak ? 60 : 55, tss: isPeak ? 65 : 58,
        powerTarget: runFtp > 0 ? `${isPeak ? Math.round(runFtp * 1.05) : runFtp}W (${isPeak ? "105% CP" : "100% CP"})` : (isPeak ? "105% Pace" : "100% Pace"),
        justification: isPeak ? "Afilado de potencia crítica y economía de carrera al ritmo de competición." : "Estímulo de potencia crítica y tolerancia al lactato.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", isPeak ? "VO2MAX" : "THRESHOLD_INTERVALS", isPeak ? 105 : 100, phase),
        isRestDay: false,
      };
    }

    if (isLongRun && !isFatigued) {
      const longMins = phase === "PEAK" ? 105 : 75;
      return {
        day, date: dateInfo.date, formattedDate: dateInfo.formattedDate, discipline: "Carrera",
        workoutName: phase === "PEAK" ? (runFtp > 0 ? "Fondo Específico Maratón Stryd (1h45m)" : "Fondo Específico Maratón (1h45m)") : (runFtp > 0 ? "Tirada Larga Progresiva Stryd (1h15m)" : "Tirada Larga Progresiva (1h15m)"),
        action: "MANTENER", durationMinutes: longMins, tss: Math.round(longMins * 0.85),
        powerTarget: runFtp > 0 ? `${Math.round(runFtp * 0.84)}W (84% CP)` : "84% Pace",
        justification: runFtp > 0 ? "Desarrollo de durabilidad y potencia específica de competición en Z2-Z3 Stryd." : "Desarrollo de durabilidad aeróbica y ritmo específico de competición.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 84, phase), isRestDay: false,
      };
    }

    return {
      day, date: dateInfo.date, formattedDate: dateInfo.formattedDate, discipline: "Carrera",
      workoutName: isFatigued ? (runFtp > 0 ? "Trote Suave Z1 Regenerativo Stryd (35m)" : "Trote Suave Z1 Regenerativo (35m)") : (runFtp > 0 ? "Carrera Continua Progresiva Z1-Z2 Stryd (45m)" : "Carrera Continua Progresiva Z1-Z2 (45m)"),
      action: isFatigued ? "MODIFICAR" : "MANTENER", durationMinutes: isFatigued ? 35 : 45, tss: isFatigued ? 26 : 42,
      powerTarget: runFtp > 0 ? `${Math.round(runFtp * (isFatigued ? 0.72 : 0.81))}W (${isFatigued ? "72% CP Z1" : "81% CP Z2"})` : (isFatigued ? "72% Pace Z1" : "81% Pace Z2"),
      justification: isFatigued ? "Atenuación a Z1 para proteger tono parasimpático y acelerar recuperación." : "Carrera aeróbica base para consistencia de fitness.",
      workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "RECOVERY", 70, phase), isRestDay: false,
    };
  });

  const finalPlan = (runningMode === "PACE" || runningMode === "HYBRID")
    ? suggestedPlan.map((item) =>
        adaptRunningPlanItem(item, {
          mode: "PACE",
          thresholdPaceSec: profile.runThresholdPaceSecPerKm,
          lthr: profile.lthr,
        })
      )
    : suggestedPlan;

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
    suggestedPlan: finalPlan,
  };
}
