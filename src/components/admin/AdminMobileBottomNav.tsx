"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Users,
  BookOpen,
  Sliders,
  CreditCard,
  Cpu,
  X,
  ChevronRight,
} from "lucide-react";
import { AdminSidebarTab } from "./types";

interface AdminMobileBottomNavProps {
  activeTab: AdminSidebarTab;
  setActiveTab: (tab: AdminSidebarTab) => void;
  pendingUsersCount?: number;
}

export const AdminMobileBottomNav: React.FC<AdminMobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  pendingUsersCount,
}) => {
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState<boolean>(false);

  const isSettingsActive = activeTab === "plans" || activeTab === "ai_settings";

  const handleSelectTab = (tab: AdminSidebarTab) => {
    setActiveTab(tab);
    setIsSettingsDrawerOpen(false);
  };

  return (
    <>
      {/* 1. Modal / Drawer Táctil de Ajustes del Administrador */}
      {isSettingsDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end animate-fadeIn"
          style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
        >
          <div className="absolute inset-0 -z-10" onClick={() => setIsSettingsDrawerOpen(false)} />

          <div className="relative w-full rounded-t-[28px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl transition-all max-h-[80vh] overflow-y-auto">
            {/* Manija táctil */}
            <div className="w-full flex justify-center pb-1">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ajustes & Motores</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSelectTab("plans")}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition text-left cursor-pointer ${
                  activeTab === "plans"
                    ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Plan Único & Bre-B</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Tarifas, datos bancarios BBVA y QR</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab("ai_settings")}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition text-left cursor-pointer ${
                  activeTab === "ai_settings"
                    ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center shrink-0">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Motor AI & Prompts</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Modelos Gemini, temperatura y SSOT</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Barra Inferior Fija de Navegación Móvil */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-lg select-none"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        {/* Tab 1: Finanzas / Dashboard */}
        <button
          type="button"
          onClick={() => handleSelectTab("dashboard")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer min-w-[62px] ${
            activeTab === "dashboard"
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
          }`}
        >
          <BarChart3 className={`h-4.5 w-4.5 mb-0.5 transition-transform ${activeTab === "dashboard" ? "scale-110" : ""}`} />
          <span className="text-[10px] tracking-tight">Finanzas</span>
        </button>

        {/* Tab 2: Atletas */}
        <button
          type="button"
          onClick={() => handleSelectTab("users")}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer min-w-[62px] ${
            activeTab === "users"
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
          }`}
        >
          <Users className={`h-4.5 w-4.5 mb-0.5 transition-transform ${activeTab === "users" ? "scale-110" : ""}`} />
          <span className="text-[10px] tracking-tight">Atletas</span>
          {Boolean(pendingUsersCount && pendingUsersCount > 0) && (
            <span className="absolute top-0 right-3 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          )}
        </button>

        {/* Tab 3: Programas */}
        <button
          type="button"
          onClick={() => handleSelectTab("methodology_programs")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer min-w-[62px] ${
            activeTab === "methodology_programs" || activeTab === "scientific_models" || activeTab === "program_libraries"
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
          }`}
        >
          <BookOpen className={`h-4.5 w-4.5 mb-0.5 transition-transform ${activeTab === "methodology_programs" || activeTab === "scientific_models" || activeTab === "program_libraries" ? "scale-110" : ""}`} />
          <span className="text-[10px] tracking-tight">Programas</span>
        </button>

        {/* Tab 4: Ajustes (Modal Drawer) */}
        <button
          type="button"
          onClick={() => setIsSettingsDrawerOpen((prev) => !prev)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer min-w-[62px] ${
            isSettingsActive || isSettingsDrawerOpen
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
          }`}
        >
          <Sliders className={`h-4.5 w-4.5 mb-0.5 transition-transform ${isSettingsActive || isSettingsDrawerOpen ? "scale-110" : ""}`} />
          <span className="text-[10px] tracking-tight">Ajustes</span>
        </button>
      </nav>
    </>
  );
};
