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

  const systemInstructions = buildHeadCoachSystemPrompt(body.customPrompt || undefined, ctx.promptContext);
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
    if (lastTurn && lastTurn.role === gRole) lastTurn.parts[0].text += `\n\n${m.content}`;
    else normalizedContents.push({ role: gRole, parts: [{ text: m.content }] });
  });

  const pLower = userPrompt.toLowerCase();
  const athleteFirstName = (ctx.profile.name && ctx.profile.name !== "Atleta" ? ctx.profile.name : "").trim().split(" ")[0] || "Atleta";
  const categoryStr = (ctx.profile.age && ctx.profile.age >= 40) ? "en categoría Máster" : "";
  const macroPhase = ctx.promptContext.macrocyclePhase;
  const race = macroPhase?.primaryRace || macroPhase?.blueprint?.primaryRace;
  const isCompetitive = ctx.isCompetitiveRace;
  const raceName = isCompetitive ? (race?.name || "tu carrera principal") : ctx.cycleGoalTitle;
  const raceDist = isCompetitive ? (race?.distance || macroPhase?.blueprint?.distanceType || "tu meta") : ctx.cycleGoalTitle;
  const totalWeeks = macroPhase?.blueprint?.totalWeeks || 16, remainingWeeks = Math.max(0, totalWeeks - ctx.targetPlanningWeekNum);
  const phaseLabel = macroPhase?.phaseLabel || macroPhase?.phase || "Construcción";
  const deltaVal = ctx.toDateTssDelta !== undefined ? ctx.toDateTssDelta : (ctx.actualTss - (ctx.plannedTssToDate || ctx.plannedWeekTss));
  const deltaStr = deltaVal >= 0 ? `+${deltaVal}` : `${deltaVal}`;

  const powerProfileStr = [
    ctx.hasRunning && ctx.profile.run_ftp ? `${ctx.profile.run_ftp}W Stryd CP (${(ctx.profile.run_ftp / (ctx.profile.weight || 72)).toFixed(2)} W/kg)` : null,
    ctx.hasCycling && ctx.profile.bike_ftp ? `${ctx.profile.bike_ftp}W FTP (${(ctx.profile.bike_ftp / (ctx.profile.weight || 72)).toFixed(2)} W/kg)` : null,
  ].filter(Boolean).join(" y ") || "potencia calibrada";

  const isGoalProgress = pLower.includes("rumbo a mi meta") || pLower.includes("rumbo hacia mi carrera") || pLower.includes("visión estratégica macro") || pLower.includes("carrera principal") || pLower.includes("semanas restantes") || pLower.includes("desde que inicio") || pLower.includes("desde que inició") || (pLower.includes("meta") && !pLower.includes("audita") && !pLower.includes("sesión") && !pLower.includes("sesion"));
  const isWeekBalance = !isGoalProgress && (Boolean(body.isWeekKickoffAudit) || pLower.includes("balance") || pLower.includes("volumen") || pLower.includes("semana completa") || pLower.includes("toda la semana") || pLower.includes("resumen semanal") || pLower.includes("resumen de la semana") || pLower.includes("cierre de semana") || pLower.includes("cómo van mis cargas") || pLower.includes("mis cargas") || pLower.includes("indicadores fisiológicos") || pLower.includes("cuántas sesiones llevo") || (pLower.includes("semana") && !pLower.includes("audita") && !pLower.includes("sesión") && !pLower.includes("sesion") && !pLower.includes("matriz") && !pLower.includes("disponibilidad")));
  const isSessionAudit = !isGoalProgress && !isWeekBalance && (pLower.includes("audita a fondo mi sesión") || pLower.includes("audita mi sesión") || pLower.includes("auditar sesión") || pLower.includes("audita sesión") || pLower.includes("mi test") || pLower.includes("test oficial") || pLower.includes("última sesión") || pLower.includes("esta sesión") || pLower.includes("fartlek") || pLower.includes("rodaje") || pLower.includes("sesión") || pLower.includes("sesion") || pLower.includes("audita"));
  const isMatrixAdjustment = !isSessionAudit && !isGoalProgress && (pLower.includes("matriz") || pLower.includes("disponibilidad") || pLower.includes("reorganizar") || pLower.includes("temporal") || Boolean(body.temporaryAvailability));

  const modeInstruction = isSessionAudit
    ? `MODO AUDITORÍA DE SESIÓN INDIVIDUAL (TONO CRÍTICO, TÉCNICO Y DIRECTO DE HEAD COACH):
   - PROHIBICIÓN TAXATIVA: CERO mención del objetivo de ${ctx.plannedWeekTss} TSS semanal, CERO mención del ${ctx.compliancePct}% ni del corte acumulado. Prohibido usar clichés ("subir escaleras", "síntesis de colágeno").
   - Párrafo 1 (Telemetría & Crítica de Desacople): Nombre real y disciplina (${ctx.disciplinesSummary || "[Carrera a pie]"}), duración, TSS real vs planeado y delta. Potencia media (W), NP o % de ${powerProfileStr}, pulso medio y máx vs LTHR (${ctx.profile.lthr || 156} bpm), desacople Pa:Hr y ritmo. ¡CRÍTICA DEL DESACOPLE: Si Pa:Hr > +5% (ej. +9.5% o +11.6%), advierte que es ELEVADO / DEFICIENTE (deriva cardíaca por deshidratación, calor o falta de eficiencia aeróbica para ${raceName}); si es <= +5% califícalo como excelente! ¡CRÍTICA DE ESFUERZO: En test a pulso bajo sé crítico (se corrió a media máquina); en rodaje Z2 valida la contención sin acelerar!
   - Párrafo 2 (Análisis Fisiológico Específico): Explica la respuesta metabólica real de esta sesión puntual (gestión de glucógeno, fatiga cardíaca o costo neuromuscular). Cero frases genéricas.
   - Párrafo 3 (Ajuste Táctico Inmediato): Conexión directa con la sesión de mañana. Si hoy ${ctx.todayDayName} es noche, pauta de recuperación para llegar a punto.`
    : isGoalProgress
    ? (isCompetitive
      ? `MODO RUMBO A MI META (ANÁLISIS MACRO COMPETITIVO HACIA ${raceName}):
   - PROHIBICIÓN TAXATIVA: CERO pautas de recuperación para hoy ni rutina del día a día; perspectiva macro hacia ${raceName}.
   - Párrafo 1 (Perspectiva Macro): Semana ${ctx.targetPlanningWeekNum} de ${totalWeeks} (Fase ${phaseLabel} rumbo a ${raceName}, restan ${remainingWeeks} sem). Fitness: ${ctx.physioStatus.ctl.toFixed(1)} CTL vs ${ctx.plannedCtlForWeek || ctx.physioStatus.ctl.toFixed(1)} proyectados (${ctx.ctlDeltaVerdict || "en trayectoria"}), hacia pico Banister ${ctx.targetPeakCtl || 70} CTL con ${powerProfileStr}.
   - Párrafo 2 (Diagnóstico Semanal): Sumas ${ctx.actualTss} TSS de ${ctx.plannedTssToDate || ctx.plannedWeekTss} al corte (${deltaStr} delta), TSB ${ctx.physioStatus.tsb >= 0 ? `+${ctx.physioStatus.tsb.toFixed(1)}` : ctx.physioStatus.tsb.toFixed(1)}, HRV ${ctx.physioStatus.currentHrv ? `${ctx.physioStatus.currentHrv} ms` : "estable"}. Analiza asimilación aeróbica para sostener ritmo en ${raceDist}.
   - Párrafo 3 (Dirección Estratégica): En ${phaseLabel}, foco en estímulo target (${raceDist}), volumen Zona 2 y fuerza${categoryStr ? ` (${categoryStr})` : ""}.`
      : `MODO RUMBO A MI META (PLAN DE SALUD Y MANTENIMIENTO: ${raceName}):
   - PROHIBICIÓN TAXATIVA: CERO mención de 10k, carreras ni ritmos de competición. El atleta entrena por salud y mantenimiento (${raceName}).
   - Párrafo 1 (Perspectiva Macro de Salud y Base): Semana ${ctx.targetPlanningWeekNum} de ${totalWeeks} (Fase ${phaseLabel}: ${raceName}). Fitness: ${ctx.physioStatus.ctl.toFixed(1)} CTL vs ${ctx.plannedCtlForWeek || ctx.physioStatus.ctl.toFixed(1)} proyectados (${ctx.ctlDeltaVerdict || "en trayectoria"}), consolidando base aeróbica y longevidad con ${powerProfileStr}.
   - Párrafo 2 (Diagnóstico Semanal de Carga): Sumas ${ctx.actualTss} TSS ejecutados de ${ctx.plannedTssToDate || ctx.plannedWeekTss} al corte (${deltaStr} delta), TSB ${ctx.physioStatus.tsb >= 0 ? `+${ctx.physioStatus.tsb.toFixed(1)}` : ctx.physioStatus.tsb.toFixed(1)}, HRV ${ctx.physioStatus.currentHrv ? `${ctx.physioStatus.currentHrv} ms` : "estable"}. Analiza asimilación sin estrés competitivo.
   - Párrafo 3 (Dirección Estratégica): En ${phaseLabel}, foco en salud Zona 2, consistencia y fuerza${categoryStr ? ` (${categoryStr})` : ""}, garantizando bienestar físico.`)
    : isMatrixAdjustment
    ? `MODO ADAPTACIÓN POR MATRIZ TEMPORAL (REESTRUCTURACIÓN DE MICROCICLO):
   - DIRECTRIZ SUPREMA: El atleta configuró su disponibilidad temporal para esta semana. Tu "suggestedPlan" DEBE contener exactamente 7 días respetando ESTRICTAMENTE la disciplina configurada para cada día en la matriz semanal.
   - REGLA DE NO MONOTONÍA & VARIABILIDAD (INNEGOCIABLE): Si el atleta configuró múltiples días de Carrera (ej. 4 o 5 días de trote), PROHIBIDO repetir sesiones o dar puro rodaje Z2. Cada día de trote DEBE tener un estímulo metabólico DIFERENCIADO: (1) Calidad/Series Umbral 98-102% CP, (2) Base Aeróbica Z2 70-75% CP, (3) Regenerativo Z1 suave 65-70% CP (30-35m), (4) Fartlek Dinámico Z2-Z4, (5) Tirada Larga Progresiva Z2. Si un día es Fuerza, disciplina DEBE ser "Fuerza". Si es Ciclismo, "Ciclismo". Si es Descanso, "Descanso".
   - Párrafo 1 (Explicación): Explica directamente a ${athleteFirstName} cómo redistribuiste los estímulos según su matriz sin alterar la carga global.
   - Párrafo 2 (Diversificación Fisiológica): Detalla la variedad asignada (calidad, aeróbico Z2, fuerza, regeneración) para maximizar adaptación sin sobrecarga osteoarticular.
   - Párrafo 3 (Directriz Táctica): Pauta para encarar la semana con disciplina respetando intensidades.`
    : `MODO BALANCE DE SEMANA (AUDITORÍA EXIGENTE DE CARGAS E INDICADORES FISIOLÓGICOS):
   - PROHIBICIÓN TAXATIVA: CERO foco en una sesión aislada; analiza el microciclo.${!isCompetitive ? ` Prohibido inventar carreras o 10k; el plan es de salud/mantenimiento (${raceName}).` : ""}
   - Párrafo 1 (Auditoría Numérica de Cargas al Corte): Balance global: ${ctx.actualTss} TSS ejecutados de ${ctx.plannedWeekTss} TSS (${ctx.compliancePct}% global). Al corte de este ${ctx.todayDayName}, debías sumar ${ctx.plannedTssToDate || ctx.plannedWeekTss} TSS, arrojando un diferencial de ${deltaStr} TSS. Dictamina si el volumen va en línea con el microciclo o si hay déficit.
   - Párrafo 2 (Comparativa de Indicadores Fisiológicos vs Modelo): Contrasta indicadores frente a referencia: Fitness en ${ctx.physioStatus.ctl.toFixed(1)} CTL vs ${ctx.plannedCtlForWeek || ctx.physioStatus.ctl.toFixed(1)} proyectados (${ctx.ctlDeltaVerdict || "acorde al modelo"}), TSB en ${ctx.physioStatus.tsb >= 0 ? `+${ctx.physioStatus.tsb.toFixed(1)}` : ctx.physioStatus.tsb.toFixed(1)}, rampa en ${(ctx.physioStatus.rampRate >= 0 ? "+" : "") + Number(ctx.physioStatus.rampRate || 0).toFixed(1)} CTL/sem y HRV en ${ctx.physioStatus.currentHrv ? `${ctx.physioStatus.currentHrv} ms` : "estable"}. Evalúa asimilación muscular y de sostén de cara a ${raceName}.
   - Párrafo 3 (Directriz Táctica de Cierre): ¡PROHIBIDO doblar sesiones o inventar kilometraje extra para "recuperar" TSS! La carga debe asimilarse progresivamente. Siendo ${ctx.todayDayName}, define la pauta de descanso o sesiones restantes.`;

  const smartBrevityInstruction = `\n\n[DIRECTRICES DEL HEAD COACH HUMANO DE ÉLITE PULSE]:
1. "reply": Habla en primera persona directamente a ${athleteFirstName} (120-180 palabras, tono cercano, firme, crítico y honesto como entrenador de alto rendimiento):
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
              const isTimeCompression = allUserText.includes("poco tiempo") || allUserText.includes("comprime") || allUserText.includes("tiempo limitado") || allUserText.includes("express") || allUserText.includes("-20%") || allUserText.includes("-30%");
              const userExplicitlyRequestedAdjustment =
                isMatrixRequest || isTimeCompression || allUserText.includes("reduc") || allUserText.includes("-15%") || allUserText.includes("-25%") ||
                allUserText.includes("+10%") || allUserText.includes("viaje") || allUserText.includes("cambia") ||
                allUserText.includes("sí, adaptar") || allUserText.includes("si, adaptar") || allUserText.includes("ajusta") ||
                allUserText.includes("intercambi") || allUserText.includes("sustitu") || allUserText.includes("enferm") ||
                allUserText.includes("retorno") || allUserText.includes("rodillo") || allUserText.includes("salté") || allUserText.includes("salte");

              if (ctx.isWeekCompleted || (!isMatrixRequest && !isTimeCompression && (isContinuityVerdict || !userExplicitlyRequestedAdjustment))) {
                parsed.actionType = "REVIEW_PHYSIOLOGY";
                parsed.suggestedPlan = null;
                parsed.quickReplies = [];
              } else if (Array.isArray(parsed.suggestedPlan)) {
                const CANONICAL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
                const RUN_ARCHETYPES = [
                  { name: "Carrera - Series de Umbral 4x1200m @ 98-102% Stryd CP", power: "98-102% Stryd CP", tss: 58, min: 55, struct: "- Calentamiento: 15m @ 65-70% Stryd CP\n- 4x:\n  - Intervalo Umbral: 5m @ 98-102% Stryd CP\n  - Recuperación: 2m @ 60% Stryd CP\n- Enfriamiento: 10m @ 65% Stryd CP" },
                  { name: "Carrera - Base Aeróbica Z2 Constante", power: "70-75% Stryd CP", tss: 44, min: 50, struct: "- Rodaje Continuo Zona 2: 50m @ 70-75% Stryd CP (cadencia 88-92 spm)" },
                  { name: "Carrera - Fartlek Progresivo Dinámico Z2-Z4", power: "Z2-Z4 (Cambios @ 95-98% CP)", tss: 50, min: 45, struct: "- Calentamiento: 15m @ 65% Stryd CP\n- 6x:\n  - Cambio de Ritmo: 2m @ 95-98% Stryd CP\n  - Recuperación: 1m @ 60% Stryd CP\n- Enfriamiento: 10m @ 65% Stryd CP" },
                  { name: "Carrera - Rodaje Regenerativo Z1 de Descarga", power: "60-68% Stryd CP", tss: 28, min: 35, struct: "- Rodaje Regenerativo: 35m @ 60-68% Stryd CP (lavado de lactato)" },
                  { name: "Carrera - Tirada Larga Progresiva Z2", power: "72-78% Stryd CP", tss: 75, min: 75, struct: "- Fondo Base Aeróbico: 55m @ 70-74% Stryd CP\n- Bloque Progresivo: 15m @ 78-82% Stryd CP\n- Enfriamiento: 5m @ 65% Stryd CP" },
                ];

                let runCount = 0;
                const seenRunNames = new Set<string>();

                parsed.suggestedPlan = CANONICAL_DAYS.map((dName, dayIdx) => {
                  const dateInfo = ctx.planningWeekDates[dayIdx] || { day: dName, date: "", formattedDate: "" };
                  const itemDate = dateInfo.date;
                  const isPast = ctx.isCurrentWeek && Boolean(itemDate && (itemDate < ctx.todayDateStr || (itemDate === ctx.todayDateStr && ctx.hasTrainedToday && !isTimeCompression)));

                  if (isPast) {
                    const execData = ctx.effectiveExecutedMap[itemDate];
                    if (execData && execData.activities.length > 0) {
                      const act = execData.activities[0];
                      const disc = /ride|cycling|bike/i.test(act.type) ? "Ciclismo" : /weight|strength|fuerza/i.test(act.type) ? "Fuerza" : /swim|nataci/i.test(act.type) ? "Natacion" : "Carrera";
                      return {
                        day: dName, date: itemDate, formattedDate: dateInfo.formattedDate, discipline: disc,
                        workoutName: act.name || `${disc} Completada`, action: "MANTENER", powerTarget: act.watts ? `${act.watts}W` : "Completada",
                        tss: execData.totalTss, durationMinutes: act.movingTimeMin || 0, justification: "Historial inmutable: sesión realizada y registrada en Intervals.icu.", workoutStructure: "",
                      };
                    }
                    const plannedSession = Array.isArray(body.currentPlan) ? body.currentPlan.find((cp: any) => cp?.day?.toLowerCase() === dName.toLowerCase()) : null;
                    const isRestPlanned = !plannedSession || plannedSession.discipline === "Descanso" || (plannedSession.tss || 0) === 0;
                    return {
                      day: dName, date: itemDate, formattedDate: dateInfo.formattedDate, discipline: isRestPlanned ? "Descanso" : (plannedSession?.discipline || "Carrera"),
                      workoutName: isRestPlanned ? "Descanso Pasivo Realizado" : `Sesión Saltada (${plannedSession?.workoutName || "Entrenamiento"})`,
                      action: "MANTENER", powerTarget: isRestPlanned ? "0W" : "0 TSS", tss: 0, durationMinutes: 0,
                      justification: isRestPlanned ? "Historial inmutable: descanso respetado." : "Historial inmutable: sesión no registrada.", workoutStructure: "",
                    };
                  }

                  const rawProposal = (parsed.suggestedPlan as any[]).find((p: any) =>
                    p && ((p.date && p.date === itemDate) || (p.day && (p.day.toLowerCase() === dName.toLowerCase() || p.day.toLowerCase().startsWith(dName.slice(0, 3).toLowerCase()))))
                  ) || {};

                  const configuredList = getDayDisciplines(ctx.safeAvailability, dName);
                  let safeDiscipline = rawProposal.discipline || rawProposal.type;
                  if (configuredList.length === 1) {
                    safeDiscipline = configuredList[0];
                  } else if (configuredList.length > 1) {
                    const matchConfig = configuredList.find((c) => c.toLowerCase() === (safeDiscipline || "").toLowerCase());
                    if (matchConfig) safeDiscipline = matchConfig;
                    else if (/fuerza|gimnasio|pesas/i.test(rawProposal.workoutName || "") && configuredList.includes("Fuerza")) safeDiscipline = "Fuerza";
                    else if (/ciclismo|bici|rodillo/i.test(rawProposal.workoutName || "") && configuredList.includes("Ciclismo")) safeDiscipline = "Ciclismo";
                    else if (/nataci|nado|swim/i.test(rawProposal.workoutName || "") && configuredList.includes("Natacion")) safeDiscipline = "Natacion";
                    else safeDiscipline = configuredList[0];
                  } else {
                    safeDiscipline = safeDiscipline || "Descanso";
                  }

                  const isRest = safeDiscipline === "Descanso";
                  if (isRest) {
                    return {
                      day: dName, date: itemDate, formattedDate: dateInfo.formattedDate, discipline: "Descanso",
                      workoutName: "Descanso Pasivo Total", action: "MANTENER", powerTarget: "0W", tss: 0, durationMinutes: 0,
                      justification: rawProposal.justification || "Descanso programado para regeneración biológica.", workoutStructure: "",
                    };
                  }

                  let safeDuration = (typeof rawProposal.durationMinutes === "number" && rawProposal.durationMinutes > 0) ? rawProposal.durationMinutes : (safeDiscipline === "Ciclismo" ? 60 : 45);
                  let safeTss = (typeof rawProposal.tss === "number" && rawProposal.tss > 0) ? rawProposal.tss : (safeDiscipline === "Ciclismo" ? 50 : 45);
                  let safePower = rawProposal.powerTarget || "";
                  let safeName = (rawProposal.workoutName || rawProposal.title || "").trim();
                  let safeStructure = rawProposal.workoutStructure || "";

                  if (safeDiscipline === "Carrera") {
                    const isLongDay = dName === "Domingo" || dName === "Sábado";
                    const isRepetitive = !safeName || /^(carrera|rodaje|sesi[oó]n|entrenamiento|rodaje z2|rodaje continuo)$/i.test(safeName) || seenRunNames.has(safeName.toLowerCase());
                    if (isRepetitive) {
                      const arch = isLongDay ? RUN_ARCHETYPES[4] : RUN_ARCHETYPES[runCount % (RUN_ARCHETYPES.length - 1)];
                      safeName = arch.name;
                      safePower = safePower || arch.power;
                      safeDuration = safeDuration || arch.min;
                      safeTss = safeTss || arch.tss;
                      safeStructure = safeStructure || arch.struct;
                    }
                    runCount++;
                    seenRunNames.add(safeName.toLowerCase());
                    const runFtp = ctx.profile.run_ftp || 320;
                    if (!safePower || safePower.includes("Bike")) safePower = `70-75% Stryd CP (${Math.round(runFtp * 0.72)}W)`;
                    if (!safeStructure) safeStructure = `- Rodaje Continuo Z2: ${safeDuration}m @ ${safePower}`;
                  } else if (safeDiscipline === "Ciclismo") {
                    const bikeFtp = ctx.profile.bike_ftp || 250;
                    if (!safePower || safePower.includes("CP")) safePower = `65-72% Bike FTP (${Math.round(bikeFtp * 0.68)}W)`;
                    if (!safeName || /ciclismo|rodaje|sesion/i.test(safeName)) safeName = dName === "Sábado" ? "Ciclismo - SweetSpot 2x15m en Rodillo / Resistencia" : "Ciclismo - Resistencia Base Z2 & Cadencia Dinámica";
                    if (!safeStructure) safeStructure = `- Rodillo / Ciclismo Z2: ${safeDuration}m @ ${safePower}`;
                  } else if (safeDiscipline === "Fuerza") {
                    safeName = safeName || "Fuerza Neuromuscular, Core & Cadena Posterior";
                    safePower = "RPE 7-8 / Calistenia y Pesas";
                    if (!safeStructure) safeStructure = "- Movilidad articular & Core: 10m\n- Fuerza Funcional (Sóleo, Isquios, Glúteos): 25m\n- Vuelta a la calma: 10m";
                  } else if (safeDiscipline === "Natacion") {
                    safeName = safeName || "Natación Técnica & Resistencia Aeróbica";
                    safePower = safePower || "Ritmo CSS Aeróbico";
                    if (!safeStructure) safeStructure = `- Nado continuo y técnica: ${safeDuration}m @ ${safePower}`;
                  }

                  return {
                    day: dName, date: itemDate, formattedDate: rawProposal.formattedDate || dateInfo.formattedDate,
                    discipline: safeDiscipline, workoutName: safeName, action: rawProposal.action || "MANTENER",
                    powerTarget: safePower, tss: safeTss, durationMinutes: safeDuration,
                    justification: rawProposal.justification || rawProposal.description || "Sesión calibrada a tu matriz temporal.", workoutStructure: safeStructure,
                    mobilityWarmup: rawProposal.mobilityWarmup, fuelingStrategy: rawProposal.fuelingStrategy,
                  };
                });
                if (ctx.targetTssAdjustmentPct && ctx.targetTssAdjustmentPct !== 0 && Array.isArray(parsed.suggestedPlan)) {
                  parsed.suggestedPlan = applyTssAdjustmentToPlan(parsed.suggestedPlan, ctx.targetTssAdjustmentPct);
                }
              }
              return { success: true, data: parsed, successfulModel: model };
            }
          } catch (pErr) {
            console.warn(`Error al parsear JSON devuelto por Gemini (${model}):`, pErr, text.slice(0, 500));
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
