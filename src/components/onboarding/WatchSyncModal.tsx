"use client";

import React, { useState } from "react";
import { CheckCircle2, ExternalLink, Sparkles, X, Watch, ArrowRight } from "lucide-react";
import { PulseLogo } from "../PulseLogo";

interface WatchSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId?: string;
  athleteName?: string;
}

const SUPPORTED_WATCHES = [
  { name: "Garmin Connect", popular: true, desc: "Sincronización instantánea de pulsaciones, potencia Stryd y entrenamientos" },
  { name: "Polar Flow", popular: false, desc: "Sincroniza actividades, sueño y frecuencia cardíaca" },
  { name: "Coros", popular: false, desc: "Sincroniza tus carreras y métricas de carga de entrenamiento" },
  { name: "Apple Watch / Wahoo / Suunto", popular: false, desc: "Compatible vía Strava o enlace directo en Intervals" },
];

export const WatchSyncModal: React.FC<WatchSyncModalProps> = ({
  isOpen,
  onClose,
  athleteId = "",
  athleteName = "Atleta",
}) => {
  const [openedSettings, setOpenedSettings] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleOpenIntervalsSettings = () => {
    setOpenedSettings(true);
    if (typeof window !== "undefined") {
      window.open("https://intervals.icu/settings", "_blank", "width=880,height=780,scrollbars=yes");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <PulseLogo size="sm" showSubtext={false} />
            <span className="text-xs font-bold text-slate-400">⚡</span>
            <span className="text-xs font-black text-rose-600 tracking-tight">Intervals.icu</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Badge de Éxito de Vinculación */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-emerald-950">
                ¡Conexión Exitosa con Intervals.icu!
              </h3>
              <p className="text-xs text-emerald-800">
                Atleta vinculado: <span className="font-bold">{athleteName}</span> {athleteId && <span className="font-mono text-[11px] bg-emerald-100/70 px-1.5 py-0.5 rounded">({athleteId})</span>}
              </p>
            </div>
          </div>

          {/* Paso 2: Conectar Reloj */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center text-xs font-black">
                2
              </div>
              <h4 className="text-sm font-black text-slate-900">
                Paso Final: Conecta tu Reloj Deportivo
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Para que el Head Coach de PULSE IA reciba automáticamente tus entrenamientos y envíe tus sesiones programadas directamente a tu muñeca:
            </p>

            {/* Lista de Relojes Soportados */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              {SUPPORTED_WATCHES.map((watch) => (
                <div
                  key={watch.name}
                  className={`p-3 rounded-xl border text-left transition ${
                    watch.popular
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Watch className={`h-4 w-4 ${watch.popular ? "text-cyan-400" : "text-slate-500"}`} />
                      <span className="text-xs font-bold">{watch.name}</span>
                    </div>
                    {watch.popular && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] mt-1 leading-normal ${watch.popular ? "text-slate-300" : "text-slate-500"}`}>
                    {watch.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Instrucción Rápida */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-xs space-y-1">
              <div className="font-bold flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>¿Cómo activarlo en 10 segundos?</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Al pulsar el botón verde, se abrirá la configuración de Intervals.icu en una ventana. Solo baja a la sección de tu marca (ej. <strong>Garmin</strong>) y activa el interruptor.
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row gap-2.5">
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
            onClick={onClose}
            className={`py-2.5 px-5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              openedSettings
                ? "bg-slate-900 text-white hover:bg-slate-800 shadow"
                : "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
            }`}
          >
            <span>{openedSettings ? "¡Listo! Ir al Dashboard" : "Omitir por ahora"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
