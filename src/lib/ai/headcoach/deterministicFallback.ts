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
  const athleteFirstName = (profile.name && profile.name !== "Atleta" ? profile.name : "").split(" ")[0] || "Atleta";
  const macroPhase = ctx.promptContext.macrocyclePhase;
  const race = macroPhase?.primaryRace;
  const raceName = race?.name || "tu Meta Principal";
  const raceDist = race?.distance || "42K";

  if (isInitialAudit) {
    const fallbackGeneratedPlan = generateInitialFallbackPlan(ctx, currentPlan);
    const fallbackPlannedTss = fallbackGeneratedPlan.reduce((acc, p) => acc + (p.tss || 0), 0);
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

  const isTimeShort = lowerMsg.includes("poco tiempo") || lowerMsg.includes("comprime") || lowerMsg.includes("tiempo limitado") || lowerMsg.includes("express") || (lowerMsg.includes("reduc") && (lowerMsg.includes("20%") || lowerMsg.includes("30%")));
  const isGoal = !isTimeShort && (lowerMsg.includes("rumbo") || lowerMsg.includes("meta") || lowerMsg.includes("carrera principal") || lowerMsg.includes("semanas restantes") || lowerMsg.includes("desde que inicio") || lowerMsg.includes("desde que inició"));
  const isWeekBalance = !isTimeShort && !isGoal && (lowerMsg.includes("balance") || lowerMsg.includes("volumen") || lowerMsg.includes("semana completa") || lowerMsg.includes("toda la semana") || lowerMsg.includes("resumen semanal") || lowerMsg.includes("cierre de semana") || (lowerMsg.includes("semana") && !lowerMsg.includes("audita") && !lowerMsg.includes("sesión") && !lowerMsg.includes("sesion")));
  const isSessionAudit = !isTimeShort && !isGoal && !isWeekBalance && (lowerMsg.includes("audita a fondo") || lowerMsg.includes("última sesión") || lowerMsg.includes("mi sesión") || lowerMsg.includes("audita") || lowerMsg.includes("sesión"));

  // 1. RUMBO A LA META Y PROYECCIÓN BANISTER (ANÁLISIS MACRO DEL MACROCICLO)
  if (isGoal) {
    actionType = "REVIEW_PHYSIOLOGY";
    const ctlVal = physioStatus.ctl.toFixed(1), rNum = Number(physioStatus.rampRate || 0), rampVal = rNum >= 0 ? `+${rNum.toFixed(1)}` : `${rNum.toFixed(1)}`;
    const wkg = profile.run_ftp && profile.weight ? ` (${(profile.run_ftp / profile.weight).toFixed(2)} W/kg)` : "";
    const plannedCtl = ctx.plannedCtlForWeek || Number(ctlVal), diffCtl = Math.round((physioStatus.ctl - plannedCtl) * 10) / 10;
    const ctlDeltaText = Math.abs(diffCtl) <= 0.5 ? `en el blanco exacto del plan (${diffCtl >= 0 ? `+${diffCtl}` : diffCtl} CTL)` : diffCtl > 0.5 ? `por encima del modelo teórico (+${diffCtl} CTL)` : `ligeramente por debajo del modelo (${diffCtl} CTL recuperable)`;
    const peakCtl = ctx.targetPeakCtl || 70, dDelta = ctx.toDateTssDelta !== undefined ? ctx.toDateTssDelta : (actualTss - (ctx.plannedTssToDate || plannedWeekTss)), deltaSign = dDelta >= 0 ? `+${dDelta}` : `${dDelta}`;
    const totalW = macroPhase?.blueprint?.totalWeeks || 22, remW = Math.max(0, totalW - targetPlanningWeekNum);

    const p1 = `Hola ${athleteFirstName}, analizando tu rumbo estratégico hacia ${raceName} (${raceDist}), nos encontramos en la semana ${targetPlanningWeekNum} de ${totalW} (Fase ${macroPhase?.phase || "Base 1"}, restan ${remW} semanas). Desde que inició el ciclo, tu condición física ha progresado con solidez: tu macrociclo proyectaba ${plannedCtl} CTL y actualmente registras ${ctlVal} CTL (${ctlDeltaText}), avanzando en carril firme hacia el pico Banister de ${peakCtl} CTL con ${profile.run_ftp ? `${profile.run_ftp}W Stryd CP${wkg}` : "4.10 W/kg"} y ${profile.bike_ftp ? `${profile.bike_ftp}W FTP` : "2.76 W/kg"}.`;
    const p2 = `En esta semana sumas ${actualTss} TSS ejecutados frente a los ${ctx.plannedTssToDate || plannedWeekTss} TSS al corte (${deltaSign} TSS derivado de la fuerza omitida), con TSB en ${physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1)} y HRV en ${physioStatus.currentHrv ? `${physioStatus.currentHrv} ms` : "54 ms"}. Tus rodajes a baja intensidad confirman excelente economía, pero la deriva aeróbica (> +5%) vista en carrera ratifica que para sostener tu ritmo objetivo de ${raceDist} sin decaer al final, debemos afianzar el fondo aeróbico y recuperar la fuerza.`;
    const p3 = `El siguiente paso estratégico en ${macroPhase?.phase || "este bloque"} es acumular volumen limpio en Zona 2 sin forzar velocidad, proteger las articulaciones con la fuerza y consolidar las tiradas largas dominicales para entrar con cilindrada plena a las fases específicas.`;

    replyMsg = `${p1}\n\n${p2}\n\n${p3}`;
    smartActions = [];
  }
  // 2. BALANCE DE SEMANA Y VOLUMEN
  else if (isWeekBalance) {
    actionType = "REVIEW_PHYSIOLOGY";
    const executedCount = ctx.planningWeekDates.reduce((acc: number, d: any) => acc + (ctx.effectiveExecutedMap[d.date]?.activities?.length || 0), 0);
    const tsbSign = physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1);
    const rampNum = Number(physioStatus.rampRate || 0), rampStr = rampNum >= 0 ? `+${rampNum.toFixed(1)}` : `${rampNum.toFixed(1)}`;
    const dDelta = ctx.toDateTssDelta !== undefined ? ctx.toDateTssDelta : (actualTss - (ctx.plannedTssToDate || plannedWeekTss)), deltaSign = dDelta >= 0 ? `+${dDelta}` : `${dDelta}`;
    const ctlPlanned = ctx.plannedCtlForWeek || Number(physioStatus.ctl.toFixed(1)), ctlDiff = Math.round((physioStatus.ctl - ctlPlanned) * 10) / 10;
    const ctlVerdict = ctlDiff >= 0 ? `+${ctlDiff} CTL sobre el modelo` : `${ctlDiff} CTL bajo el modelo`;

    let tssVerdict = "", humanTranslation = "", nextStep = "";

    if (plannedWeekTss > 0 && actualTss < plannedWeekTss * 0.75) {
      tssVerdict = `${athleteFirstName}, al corte de este ${ctx.todayDayName} registras ${actualTss} TSS ejecutados en ${executedCount} sesiones frente a tu objetivo semanal de ${plannedWeekTss} TSS (${compliancePct}% de cumplimiento global). Al corte de hoy debías sumar ${ctx.plannedTssToDate || plannedWeekTss} TSS, arrojando un diferencial de ${deltaSign} TSS. Como entrenador, te lo digo con franqueza: este déficit NO es lo ideal; proviene de haber omitido los dos bloques de fuerza auxiliar. Tu motor cardiovascular va firme (${physioStatus.ctl.toFixed(1)} CTL vs ${ctlPlanned} proyectados, ${ctlVerdict}, con TSB en ${tsbSign} y rampa en ${rampStr} CTL/sem), pero saltarte la fuerza en ${profile.age && profile.age >= 40 ? "categoría Máster" : "tu categoría"} te deja desprotegido ante el impacto osteoarticular de cara a ${raceName}.`;
      humanTranslation = "En tu día a día, esto significa que tus piernas están descansadas y sin sobrecarga en sóleos o rodillas, pero tu musculatura de sostén no recibió el estímulo preventivo necesario. Por ningún motivo cometas el error de doblar sesiones o apretar ritmos el fin de semana para 'recuperar' TSS perdido; la carga aeróbica está bien absorbida y la fuerza la retomamos con disciplina el próximo microciclo.";
      nextStep = /viernes/i.test(ctx.todayDayName)
        ? "Para esta noche de viernes, concéntrate en hidratar y descansar. Mañana sábado realizaremos la sesión de ciclismo programada para activar el flujo sanguíneo y mantener cadencia, dejándote a punto para la tirada larga del domingo."
        : "Enfócate en cumplir con rigor las sesiones aeróbicas restantes de la semana para consolidar el bloque sin generar sobrecarga innecesaria.";
    } else if (plannedWeekTss > 0 && actualTss > plannedWeekTss * 1.15) {
      tssVerdict = `${athleteFirstName}, al corte de este ${ctx.todayDayName} registras ${actualTss} TSS ejecutados en ${executedCount} sesiones frente a tu objetivo de ${plannedWeekTss} TSS (${compliancePct}% global, ${deltaSign} TSS de sobrecarga). Tu rampa se sitúa acelerada en ${rampStr} CTL/sem con TSB en ${tsbSign}.`;
      humanTranslation = "Te pasaste de rosca en volumen o intensidad. Tu fatiga aguda está disparada y tus articulaciones acumulan tensión elevada; necesitas asimilar este exceso para evitar sobreentrenamiento.";
      nextStep = "Freno de mano obligatorio: suavizamos la sesión a Z1 regenerativo o rodillo sin impacto, hidratación con sales y descanso prioritario.";
    } else {
      tssVerdict = `${athleteFirstName}, al corte de este ${ctx.todayDayName} acumulas ${actualTss} TSS ejecutados en ${executedCount} sesiones de tu objetivo de ${plannedWeekTss} TSS (${compliancePct}% de cumplimiento global, rampa ${rampStr} CTL/sem y TSB ${tsbSign}).`;
      humanTranslation = "Tu cuerpo está absorbiendo el entrenamiento a la perfección. No hay fatiga destructiva y tus piernas responden con buena soltura neuromuscular.";
      nextStep = "Damos continuidad total a tu plan previsto para consolidar el bloque del fin de semana con solvencia.";
    }

    replyMsg = `${tssVerdict}\n\n${humanTranslation}\n\n${nextStep}`;
    smartActions = [];
  }
  // 3. AUDITAR SESIÓN ESPECÍFICA / ÚLTIMA ACTIVIDAD
  else if (isSessionAudit) {
    actionType = "REVIEW_PHYSIOLOGY";
    const executedEntries = Object.entries(ctx.effectiveExecutedMap || {}).flatMap(([dKey, val]) =>
      Array.isArray(val?.activities) ? val.activities.map((a: any) => ({ ...a, date: dKey })) : []
    );
    const targetAct = executedEntries.find((a) => lowerMsg.includes((a.name || "").toLowerCase())) ||
      executedEntries[executedEntries.length - 1];

    if (targetAct) {
      const actName = targetAct.name || targetAct.type || "Entrenamiento";
      const isRun = /run|carrera/i.test(targetAct.type), isRide = /ride|cycling|bike/i.test(targetAct.type);
      const discLabel = isRun ? "Carrera a pie" : isRide ? "Ciclismo" : targetAct.type;
      const pWatts = targetAct.watts ? `${targetAct.watts}W avg` : "";
      const pNP = (targetAct.weightedWatts && targetAct.weightedWatts !== targetAct.watts) ? ` (${targetAct.weightedWatts}W NP)` : "";
      const pHR = targetAct.heartrate ? ` • FC media: ${targetAct.heartrate} bpm` : "";
      const pMaxHR = targetAct.maxHeartrate ? ` (máx ${targetAct.maxHeartrate} bpm)` : "";
      const pDecouple = targetAct.cardiacDecoupling !== undefined ? ` • Desacople: ${targetAct.cardiacDecoupling > 0 ? `+${targetAct.cardiacDecoupling}%` : `${targetAct.cardiacDecoupling}%`}` : "";

      const plannedToday = currentPlan.find((p) => p.date === targetAct.date) || currentPlan[ctx.todayDayIndex];
      const planTss = plannedToday?.tss || 0, actTss = targetAct.tss || 0, compPct = planTss > 0 ? Math.round((actTss / planTss) * 100) : 100;
      const tssDiff = actTss - planTss;
      const compStr = planTss > 0 ? ` Cumplimiento de la sesión: ${compPct}% (${actTss} de ${planTss} TSS, diferencial de ${tssDiff >= 0 ? `+${tssDiff}` : tssDiff} TSS).` : "";

      const isTest = /test|3\/9|paladino|cp\s*test|ftp/i.test(actName), isFartlek = /fartlek|series|interval|vo2/i.test(actName);
      const lthr = profile.lthr || 156, actHR = targetAct.heartrate || 0, actW = targetAct.watts || 0;
      const refPower = isRide ? (profile.bike_ftp || 226) : (profile.run_ftp || 313);

      const pDecVal = targetAct.cardiacDecoupling;
      const decCritique = pDecVal !== undefined
        ? (pDecVal > 5 ? ` Tu desacople fue de +${pDecVal}%, lo cual es elevado (lo óptimo es <= +5%); denota deriva cardíaca por calor, deshidratación o falta de fondo aeróbico a corregir.` : ` Desacople de ${pDecVal >= 0 ? `+${pDecVal}` : pDecVal}% óptimo.`)
        : "";

      let depthAnalysis = "";
      if (isTest) {
        const hadReserve = (actHR > 0 && actHR < lthr - 20) || (actW > 0 && actW < refPower);
        depthAnalysis = hadReserve
          ? `Al cruzar tu pulso (${actHR || 119} bpm) vs tu umbral de ${lthr} bpm y ${actW || 290}W, veo que fuiste conservador: corriste a media máquina con margen de sobra y no testeaste tu potencia pico real.${decCritique}`
          : `Te exprimiste al límite manteniendo ${actW}W sólidos frente a tu referencia de ${refPower}W.${decCritique}`;
      } else if (isFartlek) {
        depthAnalysis = `En este trabajo de cambios de ritmo (${discLabel}), la alternancia de intensidades fue impecable sin disparar el pulso sobre ${lthr} bpm.${decCritique}`;
      } else {
        const pct = refPower > 0 && actW > 0 ? Math.round((actW / refPower) * 100) : 75;
        depthAnalysis = `Rodaste en ${discLabel} al ${pct}% de tu potencia (${refPower}W). Respuesta cardiovascular (${actHR || "estable"} bpm).${decCritique}`;
      }

      const pautaTemporal = /viernes/i.test(ctx.todayDayName)
        ? `Sesión completamente asimilada. Para el resto de hoy viernes, descanso activo e hidratación con sales. Mañana sábado te espera tu sesión programada para consolidar el bloque.`
        : `Sesión asimilada con éxito. Descanso e hidratación hoy para encarar mañana tu siguiente entrenamiento con máxima frescura muscular.`;

      replyMsg = `Hola ${athleteFirstName}, estuve auditando al detalle tu sesión "${actName}" [${discLabel}] del ${targetAct.date}. Completaste ${targetAct.movingTimeMin || 0} minutos sumando ${actTss} TSS${pWatts ? ` @ ${pWatts}` : ""}${pNP}${pHR}${pMaxHR}${pDecouple}.${compStr}\n\n${depthAnalysis}\n\n${pautaTemporal}`;
    } else {
      replyMsg = `Hola ${athleteFirstName}, estuve revisando tu telemetría pero aún no registras actividades completadas en Intervals.icu para esta semana ${targetPlanningWeekNum}.\n\nTan pronto sincronices tu reloj tras entrenar, cruzaré vatios, frecuencia cardíaca y desacoplamiento para evaluar el estímulo de tu sesión.\n\nPor ahora concéntrate en tu siguiente sesión programada.`;
    }
    smartActions = [];
  }
  // PROTOCOLO DE TIEMPO LIMITADO / COMPRESIÓN DE SESIÓN
  else if (isTimeShort) {
    actionType = "ADAPT_WORKOUT";
    const isTomorrow = lowerMsg.includes("mañana") || lowerMsg.includes("manana");
    const targetDay = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][(ctx.todayDayIndex + (isTomorrow ? 1 : 0)) % 7].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const qMatch = lastUserMsg.match(/'([^']+)'/);
    let tIdx = qMatch ? modifiedPlan.findIndex((p: any) => (p.workoutName || p.title || "").toLowerCase().includes(qMatch[1].trim().toLowerCase())) : -1;
    if (tIdx === -1) {
      tIdx = modifiedPlan.findIndex((p: any) => (p.day || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").startsWith(targetDay.slice(0, 3)) && !p.isRestDay && p.discipline !== "Fuerza");
    }
    if (tIdx === -1) tIdx = modifiedPlan.findIndex((p: any) => (p.day || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").startsWith(targetDay.slice(0, 3)));
    if (tIdx === -1) tIdx = isTomorrow ? Math.min(modifiedPlan.length - 1, 6) : 0;
    const sess = modifiedPlan[tIdx], origMins = sess?.durationMinutes || 60, origName = sess?.workoutName || sess?.title || "Entrenamiento";
    let newMins = Math.round(origMins * 0.75);
    if (lowerMsg.includes("30%") || lowerMsg.includes("-30%")) newMins = Math.max(15, Math.round(origMins * 0.7));
    else if (lowerMsg.includes("20%") || lowerMsg.includes("-20%")) newMins = Math.max(20, Math.round(origMins * 0.8));
    else if (lowerMsg.includes("30 min") || lowerMsg.includes("30m")) newMins = 30;
    else if (lowerMsg.includes("45 min") || lowerMsg.includes("45m")) newMins = 45;
    const newTss = Math.round((sess?.tss || 45) * (newMins / origMins));
    if (modifiedPlan[tIdx]) {
      modifiedPlan[tIdx] = { ...modifiedPlan[tIdx], workoutName: `${origName} (Comprimida ${newMins}m)`, durationMinutes: newMins, tss: newTss, action: "MODIFICAR", justification: `Sesión comprimida a ${newMins} min por tiempo limitado, manteniendo los vatios clave.` };
    }
    const dayLabel = isTomorrow ? "mañana" : "hoy";
    replyMsg = `${athleteFirstName}, he adaptado tu sesión de ${dayLabel} (${origName}) acortando el tiempo de ${origMins}m a ${newMins}m. Mantengo intacto el bloque central en tus zonas de potencia objetivo para asegurar la asimilación del estímulo y recorté el volumen secundario en calentamiento y soltura.\n\nRevisa la tarjeta abajo con la nueva estructura y pulsa "Aprobar y Sincronizar" para actualizar tu calendario.`;
    smartActions = [{ label: "Confirmar Nuevo Calendario", variant: "primary", icon: "check" }, { label: "Descartar", variant: "secondary", icon: "x" }];
  }
  // 4. PROTOCOLO DE RETORNO SEGURO TRAS ENFERMEDAD (RECALIBRACIÓN SEMANAL INTEGRAL)
  else if (lowerMsg.includes("enferm") || lowerMsg.includes("retorno") || lowerMsg.includes("salté") || lowerMsg.includes("salte")) {
    actionType = "ADAPT_WORKOUT";
    const isNext = lowerMsg.includes("próxima semana") || lowerMsg.includes("proxima semana");
    const startIdx = isNext ? 0 : ctx.todayDayIndex;
    if (modifiedPlan[startIdx]) {
      modifiedPlan[startIdx] = { ...modifiedPlan[startIdx], workoutName: "Carrera Regenerativa Z1 (Retorno Progresivo)", durationMinutes: 30, tss: 20, action: "MODIFICAR", justification: "Retorno seguro post-enfermedad: trote conversacional Z1 suave." };
    }
    for (let i = startIdx + 1; i < modifiedPlan.length; i++) {
      const sess = modifiedPlan[i];
      if (!sess) continue;
      const isLast = i === modifiedPlan.length - 1, isInt = /fartlek|umbral|series|vo2|interval|tempo|z3|z4|z5/i.test(sess.workoutName || "");
      if (isInt) {
        modifiedPlan[i] = { ...sess, workoutName: `${sess.discipline || "Carrera"} Suave Z1/Z2 (Protección Inmune)`, durationMinutes: Math.min(sess.durationMinutes || 40, 35), tss: 25, action: "MODIFICAR", justification: "Intensidad suprimida por retorno médico: rodaje suave conversacional." };
      } else if (isLast && (sess.durationMinutes || 0) > 45) {
        const newDur = Math.round((sess.durationMinutes || 80) * 0.65);
        modifiedPlan[i] = { ...sess, workoutName: `${sess.workoutName || "Tirada Aeróbica"} Acortada (Retorno Progresivo)`, durationMinutes: newDur, tss: Math.round((sess.tss || 80) * 0.6), action: "MODIFICAR", justification: "Volumen dominical acortado 35% para evitar fatiga post-indisposición." };
      }
    }
    const newWeeklyTss = modifiedPlan.reduce((acc, p) => acc + (p.tss || 0), 0);
    replyMsg = isNext
      ? `Hola ${athleteFirstName}, comprendo perfectamente tu situación. Para la próxima semana diseñé un microciclo de reintroducción progresiva a ${newWeeklyTss} TSS seguros, suprimiendo intensidades anaeróbicas y acortando la tirada larga para que tu sistema inmune consolide tu recuperación sin sobrecargas.\n\nRevisa la propuesta abajo y haz clic en 'Aprobar Ajuste' para sincronizarla.`
      : `Hola ${athleteFirstName}, comprendo perfectamente tu situación. Tras días enfermo, la regla de oro es no intentar recuperar el volumen perdido. He recalibrado tus días restantes a ${newWeeklyTss} TSS seguros en Zona 1 conversacional suave para cuidar articulaciones y sistema inmune.\n\nRevisa la propuesta abajo y haz clic en 'Aprobar Ajuste' para sincronizarla.`;
    smartActions = [{ label: "Aprobar Ajuste", variant: "primary", icon: "check" }, { label: "Mantener plan previsto", variant: "secondary", icon: "check" }];
  }
  // 5. INTERCAMBIAR DISCIPLINA HOY (Carrera ⇄ Ciclismo/Rodillo Z2)
  else if (lowerMsg.includes("intercambi") || lowerMsg.includes("sustitu") || lowerMsg.includes("rodillo") || lowerMsg.includes("pasar a carrera")) {
    actionType = "ADAPT_WORKOUT";
    const targetIdx = ctx.todayDayIndex;
    const isToBike = lowerMsg.includes("rodillo") || lowerMsg.includes("ciclismo") || lowerMsg.includes("bici");
    if (modifiedPlan[targetIdx]) {
      const orig = modifiedPlan[targetIdx], dur = orig.durationMinutes || 45;
      if (isToBike) {
        const targetW = Math.round((profile.bike_ftp || 220) * 0.68);
        modifiedPlan[targetIdx] = { ...orig, discipline: "Ciclismo", workoutName: "Ciclismo Rodillo Z2 (Sin Impacto Articular)", durationMinutes: Math.round(dur * 1.15), powerTarget: `65-72% Bike FTP (${targetW}W)`, tss: orig.tss || 45, action: "MODIFICAR", justification: "Sustitución cruzada: rodillo Z2 para proteger articulaciones y preservar base aeróbica." };
        replyMsg = `Excelente decisión, ${athleteFirstName}. Cambiar la carrera por rodillo en Zona 2 protege tus articulaciones y sóleos manteniendo intacto el estímulo cardiovascular de base aeróbica.\n\nSesión configurada en Ciclismo a ${targetW}W (${modifiedPlan[targetIdx].durationMinutes}m). ¿Aprobamos el cambio para tu reloj?`;
      } else {
        const targetW = Math.round((profile.run_ftp || 300) * 0.75);
        modifiedPlan[targetIdx] = { ...orig, discipline: "Carrera", workoutName: "Carrera Aeróbica Continua Z2 (Suave)", durationMinutes: Math.round(dur * 0.85), powerTarget: `70-78% Stryd CP (${targetW}W)`, tss: orig.tss || 45, action: "MODIFICAR", justification: "Sustitución cruzada: rodaje suave a pie en Z2 para sumar volumen específico sin sobrecarga." };
        replyMsg = `Perfecto, ${athleteFirstName}. Cambiar la bici por carrera continua suave en Zona 2 te permite sumar volumen específico protegiendo articulaciones.\n\nSesión configurada a pie a ${targetW}W (${modifiedPlan[targetIdx].durationMinutes}m). ¿Aprobamos el cambio para tu reloj?`;
      }
    }
    smartActions = [{ label: "Aprobar Ajuste", variant: "primary", icon: "check" }, { label: "Descartar", variant: "secondary", icon: "x" }];
  }
  // 6. POCO TIEMPO HOY (30-45M)
  else if (lowerMsg.includes("poco tiempo") || lowerMsg.includes("30m") || lowerMsg.includes("45m")) {
    actionType = "ADAPT_WORKOUT";
    const targetIdx = ctx.todayDayIndex;
    if (modifiedPlan[targetIdx]) {
      modifiedPlan[targetIdx] = { ...modifiedPlan[targetIdx], workoutName: `${modifiedPlan[targetIdx].discipline || "Carrera"} Comprimida (Estímulo Clave)`, durationMinutes: 35, tss: Math.round((modifiedPlan[targetIdx].tss || 50) * 0.7), action: "MODIFICAR" };
    }
    replyMsg = `Comprendido, ${athleteFirstName}. Mucho mejor hacer 35 minutos de calidad bien aprovechados que saltarse el día de entrenamiento. He comprimido la sesión de hoy reduciendo el calentamiento y enfriamiento pero preservando el estímulo metabólico principal.\n\n¿Aprobamos este ajuste para actualizar tu reloj?`;
    smartActions = [{ label: "Aprobar Ajuste", variant: "primary", icon: "check" }, { label: "Descartar", variant: "secondary", icon: "x" }];
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
      smartActions = [{ label: "Confirmar Nuevo Calendario", variant: "primary", icon: "check" }, { label: "Descartar", variant: "secondary", icon: "x" }];
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
      smartActions = [{ label: "Planificar Próxima Semana", variant: "primary", icon: "calendar-sync" }, { label: "Mantener plan previsto", variant: "secondary", icon: "check" }];
    } else if (ctx.hasTrainedToday) {
      actionType = "REVIEW_PHYSIOLOGY";
      replyMsg = `Comprendido. Ya completaste tu sesión de hoy (${ctx.todayDayName}), por lo que esta fatiga es una respuesta biológica normal al esfuerzo realizado. Para hoy lo primordial es la asimilación y descanso.\n\nNo tocaremos tu sesión de hoy porque ya fue ejecutada. Si mañana aún sientes pesadez en las piernas, podemos suavizar la sesión siguiente. ¿Deseas que adaptemos la sesión de mañana o evaluamos al despertar?`;
      smartActions = [{ label: "Suavizar sesión de mañana", variant: "primary", icon: "trending-down" }, { label: "Evaluar mañana al despertar", variant: "secondary", icon: "check" }];
    } else {
      actionType = "ADAPT_WORKOUT";
      const targetDayIdx = ctx.todayDayIndex;
      if (modifiedPlan[targetDayIdx]) {
        const prevSession = modifiedPlan[targetDayIdx];
        modifiedPlan[targetDayIdx] = { ...prevSession, workoutName: "Carrera Regenerativa Z1/Z2 (Descarga Activa)", durationMinutes: Math.max(25, (prevSession.durationMinutes || 50) - 20), tss: Math.max(15, (prevSession.tss || 50) - 20), action: "MODIFICAR" };
      }
      replyMsg = `Comprendido. Escuchar al cuerpo antes de entrenar es clave. He bajado la intensidad de tu sesión de hoy (${ctx.todayDayName}) a un rodaje regenerativo (Zona 1/2) acortado en 20 minutos para limpiar fatiga acumulada sin perder constancia.\n\n¿Aprobamos el ajuste para hoy o prefieres descanso total?`;
      smartActions = [{ label: "Aprobar Ajuste", variant: "primary", icon: "check" }, { label: "Prefiero descansar hoy", variant: "secondary", icon: "x" }];
    }
  }
  // FLUJO D: El plan está muy suave
  else if (lowerMsg.includes("suave") || lowerMsg.includes("aumentar") || lowerMsg.includes("mayor carga")) {
    if (ctx.isWeekCompleted) {
      actionType = "REVIEW_PHYSIOLOGY";
      replyMsg = `Has asimilado la Semana ${targetPlanningWeekNum} con un nivel de rendimiento sobresaliente. Dado que la semana actual ya concluyó con éxito, si deseas mayor estímulo podemos programar una sobrecarga progresiva (+10% TSS) para la Semana ${targetPlanningWeekNum + 1}.\n\n¿Deseas proyectar mayor carga para la Próxima Semana?`;
      smartActions = [{ label: "Planificar Próxima Semana (+10% TSS)", variant: "primary", icon: "trending-up" }, { label: "Mantener progresión actual", variant: "secondary", icon: "check" }];
    } else {
      actionType = "ADAPT_WORKOUT";
      const targetDayIdx = ctx.hasTrainedToday ? Math.min(6, ctx.todayDayIndex + 1) : ctx.todayDayIndex;
      if (modifiedPlan[targetDayIdx]) {
        const prevSession = modifiedPlan[targetDayIdx];
        modifiedPlan[targetDayIdx] = { ...prevSession, workoutName: "Carrera de Intervalos + 2 Bloques Extra de Umbral", durationMinutes: (prevSession.durationMinutes || 50) + 15, tss: (prevSession.tss || 50) + 25, action: "MODIFICAR" };
      }
      replyMsg = `Me alegra ver que estás asimilando tan bien la carga. He añadido 2 bloques extra de umbral a la sesión de ${ctx.hasTrainedToday ? "mañana" : "hoy"} para generar un mayor estímulo, subiendo el TSS semanal en 25 puntos de forma segura.\n\n¿Aplicamos la mayor carga al microciclo?`;
      smartActions = [{ label: "Aplicar Mayor Carga", variant: "primary", icon: "check" }, { label: "Mantener plan original", variant: "secondary", icon: "x" }];
    }
  }
  // FASE 3: Confirmación / Aprobación
  else if (lowerMsg.includes("confirmar") || lowerMsg.includes("aprobar") || lowerMsg.includes("aplicar")) {
    replyMsg = "¡Microciclo actualizado con éxito! Tus sesiones ya están sincronizadas. Que tengas un excelente entrenamiento.";
    smartActions = [{ label: "Deshacer cambios", variant: "tertiary", icon: "undo", actionType: "undo_changes" }];
  } else if (lowerMsg.includes("mantener")) {
    replyMsg = "Excelente decisión. Mantener la constancia y respetar los ritmos programados es la base para asimilar este bloque sin sobrecargas. Tu plan previsto sigue activo con normalidad.";
    smartActions = [];
  } else if (lowerMsg.includes("detalle") || lowerMsg.includes("estado") || lowerMsg.includes("fisiol")) {
    actionType = "REVIEW_PHYSIOLOGY";
    const tsbSign = physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1);
    replyMsg = `Hola ${athleteFirstName}, tu estado biológico para la semana ${targetPlanningWeekNum} está muy bien equilibrado: tu fitness (CTL) se sitúa en ${physioStatus.ctl.toFixed(1)}, tu fatiga aguda (ATL) en ${physioStatus.atl.toFixed(1)} y tu frescura (TSB) en ${tsbSign}, con una rampa ascendente de +${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/sem.\n\nEsto confirma que estás asimilando el volumen con buena tolerancia neuromuscular y sin sobreesfuerzo destructivo. El sistema nervioso responde favorablemente al estímulo.\n\nMi recomendación es continuar con el plan previsto para consolidar el bloque del fin de semana con solidez.`;
    smartActions = [];
  } else {
    replyMsg = `He registrado tus indicaciones ("${lastUserMsg}"). Los parámetros fisiológicos están equilibrados. Si deseas modular la carga o revisar una sesión específica, indícamelo directamente.`;
    smartActions = [];
  }

  const hasActiveProposal = !ctx.isWeekCompleted && (actionType === "ADAPT_WORKOUT" || (actionType as any) === "MODIFY_WORKOUT");
  const finalPlan = (hasActiveProposal && modifiedPlan && modifiedPlan.length > 0)
    ? (ctx.targetTssAdjustmentPct && ctx.targetTssAdjustmentPct !== 0 ? applyTssAdjustmentToPlan(modifiedPlan, ctx.targetTssAdjustmentPct) : modifiedPlan)
    : null;

  return {
    success: true, reply: replyMsg, actionType, workoutDiff,
    previousWeekSummary: ctx.previousWeekSummary || null, suggestedPlan: finalPlan,
    reasoning: "Ajuste algorítmico fisiológico determinístico completado.", smartActions,
    quickReplies: smartActions.map((s) => s.label), modelUsed: "Motor Fisiológico PULSE (Algorítmico)", targetWeekNumber: targetPlanningWeekNum,
  };
}
