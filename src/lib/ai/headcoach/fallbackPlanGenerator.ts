import { PlanItem } from "@/lib/gemini/engine";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { ResolvedChatContext } from "./chatContext";

export function generateInitialFallbackPlan(
  ctx: ResolvedChatContext,
  currentPlan: PlanItem[] = []
): PlanItem[] {
  const {
    profile, targetMinTss, targetMaxTss, safeAvailability,
    targetPlanningWeekNum, planningWeekDates, isDeload,
  } = ctx;
  const macroPhase = ctx.promptContext.macrocyclePhase;
  const hasSwim = Object.values(safeAvailability).some((v: any) =>
    Array.isArray(v) ? v.includes("Natacion") : v === "Natacion"
  );
  const resolvedDist = (macroPhase?.primaryRace?.distance as any) || (hasSwim ? "triathlon_short" : "42k");
  const totalWeeksCount = macroPhase?.blueprint?.totalWeeks || 16;
  const defaultWeekBlueprint = {
    weekNumber: targetPlanningWeekNum, countdownWeeks: Math.max(1, totalWeeksCount - targetPlanningWeekNum + 1),
    totalWeeks: totalWeeksCount, startDate: planningWeekDates[0]?.date || new Date().toISOString().split("T")[0],
    phase: (macroPhase?.phase || (isDeload ? "RECOVERY" : "BUILD")) as any,
    focusDescription: macroPhase?.suggestedFocus || "Desarrollo de potencia aeróbica y resistencia específica",
    targetTss: Math.round((targetMinTss + targetMaxTss) / 2),
    microcycleType: isDeload ? ("RECOVERY" as const) : ("LOAD" as const),
    maxLongRunMinutes: macroPhase?.maxLongRunMinutes || 75,
  };

  const runningOpts = {
    mode: macroPhase?.blueprint?.runningTrainingMode || (Number(profile.run_ftp || 0) > 0 ? "POWER" : "PACE"),
    raceGoal: macroPhase?.primaryRace?.goalTarget,
  };
  const rawFallbackPlan = generateWeekTemplate(
    defaultWeekBlueprint as any, profile.run_ftp || 0, profile.bike_ftp || 0,
    safeAvailability, resolvedDist, profile.ctl, macroPhase?.primaryRace?.date, runningOpts
  );

  return rawFallbackPlan.map((p, pIdx) => {
    const dateInfo = planningWeekDates[pIdx] || { date: "", formattedDate: "" };
    const itemDate = dateInfo.date || p.date;
    const isPast = ctx.isCurrentWeek && Boolean(itemDate && itemDate < ctx.todayDateStr);

    if (isPast) {
      const execData = ctx.effectiveExecutedMap[itemDate];
      if (execData && execData.activities.length > 0) {
        const act = execData.activities[0];
        const disc: PlanItem["discipline"] = /ride|cycling|bike/i.test(act.type) ? "Ciclismo" : /weight|strength|fuerza/i.test(act.type) ? "Fuerza" : "Carrera";
        return {
          ...p, date: itemDate, formattedDate: dateInfo.formattedDate, discipline: disc,
          workoutName: act.name || `${disc} Completada`, action: "MANTENER" as const,
          powerTarget: act.watts ? `${act.watts}W` : (act.heartrate ? `${act.heartrate} bpm` : "Completada"),
          tss: execData.totalTss, durationMinutes: act.movingTimeMin || 0,
          justification: "Historial inmutable: sesión realizada y registrada en Intervals.icu.",
        };
      }
      const plannedSession = Array.isArray(currentPlan) ? currentPlan[pIdx] : null;
      const isRestPlanned = !plannedSession || plannedSession.discipline === "Descanso" || (plannedSession.tss || 0) === 0;
      return {
        ...p, date: itemDate, formattedDate: dateInfo.formattedDate,
        discipline: (isRestPlanned ? "Descanso" : (plannedSession?.discipline || "Carrera")) as PlanItem["discipline"],
        workoutName: isRestPlanned ? "Descanso Pasivo Realizado" : `Sesión Saltada (${plannedSession?.workoutName || "Entrenamiento"})`,
        action: "MANTENER" as const, powerTarget: isRestPlanned ? "0W" : "0 TSS", tss: 0, durationMinutes: 0,
        justification: isRestPlanned ? "Historial inmutable: descanso respetado." : "Historial inmutable: sesión no registrada en Intervals.icu.",
      };
    }

    const isRest = p.discipline === "Descanso" || p.action === "DESCANSO_ACTIVO";
    const dayName = p.day || (planningWeekDates[pIdx]?.day) || "Día";
    let workoutName = p.workoutName || p.title;
    if (isRest) {
      workoutName = "Descanso Pasivo Total";
    } else if (!workoutName || workoutName === "Entrenamiento" || /rodaje de activaci|aer[oó]bica continua z2/i.test(workoutName)) {
      if (p.discipline === "Ciclismo") workoutName = dayName === "Sábado" ? "Ciclismo - SweetSpot 2x15m en Rodillo" : "Ciclismo - Resistencia Base Z2";
      else if (p.discipline === "Fuerza") workoutName = "Fuerza Neuromuscular, Core & Cadena Posterior";
      else {
        workoutName = dayName === "Martes" ? "Carrera - Series de Umbral 4x1200m @ 98-102% CP" :
          dayName === "Jueves" ? "Carrera - Fartlek Progresivo Z2-Z4" :
          dayName === "Viernes" ? "Carrera - Trote Regenerativo Z1" :
          dayName === "Domingo" ? "Carrera - Tirada Larga Progresiva Maratón" : "Carrera - Rodaje Base Z2";
      }
    }

    const dur = p.durationMinutes || (isRest ? 0 : p.discipline === "Ciclismo" ? 55 : p.discipline === "Fuerza" ? 30 : 45);
    const tssVal = p.tss || (isRest ? 0 : Math.round(dur * 0.75));
    return {
      ...p, date: itemDate, formattedDate: dateInfo.formattedDate || p.formattedDate,
      workoutName, title: workoutName, durationMinutes: dur, tss: tssVal,
    };
  });
}
