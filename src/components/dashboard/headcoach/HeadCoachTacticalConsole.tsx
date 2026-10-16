"use client";

import React, { useState } from "react";
import { Activity, Target, Compass, Sliders, Thermometer, Clock, Bike, CalendarSync } from "lucide-react";

interface HeadCoachTacticalConsoleProps {
  onSelectAction: (prompt: string, options?: any) => void;
  onOpenTemporaryMatrix?: () => void;
  completedActivities?: { id: string; name: string; date: string; type?: string; tss?: number; movingTimeMin?: number; watts?: number; heartrate?: number }[];
  isLoading?: boolean;
}

export const HeadCoachTacticalConsole: React.FC<HeadCoachTacticalConsoleProps> = ({
  onSelectAction,
  onOpenTemporaryMatrix,
  completedActivities = [],
  isLoading = false,
}) => {
  const [reorgOpen, setReorgOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  const handleAction = (prompt: string, opts?: any) => {
    if (isLoading) return;
    onSelectAction(prompt, opts);
  };

  return (
    <div className="shrink-0 space-y-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {/* PILAR 1: Balance de Semana & Volumen */}
        <button
          type="button"
          onClick={() => {
            setReorgOpen(false);
            setAuditOpen(false);
            handleAction(
              "Germán aquí. Dame el balance de volumen y carga de esta semana: cuántas sesiones llevo ejecutadas vs planificadas, mi TSS acumulado y cómo asimila mi cuerpo la fatiga (TSB) para los días restantes.",
              { isWeekKickoffAudit: true }
            );
          }}
          disabled={isLoading}
          className="text-left rounded-2xl p-2.5 sm:p-3 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 transition-all cursor-pointer group disabled:opacity-50 shadow-2xs"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
              Balance de Semana
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
            Volumen, TSS y asimilación
          </p>
        </button>

        {/* PILAR 2: Auditar Sesión Específica */}
        <button
          type="button"
          onClick={() => {
            setReorgOpen(false);
            if (completedActivities && completedActivities.length > 0) {
              setAuditOpen((prev) => !prev);
            } else {
              setAuditOpen(false);
              handleAction(
                "Audita la planificación de esta semana: aún no he registrado actividades completadas. Analiza las sesiones programadas y qué objetivos de potencia/ritmo debo cuidar."
              );
            }
          }}
          disabled={isLoading}
          className={`text-left rounded-2xl p-2.5 sm:p-3 border transition-all cursor-pointer group disabled:opacity-50 shadow-2xs ${
            auditOpen
              ? "border-cyan-500/40 bg-cyan-500/15 dark:bg-cyan-950/40 ring-1 ring-cyan-400/30"
              : "border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Target className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
              Auditar Sesión
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
            {completedActivities && completedActivities.length > 0
              ? `${completedActivities.length} de esta semana • Elegir`
              : "Potencia, pulso y desacople"}
          </p>
        </button>

        {/* PILAR 3: Rumbo a mi Meta */}
        <button
          type="button"
          onClick={() => {
            setReorgOpen(false);
            setAuditOpen(false);
            handleAction(
              "Germán aquí. Hazme un análisis estratégico de mi rumbo hacia mi carrera principal: revisa mis semanas restantes, mi estado de forma (CTL y Stryd CP / FTP) y explícame cómo se proyecta mi ritmo objetivo para el día de la carrera. No alteres mi microciclo ni me hables de la rutina del día a día, dame una visión estratégica macro."
            );
          }}
          disabled={isLoading}
          className="text-left rounded-2xl p-2.5 sm:p-3 border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 dark:bg-purple-950/20 dark:hover:bg-purple-950/30 transition-all cursor-pointer group disabled:opacity-50 shadow-2xs"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
              Rumbo a mi Meta
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
            Proyección y ritmo de carrera
          </p>
        </button>

        {/* PILAR 4: Reagendar o Adaptar */}
        <button
          type="button"
          onClick={() => {
            setAuditOpen(false);
            setReorgOpen((prev) => !prev);
          }}
          disabled={isLoading}
          className={`text-left rounded-2xl p-2.5 sm:p-3 border transition-all cursor-pointer group disabled:opacity-50 shadow-2xs ${
            reorgOpen
              ? "border-amber-500/40 bg-amber-500/15 dark:bg-amber-950/40 ring-1 ring-amber-400/30"
              : "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sliders className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
              Reagendar / Imprevisto
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
            Enfermedad, tiempo o viaje
          </p>
        </button>
      </div>

      {/* Sub-Opciones Desplegables de Auditoría de Sesiones */}
      {auditOpen && completedActivities && completedActivities.length > 0 && (
        <div className="p-2 sm:p-2.5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-500/25 flex flex-wrap items-center gap-1.5 sm:gap-2 animate-fadeIn">
          <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300 mr-1 flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>Auditar sesión:</span>
          </span>
          {completedActivities.map((act, aIdx) => {
            const isRide = /ride|bike|ciclismo/i.test(act.type || act.name || "");
            const isLatest = aIdx === completedActivities.length - 1;
            return (
              <button
                key={act.id || `${act.date}-${aIdx}`}
                type="button"
                onClick={() => {
                  setAuditOpen(false);
                  handleAction(
                    `Germán aquí. Audita en detalle mi sesión de ${act.name || act.type} realizada el ${act.date}: analiza mi potencia/ritmo, frecuencia cardíaca, desacoplamiento aeróbico (drift) y explícame con tono de entrenador si cumplí el objetivo.`
                  );
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                  isLatest
                    ? "bg-cyan-500/15 border-cyan-400 text-cyan-950 dark:text-cyan-100 hover:bg-cyan-500/25"
                    : "bg-white dark:bg-slate-900 border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 hover:border-cyan-400 hover:bg-cyan-50/80 dark:hover:bg-cyan-950/40"
                }`}
              >
                {isRide ? <Bike className="h-3 w-3 text-sky-500" /> : <Activity className="h-3 w-3 text-emerald-500" />}
                <span className="truncate max-w-[140px] sm:max-w-[180px]">{isLatest ? `⚡ ${act.name || act.type}` : (act.name || act.type)}</span>
                <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-normal">
                  {act.tss ? `${act.tss} TSS` : `${act.movingTimeMin || 0}m`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sub-Opciones Desplegables de Reagendamiento */}
      {reorgOpen && (
        <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/25 flex flex-wrap gap-1.5 sm:gap-2 animate-fadeIn">
          <button
            type="button"
            onClick={() => {
              setReorgOpen(false);
              handleAction(
                "Estuve enfermo y me salté algunos días de entrenamiento. Activa el protocolo de retorno progresivo sin sobrecargarme ni intentar recuperar los kilómetros perdidos."
              );
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:border-amber-400 transition"
          >
            <Thermometer className="h-3 w-3 text-rose-500" />
            <span>Estuve enfermo / Me salté días</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReorgOpen(false);
              handleAction(
                "Hoy tengo tiempo muy limitado (30 a 45 minutos). Comprime mi sesión manteniendo el estímulo principal y reduciendo volumen no esencial."
              );
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:border-amber-400 transition"
          >
            <Clock className="h-3 w-3 text-amber-500" />
            <span>Tengo poco tiempo hoy (30m/45m)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReorgOpen(false);
              if (onOpenTemporaryMatrix) onOpenTemporaryMatrix();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:border-amber-400 transition"
          >
            <CalendarSync className="h-3 w-3 text-indigo-500" />
            <span>Ajustar días de la semana (Matriz)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReorgOpen(false);
              handleAction(
                "Deseo sustituir la sesión de carrera por rodillo en Zona 2 sin impacto articular para proteger articulaciones."
              );
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:border-amber-400 transition"
          >
            <Bike className="h-3 w-3 text-sky-500" />
            <span>Pasar a Rodillo Z2 sin impacto</span>
          </button>
        </div>
      )}
    </div>
  );
};
