import { PlanItem, WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY } from "../gemini/engine";
import { MacrocycleWeek } from "./macrocycle";
import { MacrocycleDistanceType } from "./macrocycleLibrary";
import { resolveTrainingModel, calculateProgressiveLongRun } from "../ai/knowledge";
import { resolveVolumeScaleFactor } from "./macrocycleGenerator";
import { selectSwimWorkout } from "./swimWorkoutPool";
import { selectStrengthWorkout } from "./strengthWorkoutPool";
import {
  getCoprimeStride,
  buildRestDay,
  selectQualityWorkout,
  resolveRaceWorkout,
  resolveRaceSundayWorkout,
  resolveWeekendRide,
} from "./macrocycleTemplateHelpers";

export { selectQualityWorkout };

export function generateWeekTemplate(
  week: MacrocycleWeek,
  runFtp?: number,
  bikeFtp?: number,
  availability: WeeklyAvailabilityMap = DEFAULT_WEEKLY_AVAILABILITY,
  distanceType?: MacrocycleDistanceType,
  athleteCtl?: number,
  primaryRaceDate?: string
): PlanItem[] {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const weekStart = new Date(week.startDate + "T00:00:00");
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const { weekNumber, countdownWeeks: countdown, phase, microcycleType } = week;
  const isRecovery = microcycleType === "DESCARGA_ASIMILACION";
  const isRaceWeek = phase === "RACE_WEEK" || countdown === 1;

  const curatedModel = resolveTrainingModel({ targetDistance: distanceType || "42k", raceDistance: distanceType });
  const volumeScaleFactor = resolveVolumeScaleFactor(athleteCtl);
  const scheduledTests = curatedModel.mandatoryTests.filter((t) => t.recommendedWeekIndex === weekNumber);
  const longRun = calculateProgressiveLongRun(curatedModel, weekNumber, weekNumber + countdown - 1, isRecovery, phase, countdown, volumeScaleFactor);

  const result: PlanItem[] = [];
  let bikeTestInjected = false;
  let swimTestInjected = false;
  let runTestInjected = false;
  let runCount = 0, bikeCount = 0, swimCount = 0, strengthCount = 0;

  for (let idx = 0; idx < days.length; idx++) {
    const day = days[idx];
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + idx);
    const dateStr = d.toISOString().split("T")[0];
    const formattedDate = `${d.getDate()} ${months[d.getMonth()]}`;

    const rawDisc = availability[day];
    const discList: string[] = Array.isArray(rawDisc) ? (rawDisc.length > 0 ? [...rawDisc] : ["Descanso"]) : [rawDisc || "Descanso"];

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

      for (const disc of discList) {
        if (disc === "Descanso") continue;

        if (disc === "Natacion" || disc === "Natación") {
          result.push({
            day, date: dateStr, formattedDate, discipline: "Natacion",
            workoutName: "Natación de Sensaciones Acuáticas & Soltura (25m)", action: "MANTENER", durationMinutes: 25, tss: 18,
            powerTarget: "Sensibilidad Acuática", justification: "Contacto suave con el agua y soltura de brazos pre-competición.",
            workoutDoc: "Calentamiento\n- 200m Nado Suave\n\nActivación Ligera (4x)\n- 25m Nado Ágil @ Ritmo Carrera\n- 25m Suave\n\nEnfriamiento\n- 100m Nado Fácil", isRestDay: false,
          });
          continue;
        }

        if (disc === "Ciclismo") {
          result.push({
            day, date: dateStr, formattedDate, discipline: "Ciclismo",
            workoutName: "Pedaleo Ciclista de Soltura & Ajuste Mecánico (30m Z1)", action: "MANTENER", durationMinutes: 30, tss: 18,
            powerTarget: bikeFtp ? `${Math.round(bikeFtp * 0.55)}W (55% FTP)` : "55% FTP", justification: "Verificación de cambios, presión de ruedas y soltura de piernas.",
            workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 15m 55% FTP con 2x30s 80% FTP\n\nCooldown\n- 5m 45% FTP", isRestDay: false,
          });
          continue;
        }

        if (disc === "Fuerza") {
          result.push({
            day, date: dateStr, formattedDate, discipline: "Fuerza",
            workoutName: "Movilidad Articular & Activación Ligera (15m)", action: "MANTENER", durationMinutes: 15, tss: 8,
            powerTarget: "Movilidad Articular", justification: "Descompresión articular y activación refleja sin carga externa.",
            workoutDoc: "Movilidad Dinámica\n- 5m Caderas y Tobillos\n- 5m Hombros y Columna Torácica\n- 5m Respiración y Relajación", isRestDay: false,
          });
          continue;
        }

        if (disc === "Carrera") {
          result.push({
            day, date: dateStr, formattedDate, discipline: "Carrera",
            workoutName: day === "Sábado" ? "Activación Final Pre-Carrera (15m Suave)" : "Trote Suave Pre-Carrera (25m + 3 Strides @ 85% CP)", action: "MANTENER",
            durationMinutes: day === "Sábado" ? 15 : 25, tss: day === "Sábado" ? 9 : 16,
            powerTarget: runFtp ? `${Math.round(runFtp * 0.68)}W` : "Z1 Trote Suave", justification: "Soltura neuromuscular con mínimo impacto articular.",
            workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 10m 70% FTP\n3x\n- 20s 85% FTP\n- 40s 55% FTP\n\nCooldown\n- 5m 60% FTP", isRestDay: false,
          });
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

      if (disc === "Natacion" || disc === "Natación") {
        swimCount++;
        const swimTest = scheduledTests.find((t) => t.sport === "Swim" && !swimTestInjected);
        if (swimTest) {
          swimTestInjected = true;
          result.push({
            day, date: dateStr, formattedDate, discipline: "Natacion",
            workoutName: `🎯 TEST DE CALIBRACIÓN SWIM: ${swimTest.testName}`, action: "MANTENER", durationMinutes: 50, tss: 50,
            powerTarget: swimTest.targetMetric, justification: swimTest.protocolDescription, workoutDoc: swimTest.workoutDoc, isRestDay: false,
          });
          continue;
        }

        const sw = selectSwimWorkout(phase, weekNumber, isRecovery, swimCount);
        result.push({
          day, date: dateStr, formattedDate, discipline: "Natacion",
          workoutName: sw.name, action: "MANTENER", durationMinutes: sw.durationMin, tss: sw.tss,
          powerTarget: sw.focus, justification: sw.justification, workoutDoc: sw.workoutDoc, isRestDay: false,
        });
        continue;
      }

      if (disc === "Fuerza") {
        strengthCount++;
        const st = selectStrengthWorkout(phase, weekNumber, isRecovery, strengthCount);
        result.push({
          day, date: dateStr, formattedDate, discipline: "Fuerza",
          workoutName: st.name, action: "MANTENER", durationMinutes: st.durationMin, tss: st.tss,
          powerTarget: st.focus, justification: st.justification, workoutDoc: st.workoutDoc, isRestDay: false,
        });
        continue;
      }

      if (disc === "Ciclismo") {
        bikeCount++;
        const bikeTest = scheduledTests.find((t) => t.sport === "Ride" && !bikeTestInjected);
        if (bikeTest) {
          bikeTestInjected = true;
          result.push({
            day, date: dateStr, formattedDate, discipline: "Ciclismo",
            workoutName: `🎯 TEST DE CALIBRACIÓN BIKE: ${bikeTest.testName}`, action: "MANTENER", durationMinutes: 55, tss: 65,
            powerTarget: bikeTest.targetMetric, justification: bikeTest.protocolDescription, workoutDoc: bikeTest.workoutDoc, isRestDay: false,
          });
          continue;
        }

        if (day === "Sábado" || day === "Domingo") {
          const { rideMins, rideTitle, rideJust, rideTarget } = resolveWeekendRide({
            distanceType, phase, weekNumber, isRecovery, bikeFtp,
          });

          result.push({
            day, date: dateStr, formattedDate, discipline: "Ciclismo",
            workoutName: rideTitle, action: "MANTENER", durationMinutes: rideMins,
            tss: Math.round(rideMins * 0.68), powerTarget: rideTarget, justification: rideJust,
            workoutDoc: `Warmup\n- 15m 55% FTP\n\nMain\n- ${rideMins - 25}m 65% FTP\n\nCooldown\n- 10m 50% FTP`, isRestDay: false,
          });
          continue;
        }

        const bikeVars = curatedModel.workoutVariations.bikeMidWeekWorkouts || [];
        const bStride = getCoprimeStride(bikeVars.length, 3);
        const bIdx = ((weekNumber - 1) * bStride + (bikeCount - 1)) % (bikeVars.length || 1);
        const selBike = bikeVars[bIdx >= 0 ? bIdx : 0] || bikeVars[0];
        const bDur = isRecovery ? Math.min(45, selBike.durationMin || 45) : (selBike.durationMin || 50);

        result.push({
          day, date: dateStr, formattedDate, discipline: "Ciclismo",
          workoutName: selBike.name, action: "MANTENER", durationMinutes: bDur, tss: Math.round(bDur * 0.78),
          powerTarget: selBike.powerTarget, justification: selBike.justification, workoutDoc: selBike.workoutDoc, isRestDay: false,
        });
        continue;
      }

      if (disc === "Carrera") {
        runCount++;
        const runTest = scheduledTests.find((t) => t.sport === "Run" && !runTestInjected && day !== "Domingo");
        if (runTest) {
          runTestInjected = true;
          result.push({
            day, date: dateStr, formattedDate, discipline: "Carrera",
            workoutName: `🎯 TEST DE CAMPO RUN: ${runTest.testName}`, action: "MANTENER", durationMinutes: 55, tss: 62,
            powerTarget: runTest.targetMetric, justification: runTest.protocolDescription, workoutDoc: runTest.workoutDoc, isRestDay: false,
          });
          continue;
        }

        if (day === "Domingo") {
          result.push({
            day, date: dateStr, formattedDate, discipline: "Carrera",
            workoutName: longRun.workoutName, action: "MANTENER", durationMinutes: longRun.minutes,
            tss: Math.round(longRun.minutes * (longRun.isPeakBlock ? 0.82 : 0.74)),
            powerTarget: longRun.powerTarget,
            justification: `Tirada dominical progresiva de ${longRun.km} km (Semana ${weekNumber}, escala CTL: ${Math.round(volumeScaleFactor * 100)}%).`,
            workoutDoc: longRun.workoutDoc, isRestDay: false,
          });
          continue;
        }

        if (runCount === 1 && !isRecovery && phase !== "TAPER") {
          const q = selectQualityWorkout(phase, weekNumber, curatedModel);
          const isBrick = q.name.toLowerCase().includes("brick") || q.workoutDoc.toLowerCase().includes("transición");
          let dur = 50;
          let tss = 55;
          if (isBrick) {
            if (q.name.includes("1h30m") || q.name.includes("2h")) { dur = 115; tss = 110; }
            else if (q.name.includes("1h15m") || q.name.includes("1h20m")) { dur = 95; tss = 95; }
            else if (q.name.includes("1h10m") || q.name.includes("1h00m")) { dur = 85; tss = 85; }
            else if (q.name.includes("50m")) { dur = 65; tss = 70; }
            else { dur = 75; tss = 75; }
          }
          result.push({
            day, date: dateStr, formattedDate, discipline: "Carrera", activityType: isBrick ? "Brick" : "Carrera",
            workoutName: q.name, action: "MANTENER", durationMinutes: dur, tss,
            powerTarget: q.powerTarget, justification: q.justification, workoutDoc: q.workoutDoc, isRestDay: false,
          });
          continue;
        }

        const recVars = curatedModel.workoutVariations.recoveryAerobicWorkouts || [];
        const rStride = getCoprimeStride(recVars.length, 2);
        const recIdx = ((weekNumber - 1) * rStride + (runCount - 1)) % (recVars.length || 1);
        const recW = recVars[recIdx >= 0 ? recIdx : 0] || recVars[0];
        const dur = phase === "TAPER" || isRecovery ? 35 : (recW.durationMin || 40);

        result.push({
          day, date: dateStr, formattedDate, discipline: "Carrera",
          workoutName: recW.name, action: "MANTENER", durationMinutes: dur, tss: Math.round(dur * 0.75),
          powerTarget: recW.powerTarget, justification: recW.justification, workoutDoc: recW.workoutDoc, isRestDay: false,
        });
        continue;
      }

      result.push(buildRestDay(day, dateStr, formattedDate));
    }
  }

  return result;
}
