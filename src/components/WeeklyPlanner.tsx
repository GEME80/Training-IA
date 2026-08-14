"use client";

import React from "react";
import { Calendar, Dumbbell, Bike, Footprints, Moon, ChevronRight, CheckCircle } from "lucide-react";
import { AgentDecisionOutput } from "@/lib/gemini/engine";

interface WeeklyPlannerProps {
  suggestedPlan: AgentDecisionOutput["suggestedPlan"];
  runFtp: number;
  bikeFtp: number;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  suggestedPlan,
  runFtp,
  bikeFtp,
}) => {
  const getDisciplineIcon = (discipline: string) => {
    switch (discipline) {
      case "Carrera":
        return <Footprints className="h-4 w-4 text-emerald-400" />;
      case "Ciclismo":
        return <Bike className="h-4 w-4 text-cyan-400" />;
      case "Fuerza":
        return <Dumbbell className="h-4 w-4 text-purple-400" />;
      default:
        return <Moon className="h-4 w-4 text-slate-400" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "MODIFICAR":
        return (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
            Ajustado
          </span>
        );
      case "REDUCIR_INTENSIDAD":
        return (
          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
            Descarga
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
            Nominal
          </span>
        );
    }
  };

  return (
    <div className="card-gradient rounded-2xl p-5 border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center space-x-2.5">
          <Calendar className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Microciclo Semanal Adaptativo (Lunes a Domingo)
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          Disponibilidad Base & Sintaxis Stryd Potencia % FTP
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-7">
        {suggestedPlan.map((item, idx) => (
          <div
            key={idx}
            className={`group relative flex flex-col justify-between rounded-xl p-3.5 border transition-all ${
              item.action === "MODIFICAR" || item.action === "REDUCIR_INTENSIDAD"
                ? "border-amber-500/40 bg-amber-950/10 hover:border-amber-400"
                : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700"
            }`}
          >
            {/* Day Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {item.day}
                </span>
                {getActionBadge(item.action)}
              </div>

              {/* Discipline and Workout */}
              <div className="mt-2.5 flex items-center space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
                  {getDisciplineIcon(item.discipline)}
                </div>
                <span className="text-xs font-semibold text-slate-200">{item.discipline}</span>
              </div>

              <h3 className="mt-2 text-xs font-bold text-white line-clamp-2 leading-snug">
                {item.workoutName}
              </h3>

              {/* Power Target */}
              {item.powerTarget && (
                <div className="mt-2 rounded bg-slate-950/60 px-2 py-1 border border-slate-800">
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    🎯 {item.powerTarget}
                  </span>
                </div>
              )}
            </div>

            {/* Justification Footer */}
            <div className="mt-3 border-t border-slate-800/60 pt-2 text-[10px] text-slate-400 leading-tight">
              {item.justification}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
