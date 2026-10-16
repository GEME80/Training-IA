"use client";

import React, { useState } from "react";
import { CheckCircle2, ExternalLink, Sparkles, X, Watch, ArrowRight, ShieldCheck } from "lucide-react";
import { PulseLogo } from "../PulseLogo";

interface WatchSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  athleteId?: string;
  athleteName?: string;
}

export const WatchSyncModal: React.FC<WatchSyncModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  athleteId = "",
  athleteName = "Atleta",
}) => {
  const [openedSettings, setOpenedSettings] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleOpenIntervalsSettings = () => {
    setOpenedSettings(true);
    if (typeof window !== "undefined") {
      window.open("https://intervals.icu/settings", "_blank", "width=900,height=800,scrollbars=yes");
    }
  };

  const handleFinish = () => {
    if (onComplete) {
      onComplete();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <PulseLogo size="sm" showSubtext={false} />
            <span className="text-xs font-bold text-slate-400">⚡</span>
            <span className="text-xs font-black text-rose-600 tracking-tight">Intervals.icu</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="p-6 overflow-y-auto space-y-5 text-left">
          {/* Badge de Éxito de Vinculación */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                ¡Conexión Exitosa con Intervals.icu!
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Atleta vinculado: <span className="font-bold">{athleteName}</span> {athleteId && <span className="font-mono text-[11px] bg-emerald-100/70 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">({athleteId})</span>}
              </p>
            </div>
          </div>

          {/* Paso 2: Conectar Reloj */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 flex items-center justify-center text-xs font-black">
                2
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Sincroniza tu Garmin u otro Reloj
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Para que tu Head Coach de PULSE IA reciba automáticamente tus pulsaciones, ritmos y envíe tus entrenamientos a tu reloj:
            </p>

            {/* Paso a Paso Guiado */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span className="text-slate-700 dark:text-slate-300 leading-snug">
                  Pulsa el botón verde <strong>"Abrir Ajustes en Intervals.icu"</strong> para abrir la ventana de configuración.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span className="text-slate-700 dark:text-slate-300 leading-snug">
                  Baja hasta la sección <strong>"Conexiones"</strong> (o Dispositivos).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span className="text-slate-700 dark:text-slate-300 leading-snug">
                  En <strong>Garmin</strong> (o tu marca), haz clic en <strong>Conectar</strong> e inicia sesión con tu cuenta del reloj.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                <span className="text-slate-700 dark:text-slate-300 leading-snug">
                  Asegúrate de marcar los permisos de <strong>Actividades</strong> y <strong>Datos de Salud</strong> (sueño, FC reposo, HRV).
                </span>
              </div>
            </div>

            {/* Tip Proactivo */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Una vez conectado Garmin, todos tus entrenamientos se sincronizarán en tiempo real tanto en Intervals como en PULSE AI.
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleOpenIntervalsSettings}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Watch className="h-4 w-4" />
            <span>Abrir Ajustes en Intervals.icu</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className={`py-2.5 px-5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              openedSettings
                ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 shadow"
                : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            <span>{openedSettings ? "¡Listo! Continuar" : "Omitir por ahora"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
