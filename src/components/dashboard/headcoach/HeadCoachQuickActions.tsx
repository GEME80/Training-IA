"use client";

import React, { useState } from "react";
import {
  Activity,
  Plane,
  Clock,
  ShieldAlert,
  Bike,
  Compass,
  Target,
  CheckCircle2,
  Calendar,
  Zap,
} from "lucide-react";

interface HeadCoachQuickActionsProps {
  onSelectAction: (prompt: string) => void;
  isLoading?: boolean;
}

export const HeadCoachQuickActions: React.FC<HeadCoachQuickActionsProps> = ({
  onSelectAction,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<"weekly" | "daily">("weekly");
  const [travelPickerOpen, setTravelPickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const weeklyActions = [
    {
      id: "eval",
      label: "Auditar Carga & Asimilación",
      icon: <Activity className="h-3.5 w-3.5 text-emerald-500" />,
      prompt: "Evalúa las actividades realizadas en la semana frente al plan y emite tu dictamen fisiológico.",
    },
    {
      id: "continuity",
      label: "Confirmar Continuidad Fin de Semana",
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />,
      prompt: "Confirma si el plan del fin de semana se mantiene intacto con continuidad o si amerita algún ajuste táctico.",
    },
    {
      id: "travel",
      label: "Reorganizar por Viaje",
      icon: <Plane className="h-3.5 w-3.5 text-sky-500" />,
      onClick: () => setTravelPickerOpen((prev) => !prev),
    },
    {
      id: "philosophy",
      label: "Filosofía de Microciclos",
      icon: <Compass className="h-3.5 w-3.5 text-purple-500" />,
      prompt: "¿Por qué el Head Coach adapta microciclo a microciclo en vez de modificar todo el mes a la vez?",
    },
  ];

  const travelSubOptions = [
    {
      label: "Viaje Jueves-Viernes (Descanso)",
      prompt: "Tengo un viaje laboral de Jueves a Viernes donde requiero descanso pasivo total. Reorganiza el microciclo protegiendo la calidad el fin de semana.",
    },
    {
      label: "Viaje Viernes-Domingo (Con zapatillas)",
      prompt: "Viajo de Viernes a Domingo. Dispondré de zapatillas para correr en exteriores o cinta. Adapta el fin de semana.",
    },
    {
      label: "Viaje Miércoles-Jueves (Sin rodillo)",
      prompt: "Viajo Miércoles y Jueves fuera de casa sin acceso a rodillo ni gimnasio. Adapta esos días a trote suave o descanso.",
    },
  ];

  const dailyActions = [
    {
      id: "today_pacing",
      label: "Pautas & Vatios de Hoy",
      icon: <Target className="h-3.5 w-3.5 text-emerald-500" />,
      prompt: "¿Cómo debo ejecutar la sesión programada para hoy? Detalla vatios Stryd CP o Bike FTP, zonas y enfoque metabólico.",
    },
    {
      id: "time_short",
      label: "Tiempo Limitado",
      icon: <Clock className="h-3.5 w-3.5 text-amber-500" />,
      onClick: () => setTimePickerOpen((prev) => !prev),
    },
    {
      id: "bike_trainer",
      label: "Cambiar Carrera por Rodillo Z2",
      icon: <Bike className="h-3.5 w-3.5 text-cyan-500" />,
      prompt: "Deseo sustituir la carrera de hoy por una sesión de ciclismo en rodillo Z2 sin impacto osteoarticular.",
    },
    {
      id: "fatigue_legs",
      label: "Sobrecarga / Piernas Pesadas",
      icon: <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />,
      prompt: "Siento sobrecarga muscular en piernas y fatiga alta. Adapta la sesión de hoy a trote regenerativo Z1 o descanso activo.",
    },
  ];

  const timeSubOptions = [
    {
      label: "Solo 30 min hoy",
      prompt: "Hoy dispongo de solo 30 minutos por falta de tiempo. Condensa la sesión manteniendo el estímulo principal.",
    },
    {
      label: "Solo 45 min hoy",
      prompt: "Hoy dispongo de solo 45 minutos por falta de tiempo. Condensa la sesión manteniendo el estímulo principal.",
    },
  ];

  return (
    <div className="space-y-2 text-xs">
      {/* Selector de Nivel: Semanal vs Diario */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("weekly");
              setTravelPickerOpen(false);
              setTimePickerOpen(false);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition cursor-pointer text-xs ${
              activeTab === "weekly"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Nivel Semanal (Microciclo)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("daily");
              setTravelPickerOpen(false);
              setTimePickerOpen(false);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition cursor-pointer text-xs ${
              activeTab === "daily"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Nivel Diario (Sesión)</span>
          </button>
        </div>
        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
          Consultas tácticas directas • Cero consumo libre
        </span>
      </div>

      {/* Botones del Nivel Activo */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {(activeTab === "weekly" ? weeklyActions : dailyActions).map((act) => (
          <button
            key={act.id}
            type="button"
            disabled={isLoading}
            onClick={() => {
              if (act.onClick) {
                act.onClick();
              } else if (act.prompt) {
                onSelectAction(act.prompt);
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-bold transition cursor-pointer shrink-0 border border-slate-200/80 dark:border-slate-700/80 disabled:opacity-40 shadow-2xs hover:border-emerald-500/40"
          >
            {act.icon}
            <span>{act.label}</span>
          </button>
        ))}
      </div>

      {/* Sub-selector de Viaje */}
      {travelPickerOpen && activeTab === "weekly" && (
        <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-150">
          <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 mr-1">
            Días de viaje:
          </span>
          {travelSubOptions.map((sub, sIdx) => (
            <button
              key={sIdx}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setTravelPickerOpen(false);
                onSelectAction(sub.prompt);
              }}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-sky-900 dark:text-sky-200 border border-sky-500/30 text-[11px] font-semibold hover:bg-sky-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-selector de Tiempo Limitado */}
      {timePickerOpen && activeTab === "daily" && (
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-150">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 mr-1">
            Duración disponible:
          </span>
          {timeSubOptions.map((sub, sIdx) => (
            <button
              key={sIdx}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setTimePickerOpen(false);
                onSelectAction(sub.prompt);
              }}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-[11px] font-semibold hover:bg-amber-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
