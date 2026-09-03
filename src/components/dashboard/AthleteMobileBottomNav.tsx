"use client";

import React from "react";
import { LayoutDashboard, Target, Sparkles, HeartPulse } from "lucide-react";
import { AthleteSidebarNavSection } from "./AthleteSidebar";

interface AthleteMobileBottomNavProps {
  activeSection: AthleteSidebarNavSection;
  onSelectSection: (section: AthleteSidebarNavSection) => void;
  isIntervalsConnected?: boolean;
}

export const AthleteMobileBottomNav: React.FC<AthleteMobileBottomNavProps> = ({
  activeSection,
  onSelectSection,
  isIntervalsConnected = false,
}) => {
  const tabs = [
    {
      id: "dashboard" as AthleteSidebarNavSection,
      label: "Hoy",
      sublabel: "Dashboard",
      icon: LayoutDashboard,
      badge: isIntervalsConnected ? "live" : undefined,
    },
    {
      id: "season_studio" as AthleteSidebarNavSection,
      label: "Temporada",
      sublabel: "Plan Activo",
      icon: Target,
    },
    {
      id: "head_coach" as AthleteSidebarNavSection,
      label: "Coach IA",
      sublabel: "Adaptación",
      icon: Sparkles,
      highlight: true,
    },
    {
      id: "physiology" as AthleteSidebarNavSection,
      label: "Perfil",
      sublabel: "Fisiología",
      icon: HeartPulse,
    },
  ];

  return (
    <nav
      aria-label="Navegación Móvil Principal"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/90 dark:border-slate-800 pb-safe pt-1.5 px-3 shadow-[0_-4px_25px_rgba(0,0,0,0.07)] transition-all select-none"
    >
      <div className="grid grid-cols-4 items-center gap-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSection(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-150 touch-bounce cursor-pointer group ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-400 font-black"
                  : "text-slate-400 hover:text-slate-700 dark:text-slate-400 font-medium"
              }`}
            >
              {/* Contenedor del Icono con fondo activo sutil */}
              <div
                className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-all ${
                  isActive
                    ? tab.highlight
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-xs scale-105"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : tab.highlight
                    ? "text-teal-600 dark:text-teal-400 group-hover:bg-slate-100"
                    : "text-slate-400 group-hover:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />

                {/* Badge en vivo para Dashboard */}
                {tab.badge === "live" && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex h-2 w-2"
                    title="Intervals.icu Conectado"
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
              </div>

              {/* Etiqueta de Texto */}
              <span
                className={`text-[10px] tracking-tight leading-none mt-1 truncate max-w-[70px] ${
                  isActive ? "font-black" : "font-semibold"
                }`}
              >
                {tab.label}
              </span>

              {/* Micro-indicador de barra activa inferior */}
              {isActive && (
                <span className="absolute -bottom-1 h-0.5 w-6 rounded-full bg-emerald-500 animate-in fade-in zoom-in-50 duration-150" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
