import { PlanItem, WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY } from "../gemini/engine";
import { MacrocycleWeek } from "./macrocycle";
import { MacrocycleDistanceType } from "./macrocycleLibrary";
import { resolveTrainingModel, calculateProgressiveLongRun, PhysiologicalTestDefinition } from "../ai/knowledge";
import { resolveVolumeScaleFactor } from "./macrocycleGenerator";
import { selectSwimWorkout } from "./swimWorkoutPool";
import { selectStrengthWorkout } from "./strengthWorkoutPool";

function selectQualityWorkout(
  phase: string,
  weekNumber: number,
  curatedModel: ReturnType<typeof resolveTrainingModel>
): { name: string; powerTarget: string; justification: string; workoutDoc: string } {
  const vars = curatedModel.workoutVariations.qualityWorkouts;
  const posInBlock = (weekNumber - 1) % 4;
  const blockIndex = Math.floor((weekNumber - 1) / 4);

  if (phase === "PEAK") {
    const list = vars.peak && vars.peak.length > 0 ? vars.peak : vars.build;
    return list[(blockIndex * 2 + posInBlock) % list.length] || list[0];
  }
  if (phase === "BUILD") {
    const list = vars.build && vars.build.length > 0 ? vars.build : vars.base;
    return list[(weekNumber - 1) % list.length] || list[0];
  }
  if (phase === "TAPER" || phase === "RACE_WEEK") {
    const list = vars.taper && vars.taper.length > 0 ? vars.taper : vars.base;
    return list[blockIndex % list.length] || list[0];
  }
  return vars.base[(weekNumber - 1) % vars.base.length] || vars.base[0];
}

function buildRestDay(day: string, dateStr: string, formattedDate: string): PlanItem {
  return {
    day, date: dateStr, formattedDate, discipline: "Descanso",
    workoutName: "Descanso Pasivo Total", action: "MANTENER",
    durationMinutes: 0, tss: 0,
    justification: "Recuperación biológica y descanso neuromuscular absoluto.",
    isRestDay: true,
  };
}

/**
 * Genera el microciclo semanal respetando al 100% la Matriz Semanal de Disponibilidad.
 */
export function generateWeekTemplate(
  week: MacrocycleWeek,
  runFtp: number = 285,
  bikeFtp: number = 260,
  availability: WeeklyAvailabilityMap = DEFAULT_WEEKLY_AVAILABILITY,
  distanceType?: MacrocycleDistanceType,
  athleteCtl?: number
): PlanItem[] {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const weekStart = new Date(week.startDate + "T00:00:00");
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const { weekNumber, countdownWeeks: countdown, phase, microcycleType } = week;
  const isRecovery = microcycleType === "DESCARGA_ASIMILACION";
  const isRaceWeek = phase === "RACE_WEEK" || countdown === 1;

  const curatedModel = resolveTrainingModel({ targetDistance: distanceType || "42k", raceDistance: distanceType });
  const volumeScaleFactor = resolveVolumeScaleFactor(athleteCtl);
  const scheduledTest: PhysiologicalTestDefinition | undefined = curatedModel.mandatoryTests.find((t) => t.recommendedWeekIndex === weekNumber);
  const longRun = calculateProgressiveLongRun(curatedModel, weekNumber, weekNumber + countdown - 1, isRecovery, phase, countdown, volumeScaleFactor);

  const result: PlanItem[] = [];
  let testInjected = false;
  let runCount = 0, bikeCount = 0, swimCount = 0, strengthCount = 0;

  for (let idx = 0; idx < days.length; idx++) {
    const day = days[idx];
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + idx);
    const dateStr = d.toISOString().split("T")[0];
    const formattedDate = `${d.getDate()} ${months[d.getMonth()]}`;

    const rawDisc = availability[day];
    const discList: string[] = Array.isArray(rawDisc) ? (rawDisc.length > 0 ? [...rawDisc] : ["Descanso"]) : [rawDisc || "Descanso"];

    // ── RACE_WEEK (Prescripción afinada multideporte respetando la matriz) ──
    if (isRaceWeek) {
      if (day === "Domingo") {
        result.push({
          day, date: dateStr, formattedDate, discipline: "Carrera",
          workoutName: longRun.workoutName, action: "MANTENER", durationMinutes: longRun.minutes,
          tss: longRun.km >= 40 ? 280 : Math.round(longRun.km * 6),
          powerTarget: longRun.powerTarget,
          justification: `🏆 DÍA DE COMPETICIÓN (${longRun.km} km). Ejecutar estrategia de nutrición y ritmo objetivo.`,
          workoutDoc: longRun.workoutDoc, isRestDay: false,
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
            workoutDoc: "Calentamiento\n- 200m Nado Suave\n\nActivación Ligera\n4x\n- 25m Nado Ágil @ Ritmo de Carrera\n- 25m Suave\n\nEnfriamiento\n- 100m Nado Fácil", isRestDay: false,
          });
          continue;
        }

        if (disc === "Ciclismo") {
          result.push({
            day, date: dateStr, formattedDate, discipline: "Ciclismo",
            workoutName: "Rodaje Ciclista de Soltura & Ajuste Mecánico (30m Z1)", action: "MANTENER", durationMinutes: 30, tss: 18,
            powerTarget: `${Math.round(bikeFtp * 0.55)}W (55% FTP)`, justification: "Verificación de cambios, presión de ruedas y soltura de piernas.",
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
          if (day === "Sábado") {
            result.push({
              day, date: dateStr, formattedDate, discipline: "Carrera",
              workoutName: "Activación Final Pre-Carrera (15m Suave)", action: "MANTENER", durationMinutes: 15, tss: 9,
              powerTarget: `${Math.round(runFtp * 0.65)}W (65% CP)`, justification: "Despertar neuromuscular con mínima fatiga.",
              workoutDoc: "Warmup\n- 5m 60% FTP\n\nMain\n- 8m 65% FTP\n\nCooldown\n- 2m 55% FTP", isRestDay: false,
            });
          } else {
            result.push({
              day, date: dateStr, formattedDate, discipline: "Carrera",
              workoutName: "Trote Suave Pre-Carrera (25m + 3 Strides @ 85% CP)", action: "MANTENER", durationMinutes: 25, tss: 16,
              powerTarget: `${Math.round(runFtp * 0.70)}W + 3 Strides`, justification: "Soltura neuromuscular con mínimo impacto.",
              workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 10m 70% FTP\n\n3x\n- 20s 85% FTP\n- 40s 55% FTP\n\nCooldown\n- 5m 60% FTP", isRestDay: false,
            });
          }
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
        if (scheduledTest && scheduledTest.sport === "Ride" && !testInjected) {
          testInjected = true;
          result.push({
            day, date: dateStr, formattedDate, discipline: "Ciclismo",
            workoutName: `🎯 TEST DE CALIBRACIÓN BIKE: ${scheduledTest.testName}`, action: "MANTENER", durationMinutes: 55, tss: 65,
            powerTarget: scheduledTest.targetMetric, justification: scheduledTest.protocolDescription, workoutDoc: scheduledTest.workoutDoc, isRestDay: false,
          });
          continue;
        }

        if (day === "Sábado" || day === "Domingo") {
          let rideMins = 90, rideTitle = "Fondo Resistencia Ciclismo", rideJust = "Volumen mitocondrial continuo.", rideTarget = `${Math.round(bikeFtp * 0.65)}W (65% FTP)`;
          if (phase === "TAPER") {
            rideMins = weekNumber % 2 === 0 ? 45 : 55;
            rideTitle = `Rodaje Ciclista de Descarga Pre-Carrera (${rideMins}m Z1)`;
            rideJust = "Soltura de piernas sin fatiga metabólica.";
            rideTarget = `${Math.round(bikeFtp * 0.58)}W (58% FTP)`;
          } else if (isRecovery) {
            rideMins = 60; rideTitle = "Fondo Suave de Asimilación Ciclismo (1h Z1-Z2)"; rideJust = "Recuperación activa y oxigenación."; rideTarget = `${Math.round(bikeFtp * 0.60)}W (60% FTP)`;
          } else if (phase === "PEAK") {
            const peakVars = [
              { dur: 110, name: "Fondo Específico con Bloques Sub-Tempo (1h50m Z2/Z3)", just: "Resistencia mitocondrial con aceleraciones." },
              { dur: 120, name: "Fondo Gran Fondo Resistencia Mitocondrial (2h00m Z2)", just: "Volumen aeróbico máximo sin impacto." },
              { dur: 105, name: "Simulación de Ritmo de Ciclismo Específico (1h45m Z2-Z3)", just: "Densidad de potencia y ensayo nutricional." },
            ];
            const p = peakVars[(weekNumber - 1) % peakVars.length];
            rideMins = p.dur; rideTitle = p.name; rideJust = p.just;
          } else {
            const baseVars = [
              { dur: 85, name: "Fondo Resistencia Progresivo Ciclismo (1h25m Z2)", just: "Construcción mitocondrial con final ágil." },
              { dur: 95, name: "Fondo Aeróbico & Cadencia Fluida 90-95 rpm (1h35m Z2)", just: "Eficiencia biomecánica en fatiga." },
              { dur: 90, name: "Fondo Resistencia Continua Z2 (1h30m)", just: "Capilarización muscular y oxidación lipídica." },
              { dur: 100, name: "Fondo Progresivo con Sub-Tempo Final (1h40m Z2)", just: "Fondo aeróbico con toques de ritmo medio." },
            ];
            const w = baseVars[(weekNumber - 1) % baseVars.length];
            rideMins = w.dur; rideTitle = w.name; rideJust = w.just;
          }

          result.push({
            day, date: dateStr, formattedDate, discipline: "Ciclismo",
            workoutName: rideTitle, action: "MANTENER", durationMinutes: rideMins,
            tss: Math.round(rideMins * 0.68), powerTarget: rideTarget, justification: rideJust,
            workoutDoc: `Warmup\n- 15m 55% FTP\n\nMain\n- ${rideMins - 25}m 65% FTP\n\nCooldown\n- 10m 50% FTP`, isRestDay: false,
          });
          continue;
        }

        const bikeVars = curatedModel.workoutVariations.bikeMidWeekWorkouts || [];
        const bIdx = (weekNumber * 2 + bikeCount) % (bikeVars.length || 1);
        const selBike = bikeVars[bIdx] || bikeVars[0];
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
        if (scheduledTest && scheduledTest.sport === "Run" && !testInjected && day !== "Domingo") {
          testInjected = true;
          result.push({
            day, date: dateStr, formattedDate, discipline: "Carrera",
            workoutName: `🎯 TEST DE CAMPO: ${scheduledTest.testName}`, action: "MANTENER", durationMinutes: 55, tss: 62,
            powerTarget: scheduledTest.targetMetric, justification: scheduledTest.protocolDescription, workoutDoc: scheduledTest.workoutDoc, isRestDay: false,
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
          result.push({
            day, date: dateStr, formattedDate, discipline: "Carrera",
            workoutName: q.name, action: "MANTENER", durationMinutes: 50, tss: 55,
            powerTarget: q.powerTarget, justification: q.justification, workoutDoc: q.workoutDoc, isRestDay: false,
          });
          continue;
        }

        const recVars = curatedModel.workoutVariations.recoveryAerobicWorkouts || [];
        const recIdx = (weekNumber * 3 + runCount) % (recVars.length || 1);
        const recW = recVars[recIdx] || recVars[0];
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
