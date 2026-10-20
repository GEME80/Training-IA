"use client";

import React, { useState } from "react";
import { Flame, Trophy, HeartPulse, Waves, Bike, Footprints, Zap, Timer, UtensilsCrossed, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { parseRaceExecutionPlan, ParsedRacePlan, TriathlonSector, RaceSplitItem } from "@/lib/physiology/racePlanParser";

interface RaceDayExecutionPlanProps {
  cleanDoc: string;
  discipline: string;
  workoutName?: string;
  activityType?: string;
  isRunPace: boolean;
  isRunPower: boolean;
  isBike: boolean;
  effRunFtp: number;
  effBikeFtp: number;
  thresholdPaceSec?: number;
}

export const RaceDayExecutionPlan: React.FC<RaceDayExecutionPlanProps> = ({
  cleanDoc, discipline, workoutName, activityType, isRunPace, isRunPower, isBike, effRunFtp, effBikeFtp, thresholdPaceSec,
}) => {
  const plan: ParsedRacePlan = parseRaceExecutionPlan(cleanDoc, {
    discipline, workoutName, activityType, effRunFtp, effBikeFtp, thresholdPaceSec, isRunPace,
  });

  const [activeTriSector, setActiveTriSector] = useState<string>("ALL");

  if (plan.isTriathlon) {
    return (
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTriSector("ALL")}
            className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer ${
              activeTriSector === "ALL" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Vista Completa
          </button>
          {plan.triathlonSectors.map((sector) => (
            <button
              key={sector.title}
              type="button"
              onClick={() => setActiveTriSector(sector.sectorKey)}
              className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTriSector === sector.sectorKey ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {sector.sectorKey === "SWIM" && <Waves className="h-3 w-3 text-teal-400" />}
              {sector.sectorKey === "T1" && <Zap className="h-3 w-3 text-amber-400" />}
              {sector.sectorKey === "BIKE" && <Bike className="h-3 w-3 text-sky-400" />}
              {sector.sectorKey === "T2" && <Zap className="h-3 w-3 text-amber-400" />}
              {sector.sectorKey === "RUN" && <Footprints className="h-3 w-3 text-emerald-400" />}
              <span>{sector.sectorKey}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2.5">
          {plan.triathlonSectors
            .filter((s) => activeTriSector === "ALL" || activeTriSector === s.sectorKey)
            .map((sector) => <TriathlonSectorCard key={sector.title} sector={sector} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-1">
      {/* BLOQUE 1: ACTIVACIÓN PRE-CARRERA */}
      {plan.preRaceProtocol.length > 0 && (
        <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-500/5 dark:bg-amber-950/20 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Flame className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block leading-tight">
                  Bloque 1 • Activación Pre-Carrera
                </span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  Calentamiento & Puesta a Punto
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              Fuera de Cronómetro
            </span>
          </div>

          <div className="space-y-1.5 pl-1 pt-1">
            {plan.preRaceProtocol.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BLOQUE 2: PACING PLAN OFICIAL */}
      <div className="rounded-xl border-2 border-sky-300/80 dark:border-sky-800/80 bg-white dark:bg-slate-900/90 shadow-xs p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 block leading-tight">
                Bloque 2 • Pacing Plan Oficial
              </span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                {plan.sport === "Cycling" ? "Estrategia por Tramos de Vatios" : "Splits & Gestión de Esfuerzo"}
              </h4>
            </div>
          </div>
          {isRunPace ? (
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
              <Timer className="h-3 w-3 text-emerald-500" /> Ritmo Umbral
            </span>
          ) : isRunPower && effRunFtp > 0 ? (
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" /> Stryd CP ({effRunFtp}W)
            </span>
          ) : isBike && effBikeFtp > 0 ? (
            <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800/60 flex items-center gap-1">
              <Zap className="h-3 w-3 text-sky-500" /> FTP ({effBikeFtp}W)
            </span>
          ) : null}
        </div>

        <div className="space-y-1.5">
          {plan.pacingSplits.map((split, idx) => (
            <SplitRow key={idx} split={split} isCycling={plan.sport === "Cycling"} />
          ))}
        </div>

        {plan.nutritionStrategy && (
          <div className="rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 p-2.5 flex items-start gap-2.5">
            <UtensilsCrossed className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Estrategia Nutricional en Carrera:</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">{plan.nutritionStrategy}</p>
            </div>
          </div>
        )}
      </div>

      {/* BLOQUE 3: PROTOCOLO POST-META */}
      {plan.postRaceProtocol.length > 0 && (
        <div className="rounded-xl border border-teal-200/80 dark:border-teal-900/50 bg-teal-500/5 dark:bg-teal-950/20 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <HeartPulse className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 block leading-tight">
                  Bloque 3 • Protocolo Post-Meta
                </span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Recuperación Inmediata</span>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
              Detener Cronómetro
            </span>
          </div>

          <div className="space-y-1.5 pl-1 pt-1">
            {plan.postRaceProtocol.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function SplitRow({ split, isCycling }: { split: RaceSplitItem; isCycling: boolean }) {
  if (!split.distance && !split.intensity) {
    return (
      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-800">
        {split.raw}
      </div>
    );
  }

  return (
    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {split.distance && (
          <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 font-black text-xs text-slate-800 dark:text-slate-100 shrink-0">
            {split.distance}
          </span>
        )}
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
          {split.notes || split.raw}
        </span>
      </div>
      {split.intensity && (
        <span
          className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold shrink-0 border ${
            isCycling
              ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
          }`}
        >
          {split.intensity}
        </span>
      )}
    </div>
  );
}

function TriathlonSectorCard({ sector }: { sector: TriathlonSector }) {
  const isTransition = sector.sectorKey === "T1" || sector.sectorKey === "T2";

  if (isTransition) {
    return (
      <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-black text-amber-800 dark:text-amber-300">{sector.title}</span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
          Objetivo: {sector.timeLimit || "< 3 min"}
        </span>
      </div>
    );
  }

  const badgeConfig =
    sector.sectorKey === "SWIM"
      ? { icon: <Waves className="h-4 w-4 text-teal-500" />, color: "border-teal-200 dark:border-teal-800/70 bg-teal-50/40 dark:bg-teal-950/20", titleColor: "text-teal-700 dark:text-teal-300", accentBadge: "bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200" }
      : sector.sectorKey === "BIKE"
      ? { icon: <Bike className="h-4 w-4 text-sky-500" />, color: "border-sky-200 dark:border-sky-800/70 bg-sky-50/40 dark:bg-sky-950/20", titleColor: "text-sky-700 dark:text-sky-300", accentBadge: "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200" }
      : { icon: <Footprints className="h-4 w-4 text-emerald-500" />, color: "border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/40 dark:bg-emerald-950/20", titleColor: "text-emerald-700 dark:text-emerald-300", accentBadge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200" };

  return (
    <div className={`rounded-xl border ${badgeConfig.color} p-3 space-y-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-2xs">
            {badgeConfig.icon}
          </div>
          <div>
            <span className={`text-xs font-black ${badgeConfig.titleColor}`}>{sector.title}</span>
            {sector.distance && (
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                Distancia Oficial: {sector.distance}
              </span>
            )}
          </div>
        </div>
        {sector.distance && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${badgeConfig.accentBadge}`}>
            {sector.distance}
          </span>
        )}
      </div>

      <div className="space-y-1 pl-1 pt-0.5">
        {sector.notes.map((note, idx) => (
          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
            <ArrowRight className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
            <span className="font-medium">{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
