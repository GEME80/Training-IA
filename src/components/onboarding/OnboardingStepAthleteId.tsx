"use client";

import React from "react";
import { User, ExternalLink } from "lucide-react";

interface OnboardingStepAthleteIdProps {
  athleteId: string;
  setAthleteId: (val: string) => void;
}

export const OnboardingStepAthleteId: React.FC<OnboardingStepAthleteIdProps> = ({
  athleteId,
  setAthleteId,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center space-x-2">
        <div className="h-7 w-7 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
          1
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          ¿Dónde encontrar tu Intervals Athlete ID?
        </h3>
      </div>

      {/* Leyenda Explicativa Paso a Paso */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>Sigue estos 3 sencillos pasos en tu cuenta de Intervals:</span>
          <a
            href="https://intervals.icu/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 inline-flex items-center gap-1 font-bold"
          >
            <span>Abrir Intervals.icu</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <span>
              Inicia sesión en <strong>Intervals.icu</strong> y ve al menú <strong>Ajustes (Settings)</strong> en la barra lateral izquierda.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <span>
              En la parte superior verás tu tarjeta de perfil con tu <strong>Athlete ID</strong> (por ejemplo: <code className="bg-slate-200/70 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">i123456</code> o una serie numérica).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              3
            </span>
            <span>
              Copia ese identificador y pégalo en el campo de texto a continuación.
            </span>
          </li>
        </ul>
      </div>

      {/* Input de Athlete ID */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Tu Intervals Athlete ID <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={athleteId}
            onChange={(e) => setAthleteId(e.target.value.trim())}
            placeholder="Ejemplo: i123456"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:bg-white dark:focus:bg-slate-900 focus:border-cyan-500 focus:outline-none transition shadow-2xs"
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Este ID le permite a PULSE AI PRO identificar de forma unívoca tus zonas de potencia y eventos.
        </p>
      </div>
    </div>
  );
};
