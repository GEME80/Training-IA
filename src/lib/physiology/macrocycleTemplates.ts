import { PlanItem, WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY } from "../gemini/engine";
import { PhysiologicalEngine } from "./engine";
import { MacrocycleWeek } from "./macrocycle";
import { MacrocycleDistanceType } from "./macrocycleLibrary";

/**
 * Genera la plantilla de microciclo de 7 días (Lunes a Domingo) específica y diferenciada
 * para cualquier semana de cualquier macrociclo del catálogo a partir de los indicadores físicos del atleta.
 */
export function generateWeekTemplate(
  week: MacrocycleWeek,
  runFtp: number = 285,
  bikeFtp: number = 260,
  availability: WeeklyAvailabilityMap = DEFAULT_WEEKLY_AVAILABILITY,
  distanceType?: MacrocycleDistanceType
): PlanItem[] {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const weekStart = new Date(week.startDate + "T00:00:00");
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const weekNumber = week.weekNumber;
  const countdown = week.countdownWeeks;
  const phase = week.phase;
  const microType = week.microcycleType;
  const dist = distanceType || "42k";
  const isRecovery = microType === "DESCARGA_ASIMILACION";

  // Determinación de semanas de test de rendimiento (Semana 4 y Semana 8 para calibración)
  const isBenchmarkWeek = weekNumber === 4 || weekNumber === 8;

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
      if (isTaper || isRecovery) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Fuerza",
          workoutName: "Movilidad Articular & Descarga Miofascial (20m)",
          action: "MANTENER",
          justification: "Mantenimiento del tono neuromuscular y flexibilidad funcional sin fatiga residual.",
          workoutDoc: "Warmup\n- 5m Mobility\n\nMain\n- 15m Core & Foam Roller\n\nCooldown\n- 5m Stretch",
          isRestDay: false,
        };
      }

      const strengthVariations = [
        "Fuerza Funcional & Pliometría Reactiva (Sóleo y Tobillo)",
        "Fuerza Isométrica de Cadena Posterior & Glúteo Medio",
        "Fuerza Excéntrica de Gemelo en Escalón & Sóleo",
        "Fuerza y Estabilidad Lumbopélvica de Core",
      ];
      const workoutName = strengthVariations[(weekNumber - 1) % strengthVariations.length];

      return {
        day,
        date: dateStr,
        formattedDate,
        discipline: "Fuerza",
        workoutName,
        action: "MANTENER",
        justification: "Optimización de rigidez elástica, fuerza excéntrica y eficiencia mecánica de zancada.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("WeightTraining", "STRENGTH"),
        isRestDay: false,
      };
    }

    // 3. Ciclismo
    if (disc === "Ciclismo") {
      const isWeekend = day === "Sábado" || day === "Domingo";

      // Test de Calibración FTP en Ciclismo (Opcional en semana 8 de base o mantenimiento)
      if (weekNumber === 8 && day === "Miércoles") {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Ciclismo",
          workoutName: "🎯 TEST DE CALIBRACIÓN: Umbral Funcional Ciclismo (Ramp Test FTP)",
          action: "MANTENER",
          powerTarget: `Protocolo Escalonado hasta el Agotamiento`,
          justification: "Evaluación del umbral de potencia funcional (FTP) para recalibrar las zonas de Sweetspot y Z2 en Intervals.icu.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 1m 90% FTP\n- 1m 55% FTP\n\nMain (Ramp Escalones +20W/min)\n- 1m 60% FTP\n- 1m 70% FTP\n- 1m 80% FTP\n- 1m 90% FTP\n- 1m 100% FTP\n- 1m 110% FTP\n- 1m 120% FTP\n- 1m 130% FTP\n\nCooldown\n- 10m 50% FTP",
          isRestDay: false,
        };
      }

      // A. Carrera / Competición
      if (phase === "RACE_WEEK") {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Ciclismo",
          workoutName: dist === "cycling_fondo" && isWeekend
            ? "🏆 COMPETICIÓN OBJETIVO: GRAN FONDO CICLISMO"
            : "Ciclismo Regenerativo Suave (30m Z1)",
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * 0.50)}W (50% FTP)`,
          justification: "Soltura cardiovascular sin impacto previo al día de carrera.",
          workoutDoc: "Warmup\n- 10m 45% FTP\n\nMain\n- 15m 50% FTP\n\nCooldown\n- 5m 40% FTP",
          isRestDay: false,
        };
      }

      // B. Tapering o Semana de Descarga (3:1)
      if (phase === "TAPER" || isRecovery) {
        const dur = isWeekend ? "1h00m" : "45m";
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Ciclismo",
          workoutName: `Ciclismo Z2 Ligero de Asimilación (${dur})`,
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * 0.60)}W (60% FTP)`,
          justification: "Descarga de volumen y asimilación biológica para refrescar el TSB.",
          workoutDoc: `Warmup\n- 10m 50% FTP\n\nMain\n- ${dur === "1h00m" ? "40m" : "25m"} 60% FTP\n\nCooldown\n- 10m 45% FTP`,
          isRestDay: false,
        };
      }

      // C. Macrociclo de Mantenimiento (Variación por semana)
      if (phase === "MAINTENANCE" || phase === "PRE_SEASON_MAINTENANCE") {
        if (isWeekend) {
          const weekendDurations = ["1h15m", "1h20m", "1h25m", "1h00m", "1h30m", "1h15m", "1h25m", "1h00m"];
          const dur = weekendDurations[(weekNumber - 1) % weekendDurations.length];
          return {
            day,
            date: dateStr,
            formattedDate,
            discipline: "Ciclismo",
            workoutName: `Fondo Aeróbico Ciclismo Z2 (${dur})`,
            action: "MANTENER",
            powerTarget: `${Math.round(bikeFtp * 0.65)}W (65% FTP)`,
            justification: "Volumen mitocondrial aeróbico sin impacto articular.",
            workoutDoc: `Warmup\n- 15m 55% FTP\n\nMain\n- ${dur} 65% FTP\n\nCooldown\n- 10m 50% FTP`,
            isRestDay: false,
          };
        }

        // Entre semana: Variar según la semana
        const midWeekBike = [
          { name: "Ciclismo Z2 con Variación de Cadencia 95-105 rpm (55m)", pwr: 0.70, doc: "Warmup\n- 15m 55% FTP\n\nMain\n- 30m 70% FTP\n\nCooldown\n- 10m 50% FTP" },
          { name: "Ciclismo Sweetspot Controlado (3x8m @ 85% FTP)", pwr: 0.85, doc: "Warmup\n- 15m 55% FTP\n\n3x\n- 8m 85% FTP\n- 3m 55% FTP\n\nCooldown\n- 10m 50% FTP" },
          { name: "Ciclismo Tempo Aeróbico Z3 (2x15m @ 80% FTP)", pwr: 0.80, doc: "Warmup\n- 15m 55% FTP\n\n2x\n- 15m 80% FTP\n- 4m 55% FTP\n\nCooldown\n- 10m 50% FTP" },
          { name: "Ciclismo Regenerativo Suave (40m Z1)", pwr: 0.55, doc: "Warmup\n- 10m 45% FTP\n\nMain\n- 25m 55% FTP\n\nCooldown\n- 5m 45% FTP" },
        ];
        const bikeCfg = midWeekBike[(weekNumber - 1) % midWeekBike.length];

        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Ciclismo",
          workoutName: bikeCfg.name,
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * bikeCfg.pwr)}W (${Math.round(bikeCfg.pwr * 100)}% FTP)`,
          justification: "Estímulo neuromuscular y eficiencia de pedaleo sin sobrecarga articular.",
          workoutDoc: bikeCfg.doc,
          isRestDay: false,
        };
      }

      // D. Build / Peak
      if (isWeekend) {
        const isPeak = phase === "PEAK" && microType === "IMPACTO_CHOQUE";
        const dur = dist === "cycling_fondo" ? (isPeak ? "3h30m" : "2h45m") : (isPeak ? "1h45m" : "1h30m");
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

    // 4. Carrera por defecto (Stryd Power CP)
    const isTuesday = day === "Martes";
    const isFriday = day === "Viernes";
    const isSunday = day === "Domingo" || day === "Sábado";

    // CASO MANTENIMIENTO ADAPTATIVO (Variación rica y diferenciada)
    if (phase === "MAINTENANCE" || phase === "PRE_SEASON_MAINTENANCE") {
      // Test Stryd CP en Semana 4 (Martes)
      if (weekNumber === 4 && isTuesday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "🎯 TEST DE CALIBRACIÓN: Potencia Crítica Stryd (Test 3/9 min)",
          action: "MANTENER",
          powerTarget: `Máximo Esfuerzo All-Out (Test 3m + Test 9m)`,
          justification: "Test de campo para actualizar tu Potencia Crítica (CP) de carrera y recalibrar zonas en Intervals.icu.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n- 3x 20s 115% FTP\n- 3m 55% FTP\n\nMain (Test 3/9 min)\n- 3m 100% Max Effort\n- 30m 60% Easy Recovery\n- 9m 100% Max Effort\n\nCooldown\n- 10m 55% FTP",
          isRestDay: false,
        };
      }

      if (isSunday) {
        if (isRecovery) {
          return {
            day,
            date: dateStr,
            formattedDate,
            discipline: "Carrera",
            workoutName: "Rodaje Suave de Asimilación 3:1 (45m Z2)",
            action: "MANTENER",
            powerTarget: `${Math.round(runFtp * 0.70)}W (70% CP)`,
            justification: "Semana 3:1 de descarga de volumen para refrescar el TSB y asimilar adaptaciones.",
            workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 25m 70% FTP\n\nCooldown\n- 10m 60% FTP",
            isRestDay: false,
          };
        }

        const sundayLongRuns = [
          { name: "Rodaje Largo Aeróbico Z2 (50m)", pwr: 0.74, doc: "Warmup\n- 10m 68% FTP\n\nMain\n- 30m 74% FTP\n\nCooldown\n- 10m 62% FTP" },
          { name: "Tirada Progresiva Z2 con Toques Z3 (55m)", pwr: 0.76, doc: "Warmup\n- 15m 70% FTP\n\nMain\n- 30m 76% FTP\n\nCooldown\n- 10m 62% FTP" },
          { name: "Rodaje Largo Aeróbico Z2 con Bloque Tempo (55m)", pwr: 0.76, doc: "Warmup\n- 15m 70% FTP\n\nMain\n- 30m 76% FTP\n\nCooldown\n- 10m 62% FTP" },
          { name: "Rodaje Largo de Consistencia Z2 (55m)", pwr: 0.74, doc: "Warmup\n- 10m 68% FTP\n\nMain\n- 35m 74% FTP\n\nCooldown\n- 10m 62% FTP" },
        ];
        const runCfg = sundayLongRuns[(weekNumber - 1) % sundayLongRuns.length];

        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: runCfg.name,
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * runCfg.pwr)}W (${Math.round(runCfg.pwr * 100)}% CP)`,
          justification: "Consistencia aeróbica y economía de carrera sin castigo biomecánico excesivo.",
          workoutDoc: runCfg.doc,
          isRestDay: false,
        };
      }

      if (isTuesday) {
        if (isRecovery) {
          return {
            day,
            date: dateStr,
            formattedDate,
            discipline: "Carrera",
            workoutName: "Rodaje Regenerativo Suave Z1 (35m)",
            action: "MANTENER",
            powerTarget: `${Math.round(runFtp * 0.65)}W (65% CP)`,
            justification: "Oxigenación y recuperación activa en semana de asimilación.",
            workoutDoc: "Warmup\n- 5m 60% FTP\n\nMain\n- 25m 65% FTP\n\nCooldown\n- 5m 55% FTP",
            isRestDay: false,
          };
        }

        const tuesdayQuality = [
          { name: "Rodaje Z2 (45m) + 5 Aceleraciones Progresivas (20s @ 110% CP)", pwr: 0.72, doc: "Warmup\n- 10m 68% FTP\n\nMain\n- 25m 72% FTP\n\n5x (Aceleraciones Progresivas)\n- 20s 110% FTP\n- 40s 55% FTP\n\nCooldown\n- 5m 60% FTP" },
          { name: "Fartlek de Cuestas Cortas Stryd (6x 45s @ 96% CP)", pwr: 0.96, doc: "Warmup\n- 15m 70% FTP\n\n6x\n- 45s 96% FTP\n- 1m15s 55% FTP\n\nCooldown\n- 10m 62% FTP" },
          { name: "Tempo Aeróbico Z3 Stryd (2x 10m @ 86% CP)", pwr: 0.86, doc: "Warmup\n- 15m 70% FTP\n\n2x\n- 10m 86% FTP\n- 3m 65% FTP\n\nCooldown\n- 10m 62% FTP" },
          { name: "Fartlek Piramidal Stryd (1-2-3-2-1m @ 92-95% CP)", pwr: 0.92, doc: "Warmup\n- 15m 70% FTP\n\n- 1m 92% FTP\n- 1m 65% FTP\n- 2m 92% FTP\n- 1m 65% FTP\n- 3m 92% FTP\n- 1m30s 65% FTP\n- 2m 92% FTP\n- 1m 65% FTP\n- 1m 95% FTP\n\nCooldown\n- 10m 60% FTP" },
          { name: "Series de Activación Neuromuscular (8x 200m @ 105% CP)", pwr: 1.05, doc: "Warmup\n- 15m 70% FTP\n\n8x\n- 45s 105% FTP\n- 1m 55% FTP\n\nCooldown\n- 10m 60% FTP" },
          { name: "Tempo Continuo Controlado (25m @ 88% CP)", pwr: 0.88, doc: "Warmup\n- 15m 70% FTP\n\nMain\n- 25m 88% FTP\n\nCooldown\n- 10m 62% FTP" },
        ];
        const qualityCfg = tuesdayQuality[(weekNumber - 1) % tuesdayQuality.length];

        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: qualityCfg.name,
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * qualityCfg.pwr)}W (${Math.round(qualityCfg.pwr * 100)}% CP)`,
          justification: "Estímulo neuromuscular controlado y preservación de potencia sin acumular fatiga residual.",
          workoutDoc: qualityCfg.doc,
          isRestDay: false,
        };
      }

      if (isFriday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "Rodaje Z1-Z2 (40m) + 4 Aceleraciones Progresivas (20s @ 110% CP)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.72)}W + Progresivos @ 110% CP`,
          justification: "Aceleraciones cortas de 20s de menos a más velocidad para reactivar el tobillo y zancada sin acumular fatiga.",
          workoutDoc: "Warmup\n- 10m 68% FTP\n\nMain\n- 20m 72% FTP\n\n4x (Aceleraciones Progresivas)\n- 20s 110% FTP\n- 40s 55% FTP\n\nCooldown\n- 5m 60% FTP",
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
        workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 25m 70% FTP\n\nCooldown\n- 10m 60% FTP",
        isRestDay: false,
      };
    }

    // A. SEMANA DE CARRERA (RACE WEEK)
    if (phase === "RACE_WEEK") {
      if (isSunday) {
        const raceLabel =
          dist === "42k"
            ? "MARATÓN (42.195 km)"
            : dist === "21k"
            ? "MEDIA MARATÓN (21.097 km)"
            : dist === "10k"
            ? "10K RUTA / PISTA"
            : dist === "5k"
            ? "5K VELOCIDAD"
            : "COMPETICIÓN OBJETIVO";
        const racePwrVal = dist === "42k" ? 0.80 : dist === "21k" ? 0.94 : dist === "10k" ? 1.00 : 1.06;

        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: `🏆 COMPETICIÓN OBJETIVO: ${raceLabel}`,
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * racePwrVal)}W (${Math.round(racePwrVal * 100)}% CP)`,
          justification: "¡Día del evento principal! Ejecución táctica a potencia constante Stryd.",
          workoutDoc: `Warmup\n- 10m 70% FTP\n\nMain\n- ${dist === "42k" ? "42.195km" : dist === "21k" ? "21.097km" : dist === "10k" ? "10km" : "5km"} ${Math.round(racePwrVal * 100)}% FTP\n\nCooldown\n- 5m 50% FTP`,
          isRestDay: false,
        };
      }
      if (isTuesday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "Activación Pre-Carrera (25m + 3 Aceleraciones Progresivas)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.70)}W + Progresivos @ 105% CP`,
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

    // B. TAPERING
    if (phase === "TAPER") {
      if (isSunday) {
        const taperMins = dist === "42k" ? 45 : 35;
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: `Rodaje de Puesta a Punto Z1-Z2 (${taperMins}m)`,
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.70)}W (70% CP)`,
          justification: "Descarga de volumen para maximizar el TSB y supercompensar.",
          workoutDoc: `Warmup\n- 10m 65% FTP\n\nMain\n- ${taperMins - 20}m 70% FTP\n\nCooldown\n- 10m 60% FTP`,
          isRestDay: false,
        };
      }
      if (isTuesday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "Toques a Ritmo de Carrera (30m con 3x2m @ Ritmo Objetivo)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.88)}W (88-95% CP)`,
          justification: "Recordatorio neuromuscular de ritmo competitivo con mínimo volumen.",
          workoutDoc: "Warmup\n- 10m 68% FTP\n\n3x\n- 2m 88% FTP\n- 2m 65% FTP\n\nCooldown\n- 10m 62% FTP",
          isRestDay: false,
        };
      }
      return {
        day,
        date: dateStr,
        formattedDate,
        discipline: "Carrera",
        workoutName: "Rodaje Regenerativo Suave (30m Z1)",
        action: "MANTENER",
        powerTarget: `${Math.round(runFtp * 0.68)}W (68% CP)`,
        justification: "Oxigenación y recuperación activa.",
        workoutDoc: "Warmup\n- 5m 60% FTP\n\nMain\n- 20m 68% FTP\n\nCooldown\n- 5m 55% FTP",
        isRestDay: false,
      };
    }

    // C. PICO / PEAK
    if (phase === "PEAK") {
      if (isSunday) {
        const isImpact = microType === "IMPACTO_CHOQUE";
        const longDuration =
          dist === "42k"
            ? isImpact ? (countdown === 5 ? "1h45m" : "1h55m") : "1h15m"
            : dist === "21k"
            ? isImpact ? "1h30m" : "1h05m"
            : isImpact ? "1h10m" : "50m";

        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: isImpact
            ? `🔥 Fondo Clave Específico Stryd (${longDuration})`
            : "Rodaje Largo de Asimilación Z2 (1h00m)",
          action: "MANTENER",
          powerTarget: isImpact ? `${Math.round(runFtp * 0.82)}W (82-90% CP)` : `${Math.round(runFtp * 0.74)}W (74% CP)`,
          justification: isImpact
            ? "Simulación de ritmo específico de competición y durabilidad."
            : "Asimilación intermedia para evitar fatiga residual acumulada.",
          workoutDoc: isImpact
            ? `Warmup\n- 15m 70% FTP\n\n3x\n- 5000mtr 80% FTP\n- 1000mtr 65% FTP\n\nCooldown\n- 10m 60% FTP`
            : `Warmup\n- 15m 70% FTP\n\nMain\n- 35m 74% FTP\n\nCooldown\n- 10m 62% FTP`,
          isRestDay: false,
        };
      }

      if (isTuesday) {
        const reps = dist === "5k" ? "6x 600m @ 108% CP" : dist === "10k" ? "5x 1000m @ 104% CP" : "5x 4m @ 102% CP";
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: `Series de Potencia Crítica / VO2max (${reps})`,
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 1.04)}W (104% CP)`,
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
        workoutName: "Rodaje Aeróbico Z2 (45m) + 4 Aceleraciones Progresivas (20s @ 110% CP)",
        action: "MANTENER",
        powerTarget: `${Math.round(runFtp * 0.72)}W + Progresivos @ 110% CP`,
        justification: "Mantenimiento del volumen semanal con reactividad de tobillo.",
        workoutDoc: "Warmup\n- 10m 68% FTP\n\nMain\n- 25m 72% FTP\n\n4x\n- 20s 110% FTP\n- 40s 55% FTP\n\nCooldown\n- 5m 60% FTP",
        isRestDay: false,
      };
    }

    // D. CONSTRUCCIÓN / BUILD
    if (phase === "BUILD") {
      if (isSunday) {
        const longDuration =
          dist === "42k"
            ? isRecovery ? "1h10m" : (weekNumber >= 8 ? "1h30m" : "1h20m")
            : dist === "21k"
            ? isRecovery ? "55m" : "1h15m"
            : isRecovery ? "45m" : "1h00m";

        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: isRecovery
            ? "Tirada Larga de Asimilación 3:1 (Z2)"
            : `Tirada Larga Progresiva Stryd (${longDuration})`,
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.76)}W (76% CP)`,
          justification: isRecovery
            ? "Consolidación de adaptaciones y recuperación de fibras musculares."
            : "Extensión progresiva de la durabilidad y economía de zancada.",
          workoutDoc: isRecovery
            ? `Warmup\n- 10m 68% FTP\n\nMain\n- 40m 72% FTP\n\nCooldown\n- 10m 60% FTP`
            : `Warmup\n- 15m 70% FTP\n\nMain\n- 55m 78% FTP\n\nCooldown\n- 10m 62% FTP`,
          isRestDay: false,
        };
      }

      if (isTuesday) {
        const reps = dist === "5k" ? "8x 400m @ 108% CP" : dist === "10k" ? "4x 1500m @ 100% CP" : "4x 8m @ 100% CP";
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: `Series Umbral Stryd Z4 (${reps})`,
          action: "MANTENER",
          powerTarget: `${runFtp}W (100% CP / Umbral)`,
          justification: "Elevación de la potencia crítica y tolerancia al aclaramiento de lactato.",
          workoutDoc: "Warmup\n- 15m 70% FTP\n\n4x\n- 8m 100% FTP\n- 2m30s 65% FTP\n\nCooldown\n- 10m 62% FTP",
          isRestDay: false,
        };
      }

      if (isFriday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "Rodaje Z1-Z2 (45m) + 5 Aceleraciones Progresivas (20s @ 115% CP)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.72)}W + Progresivos @ 115% CP`,
          justification: "Reactividad neuromuscular previa al fin de semana sin fatiga láctica.",
          workoutDoc: "Warmup\n- 10m 68% FTP\n\nMain\n- 25m 72% FTP\n\n5x\n- 20s 115% FTP\n- 40s 55% FTP\n\nCooldown\n- 5m 60% FTP",
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
        workoutDoc: "Warmup\n- 10m 68% FTP\n\nMain\n- 25m 73% FTP\n\nCooldown\n- 10m 62% FTP",
        isRestDay: false,
      };
    }

    // E. BASE AERÓBICA / GPP (BASE_1 & BASE_2)
    if (phase === "BASE_1" || phase === "BASE_2") {
      if (isSunday) {
        const longDuration = isRecovery ? "50m" : (phase === "BASE_2" ? "1h10m" : "1h00m");

        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: isRecovery
            ? "Rodaje Suave de Asimilación Base (50m Z2)"
            : `Tirada Larga Progresiva Base (${longDuration})`,
          action: "MANTENER",
          powerTarget: isRecovery ? `${Math.round(runFtp * 0.72)}W` : `${Math.round(runFtp * 0.75)}W (75% CP)`,
          justification: isRecovery
            ? "Semana 3:1 de asimilación biológica para refrescar el TSB."
            : "Desarrollo mitocondrial y volumen controlado de base aeróbica.",
          workoutDoc: isRecovery
            ? `Warmup\n- 10m 65% FTP\n\nMain\n- 30m 72% FTP\n\nCooldown\n- 10m 60% FTP`
            : `Warmup\n- 15m 68% FTP\n\nMain\n- 35m 75% FTP\n\nCooldown\n- 10m 60% FTP`,
          isRestDay: false,
        };
      }

      if (isTuesday) {
        if (phase === "BASE_2" && weekNumber % 2 === 0) {
          return {
            day,
            date: dateStr,
            formattedDate,
            discipline: "Carrera",
            workoutName: "Tempo Aeróbico Z3 Stryd (2x10m @ 86% CP)",
            action: "MANTENER",
            powerTarget: `${Math.round(runFtp * 0.86)}W (86% CP)`,
            justification: "Estímulo de capacidad aeróbica extensiva sin generar estrés glucolítico.",
            workoutDoc: "Warmup\n- 15m 70% FTP\n\n2x\n- 10m 86% FTP\n- 3m 65% FTP\n\nCooldown\n- 10m 62% FTP",
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
          workoutDoc: "Warmup\n- 15m 70% FTP\n\n6x\n- 45s 96% FTP\n- 1m15s 55% FTP\n\nCooldown\n- 10m 62% FTP",
          isRestDay: false,
        };
      }

      if (isFriday) {
        return {
          day,
          date: dateStr,
          formattedDate,
          discipline: "Carrera",
          workoutName: "Rodaje Z1-Z2 (45m) + 4 Aceleraciones Progresivas (20s @ 110% CP)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.72)}W + Progresivos @ 110% CP`,
          justification: "Aceleraciones cortas de 20s para reactividad elástica sin fatiga.",
          workoutDoc: "Warmup\n- 10m 68% FTP\n\nMain\n- 25m 72% FTP\n\n4x\n- 20s 110% FTP\n- 40s 55% FTP\n\nCooldown\n- 5m 60% FTP",
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
        workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 25m 70% FTP\n\nCooldown\n- 10m 60% FTP",
        isRestDay: false,
      };
    }

    // Default Fallback
    return {
      day,
      date: dateStr,
      formattedDate,
      discipline: "Carrera",
      workoutName: "Rodaje Progresivo Z1-Z2 Stryd (45m)",
      action: "MANTENER",
      powerTarget: `${Math.round(runFtp * 0.70)}W (70% CP)`,
      justification: "Rodaje aeróbico base para consistencia de fitness.",
      workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 25m 70% FTP\n\nCooldown\n- 10m 60% FTP",
      isRestDay: false,
    };
  });
}
