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
  const normalizedContents: { role: "user" | "model"; parts: { text: string }[] }[] = [
    { role: "user", parts: [{ text: isInitialAudit ? "Inicia la evaluación fisiológica y auditoría del microciclo." : "Inicia la conversación como Head Coach." }] }
  ];
  messages.forEach((m: ChatMessage, mIdx: number) => {
    const gRole: "user" | "model" = m.role === "user" ? "user" : "model", last = normalizedContents[normalizedContents.length - 1];
    if (mIdx === messages.length - 1 && m.role === "user") return;
    if (last && last.role === gRole) last.parts[0].text += `\n\n${m.content}`;
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

  const isGoalProgress = /rumbo a mi meta|rumbo hacia mi carrera|visi[oó]n estrat[eé]gica|carrera principal|semanas restantes|desde que inici/i.test(pLower) || (/meta/i.test(pLower) && !/audita|sesi[oó]n/i.test(pLower));
  const isMatrixAdjustment = !isGoalProgress && (/matriz|disponibilidad|reorganizar|temporal/i.test(pLower) || Boolean(body.temporaryAvailability));
  const isWeekBalance = !isGoalProgress && !isMatrixAdjustment && (Boolean(body.isWeekKickoffAudit) || /balance|volumen|semana completa|toda la semana|resumen semanal|cierre de semana|mis cargas|indicadores fisiol[oó]gicos|cu[aá]ntas sesiones/i.test(pLower) || (/semana/i.test(pLower) && !/audita|sesi[oó]n/i.test(pLower)));
  const isSessionAudit = !isGoalProgress && !isWeekBalance && !isMatrixAdjustment && /audita|test oficial|mi test|[uú]ltima sesi[oó]n|esta sesi[oó]n|fartlek|rodaje|sesi[oó]n/i.test(pLower);

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
   - REGLA DE NO MONOTONÍA MULTI-DEPORTE (INNEGOCIABLE PARA TODOS LOS ATLETAS):
     * Si configuró múltiples días de Ciclismo (ej. 4 o 5 días de bici): PROHIBIDO repetir rodillo o sesiones idénticas. Asigna estímulos metabólicos distintos cada día: (1) SweetSpot 2x15m 88-93% FTP, (2) Resistencia Base Z2 65-72% FTP, (3) Intervalos VO2Max 5x3m 105-115% FTP, (4) Soltura Regenerativa Z1 50-58% FTP, (5) Fondo Largo Progresivo Z2.
     * Si configuró múltiples días de Carrera (ej. 4 o 5 días de trote): PROHIBIDO dar puro rodaje Z2. Asigna estímulos metabólicos distintos: (1) Series Umbral 98-102% CP, (2) Base Aeróbica Z2, (3) Fartlek Dinámico Z2-Z4, (4) Regenerativo Z1 suave, (5) Tirada Larga Progresiva Z2.
     * Si configuró Fuerza: "Fuerza" (Neuromuscular o Funcional/Estabilidad).
     * Si configuró Natación: "Natacion" (Técnica Z2 o Intervalos Umbral CSS).
     * Si configuró Descanso: "Descanso" con 0 TSS.
   - Párrafo 1 (Explicación): Explica directamente a ${athleteFirstName} cómo redistribuiste los estímulos según su matriz sin alterar la carga global.
   - Párrafo 2 (Diversificación Fisiológica): Detalla la variedad asignada por disciplina para maximizar adaptación sin sobrecarga ni monotonía.
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

  const primaryModel = selectedModel || "gemini-flash-latest", userFallbacks = Array.isArray(fallbackModels) ? fallbackModels : [];
  const candidateModels = Array.from(new Set([primaryModel, ...userFallbacks, "gemini-flash-latest", "gemini-3-flash-preview", "gemini-pro-latest"].filter(Boolean) as string[])).slice(0, 3);
  const safeTemp = typeof temperature === "number" ? Math.max(0, Math.min(1, temperature)) : 0.0;
  const cleanJson = (s: string) => { const c = s.trim().replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "").trim(), b1 = c.indexOf("{"), b2 = c.lastIndexOf("}"); return (b1 !== -1 && b2 > b1) ? c.substring(b1, b2 + 1) : c; };

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
                let cRep = parsed.reply.replace(/\[\s*(?:ESTADO DEL PROCESO|DIAGN[OÓ]STICO|TRADUCCI[OÓ]N HUMANA|ACCI[OÓ]N PRESCRIPTIVA)\s*\]:?\s*/gi, "").replace(/\*\*(?:Estado de la semana|Diagn[oó]stico|Traducci[oó]n humana|Pauta para hoy)\*\*:\s*/gi, "").replace(/\n{3,}/g, "\n\n");
                if (/viernes/i.test(ctx.todayDayName)) cRep = cRep.replace(/(?:para\s+)?hoy\s+s[aá]bado/gi, "mañana sábado").replace(/Para hoy sábado/gi, "Para mañana sábado").replace(/Hoy sábado/gi, "Mañana sábado");
                parsed.reply = cRep.trim();
              }

              const allUserText = (messages.map((m) => m.content || "").join(" ") + " " + (userPrompt || "")).toLowerCase();
              const isContinuityVerdict = parsed.actionType === "REVIEW_PHYSIOLOGY" || (typeof parsed.reply === "string" && /continuidad/i.test(parsed.reply) && !/ajuste t[aá]ctico/i.test(parsed.reply));
              const isMatrixRequest = /matriz|temporal|disponibilidad|reorganizar/i.test(allUserText);
              const isTimeCompression = /poco tiempo|comprime|tiempo limitado|express|-20%|-30%/i.test(allUserText);
              const userExplicitlyRequestedAdjustment = isMatrixRequest || isTimeCompression || /reduc|-15%|-25%|\+10%|viaje|cambia|adaptar|ajusta|intercambi|sustitu|enferm|retorno|rodillo|salt/i.test(allUserText);

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
                const BIKE_ARCHETYPES = [
                  { name: "Ciclismo - SweetSpot 2x15m en Rodillo / Resistencia", power: "88-93% Bike FTP", tss: 62, min: 60, struct: "- Calentamiento: 15m @ 55-60% Bike FTP\n- 2x:\n  - SweetSpot: 15m @ 88-93% FTP\n  - Recuperación: 5m @ 55% FTP\n- Enfriamiento: 10m @ 50% FTP" },
                  { name: "Ciclismo - Resistencia Base Aeróbica Z2 & Cadencia Dinámica", power: "65-72% Bike FTP", tss: 48, min: 60, struct: "- Rodaje Continuo Z2: 60m @ 65-72% Bike FTP (cadencia 90-95 rpm)" },
                  { name: "Ciclismo - Intervalos VO2Max 5x3m @ Alta Potencia", power: "105-115% Bike FTP", tss: 68, min: 55, struct: "- Calentamiento: 15m @ 55-70% Bike FTP\n- 5x:\n  - Intervalo VO2Max: 3m @ 105-115% FTP\n  - Recuperación: 3m @ 50% FTP\n- Enfriamiento: 10m @ 50% FTP" },
                  { name: "Ciclismo - Soltura & Lavado Metabólico Z1 (Recuperación Activa)", power: "50-58% Bike FTP", tss: 24, min: 40, struct: "- Soltura Regenerativa Z1: 40m @ 50-58% Bike FTP (cadencia ágil >95 rpm)" },
                  { name: "Ciclismo - Fondo de Resistencia Progresiva Z2 (Tirada Larga)", power: "68-75% Bike FTP", tss: 85, min: 90, struct: "- Calentamiento: 15m @ 60% Bike FTP\n- Fondo Base Z2: 55m @ 68-72% FTP\n- Bloque Ritmo Tempo: 15m @ 78-83% FTP\n- Enfriamiento: 10m @ 55% FTP" },
                ];
                const STRENGTH_ARCHETYPES = [
                  { name: "Fuerza Neuromuscular, Core & Cadena Posterior", power: "RPE 7-8 / Calistenia y Pesas", tss: 25, min: 45, struct: "- Calentamiento articular & Core: 10m\n- Sentadilla búlgara & Peso muerto: 25m\n- Vuelta a la calma: 10m" },
                  { name: "Fuerza Funcional, Prevención de Tendones & Estabilidad", power: "RPE 6-7 / Isometría", tss: 20, min: 35, struct: "- Movilidad de cadera: 10m\n- Isometría cuádriceps & sóleo: 15m\n- Estiramientos: 10m" },
                  { name: "Movilidad Articular Dinámica & Descarga Muscular", power: "RPE 4-5 / Movilidad Fascial", tss: 12, min: 25, struct: "- Movilidad dinámica columna y caderas: 15m\n- Relajación miofascial & descarga SNC: 10m" },
                ];
                const SWIM_ARCHETYPES = [
                  { name: "Natación - Técnica, Drills & Base Aeróbica Z2", power: "Ritmo CSS Aeróbico", tss: 40, min: 50, struct: "- Calentamiento: 200m variado\n- Bloque Técnico: 4x100m Drills\n- Serie Aeróbica: 6x150m Z2\n- Enfriamiento: 100m suave" },
                  { name: "Natación - Series de Umbral & Ritmo CSS", power: "Ritmo Umbral CSS", tss: 48, min: 45, struct: "- Calentamiento: 300m progresivo\n- 6x 100m @ Ritmo CSS (rec: 20s)\n- Enfriamiento: 150m soltura" },
                  { name: "Natación - Soltura Acuática & Lavado Regenerativo", power: "Ritmo Z1 Suave", tss: 25, min: 35, struct: "- Nado continuo suave: 400m\n- Ejercicios de respiración & deslizamiento: 300m\n- Soltura: 200m estilo libre suave" },
                ];

                let runCount = 0, bikeCount = 0, strCount = 0, swCount = 0;
                const seenWorkoutNames = new Set<string>();

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
                    const isRepetitive = !safeName || /^(carrera|rodaje|sesi[oó]n|entrenamiento|rodaje z2|rodaje continuo)$/i.test(safeName) || seenWorkoutNames.has(safeName.toLowerCase());
                    if (isRepetitive) {
                      const arch = isLongDay ? RUN_ARCHETYPES[4] : RUN_ARCHETYPES[runCount % (RUN_ARCHETYPES.length - 1)];
                      safeName = arch.name;
                      safePower = safePower || arch.power;
                      safeDuration = safeDuration || arch.min;
                      safeTss = safeTss || arch.tss;
                      safeStructure = safeStructure || arch.struct;
                    }
                    runCount++;
                    seenWorkoutNames.add(safeName.toLowerCase());
                    const runFtp = ctx.profile.run_ftp || 320;
                    if (!safePower || safePower.includes("Bike")) safePower = `70-75% Stryd CP (${Math.round(runFtp * 0.72)}W)`;
                    if (!safeStructure) safeStructure = `- Rodaje Continuo Z2: ${safeDuration}m @ ${safePower}`;
                  } else if (safeDiscipline === "Ciclismo") {
                    const isLongDay = dName === "Sábado" || dName === "Domingo";
                    const isRepetitive = !safeName || /^(ciclismo|rodaje|sesi[oó]n|entrenamiento|bici|rodillo|cycling)$/i.test(safeName) || seenWorkoutNames.has(safeName.toLowerCase());
                    if (isRepetitive) {
                      const arch = isLongDay ? BIKE_ARCHETYPES[4] : BIKE_ARCHETYPES[bikeCount % (BIKE_ARCHETYPES.length - 1)];
                      safeName = arch.name;
                      safePower = safePower || arch.power;
                      safeDuration = safeDuration || arch.min;
                      safeTss = safeTss || arch.tss;
                      safeStructure = safeStructure || arch.struct;
                    }
                    bikeCount++;
                    seenWorkoutNames.add(safeName.toLowerCase());
                    const bikeFtp = ctx.profile.bike_ftp || 250;
                    if (!safePower || safePower.includes("CP")) safePower = `65-72% Bike FTP (${Math.round(bikeFtp * 0.68)}W)`;
                    if (!safeStructure) safeStructure = `- Rodillo / Ciclismo Z2: ${safeDuration}m @ ${safePower}`;
                  } else if (safeDiscipline === "Fuerza") {
                    const isRepetitive = !safeName || /^(fuerza|gimnasio|pesas|core|entrenamiento)$/i.test(safeName) || seenWorkoutNames.has(safeName.toLowerCase());
                    if (isRepetitive) {
                      const arch = STRENGTH_ARCHETYPES[strCount % STRENGTH_ARCHETYPES.length];
                      safeName = arch.name;
                      safePower = arch.power;
                      safeDuration = safeDuration || arch.min;
                      safeTss = safeTss || arch.tss;
                      safeStructure = safeStructure || arch.struct;
                    }
                    strCount++;
                    seenWorkoutNames.add(safeName.toLowerCase());
                    if (!safeStructure) safeStructure = "- Movilidad articular & Core: 10m\n- Fuerza Funcional: 25m\n- Vuelta a la calma: 10m";
                  } else if (safeDiscipline === "Natacion") {
                    const isRepetitive = !safeName || /^(nataci[oó]n|nado|swim|pileta|entrenamiento)$/i.test(safeName) || seenWorkoutNames.has(safeName.toLowerCase());
                    if (isRepetitive) {
                      const arch = SWIM_ARCHETYPES[swCount % SWIM_ARCHETYPES.length];
                      safeName = arch.name;
                      safePower = safePower || arch.power;
                      safeDuration = safeDuration || arch.min;
                      safeTss = safeTss || arch.tss;
                      safeStructure = safeStructure || arch.struct;
                    }
                    swCount++;
                    seenWorkoutNames.add(safeName.toLowerCase());
                    if (!safeStructure) safeStructure = `- Nado continuo y técnica: ${safeDuration}m @ ${safePower || "Ritmo CSS"}`;
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
