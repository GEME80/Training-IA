"use client";

import React from "react";
import { UserPlus, KeyRound, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface OnboardingPathSelectorProps {
  onSelectPath: (path: "new" | "existing") => void;
}

export const OnboardingPathSelector: React.FC<OnboardingPathSelectorProps> = ({
  onSelectPath,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="text-center space-y-1.5 pb-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          ¿Cómo deseas conectar tu telemetría deportiva?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          PULSE AI PRO se conecta con <strong>Intervals.icu</strong> para sincronizar
          automáticamente los entrenamientos de tu reloj (Garmin, Coros, Strava) y enviarte los planes de la IA.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Opción 1: Soy Nuevo */}
        <button
          type="button"
          onClick={() => onSelectPath("new")}
          className="group relative p-5 rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-b from-cyan-50/50 to-white dark:from-cyan-950/20 dark:to-slate-900 hover:border-cyan-500 dark:hover:border-cyan-400 hover:shadow-lg transition-all text-left flex flex-col justify-between cursor-pointer"
        >
          <div className="absolute top-3 right-3 bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Recomendado
          </div>

          <div className="space-y-3">
            <div className="h-11 w-11 rounded-2xl bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                Soy nuevo en Intervals.icu
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                No tengo cuenta o aún no vinculo mi reloj deportivo. Te guiaremos paso a paso en 2 minutos (es 100% gratis).
              </p>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
            <span>Iniciar guía asistida</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Opción 2: Ya tengo cuenta */}
        <button
          type="button"
          onClick={() => onSelectPath("existing")}
          className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer"
        >
          <div className="space-y-3">
            <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <KeyRound className="h-5 w-5" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-white transition">
                Ya tengo cuenta en Intervals.icu
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Tengo mi Athlete ID y Clave API listos para conectar directamente.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Ingresar credenciales</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </div>
        </button>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <span>
          Tus credenciales se cifran bajo el estándar militar AES-256-GCM. Nadie excepto tú tiene acceso a tu cuenta.
        </span>
      </div>
    </div>
  );
};
