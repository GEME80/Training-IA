"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { LandingHome } from "@/components/LandingHome";
import { AthleteDashboard } from "@/components/AthleteDashboard";
import { AdminPanel } from "@/components/AdminPanel";
import { RestrictedAccessView } from "@/components/RestrictedAccessView";

export default function HomePage() {
  const {
    user,
    userProfile,
    isAdmin,
    isActive,
    isPending,
    isDisabled,
    loading: authLoading,
    signInWithGoogle,
  } = useAuth();

  const [mounted, setMounted] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<"landing" | "dashboard" | "admin">("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<"connections" | "physiology" | "availability" | "races" | "macrocycle" | "ai" | "intervals">("connections");
  const [isSeasonStudioOpen, setIsSeasonStudioOpen] = useState<boolean>(false);
  const [seasonStudioTab, setSeasonStudioTab] = useState<"races" | "plan_generator">("plan_generator");
  const [isIntervalsConnected, setIsIntervalsConnected] = useState<boolean>(false);
  const [isGeminiConnected, setIsGeminiConnected] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. SSR / Carga Inicial Segura (Evita Hydration Mismatch #418)
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <span className="text-xs font-mono font-bold text-emerald-700">PULSE AI • Iniciando...</span>
      </div>
    );
  }

  // 2. Si el usuario está deshabilitado -> Redirección a aviso de restricción
  if (user && isDisabled) {
    return <RestrictedAccessView status="disabled" />;
  }

  // 3. Si el usuario está pendiente de aprobación -> Redirección a espera de aprobación
  if (user && isPending) {
    return <RestrictedAccessView status="pending" />;
  }

  // 4. Si el usuario no está autenticado -> Mostrar Header unificado + Landing Page pública
  if (!user && !userProfile) {
    return (
      <div className="min-h-screen bg-transparent text-slate-900 flex flex-col justify-between font-sans">
        <Header
          activeView="landing"
          onSelectView={(v) => setCurrentView(v)}
          onOpenSettings={() => {}}
          isIntervalsConnected={false}
          isGeminiConnected={false}
        />
        <LandingHome
          onLoginWithGoogle={signInWithGoogle}
          onGoToDashboard={() => setCurrentView("dashboard")}
          isAuthenticated={false}
        />
      </div>
    );
  }

  // 5. Usuario autenticado y activo -> Navegación fluida según permisos
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors font-sans">
      {/* VISTA 1: LANDING PAGE */}
      {currentView === "landing" ? (
        <div className="min-h-screen flex flex-col justify-between">
          <Header
            activeView="landing"
            onSelectView={(v) => setCurrentView(v)}
            onOpenSettings={() => {}}
            isIntervalsConnected={isIntervalsConnected}
            isGeminiConnected={isGeminiConnected}
          />
          <LandingHome
            onLoginWithGoogle={signInWithGoogle}
            onGoToDashboard={() => setCurrentView("dashboard")}
            isAuthenticated={true}
            userEmail={user?.email || userProfile?.email || undefined}
            userName={userProfile?.displayName || user?.displayName || undefined}
          />
        </div>
      ) : currentView === "admin" && isAdmin ? (
        /* VISTA 2: ADMIN PANEL */
        <div className="min-h-screen flex flex-col justify-between">
          <div>
            <Header
              athleteName={userProfile?.displayName || user?.displayName || "Germán Morales"}
              athleteId={userProfile?.intervalsAthleteId || "i442091"}
              activeView="admin"
              onSelectView={(v) => setCurrentView(v)}
              isIntervalsConnected={isIntervalsConnected}
              isGeminiConnected={isGeminiConnected}
            />
            <main className="py-2.5 sm:py-6 max-w-7xl mx-auto px-2.5 sm:px-6">
              <AdminPanel onGoBackToDashboard={() => setCurrentView("dashboard")} />
            </main>
          </div>
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
              <p>PULSE AI PRO © 2026 • Admin Console</p>
              <button
                type="button"
                onClick={() => setCurrentView("dashboard")}
                className="hover:text-cyan-600 font-bold transition cursor-pointer"
              >
                ← Volver al Dashboard
              </button>
            </div>
          </footer>
        </div>
      ) : (
        /* VISTA 3: DASHBOARD DEL ATLETA UNIFICADO (Sidebar Continuo de borde a borde) */
        <AthleteDashboard
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          settingsTab={settingsTab}
          setSettingsTab={setSettingsTab}
          isSeasonStudioOpen={isSeasonStudioOpen}
          setIsSeasonStudioOpen={setIsSeasonStudioOpen}
          seasonStudioTab={seasonStudioTab}
          setSeasonStudioTab={setSeasonStudioTab}
          onSelectView={(v) => setCurrentView(v)}
          onLiveConnectedChange={(connected) => setIsIntervalsConnected(connected)}
          onGeminiConnectedChange={(connected) => setIsGeminiConnected(connected)}
        />
      )}
    </div>
  );
}
