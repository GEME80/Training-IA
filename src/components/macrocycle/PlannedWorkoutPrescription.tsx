"use client";
import React, { useState } from "react";
import { Code2, ChevronDown, ChevronUp, Timer, Zap, Trophy } from "lucide-react";
import { WorkoutChart } from "../WorkoutChart";
import { formatPace, parsePaceToSeconds, mapPowerPctToPacePct } from "@/lib/physiology/runningWorkoutAdapter";
import { RaceDayExecutionPlan } from "./RaceDayExecutionPlan";

interface PlannedWorkoutPrescriptionProps {
  cleanDoc: string;
  discipline: string;
  workoutName?: string;
  activityType?: string;
  isRunPace: boolean;
  isRunPower: boolean;
  isBike: boolean;
  effRunFtp: number;
  effBikeFtp: number;
  thresholdPaceStr?: string;
  thresholdPaceSec?: number;
  isExecuted?: boolean;
}

export const PlannedWorkoutPrescription: React.FC<PlannedWorkoutPrescriptionProps> = ({
  cleanDoc,
  discipline,
  workoutName,
  activityType,
  isRunPace,
  isRunPower,
  isBike,
  effRunFtp,
  effBikeFtp,
  thresholdPaceStr,
  thresholdPaceSec,
  isExecuted = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(!isExecuted);

  const isStrength = discipline === "Fuerza";
  const isSwim = discipline === "Natacion";

  const isTriathlon =
    activityType === "Triatlón" ||
    activityType === "Triatlon" ||
    discipline === "Triatlón" ||
    discipline === "Triatlon" ||
    /triatl|ironman|70\.3|140\.6/i.test(workoutName || "") ||
    /triatl|ironman|70\.3|140\.6/i.test(cleanDoc) ||
    /sector 1:\s*nataci/i.test(cleanDoc);

  const isRacePacing =
    isTriathlon ||
    /pacing plan|competición oficial|protocolo pre-carrera|protocolo pre-prueba/i.test(cleanDoc) ||
    /competición|carrera oficial|gran fondo|prueba ciclista/i.test(workoutName || "");

  const sectionTitle = isStrength
    ? "Prescripción de la Sesión de Fuerza"
    : isTriathlon
    ? "Estrategia Multisport Oficial (3 Sectores + T1/T2)"
    : isRacePacing && (isBike || discipline === "Ciclismo")
    ? "Pacing Plan Oficial de Ciclismo"
    : isRacePacing && isRunPower
    ? "Pacing Plan Oficial a Potencia (Stryd CP)"
    : isRacePacing && isRunPace
    ? "Pacing Plan Oficial a Ritmo"
    : isRunPace
    ? "Prescripción Estructurada (Ritmo)"
    : isRunPower
    ? "Prescripción Estructurada (Stryd CP)"
    : isBike
    ? "Prescripción Estructurada (Bici FTP)"
    : isSwim
    ? "Prescripción Estructurada (Ritmo CSS)"
    : "Prescripción Estructurada";

  const showWattBadge = !isRacePacing && ((isRunPower && effRunFtp > 0) || (isBike && effBikeFtp > 0));
  const effectiveFtp = isRunPower ? effRunFtp : isBike ? effBikeFtp : 0;
  const ftpLabel = isRunPower ? "Stryd CP" : "FTP";
  const effPaceStr = thresholdPaceStr || (thresholdPaceSec ? `${Math.floor(thresholdPaceSec / 60)}:${String(Math.round(thresholdPaceSec % 60)).padStart(2, "0")}` : "4:45");

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
      {isExecuted ? (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-sky-500" />
            <span>Prescripción Original del Plan {isExpanded ? "(Hacer más pequeña)" : "(Expandir para comparar)"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>{isExpanded ? "Ocultar" : "Ver prescripción"}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        </button>
      ) : null}

      {isExpanded && (
        <div className="space-y-3 animate-fadeIn">
          {!isTriathlon && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {discipline === "Fuerza" ? "Estructura del Circuito de Fuerza:" : "Perfil de Intervalos y Zonas:"}
              </span>
              <WorkoutChart
                workoutDoc={cleanDoc}
                discipline={discipline}
                athleteFtp={isRunPace ? undefined : (discipline === "Carrera" ? effRunFtp : discipline === "Ciclismo" ? effBikeFtp : undefined)}
              />
            </div>
          )}

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                {isRacePacing ? <Trophy className="h-3.5 w-3.5 text-amber-500" /> : <Code2 className="h-3.5 w-3.5 text-sky-500" />}
                {sectionTitle}:
              </span>
              {!isRacePacing && isRunPace ? (
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                  <Timer className="h-3 w-3 text-emerald-500" />
                  Calculado a tu Ritmo Umbral ({effPaceStr}/km)
                </span>
              ) : showWattBadge ? (
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" />
                  Calculado a tu {ftpLabel} ({effectiveFtp}W)
                </span>
              ) : null}
            </div>

            {isRacePacing ? (
              <RaceDayExecutionPlan
                cleanDoc={cleanDoc}
                discipline={discipline}
                workoutName={workoutName}
                activityType={activityType}
                isRunPace={isRunPace}
                isRunPower={isRunPower}
                isBike={isBike}
                effRunFtp={effRunFtp}
                effBikeFtp={effBikeFtp}
                thresholdPaceSec={thresholdPaceSec}
              />
            ) : (
              <pre className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                {cleanDoc.split("\n").map((line) => {
                  if (effectiveFtp > 0 && /%\s*(?:stryd\s*)?(?:ftp|cp)/i.test(line)) {
                    return line.replace(/(\d+)(?:\s*-\s*(\d+))?\s*%\s*(?:stryd\s*)?(?:ftp|cp)(?:\s*\(\d+(?:\s*-\s*\d+)?\s*[wW]\))?/gi, (_, p1, p2) => {
                      const n1 = parseInt(p1, 10);
                      const w1 = Math.round((effectiveFtp * n1) / 100);
                      if (p2) {
                        const n2 = parseInt(p2, 10);
                        const w2 = Math.round((effectiveFtp * n2) / 100);
                        return `${n1}-${n2}% ${ftpLabel} (${w1}-${w2}W)`;
                      }
                      return `${n1}% ${ftpLabel} (${w1}W)`;
                    });
                  }
                  if (!isRunPower && discipline === "Carrera") {
                    let baseLine = line
                      .replace(/\s*\(\d+\s*w\)/gi, "")
                      .replace(/\b\d+\s*w\b/gi, "")
                      .replace(/\s*\([~]?\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})?\/km\)/gi, "");
                    baseLine = baseLine.replace(/(\d+)(?:\s*-\s*(\d+))?\s*%\s*(?:stryd\s*)?(?:cp|ftp)/gi, (_, p1, p2) => {
                      const pace1 = mapPowerPctToPacePct(parseInt(p1, 10));
                      if (p2) return `${pace1}-${mapPowerPctToPacePct(parseInt(p2, 10))}% Pace`;
                      return `${pace1}% Pace`;
                    });

                    const tpSec = thresholdPaceSec || (thresholdPaceStr ? parsePaceToSeconds(thresholdPaceStr) : 285);
                    return baseLine.replace(/(\d+)(?:\s*-\s*(\d+))?\s*%\s*(?:Pace|pace|Ritmo)/gi, (_, p1, p2) => {
                      const n1 = parseInt(p1, 10);
                      const pace1 = formatPace(Math.round(tpSec / (n1 / 100)));
                      if (p2) {
                        const n2 = parseInt(p2, 10);
                        const pace2 = formatPace(Math.round(tpSec / (n2 / 100)));
                        return `${n1}-${n2}% Pace (${pace2}-${pace1}/km)`;
                      }
                      return `${n1}% Pace (~${pace1}/km)`;
                    });
                  }
                  return line;
                }).join("\n")}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
