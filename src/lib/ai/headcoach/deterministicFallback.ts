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
    const athleteFirstName = profile.name ? profile.name.split(" ")[0] : "Germán";
    const masterLabel = profile.age && profile.age >= 40 ? "Categoría Máster" : "Categoría Senior";
    const wkgRun = profile.run_ftp && profile.weight ? ` (${(profile.run_ftp / profile.weight).toFixed(2)} W/kg)` : "";
    const isContinuityViable = hasExistingPlan && physioStatus.tsb >= -12 && compliancePct >= 80;
    const tsbStr = physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1);
    const auditText = isContinuityViable
      ? `Hola ${athleteFirstName}, estuve revisando tu semana ${targetPlanningWeekNum} (${macroPhase?.phase || "Construcción"}). Llevas un cumplimiento del ${compliancePct}% con ${actualTss} de ${fallbackPlannedTss} TSS y una rampa de fitness de +${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem.\n\nTus números demuestran una asimilación impecable: tu frescura (TSB ${tsbStr}) y variabilidad cardíaca confirman que tus piernas y sistema nervioso absorben el volumen sin sobrecarga peligrosa.\n\nEl plan va rodando a la perfección. Mantengamos tu sesión programada para hoy exactamente como está para llegar fuerte al fin de semana.`
      : `Hola ${athleteFirstName}, revisando tu semana ${targetPlanningWeekNum} veo que acumulamos ${actualTss} TSS (${compliancePct}% de cumplimiento). ${hasExistingPlan ? `Tu balance actual marca fatiga residual (TSB ${tsbStr}), por lo que conviene modular la carga para cuidar tendones.` : "Preparé una propuesta optimizada según tu disponibilidad."}\n\nLo primordial es proteger la asimilación muscular sin comprometer las sesiones clave. Revisa la estructura abajo y me confirmas si la sincronizamos.`;

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
    const athleteFirstName = profile.name ? profile.name.split(" ")[0] : "Germán";
    const executedEntries = Object.entries(ctx.effectiveExecutedMap || {}).flatMap(([dKey, val]) =>
      Array.isArray(val?.activities) ? val.activities.map((a: any) => ({ ...a, date: dKey })) : []
    );
    const targetAct = executedEntries.find((a) => lowerMsg.includes((a.name || "").toLowerCase())) ||
      executedEntries[executedEntries.length - 1];

    if (targetAct) {
      const pWatts = targetAct.watts ? ` con una potencia media de ${targetAct.watts}W` : "";
      const pHR = targetAct.heartrate ? ` y ${targetAct.heartrate} bpm de pulso medio` : "";
      replyMsg = `Hola ${athleteFirstName}, estuve auditando tu sesión "${targetAct.name || targetAct.type}" del ${targetAct.date}. Completaste ${targetAct.movingTimeMin || 0} minutos sumando ${targetAct.tss || 0} TSS${pWatts}${pHR}.\n\nClavaste el estímulo metabólico planificado. Tu frecuencia cardíaca y la entrega de potencia se mantuvieron dentro de los rangos objetivo sin desacoplamiento tardío, con una respuesta fisiológica muy limpia.\n\nSesión totalmente asimilada. Enfócate en descanso activo e hidratación para llegar con piernas frescas a tu siguiente entrenamiento.`;
    } else {
      replyMsg = `Hola ${athleteFirstName}, estuve revisando tu telemetría pero aún no registras actividades completadas en Intervals.icu para esta semana ${targetPlanningWeekNum}.\n\nTan pronto sincronices tu reloj tras entrenar, cruzaré tus vatios, frecuencia cardíaca y desacoplamiento para evaluar el estímulo de tu sesión.\n\nPor ahora concéntrate en la sesión que tienes programada para hoy. Abajo tienes las zonas de potencia y ritmo antes de salir.`;
    }
    smartActions = [
      { label: "Balance de Semana", icon: "activity", variant: "secondary" },
      { label: "Mantener plan previsto", variant: "primary", icon: "check" },
    ];
  }
  // 2. RUMBO A LA META Y PROYECCIÓN BANISTER
  else if (lowerMsg.includes("rumbo") || lowerMsg.includes("meta") || lowerMsg.includes("carrera principal")) {
    actionType = "REVIEW_PHYSIOLOGY";
    const athleteFirstName = profile.name ? profile.name.split(" ")[0] : "Germán";
    const macroPhase = ctx.promptContext.macrocyclePhase;
    const race = macroPhase?.primaryRace;
    const raceName = race?.name || "tu Meta Principal";
    const raceDist = race?.distance || "42K";
    const ctlVal = physioStatus.ctl.toFixed(1);
    const rampVal = Number(physioStatus.rampRate || 0).toFixed(1);
    const wkg = profile.run_ftp && profile.weight ? ` (${(profile.run_ftp / profile.weight).toFixed(2)} W/kg)` : "";
    replyMsg = `Hola ${athleteFirstName}, con la mirada puesta en ${raceName} (${raceDist}), nos encontramos en la semana ${targetPlanningWeekNum} de ${macroPhase?.blueprint?.totalWeeks || 22} del macrociclo.\n\nTu cilindrada aeróbica (CTL) se encuentra en ${ctlVal} con una rampa ascendente y segura de +${rampVal} CTL/sem.${profile.run_ftp ? ` Tu potencia crítica Stryd está calibrada en ${profile.run_ftp}W${wkg}.` : ""} El modelo Banister proyecta que llegaremos al pico de forma en la ventana ideal de tapering sin riesgo de sobreentrenamiento.\n\nEn esta fase base estamos forjando el motor que te sostendrá en el último tercio de la prueba. Mantén la constancia en tus rodajes aeróbicos: cada kilómetro asimilado hoy es tu seguro el día de la carrera.`;
    smartActions = [
      { label: "Balance de Semana", icon: "activity", variant: "secondary" },
      { label: "Mantener plan previsto", variant: "primary", icon: "check" },
    ];
  }
  // 3. BALANCE DE SEMANA Y VOLUMEN
  else if (lowerMsg.includes("balance") || lowerMsg.includes("volumen")) {
    actionType = "REVIEW_PHYSIOLOGY";
    const athleteFirstName = profile.name ? profile.name.split(" ")[0] : "Germán";
    const executedCount = Object.values(ctx.effectiveExecutedMap || {}).reduce((acc: number, d: any) => acc + (d?.activities?.length || 0), 0);
    const totalSessions = currentPlan.filter((p) => !/descanso/i.test(p.workoutName || "")).length || 5;
    const tsbSign = physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1);
    replyMsg = `Hola ${athleteFirstName}, estuve haciendo el balance de tu semana ${targetPlanningWeekNum}: llevas ${executedCount} de ${totalSessions} sesiones completadas, con ${actualTss} de ${plannedWeekTss} TSS previstos (${compliancePct}% de adherencia).\n\nTu rampa de fitness avanza controlada en +${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem y tu balance de estrés (TSB) marca ${tsbSign}, lo que indica que tus fibras musculares y tu sistema neuromuscular están asimilando la carga con buena frescura.\n\nVamos por excelente camino para cerrar la semana. Sigamos con la planificación establecida para consolidar el bloque del fin de semana sin sobresaltos.`;
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
    const athleteFirstName = profile.name ? profile.name.split(" ")[0] : "Germán";
    replyMsg = `Hola ${athleteFirstName}, comprendo perfectamente tu situación. Tras una indisposición o días enfermo, la regla de oro es no intentar recuperar el volumen perdido: tus adaptaciones aeróbicas siguen vivas y forzar el cuerpo ahora solo dispararía una recaída.\n\nHe recalibrado tu semana restante a ${newWeeklyTss} TSS seguros, suprimiendo las intensidades altas (fartlek y umbral) y acortando la tirada dominical un 40% para cuidar tu sistema inmune y tendinoso.\n\nRodaremos en Zona 1 conversacional muy suave para despertar el corazón sin fatiga. Revisa la propuesta abajo y haz clic en 'Aprobar Ajuste' para sincronizarla.`;
    smartActions = [
      { label: "Aprobar Ajuste", variant: "primary", icon: "check" },
      { label: "Mantener plan previsto", variant: "secondary", icon: "check" },
    ];
  }
  // 5. POCO TIEMPO HOY (30-45M)
  else if (lowerMsg.includes("poco tiempo") || lowerMsg.includes("30m") || lowerMsg.includes("45m")) {
    actionType = "ADAPT_WORKOUT";
    const athleteFirstName = profile.name ? profile.name.split(" ")[0] : "Germán";
    const targetIdx = ctx.todayDayIndex;
    if (modifiedPlan[targetIdx]) {
      modifiedPlan[targetIdx] = {
        ...modifiedPlan[targetIdx],
        workoutName: `${modifiedPlan[targetIdx].discipline || "Carrera"} Comprimida (Estímulo Clave)`,
        durationMinutes: 35, tss: Math.round((modifiedPlan[targetIdx].tss || 50) * 0.7), action: "MODIFICAR",
      };
    }
    replyMsg = `Comprendido, ${athleteFirstName}. Mucho mejor hacer 35 minutos de calidad bien aprovechados que saltarse el día de entrenamiento. He comprimido la sesión de hoy reduciendo el calentamiento y enfriamiento pero preservando el estímulo metabólico principal.\n\nDe esta forma sumamos carga a tu motor aeróbico sin interferir en tu agenda del día. ¿Aprobamos este ajuste para actualizar tu reloj?`;
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
    const athleteFirstName = profile.name ? profile.name.split(" ")[0] : "Germán";
    const tsbSign = physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1);
    replyMsg = `Hola ${athleteFirstName}, tu estado biológico para la semana ${targetPlanningWeekNum} está muy bien equilibrado: tu fitness (CTL) se sitúa en ${physioStatus.ctl.toFixed(1)}, tu fatiga aguda (ATL) en ${physioStatus.atl.toFixed(1)} y tu frescura (TSB) en ${tsbSign}, con una rampa ascendente de +${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem.\n\nEsto confirma que estás asimilando el volumen con buena tolerancia neuromuscular y sin sobreesfuerzo destructivo. El sistema nervioso responde favorablemente al estímulo.\n\nMi recomendación es continuar con el plan previsto para consolidar el bloque. ¿Te gustaría auditar alguna sesión o revisar tu balance semanal?`;
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
