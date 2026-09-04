"use client";

import React from "react";
import { Footprints, Bike, HeartPulse, Zap, Activity } from "lucide-react";

interface AthleteZonesViewerProps {
  runFtp: number;
  bikeFtp: number;
  lthr: number;
  maxHR: number;
}

export const AthleteZonesViewer: React.FC<AthleteZonesViewerProps> = ({
  runFtp = 0,
  bikeFtp = 0,
  lthr = 0,
  maxHR = 0,
}) => {
  // 1. ZONAS STRYD RUNNING POWER (Estilo exacto Stryd / Intervals)
  const strydZones = [
    {
      id: "Z1",
      name: "Fácil",
      nameColor: "text-amber-500 dark:text-amber-400",
      pct: "65 - 80 % CP",
      range: runFtp > 0 ? `${Math.round(runFtp * 0.65)} - ${Math.round(runFtp * 0.80)} W` : "—",
    },
    {
      id: "Z2",
      name: "Moderado",
      nameColor: "text-amber-600 dark:text-amber-300",
      pct: "80 - 90 % CP",
      range: runFtp > 0 ? `${Math.round(runFtp * 0.80)} - ${Math.round(runFtp * 0.90)} W` : "—",
    },
    {
      id: "Z3",
      name: "Umbral",
      nameColor: "text-orange-500 dark:text-orange-400",
      pct: "90 - 100 % CP",
      range: runFtp > 0 ? `${Math.round(runFtp * 0.90)} - ${runFtp} W` : "—",
    },
    {
      id: "Z4",
      name: "Intervalo",
      nameColor: "text-orange-600 dark:text-orange-500",
      pct: "100 - 115 % CP",
      range: runFtp > 0 ? `${runFtp} - ${Math.round(runFtp * 1.15)} W` : "—",
    },
    {
      id: "Z5",
      name: "Repetición",
      nameColor: "text-rose-600 dark:text-rose-400",
      pct: "115 - 300 % CP",
      range: runFtp > 0 ? `${Math.round(runFtp * 1.15)}+ W` : "—",
    },
    {
      id: "SS",
      name: "Sweet Spot",
      nameColor: "text-teal-600 dark:text-teal-400",
      pct: "84 - 97 % CP",
      range: runFtp > 0 ? `${Math.round(runFtp * 0.84)} - ${Math.round(runFtp * 0.97)} W` : "—",
    },
  ];

  // 2. ZONAS CICLISMO POWER COGGAN
  const cyclingZones = [
    { id: "Z1", name: "Recuperación", nameColor: "text-slate-600 dark:text-slate-400", pct: "< 55% FTP", range: bikeFtp > 0 ? `< ${Math.round(bikeFtp * 0.55)} W` : "—" },
    { id: "Z2", name: "Resistencia (Fondo)", nameColor: "text-sky-600 dark:text-sky-400", pct: "56 - 75% FTP", range: bikeFtp > 0 ? `${Math.round(bikeFtp * 0.56)} - ${Math.round(bikeFtp * 0.75)} W` : "—" },
    { id: "Z3", name: "Tempo", nameColor: "text-teal-600 dark:text-teal-400", pct: "76 - 90% FTP", range: bikeFtp > 0 ? `${Math.round(bikeFtp * 0.76)} - ${Math.round(bikeFtp * 0.90)} W` : "—" },
    { id: "Z4", name: "Umbral (FTP)", nameColor: "text-emerald-600 dark:text-emerald-400", pct: "91 - 105% FTP", range: bikeFtp > 0 ? `${Math.round(bikeFtp * 0.91)} - ${Math.round(bikeFtp * 1.05)} W` : "—" },
    { id: "Z5", name: "VO2max", nameColor: "text-amber-600 dark:text-amber-400", pct: "106 - 120% FTP", range: bikeFtp > 0 ? `${Math.round(bikeFtp * 1.06)} - ${Math.round(bikeFtp * 1.20)} W` : "—" },
    { id: "Z6", name: "Cap. Anaeróbica", nameColor: "text-orange-600 dark:text-orange-400", pct: "121 - 150% FTP", range: bikeFtp > 0 ? `${Math.round(bikeFtp * 1.21)} - ${Math.round(bikeFtp * 1.50)} W` : "—" },
    { id: "Z7", name: "Neuromuscular", nameColor: "text-rose-600 dark:text-rose-400", pct: "> 150% FTP", range: bikeFtp > 0 ? `> ${Math.round(bikeFtp * 1.50)} W` : "—" },
  ];

  // 3. ZONAS FRECUENCIA CARDÍACA (Intervals / LTHR)
  const hrZones = [
    { id: "Z1", name: "Recovery", nameColor: "text-slate-600 dark:text-slate-400", pct: "0 - 83% LTHR", range: lthr > 0 ? `0 - ${Math.round(lthr * 0.83)} bpm` : "—" },
    { id: "Z2", name: "Aerobic", nameColor: "text-sky-600 dark:text-sky-400", pct: "83 - 88% LTHR", range: lthr > 0 ? `${Math.round(lthr * 0.83) + 1} - ${Math.round(lthr * 0.88)} bpm` : "—" },
    { id: "Z3", name: "Tempo", nameColor: "text-teal-600 dark:text-teal-400", pct: "88 - 92% LTHR", range: lthr > 0 ? `${Math.round(lthr * 0.88) + 1} - ${Math.round(lthr * 0.92)} bpm` : "—" },
    { id: "Z4", name: "SubThreshold", nameColor: "text-emerald-600 dark:text-emerald-400", pct: "93 - 98% LTHR", range: lthr > 0 ? `${Math.round(lthr * 0.93)} - ${Math.round(lthr * 0.98)} bpm` : "—" },
    { id: "Z5", name: "SuperThreshold", nameColor: "text-amber-600 dark:text-amber-400", pct: "98 - 100% LTHR", range: lthr > 0 ? `${Math.round(lthr * 0.98) + 1} - ${lthr} bpm` : "—" },
    { id: "Z6", name: "Aerobic Capacity", nameColor: "text-orange-600 dark:text-orange-400", pct: "101 - 103% LTHR", range: lthr > 0 ? `${lthr + 1} - ${Math.round(lthr * 1.03)} bpm` : "—" },
    { id: "Z7", name: "Anaerobic", nameColor: "text-rose-600 dark:text-rose-400", pct: "104%+ LTHR", range: lthr > 0 ? `${Math.round(lthr * 1.04)} - ${maxHR > 0 ? `${maxHR} bpm` : "Máx"}` : "—" },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-sky-500" />
          Zonas de Entrenamiento Fisiológicas (Intervals.icu & Stryd)
        </h4>
      </div>

      {/* 3 Columnas Verticales Tabulares en Paralelo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* COLUMNA 1: STRYD RUNNING POWER */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Footprints className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900 dark:text-white">
                  Potencia Carrera (Stryd)
                </h5>
                <span className="text-[10px] font-mono text-slate-400">Zonas Stryd Power</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black font-mono text-amber-600 dark:text-amber-400">
                {runFtp > 0 ? `${runFtp} W` : "— W"}
              </span>
              <span className="block text-[9px] font-mono text-slate-400">CP</span>
            </div>
          </div>

          <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {strydZones.map((z) => (
              <div key={z.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 w-5">{z.id}</span>
                  <span className={`font-bold ${z.nameColor}`}>{z.name}</span>
                </div>
                <div className="text-right flex items-center space-x-3">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{z.pct}</span>
                  <strong className="text-slate-900 dark:text-white w-24 text-right">{z.range}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 2: CICLISMO POWER */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Bike className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900 dark:text-white">
                  Potencia Ciclismo (FTP)
                </h5>
                <span className="text-[10px] font-mono text-slate-400">Coggan Power</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black font-mono text-sky-600 dark:text-sky-400">
                {bikeFtp > 0 ? `${bikeFtp} W` : "— W"}
              </span>
              <span className="block text-[9px] font-mono text-slate-400">FTP</span>
            </div>
          </div>

          <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {cyclingZones.map((z) => (
              <div key={z.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 w-5">{z.id}</span>
                  <span className={`font-bold ${z.nameColor}`}>{z.name}</span>
                </div>
                <div className="text-right flex items-center space-x-3">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{z.pct}</span>
                  <strong className="text-slate-900 dark:text-white w-24 text-right">{z.range}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 3: FRECUENCIA CARDÍACA */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <HeartPulse className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900 dark:text-white">
                  Frecuencia Cardíaca
                </h5>
                <span className="text-[10px] font-mono text-slate-400">{lthr > 0 ? `LTHR ${lthr} bpm` : "Sin LTHR"}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">
                {lthr > 0 ? `${lthr} bpm` : "— bpm"}
              </span>
              <span className="block text-[9px] font-mono text-slate-400">Umbral</span>
            </div>
          </div>

          <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {hrZones.map((z) => (
              <div key={z.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 w-5">{z.id}</span>
                  <span className={`font-bold ${z.nameColor}`}>{z.name}</span>
                </div>
                <div className="text-right flex items-center space-x-3">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{z.pct}</span>
                  <strong className="text-slate-900 dark:text-white w-24 text-right">{z.range}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
