"use client";

import React from "react";
import { Footprints, Bike, Dumbbell, Waves, Moon, ChevronRight } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap, DailyExecutedActivity } from "@/lib/intervals/types";
import { WorkoutChart, parseWorkoutDoc } from "../WorkoutChart";

interface AthleteCalendarDayColumnProps {
  dayName: string;
  dayItems: PlanItem[];
  todayStr: string;
  dailyExecutedActivities?: DailyExecutedMap;
  onSelectWorkoutModal: (item: PlanItem) => void;
}

const fmtDuration = (mins: number) =>
  mins >= 60
    ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? `${mins % 60}m` : ""}`
    : `${mins}m`;

const disciplineIcon = (discipline: string, cls = "h-3.5 w-3.5") => {
  if (discipline === "Carrera") return <Footprints className={cls} />;
  if (discipline === "Ciclismo") return <Bike className={cls} />;
  if (discipline === "Natacion" || discipline === "Natación") return <Waves className={cls} />;
  return <Dumbbell className={cls} />;
};

const activityIcon = (type: string, name = "", cls = "h-3.5 w-3.5") => {
  const t = type.toLowerCase();
  const n = name.toLowerCase();
  if (/run|carrera/.test(t) || /carrera|run/.test(n))
    return <Footprints className={`${cls} text-amber-600 dark:text-amber-400`} />;
  if (/ride|bike|ciclismo|virtualride/.test(t) || /ciclismo|bike/.test(n))
    return <Bike className={`${cls} text-sky-600 dark:text-sky-400`} />;
  if (/swim|nataci/.test(t) || /nataci|swim/.test(n))
    return <Waves className={`${cls} text-cyan-600 dark:text-cyan-400`} />;
  return <Dumbbell className={`${cls} text-purple-600 dark:text-purple-400`} />;
};

/** Extrae la duración efectiva de un item sin parsear el workoutDoc */
function resolveDisplayDuration(item: PlanItem): number {
  const fromTitle = item.workoutName.match(/\((\d+)\s*m(?:in)?\)/i);
  if (fromTitle) return parseInt(fromTitle[1], 10);
  if (item.discipline === "Fuerza")
    return item.durationMinutes && item.durationMinutes >= 15 ? item.durationMinutes : 35;
  return item.durationMinutes || 45;
}

/** Nombre limpio de la sesión sin tags de acciones */
const cleanName = (name: string) => name.replace(/\[.*?\]\s*/g, "").trim();

/**
 * Extrae una descripción muy corta (≤ 60 chars) de un workoutDoc de Fuerza.
 * Toma la primera línea no vacía que no sea un encabezado de sección (no empieza con #).
 */
function gymShortDesc(workoutDoc: string): string {
  if (!workoutDoc) return "";
  const lines = workoutDoc.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#") && !l.startsWith("---"));
  const first = lines[0] || "";
  return first.length > 60 ? first.slice(0, 57) + "…" : first;
}

export const AthleteCalendarDayColumn: React.FC<AthleteCalendarDayColumnProps> = ({
  dayName,
  dayItems,
  todayStr,
  dailyExecutedActivities,
  onSelectWorkoutModal,
}) => {
  const firstItem = dayItems[0];
  const dateStr = firstItem?.date || "";
  const isToday = dateStr === todayStr;
  const isPastDay = dateStr < todayStr;

  const executedDay = dateStr ? dailyExecutedActivities?.[dateStr] : undefined;
  const allActs: DailyExecutedActivity[] = executedDay?.activities || [];
  const usedActIds = new Set<string>();

  // Emparejamiento coordinado disciplina ↔ actividad ejecutada
  const matchedEntries = dayItems.map((item) => {
    const isRest = item.isRestDay || item.discipline === "Descanso";
    if (isRest || allActs.length === 0) return { item, matchedAct: null as DailyExecutedActivity | null, isRest };
    let match: DailyExecutedActivity | undefined;
    if (item.discipline === "Carrera")
      match = allActs.find((a) => !usedActIds.has(a.id) && (a.type === "Run" || /run|carrera|trote|trail/i.test(a.type) || /run|carrera|trote|marat|fondo/i.test(a.name)));
    else if (item.discipline === "Ciclismo")
      match = allActs.find((a) => !usedActIds.has(a.id) && (a.type === "Ride" || /ride|ciclismo|bike|virtualride|indoor/i.test(a.type)));
    else if (item.discipline === "Fuerza")
      match = allActs.find((a) => !usedActIds.has(a.id) && (a.type === "WeightTraining" || /weight|gym|fuerza|strength/i.test(a.type)));
    if (match) { usedActIds.add(match.id); return { item, matchedAct: match, isRest: false }; }
    return { item, matchedAct: null as DailyExecutedActivity | null, isRest: false };
  });

  // Segundo pase: sustitución cruzada aeróbica
  matchedEntries.forEach((entry) => {
    if (!entry.matchedAct && !entry.isRest) {
      const isAerobic = entry.item.discipline === "Carrera" || entry.item.discipline === "Ciclismo";
      if (isAerobic) {
        const unused = allActs.filter((a) => !usedActIds.has(a.id) && /run|carrera|ride|ciclismo/i.test(a.type || "")).sort((a, b) => b.tss - a.tss)[0];
        if (unused) { usedActIds.add(unused.id); entry.matchedAct = unused; }
      }
    }
  });

  const extraActivities = allActs.filter((a) => !usedActIds.has(a.id));

  return (
    <div className="space-y-1.5 flex flex-col justify-start min-h-[120px]">
      {/* Fecha */}
      <div className="text-center pb-0.5">
        {isToday ? (
          <span className="inline-block px-2 py-0.5 rounded-md bg-sky-600 text-white font-mono font-bold text-[10px] shadow-xs">
            {firstItem?.formattedDate || dateStr.slice(5)}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {firstItem?.formattedDate || dateStr.slice(5)}
          </span>
        )}
      </div>

      {/* Sesiones del día */}
      <div className="space-y-1.5 flex-1 flex flex-col">
        {matchedEntries.map(({ item, matchedAct, isRest }, idx) => {
          const plannedTss = item.tss || 0;
          const duration = resolveDisplayDuration(item);

          // ── DÍA DE DESCANSO ──
          if (isRest) {
            return (
              <div key={`rest-${idx}`} className="flex items-center justify-center rounded-xl min-h-[80px] bg-slate-50/40 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400 gap-1.5">
                <Moon className="h-3.5 w-3.5" />
                <span>Descanso</span>
              </div>
            );
          }

          // ── SESIÓN EJECUTADA (verde ✓) ──
          if (matchedAct) {
            const execTss = matchedAct.tss || 0;
            const hasExtra = matchedAct.watts || matchedAct.heartrate;
            return (
              <div
                key={`item-${idx}`}
                onClick={(e) => { e.stopPropagation(); onSelectWorkoutModal(item); }}
                className="rounded-xl border border-emerald-400 dark:border-emerald-700/80 bg-emerald-50/70 dark:bg-emerald-950/35 shadow-xs overflow-hidden flex flex-col hover:border-emerald-500 hover:shadow-md transition cursor-pointer group"
              >
                {/* Header */}
                <div className="px-2 py-1 flex items-center justify-between text-xs font-bold font-mono bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 border-b border-emerald-200/90 dark:border-emerald-800/80">
                  <div className="flex items-center gap-1">
                    {activityIcon(matchedAct.type, matchedAct.name)}
                    <span>{matchedAct.movingTimeMin}m</span>
                    {matchedAct.distanceKm ? <span className="text-[9px] opacity-70">· {matchedAct.distanceKm}k</span> : null}
                  </div>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black shadow-2xs">✓</span>
                </div>
                {/* Título */}
                <div className="px-2 pt-1.5 pb-1">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight line-clamp-2">
                    {cleanName(matchedAct.name || item.workoutName)}
                  </p>
                </div>
                {/* Footer */}
                <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-mono font-bold border-t border-emerald-200/60 dark:border-emerald-800/60 pt-1 mt-auto">
                  <span className="text-emerald-800 dark:text-emerald-300">
                    {execTss > 0 ? `${execTss}/${plannedTss}` : plannedTss} TSS
                    {hasExtra ? (
                      <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">
                        {matchedAct.watts ? `· ⚡${matchedAct.watts}W` : ""}
                        {matchedAct.heartrate ? ` · ❤️${matchedAct.heartrate}` : ""}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight className="h-3 w-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          }

          // ── SESIÓN OMITIDA (rojo ✕) — día pasado sin ejecución ──
          if (isPastDay) {
            return (
              <div
                key={`item-${idx}`}
                onClick={(e) => { e.stopPropagation(); onSelectWorkoutModal(item); }}
                className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 overflow-hidden flex flex-col hover:border-rose-400 hover:shadow-sm transition cursor-pointer group opacity-80 hover:opacity-100"
              >
                {/* Header */}
                <div className="px-2 py-1 flex items-center justify-between text-xs font-bold font-mono bg-rose-100/70 dark:bg-rose-900/40 text-rose-900 dark:text-rose-300 border-b border-rose-200 dark:border-rose-800">
                  <div className="flex items-center gap-1">
                    {disciplineIcon(item.discipline)}
                    <span>{fmtDuration(duration)}</span>
                  </div>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-2xs">✕</span>
                </div>
                {/* Título */}
                <div className="px-2 pt-1.5 pb-1">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight line-clamp-2">
                    {cleanName(item.workoutName)}
                  </p>
                </div>
                {/* Footer */}
                <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-mono font-bold border-t border-rose-200/60 dark:border-rose-800/60 pt-1 mt-auto">
                  <span className="text-rose-600 dark:text-rose-400">0 / {plannedTss} TSS · ⚠ Omitida</span>
                  <ChevronRight className="h-3 w-3 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          }

          // ── SESIÓN PLANIFICADA (futura o presente) ──
          const isAerobicDisc = item.discipline === "Carrera" || item.discipline === "Ciclismo";
          const isGym = item.discipline === "Fuerza";
          const headerColors =
            item.discipline === "Carrera"
              ? "bg-[#fcf2eb] dark:bg-amber-950/40 text-[#8C564B] dark:text-amber-300 border-[#f6ddcd] dark:border-amber-900/50"
              : item.discipline === "Ciclismo"
              ? "bg-[#e8f4fd] dark:bg-sky-950/50 text-[#0863b2] dark:text-sky-300 border-[#cde6fb] dark:border-sky-900/50"
              : "bg-purple-100/80 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-purple-200/90 dark:border-purple-800/70";
          const cardColors =
            isGym
              ? "border-purple-200/90 dark:border-purple-800/80 bg-purple-50/25 dark:bg-purple-950/20 hover:border-purple-400"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400 dark:hover:border-sky-500";
          const badgeLabel = isGym ? "Gym" : "Plan";
          const gymDesc = isGym ? gymShortDesc(item.workoutDoc || "") : "";

          return (
            <div
              key={`item-${idx}`}
              onClick={(e) => { e.stopPropagation(); onSelectWorkoutModal(item); }}
              className={`rounded-xl border shadow-xs overflow-hidden flex flex-col hover:shadow-md transition cursor-pointer group ${cardColors}`}
            >
              {/* Header */}
              <div className={`px-2 py-1 flex items-center justify-between text-xs font-bold font-mono border-b ${headerColors}`}>
                <div className="flex items-center gap-1">
                  {disciplineIcon(item.discipline)}
                  <span>{fmtDuration(duration)}</span>
                </div>
                <span className="text-[9px] font-bold opacity-70">{badgeLabel}</span>
              </div>
              {/* Título */}
              <div className="px-2 pt-1.5 pb-1">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight line-clamp-2">
                  {cleanName(item.workoutName)}
                </p>
              </div>
              {/* Gráfica de intervalos — solo Carrera y Ciclismo */}
              {isAerobicDisc && item.workoutDoc && (
                <div className="px-1.5 pb-1">
                  <WorkoutChart workoutDoc={item.workoutDoc} discipline={item.discipline} />
                </div>
              )}
              {/* Descripción corta — solo Gimnasio */}
              {isGym && gymDesc && (
                <div className="px-2 pb-1">
                  <p className="text-[10px] text-purple-700 dark:text-purple-300 font-mono leading-snug line-clamp-2 opacity-80">
                    {gymDesc}
                  </p>
                </div>
              )}
              {/* Footer */}
              <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-mono font-bold border-t border-slate-100 dark:border-slate-800 pt-1 mt-auto">
                <span className="text-slate-600 dark:text-slate-400">{plannedTss} TSS</span>
                <ChevronRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}

        {/* Actividades extra no planificadas */}
        {extraActivities.map((extraAct, eIdx) => (
          <div
            key={`extra-${eIdx}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectWorkoutModal({
                id: `extra-${extraAct.id}`,
                date: dateStr,
                formattedDate: firstItem?.formattedDate || dateStr.slice(5),
                day: dayName,
                discipline:
                  extraAct.type === "WeightTraining" ? "Fuerza"
                  : extraAct.type === "Ride" || extraAct.type === "VirtualRide" ? "Ciclismo"
                  : extraAct.type === "Run" ? "Carrera"
                  : "Fuerza",
                workoutName: extraAct.name,
                durationMinutes: extraAct.movingTimeMin,
                tss: extraAct.tss,
                action: "MANTENER",
                justification: `Actividad adicional registrada en Intervals.icu (${extraAct.name}).`,
                workoutDoc: "",
              });
            }}
            className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shadow-2xs overflow-hidden flex flex-col hover:border-slate-400 hover:shadow-sm transition cursor-pointer group"
          >
            {/* Header */}
            <div className="px-2 py-1 flex items-center justify-between text-xs font-bold font-mono bg-slate-200/60 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-1">
                {activityIcon(extraAct.type, extraAct.name)}
                <span>{extraAct.movingTimeMin}m</span>
                {extraAct.distanceKm ? <span className="text-[9px] opacity-70">· {extraAct.distanceKm}k</span> : null}
              </div>
              <span className="px-1.5 rounded bg-slate-300/70 dark:bg-slate-700 text-[9px] font-bold">+ Extra</span>
            </div>
            {/* Título */}
            <div className="px-2 pt-1.5 pb-1">
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight line-clamp-1">
                {extraAct.name}
              </p>
            </div>
            {/* Footer */}
            <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-mono font-bold border-t border-slate-200/60 dark:border-slate-800 pt-1 mt-auto">
              <span className="text-slate-600 dark:text-slate-400">
                {extraAct.tss} TSS
                {extraAct.watts ? ` · ⚡${extraAct.watts}W` : ""}
                {extraAct.heartrate ? ` · ❤️${extraAct.heartrate}` : ""}
              </span>
              <ChevronRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
