"use client";

import React from "react";
import { CheckCircle2, Circle, Sparkles, ArrowRight, Calendar, Activity, X } from "lucide-react";
import { PulseLogo } from "../PulseLogo";

interface WelcomePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPlan: () => void;
  athleteName?: string;
}

export const WelcomePlanModal: React.FC<WelcomePlanModalProps> = ({
  isOpen,
  onClose,
  onStartPlan,
  athleteName = "Atleta",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Banner Superior Celebratorio */}
        <div className="relative p-6 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border-b border-emerald-500/20 text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
              Onboarding Completado
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              ¡Conexión Exitosa con PULSE AI!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              Bienvenido, <span className="font-bold text-slate-900 dark:text-white">{athleteName}</span>. Tu telemetría deportiva ya está sincronizada en tiempo real.
            </p>
          </div>
        </div>

        {/* Estado y Checklist de Inicio */}
        <div className="p-6 space-y-5 text-left">
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Estado de tu cuenta
            </span>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center space-x-2.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Cuenta de usuario verificada y activa</span>
              </div>
              <div className="flex items-center space-x-2.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Intervals.icu & telemetría conectada</span>
              </div>
              <div className="flex items-center space-x-2.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Enlace con reloj deportivo y sensores listo</span>
              </div>
              <div className="flex items-center space-x-2.5 text-amber-600 dark:text-amber-400">
                <Circle className="h-4 w-4 shrink-0 stroke-[2.5]" />
                <span className="font-bold text-slate-900 dark:text-white">Diseñar tu Plan de Temporada con el Head Coach IA</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-xs text-sky-900 dark:text-sky-200 space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <Activity className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>¿Cuál es el siguiente paso?</span>
            </div>
            <p className="text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed">
              Ahora que tus sensores están conectados, el Head Coach IA necesita conocer tu próximo objetivo o carrera principal para periodizar tus cargas y prescribir tus series semanales.
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="p-6 pt-0 space-y-2.5">
          <button
            type="button"
            onClick={onStartPlan}
            className="w-full flex items-center justify-center space-x-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            <Calendar className="h-4 w-4" />
            <span>Diseñar mi Plan con el Head Coach IA</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
          >
            Explorar Dashboard primero
          </button>
        </div>
      </div>
    </div>
  );
};
