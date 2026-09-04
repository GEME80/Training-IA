"use client";

import React from "react";
import { Activity, Plane, Clock, ShieldAlert, Bike, Brain } from "lucide-react";

interface HeadCoachQuickActionsProps {
  onSelectAction: (prompt: string) => void;
  isLoading?: boolean;
}

export const HeadCoachQuickActions: React.FC<HeadCoachQuickActionsProps> = ({
  onSelectAction,
  isLoading = false,
}) => {
  const actions = [
    {
      id: "eval",
      label: "Evaluar Actividades & Asimilación",
      icon: <Activity className="h-3.5 w-3.5 text-emerald-500" />,
      prompt: "Evalúa las actividades que he realizado esta semana frente a lo planificado y dime tu dictamen fisiológico.",
    },
    {
      id: "fatigue",
      label: "Sobrecarga en Piernas",
      icon: <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />,
      prompt: "Siento sobrecarga muscular en piernas y fatiga alta. Adapta los días restantes a trote regenerativo o descarga.",
    },
    {
      id: "travel",
      label: "Reorganizar por Viaje",
      icon: <Plane className="h-3.5 w-3.5 text-sky-500" />,
      prompt: "Tengo un viaje laboral de 2 días. Reorganiza mi semana colocando descanso en los días de viaje sin perder el fondo.",
    },
    {
      id: "time",
      label: "Solo 40 min Mañana",
      icon: <Clock className="h-3.5 w-3.5 text-indigo-500" />,
      prompt: "Mañana tengo solo 40 minutos disponibles por falta de tiempo. Condensa el entrenamiento manteniendo el estímulo.",
    },
    {
      id: "bike",
      label: "Cambiar Carrera por Rodillo Z2",
      icon: <Bike className="h-3.5 w-3.5 text-teal-500" />,
      prompt: "Deseo sustituir la carrera de hoy por una sesión de ciclismo en rodillo Z2 sin impacto osteoarticular.",
    },
    {
      id: "horizon",
      label: "Filosofía de Microciclos",
      icon: <Brain className="h-3.5 w-3.5 text-purple-500" />,
      prompt: "¿Por qué el Head Coach adapta microciclo a microciclo en vez de modificar todo el mes a la vez?",
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
      {actions.map((act) => (
        <button
          key={act.id}
          type="button"
          disabled={isLoading}
          onClick={() => onSelectAction(act.prompt)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer shrink-0 border border-slate-200/80 dark:border-slate-700/80 disabled:opacity-40"
        >
          {act.icon}
          <span>{act.label}</span>
        </button>
      ))}
    </div>
  );
};
