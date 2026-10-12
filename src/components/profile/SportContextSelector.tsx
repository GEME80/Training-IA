"use client";

import React from "react";
import { Footprints, Bike, Waves } from "lucide-react";

export type SportContextType = "RUN" | "BIKE" | "SWIM";

interface SportContextSelectorProps {
  selectedSport: SportContextType;
  onSelectSport: (sport: SportContextType) => void;
}

export const SportContextSelector: React.FC<SportContextSelectorProps> = ({
  selectedSport,
  onSelectSport,
}) => {
  const sports = [
    { id: "RUN" as const, label: "Carrera", icon: Footprints },
    { id: "BIKE" as const, label: "Ciclismo", icon: Bike },
    { id: "SWIM" as const, label: "Natación", icon: Waves },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto no-scrollbar select-none">
      {sports.map(({ id, label, icon: Icon }) => {
        const isActive = selectedSport === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelectSport(id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isActive
                ? "bg-emerald-600 text-white hover:bg-emerald-700 font-black shadow-sm ring-1 ring-emerald-600/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/40"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
