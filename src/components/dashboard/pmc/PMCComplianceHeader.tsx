"use client";

import React, { useMemo } from "react";
import { Activity, TrendingUp, Zap, Clock } from "lucide-react";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { PMCHistoricalSummary } from "@/lib/physiology/pmcEngine";

interface PMCComplianceHeaderProps {
  summary: PMCHistoricalSummary;
  blueprint: MacrocycleBlueprint | null;
  actualTss: number;
  plannedTss: number;
  actualHours: number;
  plannedHours: number;
  activeRampRate?: number;
}

function getWeekContext(blueprint: MacrocycleBlueprint | null): string {
  const d = new Date();
  const day = d.getDay();
  const diffMon = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diffMon);
  const sunday = new Date(monday.getTime() + 6 * 86400000);

  // Número de semana ISO
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  const isoWeek = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const rangeStr = `${monday.getDate()} al ${sunday.getDate()} ${months[sunday.getMonth()]}`;

  const monStr = monday.toISOString().split("T")[0];
  const todayStr = d.toISOString().split("T")[0];
  const bpWeek = blueprint?.weeks?.find(
    (w) => w.startDate === monStr || (w.startDate <= todayStr && todayStr <= w.endDate)
  );

  if (bpWeek) {
    return `Cumplimiento Semanal · Semana ${bpWeek.weekNumber} (${rangeStr})`;
  }
  return `Cumplimiento Semanal · Semana ${isoWeek} (${rangeStr})`;
}

export const PMCComplianceHeader: React.FC<PMCComplianceHeaderProps> = ({
  summary,
  blueprint,
  actualTss,
  plannedTss,
  actualHours,
  plannedHours,
  activeRampRate,
}) => {
  const weekLabel = useMemo(() => getWeekContext(blueprint), [blueprint]);

  const currentCtl = summary.lastKnownCtl || 0;
  const plannedCtl = summary.plannedCtlToday || (blueprint?.weeks?.[0]?.targetTss ? Math.round(blueprint.weeks[0].targetTss / 7) : currentCtl);
  const ctlGap = Math.round((currentCtl - plannedCtl) * 10) / 10;
  const ctlGapStr = ctlGap > 0 ? `+${ctlGap}` : `${ctlGap}`;

  const ramp = activeRampRate !== undefined ? activeRampRate : (summary.avgRampRate || 0);
  const rampStr = ramp > 0 ? `+${ramp}` : `${ramp}`;

  // TSS
  const tssTarget = plannedTss > 0 ? plannedTss : Math.max(actualTss, 1);
  const tssPercent = Math.round((actualTss / tssTarget) * 100);
  const tssBarWidth = Math.min(100, Math.max(0, tssPercent));
  const tssColor = tssPercent >= 90 ? "bg-emerald-500" : tssPercent >= 70 ? "bg-amber-500" : "bg-sky-500";

  // Horas
  const hoursTarget = plannedHours > 0 ? plannedHours : Math.max(actualHours, 0.1);
  const hoursPercent = Math.round((actualHours / hoursTarget) * 100);
  const hoursBarWidth = Math.min(100, Math.max(0, hoursPercent));
  const hoursColor = hoursPercent >= 80 ? "bg-emerald-500" : "bg-purple-600";

  return (
    <div className="space-y-2 select-none">
      {/* Etiqueta de microciclo activo */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10.5px] font-mono font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {weekLabel}
        </span>
      </div>

      {/* ── MÓVIL (< 768px): Rejilla 2x2 compacta de micro-cards (≤ 72px) ── */}
      <div className="grid md:hidden grid-cols-2 gap-2 text-xs font-mono tabular-nums">
        {/* Fila 1 - Col 1: Fitness Biológico (CTL) */}
        <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-sans font-bold uppercase">
            <span>Fitness (CTL)</span>
            <span className={`px-1 py-0.2 rounded font-mono font-black ${ctlGap >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
              Δ {ctlGapStr}
            </span>
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
            <span className="text-sky-600 dark:text-sky-400 font-black">{currentCtl.toFixed(1)}</span>
            <span className="text-slate-400 font-normal"> / </span>
            <span className="text-slate-500 dark:text-slate-400">{plannedCtl.toFixed(1)}</span>
            <span className="text-[8px] text-slate-400 ml-1 font-sans">Obj</span>
          </div>
        </div>

        {/* Fila 1 - Col 2: Tasa de Rampa Semanal */}
        <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-sans font-bold uppercase">
            <span>Rampa Semanal</span>
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5 flex items-baseline gap-1">
            <span className={ramp >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}>
              {rampStr}
            </span>
            <span className="text-[8px] text-slate-400 font-sans">CTL/sem</span>
          </div>
        </div>

        {/* Fila 2 - Col 1: Carga Estructural (TSS) */}
        <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-sans font-bold uppercase">
            <span>Carga (TSS)</span>
            <span className="text-[8px] font-mono font-bold text-slate-500">{tssPercent}%</span>
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
            <span>{actualTss}</span>
            <span className="text-slate-400 font-normal"> / </span>
            <span className="text-slate-500 dark:text-slate-400">{plannedTss > 0 ? plannedTss : actualTss}</span>
            <span className="text-[8px] text-slate-400 ml-0.5 font-sans">TSS</span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1">
            <div className={`h-full rounded-full ${tssColor}`} style={{ width: `${tssBarWidth}%` }} />
          </div>
        </div>

        {/* Fila 2 - Col 2: Volumen Mecánico (Horas) */}
        <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-sans font-bold uppercase">
            <span>Volumen</span>
            <span className="text-[8px] font-mono font-bold text-slate-500">{hoursPercent}%</span>
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
            <span>{actualHours.toFixed(1)}</span>
            <span className="text-slate-400 font-normal"> / </span>
            <span className="text-slate-500 dark:text-slate-400">{plannedHours.toFixed(1)}</span>
            <span className="text-[8px] text-slate-400 ml-0.5 font-sans">hrs</span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1">
            <div className={`h-full rounded-full ${hoursColor}`} style={{ width: `${hoursBarWidth}%` }} />
          </div>
        </div>
      </div>

      {/* ── DESKTOP (>= 768px): Fila horizontal de 4 tarjetas ── */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tarjeta 1: Fitness (CTL) */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-sky-500" />
              Fitness Biológico (CTL)
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${ctlGap >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
              Δ {ctlGapStr} pts
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono tabular-nums flex items-baseline gap-1">
            <span className="text-sky-600 dark:text-sky-400">{currentCtl.toFixed(1)}</span>
            <span className="text-slate-400 font-normal text-sm"> / </span>
            <span className="text-slate-500 dark:text-slate-400 text-base">{plannedCtl.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-sans ml-1">Obj</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {ctlGap >= 0 ? "Aptitud alineada a la curva del plan" : "Diferencia acumulada frente al objetivo"}
          </p>
        </div>

        {/* Tarjeta 2: Tasa de Rampa */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              Tasa de Rampa Semanal
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Zona Segura
            </span>
          </div>
          <div className="text-xl font-black font-mono tabular-nums flex items-baseline gap-1">
            <span className={ramp >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}>
              {rampStr}
            </span>
            <span className="text-xs text-slate-400 font-sans ml-1">CTL / sem</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Progresión de carga dentro de umbrales óptimos
          </p>
        </div>

        {/* Tarjeta 3: Carga de Microciclo (TSS) */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Carga Estructural (TSS)
            </span>
            <span className="text-xs font-mono font-black text-slate-600 dark:text-slate-300">
              {tssPercent}%
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono tabular-nums flex items-baseline gap-1">
            <span>{actualTss}</span>
            <span className="text-slate-400 font-normal text-sm"> / </span>
            <span className="text-slate-500 dark:text-slate-400 text-base">{plannedTss > 0 ? plannedTss : actualTss}</span>
            <span className="text-xs text-slate-400 font-sans ml-1">TSS</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full ${tssColor}`} style={{ width: `${tssBarWidth}%` }} />
          </div>
        </div>

        {/* Tarjeta 4: Volumen (Horas) */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-purple-600" />
              Volumen Mecánico (Horas)
            </span>
            <span className="text-xs font-mono font-black text-slate-600 dark:text-slate-300">
              {hoursPercent}%
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono tabular-nums flex items-baseline gap-1">
            <span>{actualHours.toFixed(1)}</span>
            <span className="text-slate-400 font-normal text-sm"> / </span>
            <span className="text-slate-500 dark:text-slate-400 text-base">{plannedHours.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-sans ml-1">hrs</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full ${hoursColor}`} style={{ width: `${hoursBarWidth}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
