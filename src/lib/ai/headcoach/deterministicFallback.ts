import { PlanItem } from "@/lib/gemini/engine";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { ResolvedChatContext } from "./chatContext";
import { HeadCoachChatResponse, WorkoutDiff, ChatMessage } from "./types";

export function handleDeterministicFallback(
  ctx: ResolvedChatContext,
  messages: ChatMessage[] = [],
  isInitialAudit: boolean = false,
  currentPlan: PlanItem[] = []
): HeadCoachChatResponse {
  const {
    profile,
    physioStatus,
    compliancePct,
    actualTss,
    plannedWeekTss,
    targetMinTss,
    targetMaxTss,
    formDiagnostic,
    hasExistingPlan,
    currentPlanSummary,
    availabilityFormatted,
    safeAvailability,
    targetPlanningWeekNum,
    planningWeekDates,
    isDeload,
  } = ctx;

  if (isInitialAudit) {
    const defaultWeekBlueprint = {
      weekNumber: targetPlanningWeekNum,
      phase: "SPECIFIC_MARATHON" as const,
      focusDescription: "Desarrollo de potencia aeróbica y resistencia específica",
      targetTss: Math.round((targetMinTss + targetMaxTss) / 2),
      microcycleType: isDeload ? ("RECOVERY" as const) : ("LOAD" as const),
      maxLongRunMinutes: 75,
    };

    const rawFallbackPlan = generateWeekTemplate(
      defaultWeekBlueprint as any,
      profile.run_ftp,
      profile.bike_ftp,
      safeAvailability,
      "42k" as any
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
      const dur = p.durationMinutes || (isRest ? 0 : p.discipline === "Ciclismo" ? 55 : p.discipline === "Fuerza" ? 30 : 45);
      const tssVal = p.tss || (isRest ? 0 : Math.round(dur * 0.75));
      return {
        ...p,
        date: itemDate,
        formattedDate: dateInfo.formattedDate || p.formattedDate,
        durationMinutes: dur,
        tss: tssVal,
      };
    });

    const fallbackPlannedTss = fallbackGeneratedPlan.reduce((acc, p) => acc + (p.tss || 0), 0);

    const auditText = `### 🎯 Dictamen del Microciclo • Semana ${targetPlanningWeekNum}
**Atleta:** ${profile.name || "Atleta"}${profile.age ? ` (${profile.age} años)` : ""} | **Estado TSB:** ${physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1)}

🟢 **Fortalezas & Disciplina:**
- Cumplimiento de carga acumulada: **${actualTss} TSS** (${compliancePct}% de asimilación sobre el plan).
- Fitness consolidado (CTL): **${physioStatus.ctl.toFixed(1)}** con fatiga aguda (ATL) en **${physioStatus.atl.toFixed(1)}**.
- Recuperación del sistema nervioso (HRV): **${physioStatus.currentHrv ? `${physioStatus.currentHrv} ms` : "Estable"}** (balance adecuado para asimilar calidad).

⚠️ **Puntos de Atención & Control de Carga:**
- ${physioStatus.tsb < -15 ? "Tu TSB ha caído a zona de sobrecarga. Vigila el descanso nocturno e hidratación para evitar fatiga residual." : "Ramp Rate en rango controlado. Mantén la disciplina en los ritmos y no te aceleres en los días de trote suave Z1."}
- Respetar los descansos pasivos programados es innegociable para asimilar las adaptaciones neuromusculares.

⚡ **Propuesta de Microciclo Calibrada (~${fallbackPlannedTss} TSS):**
Semana estructurada con vatios exactos a tus umbrales${profile.run_ftp ? ` (**Stryd CP ${profile.run_ftp}W**)` : ""}${profile.bike_ftp ? ` y (**Bike FTP ${profile.bike_ftp}W**)` : ""}, respetando tu disponibilidad semanal.`;

    return {
      success: true,
      reply: auditText,
      actionType: hasExistingPlan ? "REVIEW_PHYSIOLOGY" : "CREATE_PLAN",
      reasoning: "Evaluación fisiológica de rendimiento y carga completada con base en modelo Banister.",
      suggestedPlan: fallbackGeneratedPlan,
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
      quickReplies: [
        "✅ Aprobar y Sincronizar",
        "✈️ Adaptar semana por viaje / tiempo",
        "🚴 Cambiar martes a Rodillo Z2",
        "🌙 Marcar día de descanso",
        "🔍 Ver zonas de potencia",
      ],
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

  if (lowerMsg.includes("tiempo") || lowerMsg.includes("40 min") || lowerMsg.includes("reduc") || lowerMsg.includes("45 min")) {
    actionType = "ADAPT_WORKOUT";
    const targetDayIdx = modifiedPlan.findIndex((p) => p.day === "Martes" || p.dayOfWeek === "Martes") !== -1
      ? modifiedPlan.findIndex((p) => p.day === "Martes" || p.dayOfWeek === "Martes")
      : 1;
    const prevSession = modifiedPlan[targetDayIdx] || {
      day: "Martes",
      date: "",
      formattedDate: "",
      discipline: "Carrera" as const,
      workoutName: "Series VO2max 4x1000m",
      action: "MODIFICAR" as const,
      justification: "Sesión de calidad",
      durationMinutes: 60,
      tss: 65,
      activityType: "Run",
    };

    const adaptedSession: PlanItem = {
      ...prevSession,
      day: prevSession.day || "Martes",
      date: prevSession.date || "",
      formattedDate: prevSession.formattedDate || "",
      discipline: "Carrera",
      workoutName: "Carrera Condensada con Intervalos de Umbral",
      action: "MODIFICAR",
      justification: "Ajuste de tiempo",
      title: "Carrera Condensada con Intervalos de Umbral",
      durationMinutes: 40,
      tss: 45,
      focus: "Intervalos compactos de alta calidad en 40 min",
      workoutStructure: `Warmup\n- 10m 70% FTP\n\n3x\n- 6m 100% FTP\n- 2m 65% FTP\n\nCooldown\n- 6m 60% FTP`,
      workoutDoc: `Warmup\n- 10m 70% FTP\n\n3x\n- 6m 100% FTP\n- 2m 65% FTP\n\nCooldown\n- 6m 60% FTP`,
    };
    modifiedPlan[targetDayIdx] = adaptedSession;

    workoutDiff = {
      dayName: "Martes",
      dayIndex: targetDayIdx,
      changeType: "MODIFIED",
      previous: {
        title: prevSession.workoutName || prevSession.title || "Series VO2max",
        durationMinutes: prevSession.durationMinutes || 60,
        tss: prevSession.tss || 65,
        intensity: `${profile.run_ftp ?? 327}W (% CP)`,
        activityType: "Run",
      },
      proposed: {
        title: "Carrera Condensada con Intervalos de Umbral",
        durationMinutes: 40,
        tss: 45,
        intensity: `3x 6m @ 100% Stryd CP (${profile.run_ftp ?? 327}W)`,
        activityType: "Run",
        workoutStructure: adaptedSession.workoutStructure,
      },
    };

    replyMsg = `### ⚡ Adaptación de Tiempo Aplicada (Martes)
He condensado la sesión de calidad a **40 minutos exactos** manteniendo el estímulo principal con **3 series de 6 min al 100% Stryd CP (${profile.run_ftp ?? 327}W)**.

El volumen semanal se recalibra a **${plannedWeekTss - 20} TSS**, manteniendo el balance de fatiga perfecto para el resto de la semana.`;
  } else if (lowerMsg.includes("rodillo") || lowerMsg.includes("ciclismo") || lowerMsg.includes("bici") || lowerMsg.includes("molestia") || lowerMsg.includes("dolor")) {
    actionType = "ADAPT_WORKOUT";
    const targetDayIdx = 1;
    const prevSession = modifiedPlan[targetDayIdx] || {
      day: "Martes",
      date: "",
      formattedDate: "",
      discipline: "Carrera" as const,
      workoutName: "Carrera de Impacto",
      action: "MODIFICAR" as const,
      justification: "Sesión original",
      durationMinutes: 60,
      tss: 65,
      activityType: "Run",
    };

    const adaptedSession: PlanItem = {
      ...prevSession,
      day: "Martes",
      discipline: "Ciclismo",
      workoutName: "Ciclismo Z2 Rodillo (Sin Impacto Articular)",
      action: "SUSTITUIR" as any,
      justification: "Protección articular y descarga osteotendinosa",
      title: "Ciclismo Z2 Rodillo (Sin Impacto Articular)",
      durationMinutes: 50,
      tss: 42,
      focus: "Estímulo aeróbico continuo sin impacto en sóleo",
      workoutStructure: `Warmup\n- 10m 55% FTP\n\nMain\n- 35m 65% FTP\n\nCooldown\n- 5m 50% FTP`,
      workoutDoc: `Warmup\n- 10m 55% FTP\n\nMain\n- 35m 65% FTP\n\nCooldown\n- 5m 50% FTP`,
    };
    modifiedPlan[targetDayIdx] = adaptedSession;

    workoutDiff = {
      dayName: "Martes",
      dayIndex: targetDayIdx,
      changeType: "REPLACED",
      previous: {
        title: prevSession.workoutName || prevSession.title || "Carrera de Impacto",
        durationMinutes: prevSession.durationMinutes || 60,
        tss: prevSession.tss || 65,
        intensity: profile.run_ftp ? `Stryd CP (${profile.run_ftp}W)` : "Z2 Carrera",
        activityType: "Run",
      },
      proposed: {
        title: "Ciclismo Z2 Rodillo (Sin Impacto Articular)",
        durationMinutes: 50,
        tss: 42,
        intensity: profile.bike_ftp ? `65% Bike FTP (${Math.round(profile.bike_ftp * 0.65)}W)` : "65% Bike FTP",
        activityType: "Ride",
        workoutStructure: adaptedSession.workoutStructure,
      },
    };

    const bikeWattsStr = profile.bike_ftp ? ` (${Math.round(profile.bike_ftp * 0.65)}W)` : "";
    replyMsg = `### 🚴 Sustitución por Ciclismo Sin Impacto Aplicada
Para proteger la musculatura y tendones, sustituimos la carrera por **50 minutos de Ciclismo Z2 en Rodillo${bikeWattsStr}**. Mantienes el trabajo aeróbico con cero impacto osteoarticular.`;
  } else if (
    lowerMsg.includes("4 semanas") ||
    lowerMsg.includes("cuatro semanas") ||
    lowerMsg.includes("mes") ||
    lowerMsg.includes("varias semanas") ||
    lowerMsg.includes("siguientes semanas") ||
    lowerMsg.includes("próximas semanas")
  ) {
    replyMsg = `### 🧠 Fundamento Biológico de la Adaptación de Microciclos
Como tu Head Coach, mi misión es asegurar que cada sesión responda a la **biología viva de tu cuerpo** y no a predicciones estáticas.

La adaptación fisiológica opera **microciclo a microciclo**: la carga adecuada para la Semana 3 o 4 dependerá estrictamente de cómo asimile tu organismo las series y fondos de esta semana y de la siguiente (analizando tu fatiga aguda ATL, TSB y variabilidad HRV en tiempo real).

Para la visión estratégica a largo plazo disponemos del **Plan del Macrociclo**; pero aquí en la trinchera adaptativa, **nos concentramos en afinar la semana en curso o la siguiente**. Clavemos este microciclo y, con tus datos de telemetría real, modularemos la que sigue con precisión milimétrica.`;
  } else {
    replyMsg = `He registrado tus indicaciones ("${lastUserMsg}"). Los parámetros fisiológicos (CTL ${physioStatus.ctl.toFixed(1)}, TSB ${physioStatus.tsb.toFixed(1)}) están equilibrados. ¿Procedemos con la sincronización a Intervals.icu?`;
  }

  return {
    success: true,
    reply: replyMsg,
    actionType,
    workoutDiff,
    suggestedPlan: modifiedPlan,
    reasoning: "Ajuste algorítmico fisiológico determinístico completado.",
    quickReplies: [
      "✅ Aprobar y Sincronizar",
      "✈️ Adaptar por viaje / tiempo",
      "⏱️ Reducir otro día",
      "📋 Ver detalle de entrenamientos",
    ],
    modelUsed: "Motor Fisiológico PULSE (Algorítmico)",
    targetWeekNumber: targetPlanningWeekNum,
  };
}
