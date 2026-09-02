"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Layers,
  Target,
  Sparkles,
  HeartPulse,
  Radio,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { PulseLogo } from "../PulseLogo";
import { useAuth } from "@/context/AuthContext";

export type AthleteSidebarNavSection =
  | "dashboard"
  | "season_studio"
  | "head_coach"
  | "physiology";

interface AthleteSidebarProps {
  activeSection: AthleteSidebarNavSection;
  onSelectSection: (section: AthleteSidebarNavSection) => void;
  isIntervalsConnected: boolean;
  isGeminiConnected?: boolean;
  onOpenSeasonStudio?: (tab?: "races" | "plan_generator") => void;
  onOpenCoachChat?: () => void;
  onOpenSettingsTab?: (tab: "connections" | "physiology" | "availability" | "races" | "macrocycle" | "ai" | "intervals") => void;
  onSelectView?: (view: "landing" | "dashboard" | "admin") => void;
}

export const AthleteSidebar: React.FC<AthleteSidebarProps> = ({
  activeSection,
  onSelectSection,
  isIntervalsConnected,
  onSelectView,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { isAdmin } = useAuth();

  const navItems = [
    {
      id: "dashboard" as AthleteSidebarNavSection,
      label: "Mi Dashboard",
      sublabel: "Calendario & Telemetría",
      icon: LayoutDashboard,
    },
    {
      id: "physiology" as AthleteSidebarNavSection,
      label: "Perfil del Atleta",
      sublabel: "Fisiología & Zonas",
      icon: HeartPulse,
    },
    {
      id: "season_studio" as AthleteSidebarNavSection,
      label: "Mi Temporada",
      sublabel: "Plan Activo & Carreras",
      icon: Target,
    },
    {
      id: "head_coach" as AthleteSidebarNavSection,
      label: "Head Coach IA",
      sublabel: "Adaptación en Vivo",
      icon: Sparkles,
    },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen hidden md:flex flex-col justify-between border-r border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl transition-all duration-300 z-30 shrink-0 select-none ${
        isCollapsed ? "w-20" : "w-60"
      }`}
    >
      {/* 1. Header del Sidebar: Logo & Toggle */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        <div
          onClick={() => onSelectView && onSelectView("dashboard")}
          className="cursor-pointer flex items-center overflow-hidden"
        >
          {isCollapsed ? (
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              P
            </div>
          ) : (
            <PulseLogo size="sm" showSubtext={false} />
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shrink-0"
          title={isCollapsed ? "Expandir Menú Lateral" : "Colapsar Menú a Iconos"}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* 2. Cuerpo de Navegación */}
      <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer group text-left border ${
                isActive
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 font-black shadow-xs ring-2 ring-emerald-500/20"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={isCollapsed ? `${item.label} (${item.sublabel})` : undefined}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 group-hover:text-cyan-600"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate leading-tight">{item.label}</span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">
                    {item.sublabel}
                  </span>
                </div>
              )}
            </button>
          );
        })}

        {/* Acceso Especial Admin si aplica */}
        {isAdmin && onSelectView && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
            <button
              type="button"
              onClick={() => onSelectView("admin")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl font-bold text-xs text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
              title={isCollapsed ? "Panel Admin" : undefined}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Shield className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1 text-left">
                  <span className="truncate">Panel Admin</span>
                  <span className="text-[10px] text-purple-400">Control de Sistema</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 3. Footer del Sidebar: Monitor de Conectividad Intervals */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2">
        {!isCollapsed ? (
          <div className="space-y-1.5 text-[11px] font-mono">
            <div
              onClick={() => onSelectSection("physiology")}
              className="flex items-center justify-between p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-slate-300"
              title="Configurar Intervals.icu API en Perfil del Atleta"
            >
              <span className="text-slate-600 dark:text-slate-400 font-sans font-bold">Intervals.icu</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  isIntervalsConnected
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isIntervalsConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                {isIntervalsConnected ? "En Vivo" : "Offline"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isIntervalsConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
              title={isIntervalsConnected ? "Intervals: Conectado" : "Intervals: Desconectado"}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
