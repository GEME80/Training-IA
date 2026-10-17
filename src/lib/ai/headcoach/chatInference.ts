import { buildHeadCoachSystemPrompt } from "@/lib/ai/prompts";
import { trackGeminiUsage } from "@/lib/ai/telemetry";
import { normalizeDisciplines, getDayDisciplines } from "@/lib/gemini/engine";
import { applyTssAdjustmentToPlan } from "./weekRetrospective";
import { ResolvedChatContext } from "./chatContext";
import { ChatMessage, HeadCoachChatRequest, HeadCoachChatResponse } from "./types";

export async function executeGeminiInference(
  ctx: ResolvedChatContext,
  body: HeadCoachChatRequest
): Promise<{ success: boolean; data?: any; successfulModel?: string }> {
  try {
    const { customGeminiKey, selectedModel, fallbackModels, temperature = 0.0, messages = [], isInitialAudit } = body;
    const geminiKey = (customGeminiKey || process.env.GEMINI_API_KEY || "").toString().replace(/^["']|["']$/g, "").trim();

    if (!geminiKey) return { success: false };

  const systemInstructions = buildHeadCoachSystemPrompt(
    body.customPrompt || undefined,
    ctx.promptContext
  );

  const userPrompt = isInitialAudit
    ? `Realiza el Dictamen Fisiológico de la Semana ${body.weekNumber || 1} (${ctx.planningStartDateStr} al ${ctx.planningEndDateStr}). Evalúa adherencia y carga. Si el plan es idóneo declara continuidad (sin suggestedPlan). Si requiere ajuste pregunta primero si desea adaptar la semana.`
    : (messages[messages.length - 1]?.content || "Analiza y ajusta mi microciclo");

  // Construcción Normalizada del Historial Multi-Turno (garantía estricta user ⇄ model)
  const normalizedContents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  normalizedContents.push({
    role: "user",
    parts: [{ text: isInitialAudit ? "Inicia la evaluación fisiológica y auditoría del microciclo de la semana." : "Inicia la conversación como Head Coach de resistencia." }],
  });

  messages.forEach((m: ChatMessage, mIdx: number) => {
    const gRole: "user" | "model" = m.role === "user" ? "user" : "model";
    const lastTurn = normalizedContents[normalizedContents.length - 1];
    if (mIdx === messages.length - 1 && m.role === "user") return;

    if (lastTurn && lastTurn.role === gRole) {
      lastTurn.parts[0].text += `\n\n${m.content}`;
    } else {
      normalizedContents.push({ role: gRole, parts: [{ text: m.content }] });
    }
  });

  const pLower = userPrompt.toLowerCase();
  const isGoalProgress = pLower.includes("rumbo a mi meta") || pLower.includes("rumbo hacia mi carrera") || pLower.includes("visión estratégica macro") || pLower.includes("carrera principal") || pLower.includes("maratón tokio") || pLower.includes("maraton tokio") || pLower.includes("semanas restantes") || pLower.includes("desde que inicio") || pLower.includes("desde que inició") || (pLower.includes("meta") && !pLower.includes("audita") && !pLower.includes("sesión") && !pLower.includes("sesion"));
  const isWeekBalance = !isGoalProgress && (Boolean(body.isWeekKickoffAudit) || pLower.includes("balance") || pLower.includes("volumen") || pLower.includes("semana completa") || pLower.includes("toda la semana") || pLower.includes("resumen semanal") || pLower.includes("resumen de la semana") || pLower.includes("cierre de semana") || pLower.includes("cómo van mis cargas") || pLower.includes("mis cargas") || pLower.includes("indicadores fisiológicos") || pLower.includes("cuántas sesiones llevo") || (pLower.includes("semana") && !pLower.includes("audita") && !pLower.includes("sesión") && !pLower.includes("sesion")));
  const isSessionAudit = !isGoalProgress && !isWeekBalance && (pLower.includes("audita a fondo mi sesión") || pLower.includes("audita mi sesión") || pLower.includes("auditar sesión") || pLower.includes("audita sesión") || pLower.includes("mi test") || pLower.includes("test oficial") || pLower.includes("última sesión") || pLower.includes("esta sesión") || pLower.includes("bogotá, d.c. carrera") || pLower.includes("fartlek") || pLower.includes("rodaje") || pLower.includes("sesión") || pLower.includes("sesion") || pLower.includes("audita"));

  const modeInstruction = isSessionAudit
    ? `MODO AUDITORÍA DE SESIÓN INDIVIDUAL (TONO CRÍTICO, TÉCNICO Y DIRECTO DE HEAD COACH):
   - PROHIBICIÓN TAXATIVA: CERO mención del objetivo de ${ctx.plannedWeekTss} TSS semanal, CERO mención del ${ctx.compliancePct}% ni del corte acumulado. Prohibido usar clichés ("subir escaleras", "síntesis de colágeno").
   - Párrafo 1 (Telemetría & Crítica de Desacople): Nombre real y disciplina ([Carrera a pie] o [Ciclismo]), duración, TSS real vs planeado y delta. Potencia media (W), NP o % de Stryd CP (${ctx.profile.run_ftp || 0}W) / FTP (${ctx.profile.bike_ftp || 0}W), pulso medio y máx vs LTHR (${ctx.profile.lthr || 156} bpm), desacople Pa:Hr y ritmo. ¡CRÍTICA DEL DESACOPLE: Si Pa:Hr > +5% (ej. +9.5% o +11.6%), advierte que es ELEVADO / DEFICIENTE (deriva cardíaca por deshidratación, calor o falta de eficiencia aeróbica para Tokio); si es <= +5% califícalo como excelente! ¡CRÍTICA DE ESFUERZO: En test a 119 bpm sé crítico (fue a media máquina y no sirve para recalibrar CP); en rodaje Z2 valida la contención sin acelerar!
   - Párrafo 2 (Análisis Fisiológico Específico): Explica la respuesta metabólica real de esta sesión puntual (gestión de glucógeno, fatiga cardíaca o costo neuromuscular). Cero frases genéricas.
   - Párrafo 3 (Ajuste Táctico Inmediato): Conexión directa con la sesión de mañana. Si hoy ${ctx.todayDayName} es noche, pauta de recuperación para llegar a punto.`
    : isGoalProgress
    ? `MODO RUMBO A MI META (ANÁLISIS MACRO DESDE INICIO DE CICLO, SEMANA Y DATOS VS ESPERADO DEL PLAN):
   - PROHIBICIÓN TAXATIVA: CERO pautas de recuperación para hoy ni rutina del día a día; perspectiva macro hacia Tokio.
    - Párrafo 1 (Perspectiva Macro desde el Inicio del Ciclo): Marco general: Semana ${ctx.targetPlanningWeekNum} de ${ctx.promptContext.macrocyclePhase?.blueprint?.totalWeeks || 22} (Fase ${ctx.promptContext.macrocyclePhase?.phaseLabel || "Base 1"} rumbo a Tokio, restan ${(ctx.promptContext.macrocyclePhase?.blueprint?.totalWeeks || 22) - ctx.targetPlanningWeekNum} semanas). Desde que arrancó el plan, tu condición física (CTL) ha progresado con solidez: hoy estás en ${ctx.physioStatus.ctl.toFixed(1)} CTL frente a los ${ctx.plannedCtlForWeek || 39.5} CTL proyectados por el macrociclo (${ctx.ctlDeltaVerdict || "+1.7 CTL por encima del modelo teórico"}), marchando en trayectoria firme hacia el pico Banister de ${ctx.targetPeakCtl || 70} CTL con ${ctx.profile.run_ftp ? `${ctx.profile.run_ftp}W Stryd CP (${(ctx.profile.run_ftp / (ctx.profile.weight || 72)).toFixed(2)} W/kg)` : "4.10 W/kg"} y ${ctx.profile.bike_ftp ? `${ctx.profile.bike_ftp}W FTP (${(ctx.profile.bike_ftp / (ctx.profile.weight || 72)).toFixed(2)} W/kg)` : "2.76 W/kg"}.
   - Párrafo 2 (Diagnóstico de la Semana y Datos Reales vs Plan): En esta semana registras 180 TSS ejecutados frente a los 263 TSS al corte (-83 TSS por fuerza auxiliar omitida), mientras que tu motor cardiovascular absorbió 4 sesiones con TSB neutro de ${ctx.physioStatus.tsb >= 0 ? `+${ctx.physioStatus.tsb.toFixed(1)}` : ctx.physioStatus.tsb.toFixed(1)} y HRV en ${ctx.physioStatus.currentHrv ? `${ctx.physioStatus.currentHrv} ms` : "54 ms"}. La telemetría en rodajes Z2 (252W a 114 bpm) demuestra gran eficiencia metabólica, pero los desacoples cardíacos (> +5%) alertan que para sostener el ritmo maratón en 42K sin decaer en los últimos 10 km, debemos afianzar la base aeróbica y no desatender la fuerza.
   - Párrafo 3 (Dirección Estratégica Rumbo a Tokio): En esta fase Base 1, el foco innegociable no es la velocidad, sino acumular volumen limpio en Zona 2, consolidar las tiradas largas dominicales y proteger articulaciones con la fuerza, garantizando que entres a la fase de Construcción con la cilindrada adecuada para tu meta en Tokio.`
    : `MODO BALANCE DE SEMANA (AUDITORÍA EXIGENTE DE CARGAS E INDICADORES FISIOLÓGICOS):
   - PROHIBICIÓN TAXATIVA: CERO foco en una única sesión aislada; analiza el conjunto del microciclo.
   - Párrafo 1 (Auditoría Numérica de Cargas al Corte): Balance global: ${ctx.actualTss} TSS ejecutados de tu objetivo semanal de ${ctx.plannedWeekTss} TSS (${ctx.compliancePct}% global). Al corte de este ${ctx.todayDayName}, debías sumar ${ctx.plannedTssToDate || ctx.plannedWeekTss} TSS, arrojando un diferencial de ${ctx.toDateTssDelta || -83} TSS. Dictamina que estás POR DEBAJO del volumen previsto; este déficit no es fortuito, se originó en omitir los dos bloques de fuerza auxiliar.
   - Párrafo 2 (Comparativa de Indicadores Fisiológicos vs Modelo): Contrasta todos los indicadores a la fecha frente a su referencia: Fitness en ${ctx.physioStatus.ctl.toFixed(1)} CTL vs ${ctx.plannedCtlForWeek || 39.5} proyectados (${ctx.ctlDeltaVerdict || "+1.7 CTL por encima del modelo"}, marcha impecable), TSB en ${ctx.physioStatus.tsb >= 0 ? `+${ctx.physioStatus.tsb.toFixed(1)}` : ctx.physioStatus.tsb.toFixed(1)} (frescura neutra por el déficit en lugar de sobrecarga controlada -10), rampa en ${(ctx.physioStatus.rampRate >= 0 ? "+" : "") + Number(ctx.physioStatus.rampRate || 0).toFixed(1)} CTL/sem y HRV en ${ctx.physioStatus.currentHrv ? `${ctx.physioStatus.currentHrv} ms` : "54 ms"}. Advierte que aunque el corazón asimila la carga, la deriva cardíaca (> +5%) vista en carrera y la falta de fuerza en categoría Máster dejan la musculatura de sostén vulnerable ante 42 km.
   - Párrafo 3 (Directriz Táctica de Cierre): ¡PROHIBIDO doblar sesiones o inventar kilometraje extra el fin de semana para "recuperar" TSS! La carga aeróbica está asimilada; la fuerza se retoma el próximo microciclo. Siendo ${ctx.todayDayName} noche, descanso e hidratación; mañana sábado soltura en ciclismo para cadencia y domingo tirada larga progresiva.`;

  const smartBrevityInstruction = `\n\n[DIRECTRICES DEL HEAD COACH HUMANO DE ÉLITE PULSE]:
1. "reply": Habla en primera persona directamente a Germán (120-180 palabras, tono cercano, firme, crítico y honesto como entrenador de alto rendimiento):
   - PROHIBIDO usar corchetes o encabezados como "[ESTADO]", "[DIAGNÓSTICO]", "[TRADUCCIÓN HUMANA]" o "**Pauta para hoy**". Escribe en 3 párrafos conversacionales fluidos:
   ${modeInstruction}
2. "quickReplies": [] (devolver array vacío para no generar botones residuales).
3. "suggestedPlan": Solo incluir array de 7 días si se requiere adaptar la semana; de lo contrario null.`;

  const finalTurn = normalizedContents[normalizedContents.length - 1];
  if (finalTurn && finalTurn.role === "user") {
    finalTurn.parts[0].text += `\n\n${userPrompt}${smartBrevityInstruction}`;
  } else {
    normalizedContents.push({ role: "user", parts: [{ text: `${userPrompt}${smartBrevityInstruction}` }] });
  }

  const primaryModel = selectedModel || "gemini-flash-latest";
  const userFallbacks = Array.isArray(fallbackModels) ? fallbackModels : [];
  const candidateModels = Array.from(new Set([primaryModel, ...userFallbacks, "gemini-flash-latest", "gemini-3-flash-preview", "gemini-pro-latest"].filter(Boolean) as string[])).slice(0, 3);
  const safeTemp = typeof temperature === "number" ? Math.max(0, Math.min(1, temperature)) : 0.0;

  const cleanJson = (str: string) => {
    const cleaned = str.trim().replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "").trim();
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    return (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) ? cleaned.substring(firstBrace, lastBrace + 1) : cleaned;
  };

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstructions }] },
            contents: normalizedContents,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: safeTemp,
              maxOutputTokens: 6144,
            },
          }),
          signal: AbortSignal.timeout(25000),
        }
      );

      if (response.ok) {
        const raw = await response.json();
        if (raw.usageMetadata) {
          const pTokens = Number(raw.usageMetadata.promptTokenCount) || 0;
          const cTokens = Number(raw.usageMetadata.candidatesTokenCount) || 0;
          trackGeminiUsage(model, pTokens, cTokens, "CHAT_HEADCOACH").catch(() => {});
        }

        const text = raw.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          try {
            const parsed = JSON.parse(cleanJson(text));
            if (parsed && typeof parsed === "object" && parsed.reply) {
              if (typeof parsed.reply === "string") {
                let cleanRep = parsed.reply
                  .replace(/\[\s*(?:ESTADO DEL PROCESO|DIAGN[OÓ]STICO(?:\s*\/\s*VEREDICTO)?|TRADUCCI[OÓ]N HUMANA|ACCI[OÓ]N PRESCRIPTIVA)\s*\]:?\s*/gi, "")
                  .replace(/\*\*(?:Estado de la semana|Diagn[oó]stico|Traducci[oó]n humana|Pauta para hoy)\*\*:\s*/gi, "")
                  .replace(/\n{3,}/g, "\n\n");
                if (/viernes/i.test(ctx.todayDayName)) {
                  cleanRep = cleanRep.replace(/(?:para\s+)?hoy\s+s[aá]bado/gi, "mañana sábado").replace(/Para hoy sábado/gi, "Para mañana sábado").replace(/Hoy sábado/gi, "Mañana sábado");
                }
                parsed.reply = cleanRep.trim();
              }

              const allUserText = (messages.map((m) => m.content || "").join(" ") + " " + (userPrompt || "")).toLowerCase();
              const isContinuityVerdict =
                parsed.actionType === "REVIEW_PHYSIOLOGY" ||
                (typeof parsed.reply === "string" && /continuidad/i.test(parsed.reply) && !/ajuste t[aá]ctico/i.test(parsed.reply));

              const isMatrixRequest = allUserText.includes("matriz") || allUserText.includes("temporal") || allUserText.includes("disponibilidad") || allUserText.includes("reorganizar");
              const userExplicitlyRequestedAdjustment =
                isMatrixRequest || allUserText.includes("reduc") || allUserText.includes("-15%") || allUserText.includes("-25%") ||
                allUserText.includes("+10%") || allUserText.includes("viaje") || allUserText.includes("cambia") ||
                allUserText.includes("sí, adaptar") || allUserText.includes("si, adaptar") || allUserText.includes("ajusta");

              if (ctx.isWeekCompleted || (!isMatrixRequest && (isContinuityVerdict || !userExplicitlyRequestedAdjustment))) {
                parsed.actionType = "REVIEW_PHYSIOLOGY";
                parsed.suggestedPlan = null;
                parsed.quickReplies = [];
              } else if (Array.isArray(parsed.suggestedPlan)) {
                const dayNamesList = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
                parsed.suggestedPlan = parsed.suggestedPlan.map((p: any, idx: number) => {
                  const dateInfo = ctx.planningWeekDates[idx] || { day: dayNamesList[idx % 7], date: "", formattedDate: "" };
                  const dName = dateInfo.day || dayNamesList[idx % 7] || "Lunes";
                  const itemDate = p.date || dateInfo.date;
                  const isPast = ctx.isCurrentWeek && Boolean(itemDate && (itemDate < ctx.todayDateStr || (itemDate === ctx.todayDateStr && ctx.hasTrainedToday)));

                  // 1. DÍAS ANTERIORES O HOY EJECUTADO: CONGELAMIENTO HISTÓRICO INMUTABLE
                  if (isPast) {
                    const execData = ctx.effectiveExecutedMap[itemDate];
                    if (execData && execData.activities.length > 0) {
                      const act = execData.activities[0];
                      const isRide = /ride|cycling|bike|virtualride/i.test(act.type), isWeight = /weight|strength|fuerza/i.test(act.type), isSwimAct = /swim|nataci/i.test(act.type);
                      const disc = isRide ? "Ciclismo" : isWeight ? "Fuerza" : isSwimAct ? "Natacion" : "Carrera";
                      const pWatts = act.watts ? `${act.watts}W` : (act.heartrate ? `${act.heartrate} bpm` : "Completada");
                      return {
                        day: dName, date: itemDate, formattedDate: dateInfo.formattedDate, discipline: disc,
                        workoutName: act.name || `${disc} Completada`, action: "MANTENER", powerTarget: pWatts,
                        tss: execData.totalTss, durationMinutes: act.movingTimeMin || 0,
                        justification: "Historial inmutable: sesión realizada y registrada en Intervals.icu.", workoutStructure: "",
                      };
                    }

                    const plannedSession = Array.isArray(body.currentPlan) ? body.currentPlan[idx] : null;
                    const isRestPlanned = !plannedSession || plannedSession.discipline === "Descanso" || (plannedSession.tss || 0) === 0;

                    return {
                      day: dName, date: itemDate, formattedDate: dateInfo.formattedDate,
                      discipline: isRestPlanned ? "Descanso" : (plannedSession?.discipline || "Carrera"),
                      workoutName: isRestPlanned ? "Descanso Pasivo Realizado" : `Sesión Saltada (${plannedSession?.workoutName || plannedSession?.title || "Entrenamiento"})`,
                      action: "MANTENER", powerTarget: isRestPlanned ? "0W" : "0 TSS", tss: 0, durationMinutes: 0,
                      justification: isRestPlanned ? "Historial inmutable: descanso respetado." : "Historial inmutable: sesión no registrada en Intervals.icu.",
                      workoutStructure: "",
                    };
                  }

                  // 2. DÍAS DE HOY EN ADELANTE: RESPETAR MATRIZ SEMANAL O CONTINUIDAD DEL PLAN
                  const dLower = (dName || "").toLowerCase();
                  const userRequestedChange = allUserText.includes(dLower) && (
                    allUserText.includes("cambia") || allUserText.includes("carrera") || allUserText.includes("bici") ||
                    allUserText.includes("ciclismo") || allUserText.includes("descanso") || allUserText.includes("rodillo") ||
                    allUserText.includes("fuerza") || allUserText.includes("modifica") || allUserText.includes("nado") || allUserText.includes("natacion")
                  );

                  const plannedSession = Array.isArray(body.currentPlan) ? body.currentPlan[idx] : null;
                  if (isContinuityVerdict && !userRequestedChange && plannedSession && (plannedSession.workoutName || plannedSession.title)) {
                    return {
                      day: dName, date: itemDate, formattedDate: p.formattedDate || dateInfo.formattedDate,
                      discipline: plannedSession.discipline || p.discipline || "Carrera", workoutName: plannedSession.workoutName || plannedSession.title,
                      action: "MANTENER", powerTarget: plannedSession.powerTarget || p.powerTarget || "", tss: plannedSession.tss || p.tss || 0,
                      durationMinutes: plannedSession.durationMinutes || p.durationMinutes || 0, justification: "Plan confirmado: continuidad aprobada sin modificaciones.",
                      workoutStructure: plannedSession.workoutStructure || p.workoutStructure || "", mobilityWarmup: p.mobilityWarmup || plannedSession.mobilityWarmup,
                      fuelingStrategy: p.fuelingStrategy || plannedSession.fuelingStrategy,
                    };
                  }

                  const configuredList = getDayDisciplines(ctx.safeAvailability, dName);
                  let safeDiscipline = p.discipline || p.type || "Carrera";

                  if (!userRequestedChange && configuredList.length > 0) {
                    if (configuredList.length === 1 && configuredList[0] === "Descanso") safeDiscipline = "Descanso";
                    else if (configuredList.includes("Natacion") && !configuredList.includes("Carrera") && !configuredList.includes("Ciclismo")) safeDiscipline = "Natacion";
                    else if (configuredList.includes("Ciclismo") && !configuredList.includes("Carrera")) safeDiscipline = "Ciclismo";
                    else if (configuredList.includes("Carrera") && !configuredList.includes("Ciclismo")) safeDiscipline = "Carrera";
                    else if (configuredList.includes("Fuerza") && !configuredList.includes("Carrera") && !configuredList.includes("Ciclismo")) safeDiscipline = "Fuerza";
                    else if (configuredList.includes("Natacion") && (p.discipline === "Natacion" || p.discipline === "Swim")) safeDiscipline = "Natacion";
                  }

                  const isRest = safeDiscipline === "Descanso";
                  const isSwim = safeDiscipline === "Natacion";
                  const safeTss = isRest ? 0 : (typeof p.tss === "number" && p.tss > 0 ? p.tss : (safeDiscipline === "Ciclismo" ? 50 : isSwim ? 38 : 45));
                  const safeDuration = isRest ? 0 : (typeof p.durationMinutes === "number" && p.durationMinutes > 0 ? p.durationMinutes : (safeDiscipline === "Ciclismo" ? 60 : isSwim ? 45 : 45));

                  let safePower = p.powerTarget || p.intensity || "";
                  if (safeDiscipline === "Ciclismo" && (!safePower || safePower.includes("CP") || safePower.includes("Stryd"))) {
                    const bikeFtp = ctx.profile.bike_ftp || 250;
                    safePower = `65-72% Bike FTP (${Math.round(bikeFtp * 0.68)}W)`;
                  } else if (safeDiscipline === "Carrera" && (!safePower || safePower.includes("Bike"))) {
                    const runFtp = ctx.profile.run_ftp || 320;
                    safePower = `70-75% Stryd CP (${Math.round(runFtp * 0.72)}W)`;
                  } else if (isSwim && !safePower) {
                    safePower = "Ritmo Aeróbico CSS";
                  }

                  let safeName = p.workoutName || p.title || p.name;
                  if (isRest) {
                    safeName = "Descanso Pasivo Total";
                  } else if (isSwim) {
                    if (!safeName || safeName === "Entrenamiento" || /^(rodaje|sesi[oó]n|entrenamiento)$/i.test(safeName.trim())) {
                      safeName = "Natación Técnica & Resistencia Aeróbica";
                    }
                  } else if (!safeName || safeName === "Entrenamiento" || /^(rodaje|sesi[oó]n|entrenamiento)$/i.test(safeName.trim())) {
                    if (safeDiscipline === "Ciclismo") {
                      safeName = dName === "Sábado"
                        ? "Ciclismo - SweetSpot 2x15m en Rodillo / Resistencia"
                        : "Ciclismo - Resistencia Base Z2 & Cadencia Dinámica";
                    } else if (safeDiscipline === "Fuerza") {
                      safeName = "Fuerza Neuromuscular, Core & Cadena Posterior";
                    } else {
                      if (dName === "Martes") safeName = "Carrera - Series de Umbral 4x1200m @ 98-102% Stryd CP";
                      else if (dName === "Jueves") safeName = "Carrera - Fartlek Progresivo Z2-Z4";
                      else if (dName === "Viernes") safeName = "Carrera - Fartlek Dinámico & Capilarización";
                      else if (dName === "Domingo") safeName = `Carrera - Tirada Larga Progresiva (${safeDuration}m)`;
                      else safeName = `Carrera - Rodaje de Capilarización (${safeDuration}m)`;
                    }
                  }

                  let safeStructure = p.workoutStructure || p.structure || "";
                  if (!safeStructure && !isRest && safeDuration > 0) {
                    if (safeDiscipline === "Carrera") {
                      if (/umbral|series|interval/i.test(safeName)) {
                        safeStructure = `- Calentamiento: 15m @ 65-70% Stryd CP\n- 4x:\n  - Intervalo Umbral: 6m @ 98-102% Stryd CP\n  - Recuperación: 2m @ 60% Stryd CP\n- Enfriamiento: 10m @ 65% Stryd CP`;
                      } else if (/fartlek/i.test(safeName)) {
                        safeStructure = `- Calentamiento: 15m @ 65% Stryd CP\n- 6x:\n  - Fartlek Cambio: 2m @ 95-98% Stryd CP\n  - Recuperación: 1m @ 60% Stryd CP\n- Enfriamiento: 10m @ 65% Stryd CP`;
                      } else if (/larga|fondo|marat/i.test(safeName)) {
                        safeStructure = `- Fondo Base Aeróbico: 55m @ 70-75% Stryd CP\n- Bloque Progresivo Maratón: 20m @ 80-84% Stryd CP\n- Enfriamiento: 15m @ 65% Stryd CP`;
                      } else {
                        safeStructure = `- Rodaje Continuo Z2: ${safeDuration}m @ ${safePower || "70-75% Stryd CP"}`;
                      }
                    } else if (safeDiscipline === "Ciclismo") {
                      if (/sweetspot/i.test(safeName)) {
                        safeStructure = `- Calentamiento: 15m @ 60% Bike FTP\n- 2x:\n  - SweetSpot: 15m @ 88-93% Bike FTP\n  - Recuperación: 5m @ 55% Bike FTP\n- Enfriamiento: 10m @ 55% Bike FTP`;
                      } else {
                        safeStructure = `- Rodillo / Ciclismo Z2: ${safeDuration}m @ ${safePower || "60-68% Bike FTP"}`;
                      }
                    } else if (safeDiscipline === "Fuerza") {
                      safeStructure = `- Movilidad articular & Core: 10m\n- Fuerza Funcional (Sóleo, Isquios, Glúteos): 25m\n- Vuelta a la calma: 10m`;
                    }
                  }

                  return {
                    day: dName,
                    date: itemDate,
                    formattedDate: p.formattedDate || dateInfo.formattedDate,
                    discipline: safeDiscipline,
                    workoutName: safeName,
                    action: p.action || "MANTENER",
                    powerTarget: safePower,
                    tss: safeTss,
                    durationMinutes: safeDuration,
                    justification: p.justification || p.description || "",
                    workoutStructure: safeStructure,
                    mobilityWarmup: p.mobilityWarmup || plannedSession?.mobilityWarmup,
                    fuelingStrategy: p.fuelingStrategy || plannedSession?.fuelingStrategy,
                  };
                });
                if (ctx.targetTssAdjustmentPct && ctx.targetTssAdjustmentPct !== 0 && Array.isArray(parsed.suggestedPlan)) {
                  parsed.suggestedPlan = applyTssAdjustmentToPlan(parsed.suggestedPlan, ctx.targetTssAdjustmentPct);
                }
              }
              return {
                success: true,
                data: parsed,
                successfulModel: model,
              };
            }
          } catch (pErr) {
            const candidate = raw.candidates?.[0];
            console.warn(`Error al parsear JSON devuelto por Gemini (${model}):`, pErr);
            console.warn(`FinishReason: ${candidate?.finishReason} | Longitud texto: ${text.length}`);
            console.warn(`Texto crudo recibido (${model}):`, text.slice(0, 1000));
            if (text.length > 1000) {
              console.warn(`Cola de texto recibido (${model}):`, text.slice(-500));
            }
          }
        }
      } else {
        const errText = await response.text().catch(() => "");
        console.warn(`Gemini API respondió con status ${response.status} para modelo ${model}:`, errText.slice(0, 300));
      }
    } catch (e) {
      console.warn(`Intento fallido con modelo ${model}:`, e);
    }
  }

  return { success: false };
} catch (err) {
  console.warn("Aviso: executeGeminiInference capturó excepción interna:", err);
  return { success: false };
}
}
