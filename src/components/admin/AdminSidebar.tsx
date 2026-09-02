"use client";

import React from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Cpu,
  BookOpen,
  ChevronRight,
  RefreshCw,
  FlaskConical,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { AdminSidebarTab, LiveConnectionsData } from "./types";
import { AdminStats } from "@/lib/db/types";

interface AdminSidebarProps {
  activeTab: AdminSidebarTab;
  setActiveTab: (tab: AdminSidebarTab) => void;
  stats: AdminStats | null;
  projectId: string;
  connections: LiveConnectionsData | null;
  isLoading: boolean;
  onRefreshAll: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  projectId,
  connections,
  isLoading,
  onRefreshAll,
}) => {
  return (
    <aside className="w-full md:w-64 bg-slate-50/95 border-b md:border-b-0 md:border-r border-slate-200/90 p-5 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Encabezado de la Consola */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-950 tracking-tight">Centro de Control</h2>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                  En Vivo • On-Demand
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Menú de Navegación Estructurado por Categorías */}
        <nav className="space-y-4">
          {/* GRUPO 1: MONITOREO & SISTEMA */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Monitoreo
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-950"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <LayoutDashboard className={`h-4 w-4 ${activeTab === "dashboard" ? "text-cyan-400" : "text-slate-500"}`} />
                <span>Dashboard General</span>
              </div>
              <ChevronRight className={`h-3.5 w-3.5 ${activeTab === "dashboard" ? "text-cyan-400" : "text-slate-400"}`} />
            </button>
          </div>

          {/* GRUPO 2: GESTIÓN DE ATLETAS */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Comunidad & Accesos
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "users"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-950"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className={`h-4 w-4 ${activeTab === "users" ? "text-cyan-400" : "text-slate-500"}`} />
                <span>Atletas & Usuarios</span>
              </div>
              {stats?.pendingUsers ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white animate-pulse">
                  {stats.pendingUsers}
                </span>
              ) : (
                <ChevronRight className={`h-3.5 w-3.5 ${activeTab === "users" ? "text-cyan-400" : "text-slate-400"}`} />
              )}
            </button>
          </div>

          {/* GRUPO 3: CEREBRO CIENTÍFICO & IA */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Ciencia & Motor IA
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("ai_settings")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "ai_settings"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-950"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Cpu className={`h-4 w-4 ${activeTab === "ai_settings" ? "text-cyan-400" : "text-slate-500"}`} />
                <span>Motor AI & Prompts</span>
              </div>
              <ChevronRight className={`h-3.5 w-3.5 ${activeTab === "ai_settings" ? "text-cyan-400" : "text-slate-400"}`} />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("methodology_programs")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "methodology_programs" || activeTab === "scientific_models" || activeTab === "program_libraries"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-950"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FlaskConical className={`h-4 w-4 ${activeTab === "methodology_programs" || activeTab === "scientific_models" || activeTab === "program_libraries" ? "text-cyan-400" : "text-slate-500"}`} />
                <span>Ciencia & Programas</span>
              </div>
              <ChevronRight className={`h-3.5 w-3.5 ${activeTab === "methodology_programs" || activeTab === "scientific_models" || activeTab === "program_libraries" ? "text-cyan-400" : "text-slate-400"}`} />
            </button>
          </div>
        </nav>
      </div>

      {/* Widget de Salud de Servicios y Conexiones */}
      <div className="pt-6 border-t border-slate-200/90 space-y-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Activity className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[10px] uppercase font-mono font-bold text-slate-600">Salud de Servicios</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Firestore DB:</span>
              <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>En Línea</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Intervals.icu:</span>
              <span className={`font-mono font-bold ${connections?.intervals.status === "OPERATIONAL" ? "text-emerald-700" : "text-slate-700"}`}>
                {connections?.intervals.latencyMs ? `${connections.intervals.latencyMs}ms (Estable)` : "Conectado"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Inferencia Gemini:</span>
              <span className="font-mono text-cyan-700 font-bold">2.5 Flash</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefreshAll}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 text-xs font-bold transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-cyan-600" : ""}`} />
          <span>{isLoading ? "Sincronizando..." : "Actualizar Telemetría"}</span>
        </button>
      </div>
    </aside>
  );
};
