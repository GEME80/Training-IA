import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedActivity } from "@/lib/intervals/types";

export interface MatchedWorkoutResult {
  item: PlanItem;
  matchedAct: DailyExecutedActivity | null;
  isRest: boolean;
}

export function matchDailyActivities(
  planItems: PlanItem[],
  executedActivities: DailyExecutedActivity[]
): { matchedItems: MatchedWorkoutResult[]; extraActivities: DailyExecutedActivity[] } {
  const usedActIds = new Set<string>();

  const matched = planItems.map((item) => {
    const isRest = item.isRestDay || item.discipline === "Descanso";
    if (isRest || executedActivities.length === 0) {
      return { item, matchedAct: null, isRest };
    }

    let match: DailyExecutedActivity | undefined;
    if (item.discipline === "Carrera") {
      match = executedActivities.find(
        (a) =>
          !usedActIds.has(a.id) &&
          (a.type === "Run" || /run|carrera|trote|trail/i.test(a.type) || /run|carrera|trote|marat|fondo/i.test(a.name))
      );
    } else if (item.discipline === "Ciclismo") {
      match = executedActivities.find(
        (a) =>
          !usedActIds.has(a.id) &&
          (a.type === "Ride" || /ride|ciclismo|bike|virtualride|indoor/i.test(a.type) || /ride|ciclismo|bike|rodaje|fondo/i.test(a.name))
      );
    } else if (item.discipline === "Fuerza") {
      match = executedActivities.find(
        (a) =>
          !usedActIds.has(a.id) &&
          (a.type === "WeightTraining" || /weight|gym|fuerza|strength/i.test(a.type) || /fuerza|gym|pesas|fortalec/i.test(a.name))
      );
    }

    if (match) {
      usedActIds.add(match.id);
      return { item, matchedAct: match, isRest: false };
    }
    return { item, matchedAct: null, isRest: false };
  });

  const extras = executedActivities.filter((a) => !usedActIds.has(a.id));
  return { matchedItems: matched, extraActivities: extras };
}
