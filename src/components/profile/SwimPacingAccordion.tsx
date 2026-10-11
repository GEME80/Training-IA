"use client";

import React, { useState } from "react";
import { ChevronDown, Waves } from "lucide-react";

interface SwimPacingAccordionProps {
  swimCssSec: number;
  swimCssStr: string;
}

export const SwimPacingAccordion: React.FC<SwimPacingAccordionProps> = ({
  swimCssSec,
  swimCssStr,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const safeCss = swimCssSec > 0 ? swimCssSec : 130; // 2:10 por defecto si no hay dato

  const milestones = [
    { label: "50m", sec: Math.round(safeCss * 0.5) },
    { label: "100m (CSS)", sec: safeCss },
    { label: "200m", sec: Math.round(safeCss * 2) },
    { label: "400m", sec: Math.round(safeCss * 4) },
    { label: "800m", sec: Math.round(safeCss * 8) },
    { label: "1500m", sec: Math.round(safeCss * 15) },
  ];

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs select-none">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-3 sm:p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Waves className="h-4 w-4 text-cyan-500" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            {isOpen ? "▾" : "▸"} Calculadora de Parciales y Ritmos de Paso (CSS {swimCssStr || "2:10"}/100m)
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 animate-fadeIn space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Tiempos de paso proyectados para nado continuo al 100% de la Velocidad Crítica de Nado (CSS):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {milestones.map((m) => (
              <div
                key={m.label}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center shadow-2xs"
              >
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                  {m.label}
                </span>
                <span className="text-xs sm:text-sm font-black font-mono tabular-nums text-cyan-600 dark:text-cyan-400">
                  {formatSec(m.sec)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
