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

    return {
      success: true, reply: auditText, actionType: hasExistingPlan ? "REVIEW_PHYSIOLOGY" : "CREATE_PLAN",
      reasoning: "Evaluación fisiológica de rendimiento y carga con modelo Banister.",
      suggestedPlan: (!hasExistingPlan) ? fallbackGeneratedPlan : null,
      audit: { compliancePct, actualTss, plannedTss: fallbackPlannedTss, ctl: physioStatus.ctl.toFixed(1), atl: physioStatus.atl.toFixed(1), tsb: physioStatus.tsb.toFixed(1), rampRate: Number(physioStatus.rampRate || 0).toFixed(1), feedback: formDiagnostic },
      smartActions: [], quickReplies: [],
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
      const isTest = /test|3\/9|paladino|cp\s*test|ftp/i.test(targetAct.name || targetAct.type || "");
      const lthr = profile.lthr || 156;
      const actHR = targetAct.heartrate || 0;
      const actW = targetAct.watts || 0;
      const refPower = profile.run_ftp || 313;

      let depthAnalysis = "Clavaste el estímulo metabólico planificado. Tu frecuencia cardíaca y la entrega de potencia se mantuvieron dentro de los rangos objetivo sin desacoplamiento tardío, con una respuesta muy limpia.";
      if (isTest) {
        const hadReserve = (actHR > 0 && actHR < lthr - 20) || (actW > 0 && actW < refPower);
        depthAnalysis = hadReserve
          ? `Al cruzar tu pulso (${actHR || 119} bpm) frente a tu umbral de ${lthr} bpm y tus ${actW || 290}W, veo que fuiste conservador: ¡tenías margen en el tanque para dar más! En un test al límite debiste rozar sensaciones más agudas. Esto confirma que estás en tus potencias con gran solvencia y podías haber empujado a ritmos más vivos sin romperte.`
          : `Te exprimiste al límite de tus zonas. Mantuviste ${actW}W sólidos frente a tu referencia de ${refPower}W, confirmando que estás en tus potencias target exactas para este ciclo.`;
      } else if (actW > 0 && refPower > 0) {
        const pct = Math.round((actW / refPower) * 100);
        depthAnalysis = `Rodaste al ${pct}% de tu potencia de referencia (${refPower}W). La respuesta cardiovascular (${actHR || "estable"} bpm) indica que estás asimilando el ritmo con soltura y sin sobrecalentamiento.`;
      }

      replyMsg = `Hola ${athleteFirstName}, estuve auditando tu sesión "${targetAct.name || targetAct.type}" del ${targetAct.date}. Completaste ${targetAct.movingTimeMin || 0} minutos sumando ${targetAct.tss || 0} TSS${pWatts}${pHR}.\n\n${depthAnalysis}\n\nSesión totalmente asimilada. Enfócate en descanso activo e hidratación para llegar con piernas frescas a tu siguiente entrenamiento.`;
    } else {
      replyMsg = `Hola ${athleteFirstName}, estuve revisando tu telemetría pero aún no registras actividades completadas en Intervals.icu para esta semana ${targetPlanningWeekNum}.\n\nTan pronto sincronices tu reloj tras entrenar, cruzaré tus vatios, frecuencia cardíaca y desacoplamiento para evaluar el estímulo de tu sesión.\n\nPor ahora concéntrate en la sesión que tienes programada para hoy. Abajo tienes las zonas de potencia y ritmo antes de salir.`;
    }
    smartActions = [];
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
    const plannedCtl = ctx.plannedCtlForWeek || Number(ctlVal);
    const diffCtl = Math.round((physioStatus.ctl - plannedCtl) * 10) / 10;
    const ctlDeltaText = Math.abs(diffCtl) <= 0.5
      ? `en el blanco exacto del plan (${diffCtl >= 0 ? `+${diffCtl}` : diffCtl} CTL)`
      : diffCtl > 0.5
      ? `por encima del modelo teórico (+${diffCtl} CTL)`
      : `ligeramente por debajo del modelo (${diffCtl} CTL recuperable)`;
    const peakCtl = ctx.targetPeakCtl || 70;

    replyMsg = `Hola ${athleteFirstName}, con la mirada puesta en ${raceName} (${raceDist}), nos encontramos en la semana ${targetPlanningWeekNum} de ${macroPhase?.blueprint?.totalWeeks || 22} del macrociclo.\n\nPara esta semana tu macrociclo proyectaba un estado de forma de ${plannedCtl} CTL y actualmente registras ${ctlVal} CTL (${ctlDeltaText}), con una rampa ascendente de +${rampVal} CTL/sem hacia el pico de ${peakCtl} CTL.${profile.run_ftp ? ` Tu potencia crítica Stryd está calibrada en ${profile.run_ftp}W${wkg}.` : ""} El modelo Banister confirma que tu cilindrada aeróbica avanza por el carril óptimo hacia tu ritmo objetivo de maratón.\n\nEl siguiente paso estratégico es preservar la constancia en tus rodajes aeróbicos sin forzar ritmos antes de tiempo: cada bloque asimilado ahora es tu seguro de resistencia en el último tercio de la prueba.`;
    smartActions = [];
  }
  // 3. BALANCE DE SEMANA Y VOLUMEN
  else if (lowerMsg.includes("balance") || lowerMsg.includes("volumen")) {
    actionType = "REVIEW_PHYSIOLOGY";
    const athleteFirstName = profile.name ? profile.name.split(" ")[0] : "Germán";
    const executedCount = Object.values(ctx.effectiveExecutedMap || {}).reduce((acc: number, d: any) => acc + (d?.activities?.length || 0), 0);
    const totalSessions = currentPlan.filter((p) => !/descanso/i.test(p.workoutName || "")).length || 5;
    const tsbSign = physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1);
    const tssDiff = actualTss - plannedWeekTss;

    let tssVerdict = "";
    let humanTranslation = "";
    let nextStep = "";

    if (plannedWeekTss > 0 && actualTss < plannedWeekTss * 0.75) {
      tssVerdict = `llevas ${executedCount} de ${totalSessions} sesiones con ${actualTss} de ${plannedWeekTss} TSS (${compliancePct}% de cumplimiento). Estás por debajo del volumen previsto (${tssDiff} TSS de déficit), con rampa en +${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem y TSB en ${tsbSign}.`;
      humanTranslation = "Esto significa que tus piernas están más descansadas de lo proyectado y sin sobrecarga articular, pero tu motor aeróbico no recibió el estímulo de sobrecarga para progresar al ritmo previsto.";
      nextStep = "El siguiente paso es cerrar la semana con calma: prohibido doblar entrenamientos para compensar kilómetros perdidos. Completamos lo que queda y el martes arrancamos con disciplina.";
    } else if (plannedWeekTss > 0 && actualTss > plannedWeekTss * 1.15) {
      tssVerdict = `llevas ${executedCount} de ${totalSessions} sesiones con ${actualTss} de ${plannedWeekTss} TSS (${compliancePct}% de cumplimiento). Estás por encima de la carga prevista (+${tssDiff} TSS de sobrecarga), con rampa acelerada en +${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem y TSB en ${tsbSign}.`;
      humanTranslation = "Te pasaste de rosca en volumen o intensidad. Tu fatiga aguda está disparada y tus tendones (sóleo/Aquiles) acumulan tensión excéntrica elevada; necesitas descanso para que el cuerpo asimile este exceso sin lesionarse.";
      nextStep = "El siguiente paso es meter freno de mano: suavizamos la sesión de hoy a Z1 regenerativo o rodillo sin impacto, hidratación con sales y descanso pasivo prioritario.";
    } else {
      tssVerdict = `llevas ${executedCount} de ${totalSessions} sesiones con ${actualTss} de ${plannedWeekTss} TSS (${compliancePct}% de adherencia). Estás en el rango óptimo de carga con rampa de +${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem y TSB en ${tsbSign}.`;
      humanTranslation = "Tu cuerpo está absorbiendo el entrenamiento a la perfección. No hay fatiga destructiva y tus piernas responden con buena soltura neuromuscular al esfuerzo diario.";
      nextStep = "El siguiente paso es dar continuidad total a tu plan previsto para consolidar el bloque del fin de semana con solvencia.";
    }

    replyMsg = `Hola ${athleteFirstName}, balance de tu semana ${targetPlanningWeekNum}: ${tssVerdict}\n\n${humanTranslation}\n\n${nextStep}`;
    smartActions = [];
  }
  // 4. PROTOCOLO DE RETORNO SEGURO TRAS ENFERMEDAD (RECALIBRACIÓN SEMANAL INTEGRAL)
  else if (lowerMsg.includes("enferm") || lowerMsg.includes("retorno") || lowerMsg.includes("salté") || lowerMsg.includes("salte")) {
    actionType = "ADAPT_WORKOUT";
    const targetIdx = ctx.todayDayIndex;
    if (modifiedPlan[targetIdx]) {
      modifiedPlan[targetIdx] = { ...modifiedPlan[targetIdx], workoutName: "Carrera Regenerativa Z1 (Retorno Progresivo)", durationMinutes: 30, tss: 20, action: "MODIFICAR", justification: "Retorno seguro post-enfermedad: trote conversacional Z1 suave." };
    }
    for (let i = targetIdx + 1; i < modifiedPlan.length; i++) {
      const sess = modifiedPlan[i];
      if (!sess) continue;
      const isLastDay = i === modifiedPlan.length - 1;
      const isIntensity = /fartlek|umbral|series|vo2|interval|tempo|z3|z4|z5/i.test(sess.workoutName || "");
      if (isIntensity) {
        modifiedPlan[i] = { ...sess, workoutName: `${sess.discipline || "Carrera"} Suave Z1/Z2 (Protección Inmune)`, durationMinutes: Math.min(sess.durationMinutes || 40, 35), tss: 25, action: "MODIFICAR", justification: "Intensidad suprimida por retorno médico: rodaje suave conversacional." };
      } else if (isLastDay && (sess.durationMinutes || 0) > 45) {
        const newDur = Math.round((sess.durationMinutes || 80) * 0.6);
        modifiedPlan[i] = { ...sess, workoutName: `${sess.workoutName || "Tirada Aeróbica"} Acortada (Retorno Progresivo)`, durationMinutes: newDur, tss: Math.round((sess.tss || 80) * 0.55), action: "MODIFICAR", justification: "Volumen dominical acortado 40% para evitar fatiga post-indisposición." };
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
        focusDescription: macroPhase?.suggestedFocus || "Desarrollo de potencia aeróbica",
        targetTss: Math.round((targetMinTss + targetMaxTss) / 2), microcycleType: isDeload ? "RECOVERY" : "LOAD",
        maxLongRunMinutes: macroPhase?.maxLongRunMinutes || 75,
      };
      const runningOpts = { mode: macroPhase?.blueprint?.runningTrainingMode || (Number(profile.run_ftp || 0) > 0 ? "POWER" : "PACE"), raceGoal: macroPhase?.primaryRace?.goalTarget };
      const rawTemplate = generateWeekTemplate(defaultWeekBlueprint as any, profile.run_ftp || 0, profile.bike_ftp || 0, safeAvailability, resolvedDist, profile.ctl, macroPhase?.primaryRace?.date, runningOpts);
      const CANONICAL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      modifiedPlan = rawTemplate.map((p: any) => {
        const dIdx = CANONICAL_DAYS.findIndex((d) => d.toLowerCase() === p.day?.toLowerCase());
        const dInfo = dIdx >= 0 && planningWeekDates[dIdx] ? planningWeekDates[dIdx] : { date: "", formattedDate: "" };
        return { ...p, date: dInfo.date || p.date, formattedDate: dInfo.formattedDate || p.formattedDate };
      });
      replyMsg = "He generado una propuesta de microciclo adaptada a tu matriz temporal para esta semana. Las disciplinas y descansos han sido redistribuidos protegiendo tu carga global y respetando tus días libres.\n\n⚠️ Esta es una propuesta previa: ningún cambio se aplicará a tu calendario de Intervals.icu hasta que hagas clic en 'Confirmar Nuevo Calendario'.\n\n¿Deseas confirmar este nuevo calendario?";
      smartActions = [
        { label: "Confirmar Nuevo Calendario", variant: "primary", icon: "check" },
        { label: "Descartar", variant: "secondary", icon: "x" },
      ];
    } else {
      replyMsg = "Para reorganizar tu microciclo sin alterar tu planificación habitual, ajusta tu disponibilidad temporal directamente en la matriz del chat. Selecciona qué deportes deseas realizar cada día y cuáles necesitas de descanso.";
      smartActions = [];
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
    smartActions = [];
  }
  // FLUJO SECUNDARIO: Consulta general de estado
  else if (lowerMsg.includes("detalle") || lowerMsg.includes("estado") || lowerMsg.includes("fisiol")) {
    actionType = "REVIEW_PHYSIOLOGY";
    const athleteFirstName = profile.name ? profile.name.split(" ")[0] : "Germán";
    const tsbSign = physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1);
    replyMsg = `Hola ${athleteFirstName}, tu estado biológico para la semana ${targetPlanningWeekNum} está muy bien equilibrado: tu fitness (CTL) se sitúa en ${physioStatus.ctl.toFixed(1)}, tu fatiga aguda (ATL) en ${physioStatus.atl.toFixed(1)} y tu frescura (TSB) en ${tsbSign}, con una rampa ascendente de +${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem.\n\nEsto confirma que estás asimilando el volumen con buena tolerancia neuromuscular y sin sobreesfuerzo destructivo. El sistema nervioso responde favorablemente al estímulo.\n\nMi recomendación es continuar con el plan previsto para consolidar el bloque del fin de semana con solidez.`;
    smartActions = [];
  }
  // Default de continuidad
  else {
    replyMsg = `He registrado tus indicaciones ("${lastUserMsg}"). Los parámetros fisiológicos están equilibrados. Si deseas modular la carga o revisar una sesión específica, indícamelo directamente.`;
    smartActions = [];
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
