"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Cpu,
  FlaskConical,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { AdminSidebarTab } from "./admin/types";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminDashboardTab } from "./admin/AdminDashboardTab";
import { AdminUsersTab } from "./admin/AdminUsersTab";
import { AdminAISettingsTab } from "./admin/AdminAISettingsTab";
import { AdminMethodologyTab } from "./admin/AdminMethodologyTab";
import { useAdminPanelData } from "./admin/useAdminPanelData";

interface AdminPanelProps {
  onGoBackToDashboard?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onGoBackToDashboard }) => {
  const [activeTab, setActiveTab] = useState<AdminSidebarTab>("dashboard");
  const data = useAdminPanelData();

  return (
    <div className="min-h-[85vh] bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col md:flex-row overflow-hidden">
      {/* 1. BARRA LATERAL IZQUIERDA (Solo visible en Escritorio md+) */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={data.stats}
        projectId={data.projectId}
        connections={data.connections}
        isLoading={data.isLoading}
        onRefreshAll={data.handleRefreshAll}
      />

      {/* 2. NAVEGACIÓN MÓVIL SUPERIOR ERGONÓMICA (< md) */}
      <div className="md:hidden border-b border-slate-200/90 bg-slate-50/95 p-3 space-y-2.5 shrink-0">
        {/* Fila 1: Título de Consola y Retorno Rápido al Dashboard */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-950 leading-tight">Consola de Control</h2>
              <div className="flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-mono text-emerald-700 font-bold uppercase">En Vivo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={data.handleRefreshAll}
              disabled={data.isLoading}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer disabled:opacity-50"
              title="Actualizar telemetría"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${data.isLoading ? "animate-spin text-cyan-600" : ""}`} />
            </button>

            {onGoBackToDashboard && (
              <button
                type="button"
                onClick={onGoBackToDashboard}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-bold hover:bg-cyan-100 transition cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Dashboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Fila 2: Selector Táctil Horizontal de Pestañas */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-bounce pb-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className={`h-3.5 w-3.5 ${activeTab === "dashboard" ? "text-cyan-400" : "text-slate-500"}`} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className={`h-3.5 w-3.5 ${activeTab === "users" ? "text-cyan-400" : "text-slate-500"}`} />
            <span>Atletas</span>
            {data.stats?.pendingUsers ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-white animate-pulse">
                {data.stats.pendingUsers}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai_settings")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              activeTab === "ai_settings"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Cpu className={`h-3.5 w-3.5 ${activeTab === "ai_settings" ? "text-cyan-400" : "text-slate-500"}`} />
            <span>Motor IA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("methodology_programs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              activeTab === "methodology_programs" || activeTab === "scientific_models" || activeTab === "program_libraries"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FlaskConical className={`h-3.5 w-3.5 ${activeTab === "methodology_programs" || activeTab === "scientific_models" || activeTab === "program_libraries" ? "text-cyan-400" : "text-slate-500"}`} />
            <span>Ciencia</span>
          </button>
        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto space-y-4 sm:space-y-6">
        {/* Toast Notificación */}
        {data.actionMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2 shadow-md ${
              data.actionMessage.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-rose-50 text-rose-900 border border-rose-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              {data.actionMessage.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{data.actionMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => data.setActionMessage(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <AdminDashboardTab
            tokenPeriod={data.tokenPeriod}
            setTokenPeriod={data.setTokenPeriod}
            tokenTelemetry={data.tokenTelemetry}
            stats={data.stats}
            firestoreStats={data.firestoreStats}
          />
        )}

        {/* TAB 2: ATLETAS */}
        {activeTab === "users" && (
          <AdminUsersTab
            users={data.users}
            onRefresh={data.fetchUsersAndStats}
            showMessage={data.showMessage}
          />
        )}

        {/* TAB 3: MOTOR AI & PROMPTS */}
        {activeTab === "ai_settings" && (
          <AdminAISettingsTab
            aiSettings={data.aiSettings}
            setAiSettings={data.setAiSettings}
            availableModels={data.availableModels}
            isLoadingModels={data.isLoadingModels}
            fetchGeminiModels={data.fetchGeminiModels}
            prompts={data.prompts}
            setPrompts={data.setPrompts}
            onSaveAISettings={data.handleSaveAISettings}
            isSavingAI={data.isSavingAI}
            onSavePrompts={data.handleSavePrompts}
            isSavingPrompts={data.isSavingPrompts}
          />
        )}

        {/* TAB 4: CIENCIA & PROGRAMAS */}
        {(activeTab === "methodology_programs" ||
          activeTab === "scientific_models" ||
          activeTab === "program_libraries") && (
          <AdminMethodologyTab
            programs={data.programs}
            isLoadingPrograms={data.isLoadingPrograms}
            onRefreshPrograms={data.fetchPrograms}
            showMessage={data.showMessage}
            getAuthParams={data.getAuthParams}
            initialSubTab={
              activeTab === "scientific_models"
                ? "models"
                : activeTab === "program_libraries"
                ? "programs"
                : "programs"
            }
          />
        )}
      </main>
    </div>
  );
};
