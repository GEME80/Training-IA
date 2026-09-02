"use client";

import React from "react";
import { Footprints, Zap, Bike, Sprout, Heart, ArrowRight } from "lucide-react";

export interface ProgramTemplate {
  key: string;
  name: string;
  discipline: string;
  weeks: number;
  description: string;
  badgeColor: string;
  icon: any;
  targetFocus: string;
}

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    key: "MARATON_42K",
    name: "PULSE 42K Marathon",
    discipline: "Carrera",
    weeks: 16,
    description: "Periodización 3:1 para maratón de asfalto, fondo dominical progresivo y bloques de potencia crítica.",
    badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    icon: Footprints,
    targetFocus: "Economía de carrera & Umbral Stryd",
  },
  {
    key: "MEDIA_MARATON_21K",
    name: "PULSE 21K Half-Marathon",
    discipline: "Carrera",
    weeks: 12,
    description: "Desarrollo de ritmo de crucero, VO2max y tolerancia al lactato para media maratón.",
    badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    icon: Zap,
    targetFocus: "VO2max & Ritmo Umbral",
  },
  {
    key: "TRIATLON_703",
    name: "PULSE 70.3 Middle Distance",
    discipline: "Triatlón",
    weeks: 16,
    description: "Estructura multideporte coordinada (Swim + Bike FTP + Run CP) sin interferencias.",
    badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    icon: Bike,
    targetFocus: "Resistencia Multideporte & Potencia",
  },
  {
    key: "BASE_BUILD",
    name: "PULSE Aerobic Engine Build",
    discipline: "Resistencia",
    weeks: 10,
    description: "Construcción de base mitocondrial Z2, fuerza estructural y aumento de volumen seguro.",
    badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    icon: Sprout,
    targetFocus: "Densidad Mitocondrial & Base Z2",
  },
  {
    key: "MANTENIMIENTO",
    name: "PULSE Longevity & Health",
    discipline: "Salud",
    weeks: 8,
    description: "Salud cardiovascular, VO2max y preservación muscular sin fatiga extrema de competición.",
    badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    icon: Heart,
    targetFocus: "Preservación & TSB Neutro",
  },
];

interface SeasonProgramLibraryProps {
  selectedProgramKey: string;
  onSelectProgram: (program: ProgramTemplate) => void;
  onConfirmProgram: (program: ProgramTemplate) => void;
}

export const SeasonProgramLibrary: React.FC<SeasonProgramLibraryProps> = ({
  selectedProgramKey,
  onSelectProgram,
  onConfirmProgram,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase font-mono text-slate-500 tracking-wider">
          Programas Oficiales ({PROGRAM_TEMPLATES.length})
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROGRAM_TEMPLATES.map((prog) => {
          const isSelected = selectedProgramKey === prog.key;
          const Icon = prog.icon;

          return (
            <div
              key={prog.key}
              onClick={() => onSelectProgram(prog)}
              className={`rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                isSelected
                  ? "bg-sky-50/60 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500 ring-2 ring-sky-400/20 shadow-xs"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold border ${prog.badgeColor}`}>
                    {prog.weeks} Semanas
                  </span>
                </div>

                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white">
                    {prog.name}
                  </h5>
                  <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold block">
                    {prog.targetFocus}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                  {prog.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  {isSelected ? "Seleccionado" : "Elegir"}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirmProgram(prog);
                  }}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs hover:bg-slate-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200"
                  }`}
                >
                  <span>{isSelected ? "Activar Plan" : "Elegir"}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
