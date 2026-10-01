"use client";

import React from "react";
import {
  TrendingUp,
  Zap,
  BatteryCharging,
  ArrowUpRight,
  Footprints,
  Bike,
  Timer,
  Waves,
  HeartPulse,
  Heart,
  Moon,
  Scale,
  User,
  Gauge,
  LucideIcon,
} from "lucide-react";

export interface MetricCardConfig {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  value: string | number;
  valueColor?: string;
  contextLabel: string;
  tooltip: string;
  hoverBorder: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor?: string;
}

interface PhysiologicalMetricCardProps {
  config: MetricCardConfig;
}

export const PhysiologicalMetricCard: React.FC<PhysiologicalMetricCardProps> = ({ config }) => {
  const Icon = config.icon;

  return (
    <div
      title={config.tooltip}
      className={`group relative rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 sm:p-2.5 shadow-2xs ${config.hoverBorder} transition-all duration-200 flex flex-col justify-between select-none min-w-0`}
    >
      {/* Cabecera de la tarjeta: Icono + Título + Badge */}
      <div className="flex items-center justify-between gap-1 min-w-0">
        <div className="flex items-center space-x-1.5 min-w-0 truncate">
          <div className={`p-1 rounded-lg shrink-0 ${config.iconBgColor || "bg-slate-100 dark:bg-slate-800"}`}>
            <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-tight text-slate-800 dark:text-slate-100 truncate">
            {config.title}
          </span>
        </div>
        <span className={`text-[9px] sm:text-[10px] font-mono font-bold shrink-0 ${config.badgeColor}`}>
          {config.badge}
        </span>
      </div>

      {/* Cuerpo de la tarjeta: Valor + Etiqueta de Contexto */}
      <div className="mt-1.5 sm:mt-2 flex items-baseline justify-between gap-1 min-w-0">
        <span
          className={`text-base sm:text-lg font-black font-mono truncate ${
            config.valueColor || "text-slate-900 dark:text-white"
          }`}
        >
          {config.value}
        </span>
        <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-sans shrink-0 truncate">
          {config.contextLabel}
        </span>
      </div>
    </div>
  );
};

export const METRIC_ICONS_MAP: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  ctl: { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  atl: { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  tsb: { icon: BatteryCharging, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  rampRate: { icon: ArrowUpRight, color: "text-teal-500", bg: "bg-teal-500/10" },
  strydCp: { icon: Footprints, color: "text-amber-500", bg: "bg-amber-500/10" },
  bikeFtp: { icon: Bike, color: "text-sky-500", bg: "bg-sky-500/10" },
  runPace: { icon: Timer, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  swimCss: { icon: Waves, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  hrv: { icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-500/10" },
  restingHr: { icon: Heart, color: "text-purple-500", bg: "bg-purple-500/10" },
  sleep: { icon: Moon, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  wKg: { icon: Scale, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ageBiometrics: { icon: User, color: "text-pink-500", bg: "bg-pink-500/10" },
  efficiencyFactor: { icon: Gauge, color: "text-teal-500", bg: "bg-teal-500/10" },
};
