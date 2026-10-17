"use client";

import React, { useState } from "react";
import { Activity, Target, Compass, Sliders, Bike } from "lucide-react";
import { formatLocalDateToYMD } from "@/lib/dateUtils";
import { HeadCoachReorgSubMenu } from "./HeadCoachReorgSubMenu";

interface HeadCoachTacticalConsoleProps {
  onSelectAction: (prompt: string, options?: any) => void;
  onOpenTemporaryMatrix?: (targetWeekNum?: number) => void;
  completedActivities?: { id: string; name: string; date: string; type?: string; tss?: number; movingTimeMin?: number; watts?: number; heartrate?: number }[];
  calendarEvents?: any[];
  isLoading?: boolean;
  currentWeekNumber?: number;
  selectedWeekNumber?: number;
  totalWeeks?: number;
  onSelectWeek?: (weekNum: number) => void;
  currentPlan?: any[];
}

export const HeadCoachTacticalConsole: React.FC<HeadCoachTacticalConsoleProps> = ({
  onSelectAction,
  onOpenTemporaryMatrix,
  completedActivities = [],
  calendarEvents = [],
  isLoading = false,
  currentWeekNumber = 1,
  selectedWeekNumber,
  totalWeeks = 22,
  onSelectWeek,
  currentPlan = [],
}) => {
  const [reorgOpen, setReorgOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  const currWeek = currentWeekNumber;
  const nextWeek = Math.min(totalWeeks, currWeek + 1);

  const now = new Date();
  const todayIdx = (now.getDay() + 6) % 7;
  const tomorrowIdx = (todayIdx + 1) % 7;
  const CANONICAL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const todayName = CANONICAL_DAYS[todayIdx];
  const tomorrowName = CANONICAL_DAYS[tomorrowIdx];

  const todayDateStr = formatLocalDateToYMD(now);
  const tomorrowObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowDateStr = formatLocalDateToYMD(tomorrowObj);

  const findSessionForDay = (targetDayName: string, targetDateStr: string) => {
    const normTarget = targetDayName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    // 1. Buscar primero en calendarEvents de Intervals.icu si hay un evento programado para targetDateStr
    if (targetDateStr && Array.isArray(calendarEvents) && calendarEvents.length > 0) {
      const calEvts = calendarEvents.filter((evt) => {
        const evtDate = evt.start_date_local?.split("T")[0];
        return evtDate === targetDateStr && evt.category !== "NOTE";
      });
      if (calEvts.length > 0) {
        const primaryEvt = calEvts.find((e: any) => /run|carrera|trote|ride|bike|ciclismo/i.test(e.type || e.name || "")) || calEvts[0];
        const matchPlan = Array.isArray(currentPlan)
          ? currentPlan.find((p) => p.date === targetDateStr || (p.day || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === normTarget)
          : null;
        const mins = Math.round((primaryEvt.moving_time || 0) / 60) || matchPlan?.durationMinutes || 60;
        const cleanName = primaryEvt.name ? primaryEvt.name.replace(/^\[(?:PULSE AI|SGEA)\]\s*/i, "").trim() : (matchPlan?.workoutName || "Entrenamiento");
        return {
          ...(matchPlan || {}),
          id: primaryEvt.id ? String(primaryEvt.id) : matchPlan?.id,
          day: targetDayName,
          date: targetDateStr,
          formattedDate: matchPlan?.formattedDate || "",
          discipline: matchPlan?.discipline || (/ride|bike/i.test(primaryEvt.type) ? "Ciclismo" : "Carrera"),
          workoutName: cleanName,
          durationMinutes: mins,
          tss: primaryEvt.icu_training_load || matchPlan?.tss || 0,
          isRestDay: false,
        };
      }
    }

    // 2. Buscar en currentPlan
    if (!Array.isArray(currentPlan) || currentPlan.length === 0) return null;

    const matches = currentPlan.filter((p) => {
      if (targetDateStr && p.date && p.date === targetDateStr) return true;
      const pNorm = (p.day || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return pNorm === normTarget || pNorm.startsWith(normTarget.slice(0, 3));
    });

    if (matches.length === 0) return null;

    // Priorizar resistencia aeróbica (Carrera / Ciclismo / Natación) sobre descanso y fuerza
    const endurance = matches.find((p) =>
      !p.isRestDay && p.discipline !== "Descanso" && p.discipline !== "Fuerza" &&
      /run|carrera|ride|bike|ciclismo|swim|nataci/i.test(p.discipline || p.workoutName || "")
    );
    if (endurance) return endurance;

    const strength = matches.find((p) => !p.isRestDay && p.discipline === "Fuerza");
    if (strength) return strength;

    const nonRest = matches.find((p) => !p.isRestDay && p.discipline !== "Descanso");
    if (nonRest) return nonRest;

    return matches[0];
  };

  const todaySession = findSessionForDay(todayName, todayDateStr);
  const tomorrowSession = findSessionForDay(tomorrowName, tomorrowDateStr);

  const isRunToday = /run|carrera|trote|atletismo/i.test(todaySession?.discipline || todaySession?.workoutName || "");
  const isBikeToday = /bike|ride|ciclismo|rodillo|bici/i.test(todaySession?.discipline || todaySession?.workoutName || "");

  const handleAction = (prompt: string, opts?: any) => {
    if (isLoading) return;
    onSelectAction(prompt, opts);
  };

  const getDayBadge = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      return `${days[dateObj.getDay()]} ${d}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="shrink-0 space-y-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {/* PILAR 1: Balance de Semana & Volumen */}
        <button
          type="button"
          onClick={() => {
            setReorgOpen(false);
            setAuditOpen(false);
            handleAction(
              "Hola Coach, dame el balance de volumen y carga de esta semana: cuántas sesiones llevo ejecutadas vs planificadas, mi TSS acumulado y cómo asimila mi cuerpo la fatiga (TSB) para los días restantes.",
              { isWeekKickoffAudit: true, skipUserBubble: true }
            );
          }}
          disabled={isLoading}
          className="text-left rounded-2xl p-2.5 sm:p-3 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 transition-all cursor-pointer group disabled:opacity-50 shadow-2xs"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
              Balance de Semana
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
            Volumen, TSS y asimilación
          </p>
        </button>

        {/* PILAR 2: Auditar Sesión Semana */}
        <button
          type="button"
          onClick={() => {
            setReorgOpen(false);
            if (completedActivities && completedActivities.length > 0) {
              setAuditOpen((prev) => !prev);
            } else {
              setAuditOpen(false);
              handleAction(
                "Audita la planificación de esta semana: aún no he registrado actividades completadas en Intervals.icu. Analiza las sesiones programadas, qué objetivos de potencia/ritmo debo cuidar y si estoy en mis potencias target.",
                { skipUserBubble: true }
              );
            }
          }}
          disabled={isLoading}
          className={`text-left rounded-2xl p-2.5 sm:p-3 border transition-all cursor-pointer group disabled:opacity-50 shadow-2xs ${
            auditOpen
              ? "border-cyan-500/40 bg-cyan-500/15 dark:bg-cyan-950/40 ring-1 ring-cyan-400/30"
              : "border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Target className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
              Auditar Sesión Semana
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
            {completedActivities && completedActivities.length > 0
              ? `${completedActivities.length} de esta semana • Elegir día`
              : "Potencia, pulso y desacople"}
          </p>
        </button>

        {/* PILAR 3: Rumbo a mi Meta */}
        <button
          type="button"
          onClick={() => {
            setReorgOpen(false);
            setAuditOpen(false);
            handleAction(
              "Hola Coach, hazme un análisis estratégico de mi rumbo hacia mi carrera principal: revisa mis semanas restantes, mi estado de forma (CTL y Stryd CP / FTP) y explícame cómo se proyecta mi ritmo objetivo para el día de la carrera. No alteres mi microciclo ni me hables de la rutina del día a día, dame una visión estratégica macro.",
              { skipUserBubble: true }
            );
          }}
          disabled={isLoading}
          className="text-left rounded-2xl p-2.5 sm:p-3 border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 dark:bg-purple-950/20 dark:hover:bg-purple-950/30 transition-all cursor-pointer group disabled:opacity-50 shadow-2xs"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
              Rumbo a mi Meta
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
            Proyección y ritmo de carrera
          </p>
        </button>

        {/* PILAR 4: Reagendar o Adaptar */}
        <button
          type="button"
          onClick={() => {
            setAuditOpen(false);
            setReorgOpen((prev) => !prev);
          }}
          disabled={isLoading}
          className={`text-left rounded-2xl p-2.5 sm:p-3 border transition-all cursor-pointer group disabled:opacity-50 shadow-2xs ${
            reorgOpen
              ? "border-amber-500/40 bg-amber-500/15 dark:bg-amber-950/40 ring-1 ring-amber-400/30"
              : "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sliders className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
              Reagendar / Imprevisto
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
            Enfermedad, tiempo o viaje
          </p>
        </button>
      </div>

      {/* Sub-Opciones Desplegables de Auditoría de Sesiones */}
      {auditOpen && completedActivities && completedActivities.length > 0 && (
        <div className="p-2 sm:p-2.5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-500/25 flex flex-wrap items-center gap-1.5 sm:gap-2 animate-fadeIn">
          <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300 mr-1 flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>Auditar sesión:</span>
          </span>
          {completedActivities.map((act, aIdx) => {
            const isRide = /ride|bike|ciclismo/i.test(act.type || act.name || "");
            const isLatest = aIdx === completedActivities.length - 1;
            const dayBadge = getDayBadge(act.date);
            return (
              <button
                key={act.id || `${act.date}-${aIdx}`}
                type="button"
                onClick={() => {
                  setAuditOpen(false);
                  handleAction(
                    `Audita a fondo mi sesión del ${dayBadge} ("${act.name || act.type}") realizada el ${act.date}: analiza mi potencia (${act.watts ? `${act.watts}W` : "por ritmo"}), frecuencia cardíaca (${act.heartrate ? `${act.heartrate} bpm` : "no registrada"}), duración (${act.movingTimeMin || 0} min) y ${act.tss || 0} TSS. Explícame con criterio de entrenador si cumplí el objetivo, si pude haber dado más o corrido más rápido en este test/sesión, y si estuve en mis potencias target según mi Stryd CP / FTP.`,
                    { skipUserBubble: true }
                  );
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                  isLatest
                    ? "bg-cyan-500/15 border-cyan-400 text-cyan-950 dark:text-cyan-100 hover:bg-cyan-500/25"
                    : "bg-white dark:bg-slate-900 border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 hover:border-cyan-400 hover:bg-cyan-50/80 dark:hover:bg-cyan-950/40"
                }`}
              >
                {isRide ? <Bike className="h-3 w-3 text-sky-500" /> : <Activity className="h-3 w-3 text-emerald-500" />}
                <span className="font-semibold text-cyan-700 dark:text-cyan-300">{dayBadge}:</span>
                <span className="truncate max-w-[130px] sm:max-w-[160px]">{act.name || act.type}</span>
                <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-normal">
                  {act.tss ? `${act.tss} TSS` : `${act.movingTimeMin || 0}m`}
                </span>
                {isLatest && <span className="text-[10px] text-amber-500 font-black">⚡</span>}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setAuditOpen(false);
              handleAction(
                "Audita la semana completa (Lunes a Domingo): analiza todas las sesiones que he ejecutado, el cumplimiento de los entrenamientos clave y el balance de carga para cerrar el microciclo con solidez.",
                { isWeekKickoffAudit: true, skipUserBubble: true }
              );
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-cyan-300 dark:border-cyan-700 bg-white dark:bg-slate-900 text-cyan-900 dark:text-cyan-200 text-[11px] font-bold hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition cursor-pointer"
          >
            <Activity className="h-3 w-3 text-cyan-600" />
            <span>Auditar semana completa</span>
          </button>
        </div>
      )}

      {/* Sub-Opciones Desplegables de Reagendamiento */}
      {reorgOpen && (
        <HeadCoachReorgSubMenu
          currWeek={currWeek}
          nextWeek={nextWeek}
          todayName={todayName}
          isRunToday={isRunToday}
          isBikeToday={isBikeToday}
          todaySession={todaySession}
          tomorrowSession={tomorrowSession}
          hasTrainedToday={completedActivities.some((a) => a.date === new Date().toISOString().split("T")[0])}
          onClose={() => setReorgOpen(false)}
          onAction={handleAction}
          onSelectWeek={onSelectWeek}
          onOpenTemporaryMatrix={onOpenTemporaryMatrix}
        />
      )}
    </div>
  );
};
