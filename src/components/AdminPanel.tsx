"use client";

import React, { useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { AdminSidebarTab } from "./admin/types";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminDashboardTab } from "./admin/AdminDashboardTab";
import { AdminUsersTab } from "./admin/AdminUsersTab";
import { AdminAISettingsTab } from "./admin/AdminAISettingsTab";
import { AdminMethodologyTab } from "./admin/AdminMethodologyTab";
import { useAdminPanelData } from "./admin/useAdminPanelData";

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminSidebarTab>("dashboard");
  const data = useAdminPanelData();

  return (
    <div className="min-h-[85vh] bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col md:flex-row overflow-hidden">
      {/* 1. BARRA LATERAL IZQUIERDA */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={data.stats}
        projectId={data.projectId}
        connections={data.connections}
        isLoading={data.isLoading}
        onRefreshAll={data.handleRefreshAll}
      />

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
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
