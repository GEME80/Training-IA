"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { LandingHome } from "@/components/LandingHome";
import { AthleteDashboard } from "@/components/AthleteDashboard";
import { AdminPanel } from "@/components/AdminPanel";
import { RestrictedAccessView } from "@/components/RestrictedAccessView";
import { GmcPaywallLockView } from "@/components/billing/GmcPaywallLockView";
import { AuthModal } from "@/components/auth/AuthModal";
import { purgeLegacyGlobalStorage } from "@/lib/storage/userStorage";
import { AdminImpersonationBanner } from "@/components/admin/AdminImpersonationBanner";
import { AdminUserListItem } from "@/lib/db/types";

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
    signOutUser,
    refreshProfile,
  } = useAuth();

  const [mounted, setMounted] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<"landing" | "dashboard" | "admin">("dashboard");
  const [previewAthlete, setPreviewAthlete] = useState<AdminUserListItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<"connections" | "physiology" | "availability" | "races" | "macrocycle" | "ai" | "intervals">("connections");
  const [isSeasonStudioOpen, setIsSeasonStudioOpen] = useState<boolean>(false);
  const [seasonStudioTab, setSeasonStudioTab] = useState<"races" | "plan_generator">("plan_generator");
  const [isIntervalsConnected, setIsIntervalsConnected] = useState<boolean>(false);
  const [isGeminiConnected, setIsGeminiConnected] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState<string | null>(null);
  const hasHandledPaymentRef = React.useRef<boolean>(false);

  const handleOpenAuthModal = (tab: "login" | "register" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    purgeLegacyGlobalStorage();
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "admin") {
        setCurrentView("admin");
      }
      if (params.get("payment") === "complete" && !hasHandledPaymentRef.current) {
        hasHandledPaymentRef.current = true;
        setPaymentSuccessNotice("¡Membresía Atleta Pro Activada con Éxito! Tu suscripción ha sido confirmada por Openpay BBVA.");
        
        const orderId = params.get("order_id");
        const subId = userProfile?.uid || user?.uid;

        // Limpiar inmediatamente los query params de la URL para evitar recargas en bucle
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("payment");
        cleanUrl.searchParams.delete("order_id");
        cleanUrl.searchParams.delete("sandbox_demo");
        cleanUrl.searchParams.delete("sandbox_simulated");
        window.history.replaceState({}, "", cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : ""));

        if (subId) {
          fetch("/api/billing/openpay/confirm-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscriberId: subId, orderId }),
          })
            .then(() => refreshProfile())
            .catch(() => {});
        }
      }
    }
  }, [user?.uid]);

  // 1. SSR / Carga Inicial Segura (Evita Hydration Mismatch #418)
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <span className="text-xs font-mono font-bold text-emerald-700">PULSE ENDURANCE • Iniciando...</span>
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

  // 3.5. Si el atleta no es admin y su membresía está vencida o bloqueada -> Paywall Bloqueante ("Efecto Netflix")
  const isBillingBlocked =
    user &&
    !isAdmin &&
    !userProfile?.billingExempt &&
    (userProfile?.billingStatus === "OVERDUE" ||
      userProfile?.gmcSubscriptionStatus === "PAST_DUE_LOCKED" ||
      userProfile?.gmcSubscriptionStatus === "CANCELLED_LOCKED" ||
      userProfile?.gmcSubscriptionStatus === "SUSPENDED_FRAUD");

  if (isBillingBlocked) {
    return (
      <GmcPaywallLockView
        reason={
          userProfile?.gmcSubscriptionStatus === "CANCELLED_LOCKED"
            ? "Tu suscripción ha finalizado tras la cancelación. Reactívala cuando quieras continuar tu plan."
            : userProfile?.gmcSubscriptionStatus === "SUSPENDED_FRAUD"
            ? "Tu cuenta ha sido congelada preventivamente por una alerta bancaria. Contacta a soporte."
            : "Tu periodo de membresía o tus 7 días de prueba han finalizado. Elige tu método de pago para continuar entrenando."
        }
        onRefresh={refreshProfile}
      />
    );
  }

  // 4. Si el usuario no está autenticado -> Mostrar Landing Page pública con LandingNavbar integrado y AuthModal
  if (!user && !userProfile) {
    return (
      <div className="min-h-screen bg-transparent text-slate-900 flex flex-col justify-between font-sans">
        <LandingHome
          onLoginWithGoogle={signInWithGoogle}
          onOpenAuthModal={handleOpenAuthModal}
          onGoToDashboard={() => handleOpenAuthModal("login")}
          isAuthenticated={false}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialTab={authModalTab}
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
          <LandingHome
            onLoginWithGoogle={signInWithGoogle}
            onOpenAuthModal={handleOpenAuthModal}
            onGoToDashboard={() => setCurrentView("dashboard")}
            onGoToAdmin={() => setCurrentView("admin")}
            isAuthenticated={true}
            userEmail={user?.email || userProfile?.email || undefined}
            userName={userProfile?.displayName || user?.displayName || undefined}
            photoURL={userProfile?.photoURL || user?.photoURL || undefined}
            isAdmin={isAdmin}
            onSignOut={signOutUser}
          />
        </div>
      ) : currentView === "admin" && isAdmin ? (
        /* VISTA 2: ADMIN PANEL */
        <div className="min-h-screen flex flex-col justify-between">
          <div>
            <Header
              athleteName={userProfile?.displayName || user?.displayName || "Atleta"}
              athleteId={userProfile?.intervalsAthleteId || ""}
              activeView="admin"
              onSelectView={(v) => {
                setPreviewAthlete(null);
                setCurrentView(v);
              }}
              onOpenAuthModal={handleOpenAuthModal}
              isIntervalsConnected={isIntervalsConnected}
              isGeminiConnected={isGeminiConnected}
            />
            <main className="py-3 sm:py-6 w-full max-w-[1720px] 2xl:max-w-[1840px] mx-auto px-2.5 sm:px-6 lg:px-8">
              <AdminPanel
                onGoBackToDashboard={() => {
                  setPreviewAthlete(null);
                  setCurrentView("dashboard");
                }}
                onInspectAthlete={(athlete) => {
                  setPreviewAthlete(athlete);
                  setCurrentView("dashboard");
                }}
              />
            </main>
          </div>
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500">
            <div className="w-full max-w-[1720px] 2xl:max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <p>PULSE ENDURANCE PRO © 2026 • Admin Console</p>
              <button
                type="button"
                onClick={() => {
                  setPreviewAthlete(null);
                  setCurrentView("dashboard");
                }}
                className="hover:text-cyan-600 font-bold transition cursor-pointer"
              >
                ← Volver al Dashboard
              </button>
            </div>
          </footer>
        </div>
      ) : (
        /* VISTA 3: DASHBOARD DEL ATLETA UNIFICADO (Sidebar Continuo de borde a borde) */
        <div className="flex flex-col min-h-screen">
          {paymentSuccessNotice && (
            <div className="bg-emerald-600 text-white px-4 py-3 text-xs sm:text-sm font-bold flex items-center justify-between shadow-md z-30">
              <div className="flex items-center gap-2 max-w-5xl mx-auto">
                <span className="text-base">🎉</span>
                <span>{paymentSuccessNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setPaymentSuccessNotice(null)}
                className="text-white hover:text-emerald-200 font-bold px-2 py-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          {previewAthlete && (
            <AdminImpersonationBanner
              athlete={previewAthlete}
              onExit={() => {
                setPreviewAthlete(null);
                setCurrentView("admin");
              }}
            />
          )}
          <AthleteDashboard
            key={previewAthlete ? `audit-${previewAthlete.uid}` : "self-dashboard"}
            targetAthlete={previewAthlete}
            isReadOnly={Boolean(previewAthlete)}
            isSettingsOpen={isSettingsOpen}
            setIsSettingsOpen={setIsSettingsOpen}
            settingsTab={settingsTab}
            setSettingsTab={setSettingsTab}
            isSeasonStudioOpen={isSeasonStudioOpen}
            setIsSeasonStudioOpen={setIsSeasonStudioOpen}
            seasonStudioTab={seasonStudioTab}
            setSeasonStudioTab={setSeasonStudioTab}
            onSelectView={(v) => {
              if (previewAthlete && (v === "admin" || v === "landing")) {
                setPreviewAthlete(null);
              }
              setCurrentView(v);
            }}
            onLiveConnectedChange={(connected) => setIsIntervalsConnected(connected)}
            onGeminiConnectedChange={(connected) => setIsGeminiConnected(connected)}
          />
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
}
