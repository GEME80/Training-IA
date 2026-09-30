import { MacrocycleBlueprint } from "./macrocycle";
import { SWIM_WORKOUT_POOL, selectSwimWorkout } from "./swimWorkoutPool";

/**
 * Sanitiza y auto-actualiza los entrenamientos de natación de un macrociclo
 * reemplazando sintaxis heredada con especificación estándar compliant de Intervals.icu.
 */
export function sanitizeMacrocycleBlueprint(blueprint: MacrocycleBlueprint): MacrocycleBlueprint {
  if (!blueprint || !Array.isArray(blueprint.weeks)) return blueprint;

  const allSwimWorkouts = Object.values(SWIM_WORKOUT_POOL).flat();

  const sanitizedWeeks = blueprint.weeks.map((week) => {
    const rawPlan = (week as any).plan;
    if (!Array.isArray(rawPlan)) return week;

    const sanitizedPlan = rawPlan.map((item: any, itemIdx: number) => {
      const isSwim =
        item.discipline === "Natacion" ||
        /nataci[oó]n|swim/i.test(item.workoutName) ||
        /nataci[oó]n|swim/i.test(item.discipline || "");

      if (!isSwim) return item;

      const doc = item.workoutDoc || "";
      const hasLegacySyntax =
        doc.includes("c/15s") ||
        doc.includes("c/20s") ||
        doc.includes("c/30s") ||
        doc.includes("Nado Suave") ||
        doc.includes("Nado Fácil") ||
        doc.includes("Calentamiento") ||
        doc.includes("Enfriamiento") ||
        doc.includes("Test 1 - 400m") ||
        !doc.includes("Warmup");

      if (hasLegacySyntax || !doc.trim()) {
        const matched = allSwimWorkouts.find(
          (sw) => sw.name.toLowerCase().trim() === item.workoutName?.toLowerCase().trim()
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

      return {
        ...item,
        discipline: "Natacion",
      };
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
