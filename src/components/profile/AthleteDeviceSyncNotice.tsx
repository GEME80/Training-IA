"use client";

import React from "react";
import { Watch, ExternalLink, AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

interface AthleteDeviceSyncNoticeProps {
  athleteId?: string;
  isStravaDetected?: boolean;
  hasDeviceConnected?: boolean;
}

export const AthleteDeviceSyncNotice: React.FC<AthleteDeviceSyncNoticeProps> = ({
  athleteId,
  isStravaDetected = true,
  hasDeviceConnected = false,
}) => {
  const handleOpenIntervals = () => {
    if (typeof window !== "undefined") {
      window.open("https://intervals.icu/settings", "_blank", "noopener,noreferrer");
    }
  };

  // CASO A: Dispositivo Deportivo ya Conectado y Verificado
  if (hasDeviceConnected) {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900/80 p-4 sm:p-5 shadow-xs space-y-3 text-left">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Watch className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Reloj Deportivo Sincronizado
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Garmin Connect Activo
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Transmisión bidireccional activa: telemetría de salud y recepción de entrenamientos guiados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenIntervals}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
          >
            <span>Gestionar en Intervals.icu</span>
            <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Datos de Salud (HRV, Sueño, FC)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Upload Workouts Activado</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Zonas FTP & Umbral en vivo</span>
          </div>
        </div>
      </div>
    );
  }

  // CASO B: Usuario requiere vincular su reloj (proviene de Strava o sin Garmin)
  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900/80 p-5 shadow-xs space-y-4 text-left">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-amber-200/60 dark:border-amber-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Watch className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Sincronización a tu Reloj Deportivo</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                Paso Crucial
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Garmin Connect · Wahoo · Coros · Suunto · Apple Watch
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenIntervals}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm shadow-amber-600/20 transition cursor-pointer"
        >
          <span>Abrir Conexiones en Intervals.icu</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Alerta Contextual sobre Strava */}
      {isStravaDetected && (
        <div className="p-3.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-800/60 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold">
              ¿Tus actividades entran a través de Strava?
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
              Strava es una plataforma <strong>receptora</strong>: solo registra lo que ya corriste. 
              <strong> Strava no puede enviar entrenamientos guiados por series ni zonas de potencia a tu reloj</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Diagrama de Flujo Pedagógico */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-center font-mono">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">1. Planificación</span>
          <strong className="text-xs text-slate-800 dark:text-slate-200 block">Pulse Endurance</strong>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Calcula tus zonas</span>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">2. Motor Puente</span>
          <strong className="text-xs text-rose-600 dark:text-rose-400 block">Intervals.icu</strong>
          <span className="text-[10px] text-slate-500">Almacena sesiones</span>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-amber-300 dark:border-amber-800 space-y-1">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block uppercase">3. Ejecución</span>
          <strong className="text-xs text-amber-700 dark:text-amber-300 block">Tu Reloj (Garmin/Wahoo)</strong>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">¡Te pita los intervalos!</span>
        </div>
      </div>

      {/* Paso a Paso para Conectar */}
      <div className="space-y-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wider">
          ¿Cómo activar la recepción en tu reloj? (3 pasos simples)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="inline-block w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[10px] text-center leading-4">1</span>
            <p className="leading-snug">
              Haz clic en <strong>"Abrir Conexiones"</strong> para ingresar con tu sesión activa de Intervals.icu.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="inline-block w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[10px] text-center leading-4">2</span>
            <p className="leading-snug">
              Ubica tu marca (<strong>Garmin Connect</strong>, <strong>Wahoo Cloud</strong>, <strong>Coros</strong> o <strong>Suunto</strong>) y pulsa <strong>Conectar</strong>.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="inline-block w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[10px] text-center leading-4">3</span>
            <p className="leading-snug font-medium text-slate-800 dark:text-slate-100">
              Asegúrate de marcar la casilla <strong className="text-amber-600 dark:text-amber-400">"Upload Workouts"</strong> (Subir Entrenamientos).
            </p>
          </div>
        </div>
      </div>

      {/* Pie y acceso rápido */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Configuración segura y directa en tu cuenta {athleteId ? `(${athleteId})` : ""}</span>
        </span>
        <button
          type="button"
          onClick={handleOpenIntervals}
          className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Ir a intervals.icu/settings</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
