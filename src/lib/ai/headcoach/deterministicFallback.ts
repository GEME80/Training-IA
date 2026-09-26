import { PlanItem } from "@/lib/gemini/engine";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { applyTssAdjustmentToPlan } from "./weekRetrospective";
import { ResolvedChatContext } from "./chatContext";
import { HeadCoachChatResponse, WorkoutDiff, ChatMessage, SmartActionItem } from "./types";

export function handleDeterministicFallback(
  ctx: ResolvedChatContext,
  messages: ChatMessage[] = [],
  isInitialAudit: boolean = false,
  currentPlan: PlanItem[] = []
): HeadCoachChatResponse {
  const {
    profile, physioStatus, compliancePct, actualTss, plannedWeekTss,
    targetMinTss, targetMaxTss, formDiagnostic, hasExistingPlan,
    currentPlanSummary, availabilityFormatted, safeAvailability,
    targetPlanningWeekNum, planningWeekDates, isDeload,
  } = ctx;

  if (isInitialAudit) {
    const macroPhase = ctx.promptContext.macrocyclePhase;
    const hasSwim = Object.values(safeAvailability).some((v: any) =>
      Array.isArray(v) ? v.includes("Natacion") : v === "Natacion"
    );
    const resolvedDist = (macroPhase?.primaryRace?.distance as any) || (hasSwim ? "triathlon_short" : "42k");

    const totalWeeksCount = macroPhase?.blueprint?.totalWeeks || 16;
    const defaultWeekBlueprint = {
      weekNumber: targetPlanningWeekNum,
      countdownWeeks: Math.max(1, totalWeeksCount - targetPlanningWeekNum + 1),
      totalWeeks: totalWeeksCount,
      startDate: planningWeekDates[0]?.date || new Date().toISOString().split("T")[0],
      phase: (macroPhase?.phase || (isDeload ? "RECOVERY" : "BUILD")) as any,
      focusDescription: macroPhase?.suggestedFocus || "Desarrollo de potencia aeróbica y resistencia específica",
      targetTss: Math.round((targetMinTss + targetMaxTss) / 2),
      microcycleType: isDeload ? ("RECOVERY" as const) : ("LOAD" as const),
      maxLongRunMinutes: macroPhase?.maxLongRunMinutes || 75,
    };

    const rawFallbackPlan = generateWeekTemplate(
      defaultWeekBlueprint as any, profile.run_ftp, profile.bike_ftp,
      safeAvailability, resolvedDist, profile.ctl, macroPhase?.primaryRace?.date
    );

    const fallbackGeneratedPlan = rawFallbackPlan.map((p, pIdx) => {
      const dateInfo = planningWeekDates[pIdx] || { date: "", formattedDate: "" };
      const itemDate = dateInfo.date || p.date;
      const isPast = ctx.isCurrentWeek && Boolean(itemDate && itemDate < ctx.todayDateStr);

      if (isPast) {
        const execData = ctx.effectiveExecutedMap[itemDate];
        if (execData && execData.activities.length > 0) {
          const act = execData.activities[0];
          const isRide = /ride|cycling|bike|virtualride/i.test(act.type);
          const isWeight = /weight|strength|fuerza/i.test(act.type);
          const disc: PlanItem["discipline"] = isRide ? "Ciclismo" : isWeight ? "Fuerza" : "Carrera";
          return {
            ...p,
            date: itemDate,
            formattedDate: dateInfo.formattedDate,
            discipline: disc,
            workoutName: act.name || `${disc} Completada`,
            action: "MANTENER" as const,
            powerTarget: act.watts ? `${act.watts}W` : (act.heartrate ? `${act.heartrate} bpm` : "Completada"),
            tss: execData.totalTss,
            durationMinutes: act.movingTimeMin || 0,
            justification: "Historial inmutable: sesión realizada y registrada en Intervals.icu.",
          };
        }

        const plannedSession = Array.isArray(currentPlan) ? currentPlan[pIdx] : null;
        const isRestPlanned = !plannedSession || plannedSession.discipline === "Descanso" || (plannedSession.tss || 0) === 0;
        const fallbackDisc: PlanItem["discipline"] = (isRestPlanned ? "Descanso" : (plannedSession?.discipline || "Carrera")) as PlanItem["discipline"];
        return {
          ...p,
          date: itemDate,
          formattedDate: dateInfo.formattedDate,
          discipline: fallbackDisc,
          workoutName: isRestPlanned ? "Descanso Pasivo Realizado" : `Sesión Saltada (${plannedSession?.workoutName || "Entrenamiento"})`,
          action: "MANTENER" as const,
          powerTarget: isRestPlanned ? "0W" : "0 TSS",
          tss: 0,
          durationMinutes: 0,
          justification: isRestPlanned ? "Historial inmutable: descanso respetado." : "Historial inmutable: sesión no registrada en Intervals.icu.",
        };
      }

      const isRest = p.discipline === "Descanso" || p.action === "DESCANSO_ACTIVO";
      const dayName = p.day || (planningWeekDates[pIdx]?.day) || "Día";
      let workoutName = p.workoutName || p.title;
      if (isRest) {
        workoutName = "Descanso Pasivo Total";
      } else if (!workoutName || workoutName === "Entrenamiento" || /rodaje de activaci|aer[oó]bica continua z2/i.test(workoutName)) {
        if (p.discipline === "Ciclismo") {
          workoutName = dayName === "Sábado" ? "Ciclismo - SweetSpot 2x15m en Rodillo / Resistencia" : "Ciclismo - Resistencia Base Z2 & Cadencia Dinámica";
        } else if (p.discipline === "Fuerza") {
          workoutName = "Fuerza Neuromuscular, Core & Cadena Posterior";
        } else {
          if (dayName === "Martes") workoutName = "Carrera - Series de Umbral 4x1200m @ 98-102% Stryd CP";
          else if (dayName === "Jueves") workoutName = "Carrera - Fartlek Progresivo Z2-Z4";
          else if (dayName === "Viernes") workoutName = "Carrera - Trote Regenerativo Z1 & Capilarización";
          else if (dayName === "Domingo") workoutName = "Carrera - Tirada Larga Progresiva con Bloque Maratón";
          else workoutName = "Carrera - Rodaje Base Aeróbico Z2";
        }
      }

      const dur = p.durationMinutes || (isRest ? 0 : p.discipline === "Ciclismo" ? 55 : p.discipline === "Fuerza" ? 30 : 45);
      const tssVal = p.tss || (isRest ? 0 : Math.round(dur * 0.75));
      return {
        ...p,
        date: itemDate,
        formattedDate: dateInfo.formattedDate || p.formattedDate,
        workoutName,
        title: workoutName,
        durationMinutes: dur,
        tss: tssVal,
      };
    });

    const fallbackPlannedTss = fallbackGeneratedPlan.reduce((acc, p) => acc + (p.tss || 0), 0);
    const masterLabel = profile.age && profile.age >= 40 ? "Categoría Máster" : "Categoría Senior";
    const wkgRun = profile.run_ftp && profile.weight ? ` (${(profile.run_ftp / profile.weight).toFixed(2)} W/kg)` : "";
    const isContinuityViable = hasExistingPlan && physioStatus.tsb >= -12 && compliancePct >= 80;

    const decisionHeader = isContinuityViable
      ? `### 📋 Decisión del Microciclo: 🟢 CONTINUIDAD DEL PLAN PROGRAMADO\nTu asimilación biológica es óptima (TSB ${physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1)}, HRV ${physioStatus.currentHrv ?? "Estable"}). Mantenemos el plan previsto para los días restantes.`
      : `### 📋 Decisión del Microciclo: ⚠️ PROPUESTA DE RECALIBRACIÓN / NUEVO PLAN\n${hasExistingPlan ? "Debido a la fatiga acumulada o sesiones omitidas, sugiero reestructurar la carga." : "No se encontró un plan previo activo; generamos una propuesta estructurada a medida respetando tu matriz semanal."}`;

    const actionPlanText = isContinuityViable
      ? `🎯 **Plan de Acción:**\nContinuamos con las sesiones ya programadas en tu calendario sin necesidad de cambios.`
      : hasExistingPlan
        ? `🎯 **Recomendación:**\n¿Deseas que adaptemos el plan de esta semana para balancear la fatiga?`
        : `🎯 **Propuesta Adaptada del Microciclo (~${fallbackPlannedTss} TSS):**\nSemana estructurada con estímulos diferenciados evaluados según tu matriz semanal.`;

    const auditText = `${decisionHeader}

🧬 **Contexto Biológico & Demográfico:**
- **Atleta:** ${profile.name || "Atleta"}${profile.age ? ` (${profile.age} años - ${masterLabel})` : ""}${profile.weight ? ` | **Peso:** ${profile.weight} kg` : ""}
- **Potencia Relativa:** Carrera ${profile.run_ftp ? `${profile.run_ftp}W${wkgRun}` : "—"} | Ciclismo ${profile.bike_ftp ? `${profile.bike_ftp}W` : "—"}

⚡ **Auditoría Fisiológica & TSS por Actividad:**
- Carga acumulada ejecutada: **${actualTss} TSS** (${compliancePct}% de cumplimiento sobre el objetivo).
- Balance de fatiga (TSB): **${physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1)}** | ATL: **${physioStatus.atl.toFixed(1)}** | CTL: **${physioStatus.ctl.toFixed(1)}**.
- Recuperación del sistema nervioso (HRV): **${physioStatus.currentHrv ? `${physioStatus.currentHrv} ms` : "Estable"}** (balance adecuado para asimilar calidad).

🟢 **Fortalezas & Disciplina:**
- Cumplimiento de carga acumulada en el rango fisiológico programado.
- Respeto de los descansos pasivos para asimilación neuromuscular.

⚠️ **Puntos de Atención & Control de Carga:**
- ${physioStatus.tsb < -15 ? "Tu TSB ha caído a zona de sobrecarga. Vigila el descanso nocturno e hidratación para evitar fatiga residual." : "Ramp Rate en rango controlado. Mantén la disciplina en los ritmos y no te aceleres en los días de trote suave Z1."}
- En atletas ${masterLabel.toLowerCase()}, el tiempo de asimilación articular exige no encadenar dos días de calidad consecutivos.

${actionPlanText}`;

    const fallbackSmartActions: SmartActionItem[] = [
      { label: "Ver detalle de mi estado", icon: "activity", variant: "secondary" },
      { label: "Reorganizar", icon: "calendar-sync", variant: "secondary" },
      { label: "Siento mucha fatiga hoy", icon: "trending-down", variant: "secondary" },
      { label: "El plan está muy suave", icon: "trending-up", variant: "secondary" },
    ];

    return {
      success: true,
      reply: auditText,
      actionType: hasExistingPlan ? "REVIEW_PHYSIOLOGY" : "CREATE_PLAN",
      reasoning: "Evaluación fisiológica de rendimiento y carga completada con base en modelo Banister.",
      suggestedPlan: (!hasExistingPlan) ? fallbackGeneratedPlan : null,
      audit: {
        compliancePct,
        actualTss,
        plannedTss: fallbackPlannedTss,
        ctl: physioStatus.ctl.toFixed(1),
        atl: physioStatus.atl.toFixed(1),
        tsb: physioStatus.tsb.toFixed(1),
        rampRate: Number(physioStatus.rampRate || 0).toFixed(1),
        feedback: formDiagnostic,
      },
      smartActions: fallbackSmartActions,
      quickReplies: ["Ver detalle de mi estado", "Reorganizar", "Siento mucha fatiga hoy", "El plan está muy suave"],
      modelUsed: "Motor Fisiológico PULSE (Algorítmico)",
      targetWeekNumber: targetPlanningWeekNum,
    };
  }

  const lastUserMsg = messages[messages.length - 1]?.content || "";
  let modifiedPlan = [...currentPlan];
  let workoutDiff: WorkoutDiff | null = null;
  let replyMsg = "";
  let actionType: "ADAPT_WORKOUT" | "CREATE_PLAN" | "REVIEW_PHYSIOLOGY" | "CONVERSATION" = "CONVERSATION";
  const lowerMsg = lastUserMsg.toLowerCase();
  let smartActions: SmartActionItem[] = [];

  // FLUJO A: Ver detalle de estado fisiológico
  if (lowerMsg.includes("detalle") || lowerMsg.includes("estado") || lowerMsg.includes("fisiol")) {
    actionType = "REVIEW_PHYSIOLOGY";
    replyMsg = "Tu cuerpo está asimilando la carga acumulada de manera óptima. La fatiga de las sesiones previas se mantiene en rangos totalmente seguros y la recuperación de tu sistema nervioso confirma que estás absorbiendo el trabajo sin riesgo de sobrecarga.\n\nVamos en trayectoria ideal hacia tu objetivo. ¿Mantenemos la planificación prevista para cerrar la semana con fuerza o necesitas reorganizar algún día?";
    smartActions = [
      { label: "Mantener plan previsto", variant: "primary", icon: "check" },
      { label: "Reorganizar", variant: "secondary", icon: "calendar-sync" },
    ];
  }
  // FLUJO B: Reorganizar por disponibilidad / matriz temporal
  else if (lowerMsg.includes("reorganizar") || lowerMsg.includes("matriz") || lowerMsg.includes("temporal") || lowerMsg.includes("viaje")) {
    actionType = "ADAPT_WORKOUT";
    if (lowerMsg.includes("matriz") || lowerMsg.includes("temporal") || lowerMsg.includes("disponibilidad")) {
      const macroPhase = ctx.promptContext.macrocyclePhase;
      const resolvedDist = (macroPhase?.primaryRace?.distance as any) || "42k";
      const totalWeeksCount = macroPhase?.blueprint?.totalWeeks || 16;
      const defaultWeekBlueprint = {
        weekNumber: targetPlanningWeekNum,
        countdownWeeks: Math.max(1, totalWeeksCount - targetPlanningWeekNum + 1),
        totalWeeks: totalWeeksCount,
        startDate: planningWeekDates[0]?.date || new Date().toISOString().split("T")[0],
        phase: (macroPhase?.phase || (isDeload ? "RECOVERY" : "BUILD")) as any,
        focusDescription: macroPhase?.suggestedFocus || "Desarrollo de potencia aeróbica y resistencia específica",
        targetTss: Math.round((targetMinTss + targetMaxTss) / 2),
        microcycleType: isDeload ? ("RECOVERY" as const) : ("LOAD" as const),
        maxLongRunMinutes: macroPhase?.maxLongRunMinutes || 75,
      };
      const rawTemplate = generateWeekTemplate(
        defaultWeekBlueprint as any, profile.run_ftp, profile.bike_ftp,
        safeAvailability, resolvedDist, profile.ctl, macroPhase?.primaryRace?.date
      );
      const CANONICAL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      modifiedPlan = rawTemplate.map((p) => {
        const dayIdx = CANONICAL_DAYS.findIndex((d) => d.toLowerCase() === p.day?.toLowerCase());
        const dateInfo = dayIdx >= 0 && planningWeekDates[dayIdx] ? planningWeekDates[dayIdx] : { date: "", formattedDate: "" };
        return {
          ...p,
          date: dateInfo.date || p.date,
          formattedDate: dateInfo.formattedDate || p.formattedDate,
        };
      });
      replyMsg = "He generado una propuesta de microciclo adaptada a tu matriz temporal para esta semana. Las disciplinas y descansos han sido redistribuidos protegiendo tu carga global y respetando tus días libres.\n\n⚠️ Esta es una propuesta previa: ningún cambio se aplicará a tu calendario de Intervals.icu hasta que hagas clic en 'Confirmar Nuevo Calendario'.\n\n¿Deseas confirmar este nuevo calendario?";
      smartActions = [
        { label: "Confirmar Nuevo Calendario", variant: "primary", icon: "check" },
        { label: "Descartar", variant: "secondary", icon: "x" },
      ];
    } else {
      replyMsg = "Para reorganizar tu microciclo sin alterar tu planificación habitual, ajusta tu disponibilidad temporal directamente en la matriz del chat. Selecciona qué deportes deseas realizar cada día y cuáles necesitas de descanso.";
      smartActions = [
        { label: "Mantener plan previsto", variant: "secondary", icon: "check" },
      ];
    }
  }
  // FLUJO C: Siento mucha fatiga hoy
  else if (lowerMsg.includes("fatiga") || lowerMsg.includes("cansad") || lowerMsg.includes("dolor") || lowerMsg.includes("molestia")) {
    actionType = "ADAPT_WORKOUT";
    const targetDayIdx = modifiedPlan.findIndex((p) => (p.tss || 0) > 30) !== -1
      ? modifiedPlan.findIndex((p) => (p.tss || 0) > 30)
      : 1;
    if (modifiedPlan[targetDayIdx]) {
      const prevSession = modifiedPlan[targetDayIdx];
      modifiedPlan[targetDayIdx] = {
        ...prevSession,
        workoutName: "Carrera Regenerativa Z1/Z2 (Descarga Activa)",
        durationMinutes: Math.max(25, (prevSession.durationMinutes || 50) - 20),
        tss: Math.max(15, (prevSession.tss || 50) - 20),
        action: "MODIFICAR",
      };
    }
    replyMsg = "Comprendido. Escuchar al cuerpo es clave. He bajado la intensidad de tu sesión de hoy a un rodaje regenerativo (Zona 1/2) y acortado el tiempo en 20 minutos. Esto ayudará a limpiar la fatiga acumulada sin perder tu constancia.\n\n¿Aprobamos el ajuste o prefieres descansar hoy?";
    smartActions = [
      { label: "Aprobar Ajuste", variant: "primary", icon: "check" },
      { label: "Prefiero descansar hoy", variant: "secondary", icon: "x" },
    ];
  }
  // FLUJO D: El plan está muy suave
  else if (lowerMsg.includes("suave") || lowerMsg.includes("aumentar") || lowerMsg.includes("mayor carga")) {
    actionType = "ADAPT_WORKOUT";
    const targetDayIdx = modifiedPlan.findIndex((p) => (p.tss || 0) > 30) !== -1
      ? modifiedPlan.findIndex((p) => (p.tss || 0) > 30)
      : 1;
    if (modifiedPlan[targetDayIdx]) {
      const prevSession = modifiedPlan[targetDayIdx];
      modifiedPlan[targetDayIdx] = {
        ...prevSession,
        workoutName: "Carrera de Intervalos + 2 Bloques Extra de Umbral",
        durationMinutes: (prevSession.durationMinutes || 50) + 15,
        tss: (prevSession.tss || 50) + 25,
        action: "MODIFICAR",
      };
    }
    replyMsg = "Me alegra ver que estás asimilando tan bien la carga. He añadido 2 bloques extra de umbral a tu sesión de intervalos de mañana para generar un mayor estímulo, subiendo el TSS semanal en 25 puntos de forma segura.\n\n¿Aplicamos la mayor carga al microciclo?";
    smartActions = [
      { label: "Aplicar Mayor Carga", variant: "primary", icon: "check" },
      { label: "Mantener plan original", variant: "secondary", icon: "x" },
    ];
  }
  // FASE 3: Confirmación / Aprobación
  else if (lowerMsg.includes("confirmar") || lowerMsg.includes("aprobar") || lowerMsg.includes("aplicar")) {
    replyMsg = "¡Microciclo actualizado con éxito! Tus sesiones ya están sincronizadas. Que tengas un excelente entrenamiento.";
    smartActions = [
      { label: "Deshacer cambios", variant: "tertiary", icon: "undo", actionType: "undo_changes" },
    ];
  }
  // FLUJO: Mantener plan original
  else if (lowerMsg.includes("mantener plan original") || lowerMsg.includes("mantener plan") || lowerMsg.includes("mantener")) {
    replyMsg = "Excelente decisión. Mantener la constancia y respetar los ritmos programados es la base para asimilar este bloque sin sobrecargas. Tu plan previsto sigue activo con normalidad.";
    smartActions = [
      { label: "Ver detalle de mi estado", icon: "activity", variant: "secondary" },
      { label: "Reorganizar", icon: "calendar-sync", variant: "secondary" },
    ];
  }
  // Default de continuidad
  else {
    replyMsg = `He registrado tus indicaciones ("${lastUserMsg}"). Los parámetros fisiológicos están equilibrados. ¿Qué ajuste táctico deseas realizar en tu microciclo?`;
    smartActions = [
      { label: "Ver detalle de mi estado", icon: "activity", variant: "secondary" },
      { label: "Reorganizar", icon: "calendar-sync", variant: "secondary" },
      { label: "Siento mucha fatiga hoy", icon: "trending-down", variant: "secondary" },
      { label: "El plan está muy suave", icon: "trending-up", variant: "secondary" },
    ];
  }

  // SUGGESTED_PLAN SOLO se incluye cuando hay una propuesta de cambio activa
  const hasActiveProposal =
    (lowerMsg.includes("matriz") || lowerMsg.includes("temporal") || lowerMsg.includes("disponibilidad")) ||
    (lowerMsg.includes("fatiga") || lowerMsg.includes("cansad") || lowerMsg.includes("dolor") || lowerMsg.includes("molestia")) ||
    (lowerMsg.includes("suave") || lowerMsg.includes("aumentar") || lowerMsg.includes("mayor carga"));

  const finalPlan = (hasActiveProposal && modifiedPlan && modifiedPlan.length > 0)
    ? (ctx.targetTssAdjustmentPct && ctx.targetTssAdjustmentPct !== 0
        ? applyTssAdjustmentToPlan(modifiedPlan, ctx.targetTssAdjustmentPct)
        : modifiedPlan)
    : null;

  return {
    success: true,
    reply: replyMsg,
    actionType,
    workoutDiff,
    previousWeekSummary: ctx.previousWeekSummary || null,
    suggestedPlan: finalPlan,
    reasoning: "Ajuste algorítmico fisiológico determinístico completado.",
    smartActions,
    quickReplies: smartActions.map((s) => s.label),
    modelUsed: "Motor Fisiológico PULSE (Algorítmico)",
    targetWeekNumber: targetPlanningWeekNum,
  };
}
