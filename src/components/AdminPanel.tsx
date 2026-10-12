"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { AdminSidebarTab } from "./admin/types";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminMobileHeader } from "./admin/AdminMobileHeader";
import { AdminMobileBottomNav } from "./admin/AdminMobileBottomNav";
import { AdminDashboardTab } from "./admin/AdminDashboardTab";
import { AdminUsersTab } from "./admin/AdminUsersTab";
import { AdminPlansTab } from "./admin/AdminPlansTab";
import { AdminAISettingsTab } from "./admin/AdminAISettingsTab";
import { AdminMethodologyTab } from "./admin/AdminMethodologyTab";
import { useAdminPanelData } from "./admin/useAdminPanelData";
import { AdminUserListItem } from "@/lib/db/types";

interface AdminPanelProps {
  onGoBackToDashboard?: () => void;
  onInspectAthlete?: (user: AdminUserListItem) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onGoBackToDashboard, onInspectAthlete }) => {
  const [activeTab, setActiveTab] = useState<AdminSidebarTab>("dashboard");
  const data = useAdminPanelData();

  return (
    <div className="min-h-[85vh] bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row overflow-hidden relative">
      {/* 1. BARRA LATERAL IZQUIERDA (Escritorio lg+) */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={data.stats}
        projectId={data.projectId}
        connections={data.connections}
        isLoading={data.isLoading}
        onRefreshAll={data.handleRefreshAll}
        onGoBackToDashboard={onGoBackToDashboard}
      />

      {/* 2. CABECERA MÓVIL (< lg) */}
      <AdminMobileHeader
        onGoBackToDashboard={onGoBackToDashboard}
        onRefreshAll={data.handleRefreshAll}
        isLoading={data.isLoading}
      />

      {/* 3. CONTENIDO PRINCIPAL */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-9 xl:p-10 overflow-y-auto space-y-5 sm:space-y-7 pb-24 lg:pb-10">
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
            users={data.users}
            onRefreshUsers={data.fetchUsersAndStats}
            showMessage={data.showMessage}
            onEditAthlete={() => setActiveTab("users")}
          />
        )}

        {/* TAB 2: ATLETAS */}
        {activeTab === "users" && (
          <AdminUsersTab
            users={data.users}
            onRefresh={data.fetchUsersAndStats}
            showMessage={data.showMessage}
            onInspectAthlete={onInspectAthlete}
          />
        )}

        {/* TAB 2.5: PLAN ÚNICO & PAGOS BRE-B (BBVA) */}
        {activeTab === "plans" && (
          <AdminPlansTab showMessage={data.showMessage} />
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

      {/* 4. BARRA DE NAVEGACIÓN INFERIOR MÓVIL (< lg) */}
      <AdminMobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingUsersCount={data.stats?.pendingUsers}
      />
    </div>
  );
};
