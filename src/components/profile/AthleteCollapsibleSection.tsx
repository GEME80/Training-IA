"use client";

import React, { useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";

interface AthleteCollapsibleSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  summaryBadge?: React.ReactNode;
  defaultOpenMobile?: boolean;
  defaultOpenDesktop?: boolean;
  children: React.ReactNode;
}

export const AthleteCollapsibleSection: React.FC<AthleteCollapsibleSectionProps> = ({
  id,
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-sky-500",
  summaryBadge,
  defaultOpenMobile = false,
  defaultOpenDesktop = true,
  children,
}) => {
  // En móvil arranca colapsado si defaultOpenMobile es false; en desktop abierto
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768 ? defaultOpenDesktop : defaultOpenMobile;
    }
    return defaultOpenDesktop;
  });

  return (
    <section
      id={id}
      aria-expanded={isOpen}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden transition-colors"
    >
      {/* Encabezado táctil interactivo */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer select-none"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                {title}
              </h3>
              {summaryBadge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Indicador de colapso */}
        <div className="flex items-center space-x-2 shrink-0 ml-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 hidden sm:inline">
            {isOpen ? "Ocultar" : "Mostrar"}
          </span>
          <div
            className={`p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </button>

      {/* Contenido colapsable */}
      {isOpen && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 p-4 sm:p-5 pt-3 animate-fadeIn">
          {children}
        </div>
      )}
    </section>
  );
};
