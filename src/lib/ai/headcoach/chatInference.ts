import { buildHeadCoachSystemPrompt } from "@/lib/ai/prompts";
import { trackGeminiUsage } from "@/lib/ai/telemetry";
import { normalizeDisciplines, getDayDisciplines } from "@/lib/gemini/engine";
import { applyTssAdjustmentToPlan } from "./weekRetrospective";
import { ResolvedChatContext } from "./chatContext";
import { ChatMessage, HeadCoachChatRequest, HeadCoachChatResponse } from "./types";
import { generateInitialFallbackPlan } from "./fallbackPlanGenerator";

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

              const CANONICAL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
              const canonicalTemplatePlan = generateInitialFallbackPlan(ctx, body.currentPlan || []);

              if (ctx.isWeekCompleted || (!isMatrixRequest && !isTimeCompression && (isContinuityVerdict || !userExplicitlyRequestedAdjustment))) {
                parsed.actionType = "REVIEW_PHYSIOLOGY";
                parsed.suggestedPlan = null;
                parsed.quickReplies = [];
              } else if (isMatrixRequest || isMatrixAdjustment) {
                // MODO REORGANIZACIÓN POR MATRIZ TEMPORAL:
                // La semana se nutre 100% de la librería fisiológica científica oficial (generateWeekTemplate / SSOT)
                // garantizando 0 duplicación de entrenamientos, variabilidad biológica y respeto estricto a la matriz.
                parsed.actionType = "ADAPT_WORKOUT";
                parsed.suggestedPlan = canonicalTemplatePlan;
              } else if (Array.isArray(parsed.suggestedPlan)) {
                // Ajustes no-matriz (ej. tiempo comprimido puntual hoy/mañana):
                parsed.suggestedPlan = CANONICAL_DAYS.map((dName, dayIdx) => {
                  const fallbackItem = canonicalTemplatePlan[dayIdx];
                  const itemDate = ctx.planningWeekDates[dayIdx]?.date || fallbackItem?.date;
                  const isPast = ctx.isCurrentWeek && Boolean(itemDate && (itemDate < ctx.todayDateStr || (itemDate === ctx.todayDateStr && ctx.hasTrainedToday && !isTimeCompression)));
                  if (isPast) return fallbackItem;

                  const rawProposal = (parsed.suggestedPlan as any[]).find((p: any) =>
                    p && ((p.date && p.date === itemDate) || (p.day && (p.day.toLowerCase() === dName.toLowerCase() || p.day.toLowerCase().startsWith(dName.slice(0, 3).toLowerCase()))))
                  );
                  if (!rawProposal) return fallbackItem;

                  const configuredList = getDayDisciplines(ctx.safeAvailability, dName);
                  const isRest = configuredList.length === 1 && configuredList[0] === "Descanso";
                  if (isRest) return fallbackItem;

                  return {
                    ...fallbackItem,
                    ...rawProposal,
                    day: dName,
                    date: itemDate,
                    formattedDate: ctx.planningWeekDates[dayIdx]?.formattedDate || fallbackItem.formattedDate,
                    discipline: rawProposal.discipline || fallbackItem.discipline,
                    workoutName: rawProposal.workoutName || fallbackItem.workoutName,
                    powerTarget: rawProposal.powerTarget || fallbackItem.powerTarget,
                    durationMinutes: rawProposal.durationMinutes || fallbackItem.durationMinutes,
                    tss: rawProposal.tss || fallbackItem.tss,
                    workoutStructure: rawProposal.workoutStructure || fallbackItem.workoutStructure,
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
