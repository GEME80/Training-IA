import { PlanItem, WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, getDayDisciplines, resolveEffectiveAvailability } from "../gemini/engine";
import { MacrocycleWeek } from "./macrocycle";
import { MacrocycleDistanceType } from "./macrocycleLibrary";
import { resolveTrainingModel, calculateProgressiveLongRun, BIKE_TEST_RAMP } from "../ai/knowledge";
import { resolveVolumeScaleFactor } from "./macrocycleGenerator";
import { selectSwimWorkout } from "./swimWorkoutPool"; import { selectStrengthWorkout } from "./strengthWorkoutPool";
import { resolveSpecializedStrengthWorkout } from "./specializedStrengthCoaches"; import { resolveWorkoutAddons } from "./workoutEnhancers";
import { parseWorkoutDoc } from "./workoutDocParser";
import {
  getCoprimeStride, buildRestDay, selectQualityWorkout, interpolatePowerTarget,
  resolveRaceWorkout, resolveWeekendRide, resolveTriathlonBrick, resolveLongRunDay, resolveLongRideDay, resolveEveRide, resolveFridayFartlek,
  resolveCuratedModelForWeek, resolveMidweekRide,
} from "./macrocycleTemplateHelpers";
import { AntiMonotonyMemoryBuffer, applyParametricProgression } from "./workoutProgressionEngine";
import { adaptRunningPlanItem } from "./runningWorkoutAdapter";

export { selectQualityWorkout, selectStrengthWorkout, interpolatePowerTarget };

export function generateWeekTemplate(
  week: MacrocycleWeek, runFtp?: number, bikeFtp?: number,
  availability: WeeklyAvailabilityMap = DEFAULT_WEEKLY_AVAILABILITY,
  distanceType?: MacrocycleDistanceType, athleteCtl?: number, primaryRaceDate?: string,
  runningOpts?: { mode?: "POWER" | "PACE" | "HYBRID"; thresholdPaceSec?: number; thresholdPaceStr?: string; lthr?: number; }
): PlanItem[] {
  const safeAvailability = resolveEffectiveAvailability(availability);
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const weekStart = (!week?.startDate || Number.isNaN(new Date(week.startDate).getTime())) ? new Date() : new Date(week.startDate.includes("T") ? week.startDate : `${week.startDate}T00:00:00`);
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  if ((week as any).isHistorical || week.weekNumber <= 0) {
    return days.map((day, idx) => {
      const d = new Date(weekStart); d.setDate(weekStart.getDate() + idx);
      return { day, date: d.toISOString().split("T")[0], formattedDate: `${d.getDate()} ${months[d.getMonth()]}`, discipline: "Descanso", workoutName: "Descanso", action: "MANTENER", justification: "Historial ejecutado", isRestDay: true, workoutDoc: "" };
    });
  }

  const { weekNumber, phase, microcycleType } = week;
  const countdown = week.countdownWeeks || Math.max(1, 16 - (weekNumber || 1) + 1);
  const totalWeeks = (week as any).totalWeeks || (weekNumber + countdown - 1) || 16;
  const isRecovery = microcycleType === "DESCARGA_ASIMILACION", isRaceWeek = phase === "RACE_WEEK" || countdown === 1 || microcycleType === "COMPETICION";

  const curatedModel = resolveCuratedModelForWeek(distanceType, week.focusDescription, safeAvailability);
  const volumeScaleFactor = resolveVolumeScaleFactor(athleteCtl);
  const scheduledTests = [...curatedModel.mandatoryTests.filter((t) => t.recommendedWeekIndex === weekNumber)];
  const hasCycling = Object.values(safeAvailability).some((discs: any) => Array.isArray(discs) && discs.some((d: string) => /ciclismo|bike|ride/i.test(d)));
  const isFtpTestWk = !isRaceWeek && hasCycling && ((microcycleType === "TEST_CONTROL" && /ftp/i.test(week.focusDescription || "")) || (weekNumber === 7 && totalWeeks >= 9));
  if (isFtpTestWk && !scheduledTests.some((t) => t.sport === "Ride")) scheduledTests.push({ ...BIKE_TEST_RAMP, recommendedWeekIndex: weekNumber });
  if (isRaceWeek || scheduledTests.length > 1) scheduledTests.splice(isRaceWeek ? 0 : 1);
  const longRun = calculateProgressiveLongRun(curatedModel, weekNumber, weekNumber + countdown - 1, isRecovery, phase, countdown, volumeScaleFactor, athleteCtl, runFtp);
  const longRunDay = resolveLongRunDay(safeAvailability), longRideDay = resolveLongRideDay(safeAvailability);
  const result: PlanItem[] = [];
  let bikeTestInjected = false, swimTestInjected = false, runTestInjected = false, longRideInjected = false, runCount = 0, bikeCount = 0, swimCount = 0, strengthCount = 0;
  const usedRunWorkoutNames = new Set<string>(), usedBikeWorkoutNames = new Set<string>();
  const memory = new AntiMonotonyMemoryBuffer(5);
  memory.record(longRun.workoutName);

  for (let idx = 0; idx < days.length; idx++) {
    const day = days[idx], d = new Date(weekStart);
    d.setDate(weekStart.getDate() + idx);
    const dateStr = d.toISOString().split("T")[0], formattedDate = `${d.getDate()} ${months[d.getMonth()]}`;
    let discList = getDayDisciplines(safeAvailability, day);

    if (isRaceWeek) {
      const isTargetRaceDay = primaryRaceDate ? dateStr === primaryRaceDate : day === "Domingo";
      if (isTargetRaceDay) {
        result.push(resolveRaceWorkout({ curatedModel, longRun, dateStr, formattedDate, day, runFtp, bikeFtp }));
        continue;
      }

      if (primaryRaceDate && dateStr > primaryRaceDate && day === "Domingo") {
        result.push({
          day, date: dateStr, formattedDate, discipline: "Descanso",
          workoutName: "Descanso Post-Competición & Celebración", action: "MANTENER", durationMinutes: 0, tss: 0,
          justification: "Recuperación biológica y asimilación del esfuerzo competitivo.", isRestDay: true,
        });
        continue;
      }

      if (discList.length === 1 && discList[0] === "Descanso") {
        result.push(buildRestDay(day, dateStr, formattedDate));
        continue;
      }

      const isEveOfRace = (primaryRaceDate && Math.abs(new Date(primaryRaceDate).getTime() - d.getTime()) <= 86400000) || day === "Sábado";

      for (const disc of discList) {
        if (disc === "Descanso") continue;
        if (disc === "Natacion") {
          result.push({ day, date: dateStr, formattedDate, discipline: "Natacion", workoutName: "Natación de Sensaciones Acuáticas & Soltura (25m)", action: "MANTENER", durationMinutes: 25, tss: 18, powerTarget: "Sensibilidad Acuática", justification: "Contacto suave y soltura pre-carrera.", workoutDoc: "Warmup\n- 200m 70% Pace\n\nMain\n4x\n- 25m 95% Pace\n- 25m 60% Pace\n\nCooldown\n- 100m 60% Pace", isRestDay: false });
          continue;
        }
        if (disc === "Ciclismo") {
          result.push({ day, date: dateStr, formattedDate, discipline: "Ciclismo", workoutName: "Pedaleo Ciclista de Soltura & Ajuste Mecánico (30m Z1)", action: "MANTENER", durationMinutes: 30, tss: 18, powerTarget: bikeFtp ? `${Math.round(bikeFtp * 0.55)}W (55% FTP)` : "55% FTP", justification: "Verificación de cambios, presión de ruedas y soltura de piernas.", workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 15m 55% FTP con 2x30s 80% FTP\n\nCooldown\n- 5m 45% FTP", isRestDay: false });
          continue;
        }
        if (disc === "Fuerza") {
          result.push({ day, date: dateStr, formattedDate, discipline: "Fuerza", workoutName: "Movilidad Articular & Activación Ligera (15m)", action: "MANTENER", durationMinutes: 15, tss: 8, powerTarget: "Movilidad Articular", justification: "Descompresión articular y activación refleja sin carga externa.", workoutDoc: "Movilidad Dinámica\n- 5m Caderas y Tobillos\n- 5m Hombros y Columna Torácica\n- 5m Respiración y Relajación", isRestDay: false });
          continue;
        }
        if (disc === "Carrera") {
          result.push({ day, date: dateStr, formattedDate, discipline: "Carrera", workoutName: isEveOfRace ? "Activación Final Pre-Carrera (15m Suave)" : "Trote Suave Pre-Carrera (25m + 3 Strides @ 85% CP)", action: "MANTENER", durationMinutes: isEveOfRace ? 15 : 25, tss: isEveOfRace ? 9 : 16, powerTarget: runFtp ? `${Math.round(runFtp * 0.68)}W` : "Z1 Trote Suave", justification: "Soltura neuromuscular con mínimo impacto articular.", workoutDoc: "Warmup\n- 10m 65% CP\n\nMain\n- 10m 70% CP\n3x\n- 20s 85% CP\n- 40s 55% CP\n\nCooldown\n- 5m 60% CP", isRestDay: false });
          continue;
        }
        result.push(buildRestDay(day, dateStr, formattedDate));
      }
      continue;
    }

    if (discList.length === 1 && discList[0] === "Descanso") {
      result.push(buildRestDay(day, dateStr, formattedDate));
      continue;
    }

    for (const disc of discList) {
      if (disc === "Descanso") continue;

      if (disc === "Natacion") {
        swimCount++;
        const swimTest = scheduledTests.find((t) => t.sport === "Swim" && !swimTestInjected);
        if (swimTest) {
          swimTestInjected = true;
          result.push({
            day, date: dateStr, formattedDate, discipline: "Natacion", workoutName: `🎯 TEST DE CALIBRACIÓN SWIM: ${swimTest.testName}`, action: "MANTENER", durationMinutes: 50, tss: 50, powerTarget: swimTest.targetMetric, justification: swimTest.protocolDescription, workoutDoc: swimTest.workoutDoc, isRestDay: false,
          });
          continue;
        }

        const sw = selectSwimWorkout(phase, weekNumber, isRecovery, swimCount);
        result.push({ day, date: dateStr, formattedDate, discipline: "Natacion", workoutName: sw.name, action: "MANTENER", durationMinutes: sw.durationMin, tss: sw.tss, powerTarget: sw.focus, justification: sw.justification, workoutDoc: sw.workoutDoc, isRestDay: false });
        continue;
      }

      if (disc === "Fuerza") {
        strengthCount++;
        const prevHadStrength = curatedModel.sportCategory !== "Running" && idx > 0 && getDayDisciplines(safeAvailability, days[idx - 1]).includes("Fuerza");
        if (prevHadStrength) {
          result.push({
            day, date: dateStr, formattedDate, discipline: "Fuerza",
            workoutName: "Movilidad Articular Dinámica & Descarga Muscular (20m)", action: "MANTENER",
            durationMinutes: 20, tss: 10, powerTarget: "Movilidad Articular",
            justification: "Descompresión y soltura fascial para permitir supercompensación del SNC.",
            workoutDoc: "Movilidad Dinámica\n- 5m Caderas y Tobillos\n- 5m Columna Torácica y Hombros\n- 5m Estiramientos Dinámicos\n- 5m Respiración Diafragmática",
            isRestDay: false,
          });
          continue;
        }
        const st = resolveSpecializedStrengthWorkout({ sportCategory: curatedModel.sportCategory, phase, weekNumber, isRecovery, sessionIndex: strengthCount });
        result.push({ day, date: dateStr, formattedDate, discipline: "Fuerza", workoutName: st.name, action: "MANTENER", durationMinutes: st.durationMin, tss: st.tss, powerTarget: st.focus, justification: st.justification, workoutDoc: st.workoutDoc, isRestDay: false });
        continue;
      }

      if (disc === "Ciclismo") {
        bikeCount++;
        const bikeTest = scheduledTests.find((t) => t.sport === "Ride" && !bikeTestInjected);
        if (bikeTest) {
          bikeTestInjected = true;
          result.push({
            day, date: dateStr, formattedDate, discipline: "Ciclismo", workoutName: `🧪 TEST OFICIAL FTP: ${bikeTest.testName}`, action: "MANTENER", durationMinutes: 40, tss: 52, powerTarget: bikeFtp ? `Ramp Test ERG (+6%/min hasta fallo) (FTP: ${bikeFtp}W)` : "Ramp Test ERG hasta fallo", justification: bikeTest.protocolDescription, workoutDoc: bikeTest.workoutDoc, isRestDay: false,
          });
          continue;
        }

        const isEve = curatedModel.sportCategory === "Running" && day === "Sábado" && longRunDay === "Domingo";
        const isLongRideMatch = !longRideInjected && !isEve && (day === longRideDay || (!longRideDay && (day === "Sábado" || day === "Domingo")));
        if (isLongRideMatch && day !== longRunDay) {
          longRideInjected = true;
          const { rideMins, rideTitle, rideJust, rideTarget, workoutDoc: rideWorkoutDoc } = resolveWeekendRide({
            distanceType, phase, weekNumber, isRecovery, bikeFtp,
          });
          usedBikeWorkoutNames.add(rideTitle);
          const baseRideDoc = rideWorkoutDoc || `Warmup\n- 15m 55% FTP\n\nMain\n- ${rideMins - 25}m 65% FTP\n\nCooldown\n- 10m 50% FTP`;
          const addons = resolveWorkoutAddons({ durationMinutes: rideMins, sport: "Ciclismo", isQualityOrLong: true });
          const parsedRide = parseWorkoutDoc(baseRideDoc, "Ciclismo");
          result.push({
            day, date: dateStr, formattedDate, discipline: "Ciclismo", workoutName: rideTitle, action: "MANTENER",
            durationMinutes: rideMins, tss: parsedRide.estimatedTss || Math.round(rideMins * 0.66), powerTarget: rideTarget, justification: rideJust,
            workoutDoc: baseRideDoc, isRestDay: false, mobilityWarmup: addons.mobilityWarmup, fuelingStrategy: addons.fuelingStrategy,
          });

          memory.record(rideTitle);

          const brick = resolveTriathlonBrick({ day, dateStr, formattedDate, curatedModel, phase, isRecovery, isRaceWeek, distanceType, runFtp });
          if (brick) {
            usedRunWorkoutNames.add(brick.workoutName);
            memory.record(brick.workoutName);
            result.push(brick);
          }
          continue;
        }

        if (isEve) {
          const eve = resolveEveRide(bikeFtp);
          usedBikeWorkoutNames.add(eve.workoutName);
          result.push({
            day, date: dateStr, formattedDate, discipline: "Ciclismo", workoutName: eve.workoutName, action: "MANTENER",
            durationMinutes: eve.durationMinutes, tss: eve.tss, powerTarget: eve.powerTarget, justification: eve.justification,
            workoutDoc: eve.workoutDoc, isRestDay: false,
          });
          continue;
        }

        if (day === longRunDay) {
          usedBikeWorkoutNames.add("Ciclismo de Soltura & Asimilación Post-Tirada (30m Z1)");
          result.push({
            day, date: dateStr, formattedDate, discipline: "Ciclismo", workoutName: "Ciclismo de Soltura & Asimilación Post-Tirada (30m Z1)",
            action: "MANTENER", durationMinutes: 30, tss: 18, powerTarget: bikeFtp ? `${Math.round(bikeFtp * 0.55)}W (55% FTP)` : "55% FTP",
            justification: "Recuperación activa y lavado metabólico sin estrés articular concurrente con la tirada larga.",
            workoutDoc: "Warmup\n- 5m 50% FTP\n\nMain\n- 20m 55% FTP (90-95 rpm)\n\nCooldown\n- 5m 45% FTP", isRestDay: false,
          });
          continue;
        }

        const bikeVars = curatedModel.workoutVariations.bikeMidWeekWorkouts || [];
        const bStride = getCoprimeStride(bikeVars.length, 3);
        const bIdx = ((weekNumber - 1) * bStride + (bikeCount - 1)) % (bikeVars.length || 1);
        const selBikeRaw = memory.selectDiverseCandidate(bikeVars, bIdx);
        const selBike = applyParametricProgression(selBikeRaw, { weekNumber, phase, isRecovery });
        const isTriOrMulti = curatedModel.sportCategory === "Triathlon" || hasCycling;
        const midRide = resolveMidweekRide({ phase, isRecovery, bikeCount, isTriOrMulti, bikeFtp, selBike });
        usedBikeWorkoutNames.add(midRide.workoutName);
        memory.record(midRide.workoutName);
        result.push({
          day, date: dateStr, formattedDate, discipline: "Ciclismo", workoutName: midRide.workoutName, action: "MANTENER",
          durationMinutes: midRide.durationMinutes, tss: midRide.tss, powerTarget: midRide.powerTarget,
          justification: midRide.justification, workoutDoc: midRide.workoutDoc, isRestDay: false,
        });
        continue;
      }

      if (disc === "Carrera") {
        runCount++;
        const runTest = scheduledTests.find((t) => t.sport === "Run" && !runTestInjected && day !== longRunDay);
        if (runTest) {
          runTestInjected = true;
          result.push({
            day, date: dateStr, formattedDate, discipline: "Carrera", workoutName: `🎯 TEST DE CAMPO RUN: ${runTest.testName}`,
            action: "MANTENER", durationMinutes: 55, tss: 62, powerTarget: runTest.targetMetric, justification: runTest.protocolDescription,
            workoutDoc: runTest.workoutDoc, isRestDay: false,
          });
          continue;
        }

        if (day === longRunDay) {
          const prevDayTest = idx > 0 && result.filter((r) => r.day === days[idx - 1]).some((r) => r.workoutName.includes("TEST"));
          const effM = prevDayTest ? Math.min(45, longRun.minutes) : longRun.minutes;
          const effKm = prevDayTest ? Math.min(8, longRun.km) : longRun.km;
          const effName = prevDayTest ? `Rodaje Aeróbico de Asimilación Post-Test (${effM}m Z2)` : longRun.workoutName;
          const effDoc = prevDayTest ? `Warmup\n- 10m 65% CP\n\nMain\n- ${effM - 15}m 72% CP\n\nCooldown\n- 5m 60% CP` : longRun.workoutDoc;
          usedRunWorkoutNames.add(effName);
          const addons = resolveWorkoutAddons({ durationMinutes: effM, sport: "Carrera", isQualityOrLong: true });
          const parsedLong = parseWorkoutDoc(effDoc, "Carrera");
          result.push({
            day, date: dateStr, formattedDate, discipline: "Carrera", workoutName: effName, action: "MANTENER",
            durationMinutes: effM, tss: parsedLong.estimatedTss || Math.round(effM * (longRun.isPeakBlock ? 0.82 : 0.74)), powerTarget: longRun.powerTarget,
            justification: `Tirada de ${effKm} km (${day}, Semana ${weekNumber}, escala CTL: ${Math.round(volumeScaleFactor * 100)}%).`,
            workoutDoc: effDoc, isRestDay: false, mobilityWarmup: addons.mobilityWarmup, fuelingStrategy: addons.fuelingStrategy,
          });
          continue;
        }

        const isEveFriday = day === "Viernes" && (longRunDay === "Domingo" || longRunDay === "Sábado");
        if (isEveFriday) {
          const isMulti = curatedModel.sportCategory === "Triathlon" || hasCycling;
          const targetDist = distanceType || curatedModel.modelId || "";
          const fri = resolveFridayFartlek({ runFtp, isMultisport: isMulti, weekNumber, phase, isRecovery, targetDistance: targetDist });
          usedRunWorkoutNames.add(fri.workoutName);
          result.push({
            day, date: dateStr, formattedDate, discipline: "Carrera", workoutName: fri.workoutName, action: "MANTENER",
            durationMinutes: fri.durationMinutes, tss: fri.tss, powerTarget: fri.powerTarget, justification: fri.justification,
            workoutDoc: fri.workoutDoc, isRestDay: false,
          });
          continue;
        }

        const isAdj = day === "Sábado" && longRunDay === "Domingo";
        const isEligibleQuality = runCount === 1 && !isRecovery && phase !== "TAPER" && day !== longRunDay && !isAdj && !discList.includes("Fuerza");

        if (isEligibleQuality) {
          let q = selectQualityWorkout(phase, weekNumber, curatedModel, runFtp, bikeFtp, {
            isRecovery,
            memoryBuffer: memory,
            mode: (runningOpts?.mode as any),
            thresholdPaceSec: runningOpts?.thresholdPaceSec,
            microcycleType: week.microcycleType,
          });
          const isRunningProgram = curatedModel.sportCategory === "Running";
          if (isRunningProgram && (q.name.toLowerCase().includes("brick") || q.workoutDoc.toLowerCase().includes("transición"))) {
            const phaseList = curatedModel.workoutVariations.qualityWorkouts[phase.toLowerCase() as "base" | "build" | "peak" | "taper"] || [];
            const nonBrick = phaseList.find((v) => !v.name.toLowerCase().includes("brick")) || phaseList[0];
            if (nonBrick) q = applyParametricProgression({ name: nonBrick.name, powerTarget: interpolatePowerTarget(nonBrick.powerTarget, runFtp, bikeFtp), justification: nonBrick.justification, workoutDoc: nonBrick.workoutDoc }, { weekNumber, phase, isRecovery });
          }
          usedRunWorkoutNames.add(q.name);
          memory.record(q.name);
          const isBrick = !isRunningProgram && q.name.toLowerCase().includes("brick");
          const parsedQ = parseWorkoutDoc(q.workoutDoc, "Carrera");
          const dur = isBrick ? 85 : (parsedQ.totalMins || 50), tss = isBrick ? 85 : (parsedQ.estimatedTss || 55);
          const addons = resolveWorkoutAddons({ durationMinutes: dur, sport: "Carrera", isQualityOrLong: true });
          result.push({
            day, date: dateStr, formattedDate, discipline: "Carrera", activityType: isBrick ? "Brick" : "Carrera",
            workoutName: q.name, action: "MANTENER", durationMinutes: dur, tss, powerTarget: q.powerTarget,
            justification: q.justification, workoutDoc: q.workoutDoc, isRestDay: false,
            mobilityWarmup: addons.mobilityWarmup, fuelingStrategy: addons.fuelingStrategy,
          });
          continue;
        }

        const recVars = curatedModel.workoutVariations.recoveryAerobicWorkouts || [];
        const rStride = getCoprimeStride(recVars.length, 2);
        const recIdx = ((weekNumber - 1) * rStride + (runCount - 1)) % (recVars.length || 1);
        const recW = memory.selectDiverseCandidate(recVars, recIdx);
        usedRunWorkoutNames.add(recW.name);
        memory.record(recW.name);
        const dur = phase === "TAPER" || isRecovery ? 35 : (recW.durationMin || 40);

        result.push({
          day, date: dateStr, formattedDate, discipline: "Carrera", workoutName: recW.name, action: "MANTENER",
          durationMinutes: dur, tss: Math.round(dur * 0.75), powerTarget: interpolatePowerTarget(recW.powerTarget, runFtp, undefined),
          justification: recW.justification, workoutDoc: recW.workoutDoc, isRestDay: false,
        });
        continue;
      }

      result.push(buildRestDay(day, dateStr, formattedDate));
    }
  }

  const runningMode = runningOpts?.mode || (runFtp && runFtp > 0 ? "POWER" : "PACE");
  if (runningMode === "PACE" || runningMode === "HYBRID") {
    return result.map((item) => adaptRunningPlanItem(item, { mode: "PACE", thresholdPaceSec: runningOpts?.thresholdPaceSec, lthr: runningOpts?.lthr }));
  }
  return result;
}
