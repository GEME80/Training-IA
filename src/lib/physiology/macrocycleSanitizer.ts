import { MacrocycleBlueprint } from "./macrocycle";
import { SWIM_WORKOUT_POOL, selectSwimWorkout } from "./swimWorkoutPool";

/**
 * Sanitiza y auto-actualiza los entrenamientos de un macrociclo:
 * 1. Reemplaza sintaxis heredada de natación por especificación 100% compliant de Intervals.icu.
 * 2. Erradica cualquier contaminación de sesiones Brick/Ciclismo en días asignados puramente a Carrera.
 * 3. Estandariza encabezados de calidad a Warmup / Main / Cooldown.
 */
export function sanitizeMacrocycleBlueprint(blueprint: MacrocycleBlueprint): MacrocycleBlueprint {
  if (!blueprint || !Array.isArray(blueprint.weeks)) return blueprint;

  const allSwimWorkouts = Object.values(SWIM_WORKOUT_POOL).flat();

  const sanitizedWeeks = blueprint.weeks.map((week) => {
    const rawPlan = (week as any).plan;
    if (!Array.isArray(rawPlan)) return week;

    const sanitizedPlan = rawPlan.map((item: any, itemIdx: number) => {
      const discipline = item.discipline || "";
      const name = item.workoutName || "";
      const doc = item.workoutDoc || "";

      // 1. Sanitización de Natación
      const isSwim =
        discipline === "Natacion" ||
        /nataci[oó]n|swim/i.test(name) ||
        /nataci[oó]n|swim/i.test(discipline);

      if (isSwim) {
        const hasLegacySwimSyntax =
          doc.includes("c/15s") ||
          doc.includes("c/20s") ||
          doc.includes("c/30s") ||
          doc.includes("Nado Suave") ||
          doc.includes("Nado Fácil") ||
          doc.includes("Calentamiento") ||
          doc.includes("Enfriamiento") ||
          doc.includes("Test 1 - 400m") ||
          !doc.includes("Warmup");

        if (hasLegacySwimSyntax || !doc.trim()) {
          const matched = allSwimWorkouts.find(
            (sw) => sw.name.toLowerCase().trim() === name.toLowerCase().trim()
          );

          if (matched) {
            return {
              ...item,
              discipline: "Natacion",
              workoutDoc: matched.workoutDoc,
              durationMinutes: matched.durationMin,
              tss: matched.tss,
              powerTarget: matched.focus,
              justification: matched.justification,
            };
          }

          const isRec = week.microcycleType === "DESCARGA_ASIMILACION";
          const canonical = selectSwimWorkout(week.phase, week.weekNumber, isRec, itemIdx + 1);
          return {
            ...item,
            discipline: "Natacion",
            workoutName: item.workoutName || canonical.name,
            workoutDoc: canonical.workoutDoc,
            durationMinutes: item.durationMinutes || canonical.durationMin,
            tss: item.tss || canonical.tss,
            powerTarget: item.powerTarget || canonical.focus,
            justification: item.justification || canonical.justification,
          };
        }

        return { ...item, discipline: "Natacion" };
      }

      // 2. Blindaje de Carrera: Erradicar sesiones de Bici/Brick contaminadas en días de Carrera
      if (discipline === "Carrera") {
        const isLegitT2Run = item.activityType === "Brick" && !doc.toLowerCase().includes("bici") && !doc.toLowerCase().includes("ciclismo");
        if (isLegitT2Run) {
          return item;
        }

        const hasBikePollution =
          (/brick|ciclismo|bici/i.test(name) && !name.toLowerCase().includes("transición t2")) ||
          /bloque 1: ciclismo|1h\d+m bici|bici @/i.test(doc);

        if (hasBikePollution) {
          const runFtp = blueprint.runFtpAtCreation && blueprint.runFtpAtCreation > 0 ? blueprint.runFtpAtCreation : 0;
          return {
            ...item,
            discipline: "Carrera",
            workoutName: "Series de Potencia Crítica en Carrera (5x 3m 90% CP)",
            durationMinutes: 50,
            tss: 52,
            powerTarget: runFtp > 0 ? `${Math.round(runFtp * 0.9)}W (90% CP)` : "90% CP / Ritmo Umbral",
            justification: "Sesión específica de calidad en carrera a pie para desarrollo de potencia aeróbica y economía de zancada.",
            workoutDoc: "Warmup\n- 12m 65% CP\n\n5x\n- 3m 90% CP\n- 2m 60% CP\n\nCooldown\n- 8m 60% CP",
          };
        }
      }

      return item;
    });

    return {
      ...week,
      plan: sanitizedPlan,
    };
  });

  return {
    ...blueprint,
    weeks: sanitizedWeeks,
  };
}
