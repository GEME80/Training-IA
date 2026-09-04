"use client";

import React from "react";
import { Sparkles, ArrowRight, ExternalLink, ShieldCheck, User, Key } from "lucide-react";

interface OnboardingBannerProps {
  onOpenOnboarding: () => void;
}

export const OnboardingBanner: React.FC<OnboardingBannerProps> = ({ onOpenOnboarding }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-200/90 dark:border-cyan-800/60 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-slate-50/50 dark:from-cyan-950/40 dark:via-sky-950/20 dark:to-slate-900/40 p-5 sm:p-6 shadow-sm backdrop-blur-xs animate-in fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Información Principal */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-cyan-600/15 dark:bg-cyan-400/15 text-cyan-700 dark:text-cyan-300 border border-cyan-300/40 dark:border-cyan-700/40">
              <Sparkles className="h-3 w-3 animate-pulse" />
              Primer Paso del Atleta
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" />
              Cifrado AES-256-GCM
            </span>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Conecta tu cuenta de Intervals.icu y activa tu IA de Entrenamiento
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
              Vincula tu reloj <strong>Garmin, Coros, Polar, Suunto, Strava o Stryd</strong> a través de Intervals.icu para sincronizar tus zonas de potencia, telemetría biológica en vivo (Fitness, Fatiga, Forma) y planificar con IA.
            </p>
          </div>

          {/* Mini Guía Rápida de 2 Pasos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-cyan-200/50 dark:border-cyan-800/40 flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="text-[11px]">
                <strong className="block text-slate-900 dark:text-slate-100 font-bold">1. Tu Athlete ID</strong>
                <span className="text-slate-500 dark:text-slate-400">
                  Visible en la cabecera de tu perfil en Intervals.icu (ej: <code className="font-mono text-cyan-700 dark:text-cyan-300 font-bold">i123456</code>).
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-cyan-200/50 dark:border-cyan-800/40 flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                <Key className="h-3.5 w-3.5" />
              </div>
              <div className="text-[11px]">
                <strong className="block text-slate-900 dark:text-slate-100 font-bold">2. Tu Clave API</strong>
                <span className="text-slate-500 dark:text-slate-400">
                  Genérala en <em>Settings &gt; Developer Settings</em> y pégala con 1 clic.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones de Llamado Directo */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-center">
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <span>Vincular Cuenta (Paso a Paso)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <a
            href="https://intervals.icu/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-cyan-100/50 dark:hover:bg-slate-800 text-[11px] font-semibold transition cursor-pointer border border-cyan-200/60 dark:border-slate-800"
          >
            <span>Abrir Ajustes de Intervals</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
