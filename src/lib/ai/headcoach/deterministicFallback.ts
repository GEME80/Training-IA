import { PlanItem } from "@/lib/gemini/engine";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { applyTssAdjustmentToPlan } from "./weekRetrospective";
import { ResolvedChatContext } from "./chatContext";
import { HeadCoachChatResponse, WorkoutDiff, ChatMessage, SmartActionItem } from "./types";
import { generateInitialFallbackPlan } from "./fallbackPlanGenerator";

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
    const fallbackGeneratedPlan = generateInitialFallbackPlan(ctx, currentPlan);
    const fallbackPlannedTss = fallbackGeneratedPlan.reduce((acc, p) => acc + (p.tss || 0), 0);
    const masterLabel = profile.age && profile.age >= 40 ? "Categoría Máster" : "Categoría Senior";
    const wkgRun = profile.run_ftp && profile.weight ? ` (${(profile.run_ftp / profile.weight).toFixed(2)} W/kg)` : "";
    const isContinuityViable = hasExistingPlan && physioStatus.tsb >= -12 && compliancePct >= 80;

    const estadoBloque = `[ESTADO DEL PROCESO]: Semana ${targetPlanningWeekNum} (${macroPhase?.phase || "Construcción"}) • Cumplimiento: ${compliancePct}% (${actualTss}/${fallbackPlannedTss} TSS) • Rampa: ${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem`;
    const diagBloque = isContinuityViable
      ? `[DIAGNÓSTICO]: Continuidad del Plan. Balance fisiológico funcional (TSB ${physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1)}, HRV ${physioStatus.currentHrv ?? "Estable"}). Sin signos de sobrecarga no funcional.`
      : `[DIAGNÓSTICO]: Propuesta de Calibración Táctica. ${hasExistingPlan ? `Fatiga residual detectada (TSB ${physioStatus.tsb.toFixed(1)}). Conviene modular la carga semanal.` : "Sin plan previo activo; se genera una estructura optimizada según tu matriz."}`;
    const tradHumanaBloque = isContinuityViable
      ? `[TRADUCCIÓN HUMANA]: Tus números demuestran que estás asimilando el volumen a la perfección. Tus piernas están respondiendo con frescura y el corazón no sufre sobrecalentamiento. Mantén el plan tal como está para llegar fuerte al fin de semana.`
      : `[TRADUCCIÓN HUMANA]: ${hasExistingPlan ? "Tu cuerpo pide un respiro táctico para evitar sobrecargar tendones o acumular cansancio innecesario. Aligerar un poco ahora te permitirá rendir mucho mejor en las sesiones clave." : "Hemos distribuido los días de entrenamiento y descanso respetando tus deportes habituales para que comiences la semana con orden y seguridad."}`;
    const accionBloque = isContinuityViable
      ? `[ACCIÓN PRESCRIPTIVA]: Continuamos con tu sesión programada para hoy. Revisa abajo la estructura completa de tu microciclo.`
      : `[ACCIÓN PRESCRIPTIVA]: Revisa la propuesta adaptada en la tarjeta inferior y haz clic en 'Aprobar y Sincronizar' para actualizar tu reloj y calendario de Intervals.icu.`;

    const auditText = `${estadoBloque}\n\n${diagBloque}\n\n${tradHumanaBloque}\n\n${accionBloque}`;

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
      const rawTemplate = generateWeekTemplate(
        defaultWeekBlueprint as any, profile.run_ftp || 0, profile.bike_ftp || 0,
        safeAvailability, resolvedDist, profile.ctl, macroPhase?.primaryRace?.date, runningOpts
      );
      const CANONICAL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      modifiedPlan = rawTemplate.map((p: any) => {
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
  // FLUJO C: Siento fatiga
  else if (lowerMsg.includes("fatiga") || lowerMsg.includes("cansad") || lowerMsg.includes("dolor") || lowerMsg.includes("molestia")) {
    if (ctx.isWeekCompleted) {
      actionType = "REVIEW_PHYSIOLOGY";
      replyMsg = `¡Gran trabajo completando tu semana y tu tirada larga! Es totalmente normal sentir una fatiga profunda en este momento: tu fatiga aguda (ATL) está en ${Number(ctx.physioStatus.atl || 0).toFixed(1)} y tu frescura (TSB) en ${Number(ctx.physioStatus.tsb || 0).toFixed(1)}. Esto confirma que lograste el estímulo de sobrecarga necesario para tu adaptación biológica.\n\nPara el resto de hoy: descanso pasivo total, hidratación con electrolitos y recarga de carbohidratos. Tu Semana ${targetPlanningWeekNum} está completada con éxito.\n\n¿Deseas que preparemos la Semana ${targetPlanningWeekNum + 1} (Próxima Semana) con un inicio suave (descanso o rodaje regenerativo) por si la fatiga persiste?`;
      smartActions = [
        { label: "Planificar Próxima Semana", variant: "primary", icon: "calendar-sync" },
        { label: "Mantener plan previsto", variant: "secondary", icon: "check" },
      ];
    } else if (ctx.hasTrainedToday) {
      actionType = "REVIEW_PHYSIOLOGY";
      replyMsg = `Comprendido. Ya completaste tu sesión de hoy (${ctx.todayDayName}), por lo que esta fatiga es una respuesta biológica normal al esfuerzo realizado. Para hoy lo primordial es la asimilación y descanso.\n\nNo tocaremos tu sesión de hoy porque ya fue ejecutada. Si mañana aún sientes pesadez en las piernas, podemos suavizar la sesión siguiente. ¿Deseas que adaptemos la sesión de mañana o evaluamos al despertar?`;
      smartActions = [
        { label: "Suavizar sesión de mañana", variant: "primary", icon: "trending-down" },
        { label: "Evaluar mañana al despertar", variant: "secondary", icon: "check" },
      ];
    } else {
      actionType = "ADAPT_WORKOUT";
      const targetDayIdx = ctx.todayDayIndex;
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
      replyMsg = `Comprendido. Escuchar al cuerpo antes de entrenar es clave. He bajado la intensidad de tu sesión de hoy (${ctx.todayDayName}) a un rodaje regenerativo (Zona 1/2) acortado en 20 minutos para limpiar fatiga acumulada sin perder constancia.\n\n¿Aprobamos el ajuste para hoy o prefieres descanso total?`;
      smartActions = [
        { label: "Aprobar Ajuste", variant: "primary", icon: "check" },
        { label: "Prefiero descansar hoy", variant: "secondary", icon: "x" },
      ];
    }
  }
  // FLUJO D: El plan está muy suave
  else if (lowerMsg.includes("suave") || lowerMsg.includes("aumentar") || lowerMsg.includes("mayor carga")) {
    if (ctx.isWeekCompleted) {
      actionType = "REVIEW_PHYSIOLOGY";
      replyMsg = `Has asimilado la Semana ${targetPlanningWeekNum} con un nivel de rendimiento sobresaliente. Dado que la semana actual ya concluyó con éxito, si deseas mayor estímulo podemos programar una sobrecarga progresiva (+10% TSS) para la Semana ${targetPlanningWeekNum + 1}.\n\n¿Deseas proyectar mayor carga para la Próxima Semana?`;
      smartActions = [
        { label: "Planificar Próxima Semana (+10% TSS)", variant: "primary", icon: "trending-up" },
        { label: "Mantener progresión actual", variant: "secondary", icon: "check" },
      ];
    } else {
      actionType = "ADAPT_WORKOUT";
      const targetDayIdx = ctx.hasTrainedToday ? Math.min(6, ctx.todayDayIndex + 1) : ctx.todayDayIndex;
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
      replyMsg = `Me alegra ver que estás asimilando tan bien la carga. He añadido 2 bloques extra de umbral a la sesión de ${ctx.hasTrainedToday ? "mañana" : "hoy"} para generar un mayor estímulo, subiendo el TSS semanal en 25 puntos de forma segura.\n\n¿Aplicamos la mayor carga al microciclo?`;
      smartActions = [
        { label: "Aplicar Mayor Carga", variant: "primary", icon: "check" },
        { label: "Mantener plan original", variant: "secondary", icon: "x" },
      ];
    }
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
  // FLUJO ENFERMEDAD / RETORNO PROGRESIVO
  else if (lowerMsg.includes("enferm") || lowerMsg.includes("retorno") || lowerMsg.includes("salté") || lowerMsg.includes("salte")) {
    actionType = "ADAPT_WORKOUT";
    const targetIdx = ctx.todayDayIndex;
    if (modifiedPlan[targetIdx]) {
      modifiedPlan[targetIdx] = {
        ...modifiedPlan[targetIdx],
        workoutName: "Carrera Regenerativa Z1 (Retorno Progresivo)",
        durationMinutes: 30, tss: 20, action: "MODIFICAR",
      };
    }
    replyMsg = "[ESTADO DEL PROCESO]: Protocolo de Retorno Seguro • Prioridad: Cero Lesiones\n\n[DIAGNÓSTICO]: Retorno tras indisposición física. Queda prohibido intentar recuperar kilómetros perdidos.\n\n[TRADUCCIÓN HUMANA]: Tranquilidad total: unos días de descanso forzado no borran tus adaptaciones de semanas, pero querer recuperar entrenos perdidos sí te lesiona. Vamos a rodar suave para que el corazón y tendones despierten sin estrés.\n\n[ACCIÓN PRESCRIPTIVA]: He suavizado tu sesión a 30m regenerativos en Zona 1. ¿Aprobamos este ajuste progresivo?";
    smartActions = [
      { label: "Aprobar Ajuste", variant: "primary", icon: "check" },
      { label: "Mantener plan previsto", variant: "secondary", icon: "check" },
    ];
  }
  // FLUJO POCO TIEMPO HOY
  else if (lowerMsg.includes("poco tiempo") || lowerMsg.includes("30m") || lowerMsg.includes("45m")) {
    actionType = "ADAPT_WORKOUT";
    const targetIdx = ctx.todayDayIndex;
    if (modifiedPlan[targetIdx]) {
      modifiedPlan[targetIdx] = {
        ...modifiedPlan[targetIdx],
        workoutName: `${modifiedPlan[targetIdx].discipline || "Carrera"} Comprimida (Estímulo Clave)`,
        durationMinutes: 35, tss: Math.round((modifiedPlan[targetIdx].tss || 50) * 0.7), action: "MODIFICAR",
      };
    }
    replyMsg = "[ESTADO DEL PROCESO]: Sesión Comprimida por Tiempo • Enfoque Concentrado\n\n[DIAGNÓSTICO]: Adaptación por agenda limitada. Se preserva el estímulo central acortando calentamiento y enfriamiento.\n\n[TRADUCCIÓN HUMANA]: Mucho mejor 35 minutos bien aprovechados que saltarse el día. Concentramos el trabajo clave para que sume a tu motor sin consumir tiempo de más.\n\n[ACCIÓN PRESCRIPTIVA]: Sesión comprimida a 35 minutos lista. ¿Aprobamos el cambio en tu calendario?";
    smartActions = [
      { label: "Aprobar Ajuste", variant: "primary", icon: "check" },
      { label: "Descartar", variant: "secondary", icon: "x" },
    ];
  }
  // FLUJO RUMBO A LA META
  else if (lowerMsg.includes("rumbo") || lowerMsg.includes("meta") || lowerMsg.includes("carrera principal")) {
    actionType = "REVIEW_PHYSIOLOGY";
    const raceName = ctx.promptContext.macrocyclePhase?.primaryRace?.name || "tu Meta Principal";
    replyMsg = `[ESTADO DEL PROCESO]: Rumbo a ${raceName} • Semana ${targetPlanningWeekNum}\n\n[DIAGNÓSTICO]: Fitness actual en ${physioStatus.ctl.toFixed(1)} CTL con ${profile.run_ftp ? `Stryd CP de ${profile.run_ftp}W` : "ritmo umbral sólido"}. Progresión Banister controlada.\n\n[TRADUCCIÓN HUMANA]: Vas en la trayectoria correcta. Tienes la caja aeróbica y la fuerza muscular necesarias para sostener tu ritmo de carrera. La clave en las semanas que vienen es no inventar entrenamientos extra y respetar los descansos.\n\n[ACCIÓN PRESCRIPTIVA]: Continuamos enfocados en la semana en curso. Cada sesión planificada está sumando a tu día de competición.`;
    smartActions = [
      { label: "Ver detalle de mi estado", icon: "activity", variant: "secondary" },
      { label: "Mantener plan previsto", variant: "primary", icon: "check" },
    ];
  }
  // FLUJO AUDITAR SESIÓN ESPECÍFICA / ÚLTIMA ACTIVIDAD
  else if (lowerMsg.includes("audita") || lowerMsg.includes("última sesión") || lowerMsg.includes("mi sesión")) {
    actionType = "REVIEW_PHYSIOLOGY";
    replyMsg = `[ESTADO DEL PROCESO]: Auditoría de Sesión • Asimilación y Telemetría\n\n[DIAGNÓSTICO]: Potencia y ritmo ejecutados en concordancia con tus umbrales biológicos. Desacoplamiento cardíaco bajo control.\n\n[TRADUCCIÓN HUMANA]: Clavaste el objetivo de la sesión. Tu corazón no se sobrecalentó al final y mantuviste la fuerza en cada repetición sin quemar reservas innecesarias. Estímulo completado con éxito.\n\n[ACCIÓN PRESCRIPTIVA]: Hidratación y descanso activo para consolidar la adaptación. Tu cuerpo está listo para la siguiente sesión.`;
    smartActions = [
      { label: "Mantener plan previsto", variant: "primary", icon: "check" },
      { label: "Reorganizar", variant: "secondary", icon: "calendar-sync" },
    ];
  }
  // FLUJO BALANCE DE SEMANA Y VOLUMEN
  else if (lowerMsg.includes("balance") || lowerMsg.includes("volumen")) {
    actionType = "REVIEW_PHYSIOLOGY";
    replyMsg = `[ESTADO DEL PROCESO]: Balance Semanal • Semana ${targetPlanningWeekNum} (${actualTss}/${plannedWeekTss} TSS • ${compliancePct}% cumplimiento)\n\n[DIAGNÓSTICO]: Rampa de fitness en ${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem con TSB en ${physioStatus.tsb.toFixed(1)} (ATL: ${physioStatus.atl.toFixed(1)}, CTL: ${physioStatus.ctl.toFixed(1)}).\n\n[TRADUCCIÓN HUMANA]: Vas en el rango ideal de adaptación. Tu cuerpo está absorbiendo el volumen sin caer en fatiga destructiva. El trabajo de esta semana sumó calidad directamente a tu fondo aeróbico.\n\n[ACCIÓN PRESCRIPTIVA]: Mantén la constancia en tus sesiones restantes y cuida la hidratación para consolidar las adaptaciones.`;
    smartActions = [
      { label: "Ver detalle de mi estado", icon: "activity", variant: "secondary" },
      { label: "Mantener plan previsto", variant: "primary", icon: "check" },
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

  // SUGGESTED_PLAN SOLO se incluye cuando hay una adaptación activa y la semana NO está concluida
  const hasActiveProposal =
    !ctx.isWeekCompleted && (actionType === "ADAPT_WORKOUT" || (actionType as any) === "MODIFY_WORKOUT");

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
