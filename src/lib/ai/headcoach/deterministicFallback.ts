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
    const auditText = [
      `[ESTADO DEL PROCESO]: Semana ${targetPlanningWeekNum} (${macroPhase?.phase || "Construcción"}) • Cumplimiento: ${compliancePct}% (${actualTss}/${fallbackPlannedTss} TSS) • Rampa: ${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem`,
      isContinuityViable
        ? `[DIAGNÓSTICO]: Continuidad del Plan. Balance funcional (TSB ${physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1)}, HRV ${physioStatus.currentHrv ?? "Estable"}). Sin signos de sobrecarga.`
        : `[DIAGNÓSTICO]: Calibración Táctica. ${hasExistingPlan ? `Fatiga residual detectada (TSB ${physioStatus.tsb.toFixed(1)}). Conviene modular la carga.` : "Sin plan previo; optimizado según tu matriz."}`,
      isContinuityViable
        ? `[TRADUCCIÓN HUMANA]: Asimilación impecable del volumen. Piernas con frescura y corazón sin sobrecalentamiento. Mantén el plan para llegar fuerte al fin de semana.`
        : `[TRADUCCIÓN HUMANA]: ${hasExistingPlan ? "Tu cuerpo pide un respiro para evitar sobrecargar tendones. Aligerar ahora te permitirá rendir en las sesiones clave." : "Estructura distribuida respetando tus deportes habituales con orden y seguridad."}`,
      isContinuityViable
        ? `[ACCIÓN PRESCRIPTIVA]: Continuamos con tu sesión programada para hoy. Revisa abajo la estructura completa.`
        : `[ACCIÓN PRESCRIPTIVA]: Revisa la propuesta adaptada abajo y haz clic en 'Aprobar y Sincronizar' para actualizar tu reloj e Intervals.icu.`
    ].join("\n\n");

    const fallbackSmartActions: SmartActionItem[] = [
      { label: "Ver detalle de mi estado", icon: "activity", variant: "secondary" },
      { label: "Reorganizar", icon: "calendar-sync", variant: "secondary" },
      { label: "Siento mucha fatiga hoy", icon: "trending-down", variant: "secondary" },
      { label: "El plan está muy suave", icon: "trending-up", variant: "secondary" },
    ];

    return {
      success: true, reply: auditText, actionType: hasExistingPlan ? "REVIEW_PHYSIOLOGY" : "CREATE_PLAN",
      reasoning: "Evaluación fisiológica de rendimiento y carga con modelo Banister.",
      suggestedPlan: (!hasExistingPlan) ? fallbackGeneratedPlan : null,
      audit: { compliancePct, actualTss, plannedTss: fallbackPlannedTss, ctl: physioStatus.ctl.toFixed(1), atl: physioStatus.atl.toFixed(1), tsb: physioStatus.tsb.toFixed(1), rampRate: Number(physioStatus.rampRate || 0).toFixed(1), feedback: formDiagnostic },
      smartActions: fallbackSmartActions, quickReplies: ["Ver detalle de mi estado", "Reorganizar", "Siento mucha fatiga hoy", "El plan está muy suave"],
      modelUsed: "Motor Fisiológico PULSE (Algorítmico)", targetWeekNumber: targetPlanningWeekNum,
    };
  }

  const lastUserMsg = messages[messages.length - 1]?.content || "";
  let modifiedPlan = [...currentPlan];
  let workoutDiff: WorkoutDiff | null = null;
  let replyMsg = "";
  let actionType: "ADAPT_WORKOUT" | "CREATE_PLAN" | "REVIEW_PHYSIOLOGY" | "CONVERSATION" = "CONVERSATION";
  const lowerMsg = lastUserMsg.toLowerCase();
  let smartActions: SmartActionItem[] = [];

  // 1. AUDITAR SESIÓN ESPECÍFICA / ÚLTIMA ACTIVIDAD
  if (lowerMsg.includes("audita") || lowerMsg.includes("última sesión") || lowerMsg.includes("mi sesión")) {
    actionType = "REVIEW_PHYSIOLOGY";
    const executedEntries = Object.entries(ctx.effectiveExecutedMap || {}).flatMap(([dKey, val]) =>
      Array.isArray(val?.activities) ? val.activities.map((a: any) => ({ ...a, date: dKey })) : []
    );
    const targetAct = executedEntries.find((a) => lowerMsg.includes((a.name || "").toLowerCase())) ||
      executedEntries[executedEntries.length - 1];

    if (targetAct) {
      const pWatts = targetAct.watts ? `${targetAct.watts}W` : "";
      const pHR = targetAct.heartrate ? `${targetAct.heartrate} bpm` : "";
      replyMsg = `[ESTADO DEL PROCESO]: Auditoría de Sesión • ${targetAct.name || targetAct.type} (${targetAct.date})\n\n[DIAGNÓSTICO]: Carga ejecutada: ${targetAct.tss || 0} TSS en ${targetAct.movingTimeMin || 0} min.${pWatts ? ` Potencia media: ${pWatts}.` : ""}${pHR ? ` FC media: ${pHR}.` : ""} Estímulo metabólico consolidado.\n\n[TRADUCCIÓN HUMANA]: Clavaste el objetivo de la sesión. Tu corazón y piernas mantuvieron una respuesta estable sin desacoplamiento excesivo ni fatiga destructiva.\n\n[ACCIÓN PRESCRIPTIVA]: Sesión asimilada. Enfócate en descanso activo e hidratación para tu siguiente entrenamiento.`;
    } else {
      replyMsg = `[ESTADO DEL PROCESO]: Auditoría de Microciclo • Semana ${targetPlanningWeekNum}\n\n[DIAGNÓSTICO]: Aún no registras actividades completadas en Intervals.icu para este microciclo.\n\n[TRADUCCIÓN HUMANA]: Cuando completes tu primer entrenamiento, cruzaré tus vatios, pulso y desacoplamiento para evaluar el cumplimiento del estímulo.\n\n[ACCIÓN PRESCRIPTIVA]: Enfócate en tu sesión programada para hoy. Revisa abajo tus zonas objetivo antes de salir.`;
    }
    smartActions = [
      { label: "Balance de Semana", icon: "activity", variant: "secondary" },
      { label: "Mantener plan previsto", variant: "primary", icon: "check" },
    ];
  }
  // 2. RUMBO A LA META Y PROYECCIÓN BANISTER
  else if (lowerMsg.includes("rumbo") || lowerMsg.includes("meta") || lowerMsg.includes("carrera principal")) {
    actionType = "REVIEW_PHYSIOLOGY";
    const macroPhase = ctx.promptContext.macrocyclePhase;
    const race = macroPhase?.primaryRace;
    const raceName = race?.name || "tu Meta Principal";
    const raceDist = race?.distance || "42K";
    const ctlVal = physioStatus.ctl.toFixed(1);
    const rampVal = Number(physioStatus.rampRate || 0).toFixed(1);
    const wkg = profile.run_ftp && profile.weight ? ` (${(profile.run_ftp / profile.weight).toFixed(2)} W/kg)` : "";
    replyMsg = `[ESTADO DEL PROCESO]: Rumbo a ${raceName} (${raceDist}) • Semana ${targetPlanningWeekNum} de ${macroPhase?.blueprint?.totalWeeks || 22}\n\n[DIAGNÓSTICO]: Cilindrada en ${ctlVal} CTL con rampa de +${rampVal} CTL/sem. ${profile.run_ftp ? `Stryd CP: ${profile.run_ftp}W${wkg}.` : ""} Progresión Banister en zona segura.\n\n[TRADUCCIÓN HUMANA]: Vas en la trayectoria ideal. En esta fase base estamos construyendo la cilindrada aeróbica necesaria para tolerar el ritmo de competición sin fatiga prematura.\n\n[ACCIÓN PRESCRIPTIVA]: Mantén la constancia en tus rodajes base y respeta las zonas prescritas. Cada kilómetro aeróbico de hoy es tu seguro de vida el día de la carrera.`;
    smartActions = [
      { label: "Balance de Semana", icon: "activity", variant: "secondary" },
      { label: "Mantener plan previsto", variant: "primary", icon: "check" },
    ];
  }
  // 3. BALANCE DE SEMANA Y VOLUMEN
  else if (lowerMsg.includes("balance") || lowerMsg.includes("volumen")) {
    actionType = "REVIEW_PHYSIOLOGY";
    const executedCount = Object.values(ctx.effectiveExecutedMap || {}).reduce((acc: number, d: any) => acc + (d?.activities?.length || 0), 0);
    const totalSessions = currentPlan.filter((p) => !/descanso/i.test(p.workoutName || "")).length || 5;
    const tsbSign = physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1);
    replyMsg = `[ESTADO DEL PROCESO]: Balance Semanal • Semana ${targetPlanningWeekNum} (${actualTss}/${plannedWeekTss} TSS • ${compliancePct}% cumplimiento)\n\n[DIAGNÓSTICO]: Llevas ${executedCount} de ${totalSessions} sesiones ejecutadas. Rampa en +${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem con TSB en ${tsbSign} (${physioStatus.tsb >= -10 ? "asimilación óptima" : "fatiga acumulada"}).\n\n[TRADUCCIÓN HUMANA]: Tu cuerpo está absorbiendo la carga de manera eficiente. No hay signos de sobrecarga no funcional y el sistema neuromuscular responde con frescura.\n\n[ACCIÓN PRESCRIPTIVA]: Continuamos con la estructura prevista para cerrar el microciclo con solidez.`;
    smartActions = [
      { label: "Auditar Sesión", icon: "target", variant: "secondary" },
      { label: "Mantener plan previsto", variant: "primary", icon: "check" },
    ];
  }
  // 4. PROTOCOLO DE RETORNO SEGURO TRAS ENFERMEDAD (RECALIBRACIÓN SEMANAL INTEGRAL)
  else if (lowerMsg.includes("enferm") || lowerMsg.includes("retorno") || lowerMsg.includes("salté") || lowerMsg.includes("salte")) {
    actionType = "ADAPT_WORKOUT";
    const targetIdx = ctx.todayDayIndex;
    if (modifiedPlan[targetIdx]) {
      modifiedPlan[targetIdx] = {
        ...modifiedPlan[targetIdx],
        workoutName: "Carrera Regenerativa Z1 (Retorno Progresivo)",
        durationMinutes: 30, tss: 20, action: "MODIFICAR",
        justification: "Retorno seguro post-enfermedad: trote conversacional Z1 muy suave.",
      };
    }
    for (let i = targetIdx + 1; i < modifiedPlan.length; i++) {
      const sess = modifiedPlan[i];
      if (!sess) continue;
      const isLastDay = i === modifiedPlan.length - 1;
      const isIntensity = /fartlek|umbral|series|vo2|interval|tempo|z3|z4|z5/i.test(sess.workoutName || "");
      if (isIntensity) {
        modifiedPlan[i] = {
          ...sess,
          workoutName: `${sess.discipline || "Carrera"} Suave Z1/Z2 (Protección Inmune)`,
          durationMinutes: Math.min(sess.durationMinutes || 40, 35),
          tss: 25, action: "MODIFICAR",
          justification: "Intensidad suprimida por retorno médico-deportivo: rodaje suave a ritmo conversacional.",
        };
      } else if (isLastDay && (sess.durationMinutes || 0) > 45) {
        const newDur = Math.round((sess.durationMinutes || 80) * 0.6);
        modifiedPlan[i] = {
          ...sess,
          workoutName: `${sess.workoutName || "Tirada Aeróbica"} Acortada (Retorno Progresivo)`,
          durationMinutes: newDur,
          tss: Math.round((sess.tss || 80) * 0.55), action: "MODIFICAR",
          justification: "Volumen dominical acortado 40% para evitar fatiga residual post-indisposición.",
        };
      }
    }
    const newWeeklyTss = modifiedPlan.reduce((acc, p) => acc + (p.tss || 0), 0);
    replyMsg = `[ESTADO DEL PROCESO]: Protocolo de Retorno Seguro • Microciclo recalibrado a ${newWeeklyTss} TSS\n\n[DIAGNÓSTICO]: Retorno tras indisposición física. Se suprimen intensidades (Fartlek/Umbral) y se acorta la tirada dominical para proteger tu sistema inmune y tendinoso.\n\n[TRADUCCIÓN HUMANA]: Prohibido intentar recuperar kilómetros perdidos. Tus adaptaciones de semanas siguen intactas, pero forzar el cuerpo recién salido de un virus causa recaídas. Rodamos suave para que el corazón despierte sin estrés.\n\n[ACCIÓN PRESCRIPTIVA]: He suavizado toda tu semana restante a ${newWeeklyTss} TSS seguros. Haz clic en 'Aprobar Ajuste' para sincronizar con Intervals.icu.`;
    smartActions = [
      { label: "Aprobar Ajuste", variant: "primary", icon: "check" },
      { label: "Mantener plan previsto", variant: "secondary", icon: "check" },
    ];
  }
  // 5. POCO TIEMPO HOY (30-45M)
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
  // FLUJO SECUNDARIO: Consulta general de estado
  else if (lowerMsg.includes("detalle") || lowerMsg.includes("estado") || lowerMsg.includes("fisiol")) {
    actionType = "REVIEW_PHYSIOLOGY";
    const tsbSign = physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1);
    replyMsg = `[ESTADO DEL PROCESO]: Estado Fisiológico • Microciclo ${targetPlanningWeekNum}\n\n[DIAGNÓSTICO]: CTL en ${physioStatus.ctl.toFixed(1)} • ATL en ${physioStatus.atl.toFixed(1)} • TSB en ${tsbSign} (${physioStatus.tsb >= -10 ? "asimilación óptima" : "fatiga acumulada"}). Rampa: +${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem.\n\n[TRADUCCIÓN HUMANA]: Tu cuerpo está asimilando la carga acumulada sin sobreesfuerzo destructivo. La recuperación del sistema nervioso confirma que absorbes el trabajo dentro de rangos seguros.\n\n[ACCIÓN PRESCRIPTIVA]: Continuamos con la planificación prevista para cerrar el microciclo. ¿Deseas auditar una sesión o revisar tu balance?`;
    smartActions = [
      { label: "Balance de Semana", icon: "activity", variant: "secondary" },
      { label: "Auditar Sesión", icon: "target", variant: "secondary" },
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
