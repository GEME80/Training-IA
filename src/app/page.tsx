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
import { PaymentSuccessModal } from "@/components/billing/PaymentSuccessModal";
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
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    cardLast4?: string;
    cardBrand?: string;
    transactionId?: string;
  } | null>(null);
  const hasHandledPaymentRef = React.useRef<boolean>(false);

  const handleOpenAuthModal = (tab: "login" | "register" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    purgeLegacyGlobalStorage();
    setMounted(true);
    if (typeof window !== "undefined") {
      const search = window.location.search;
      const params = new URLSearchParams(search);
      const urlIdMatch = search.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      const transactionId = params.get("id") || (urlIdMatch ? urlIdMatch[1] : undefined);
      const isPaymentReturn = params.get("payment") === "complete" || Boolean(transactionId) || params.has("order_id");

      if (params.get("view") === "admin") {
        setCurrentView("admin");
      }
      if (isPaymentReturn && !hasHandledPaymentRef.current) {
        hasHandledPaymentRef.current = true;
        const msg = "¡Membresía Atleta Pro Activada con Éxito! Tu suscripción ha sido confirmada por Openpay BBVA.";
        try { sessionStorage.setItem("pulse_payment_notice", msg); } catch {}
        
        const orderId = params.get("order_id") || undefined;
        const paramSubId = params.get("subscriberId") || undefined;
        let subId = paramSubId || userProfile?.intervalsAthleteId || userProfile?.uid || user?.uid;
        if (!subId && orderId) {
          const match = orderId.match(/^GMC-[^-]+-SUB-([^-]+)-/);
          if (match) subId = match[1];
        }

        // Mostrar de inmediato modal de confirmación con datos iniciales
        const initialModalData = {
          isOpen: true,
          cardLast4: "4444",
          cardBrand: "mastercard",
          transactionId: transactionId || orderId,
        };
        setSuccessModalData(initialModalData);
        try {
          sessionStorage.setItem("pulse_payment_success_modal", JSON.stringify(initialModalData));
        } catch {}

        // Limpiar inmediatamente los query params de la URL para evitar recargas en bucle
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("payment");
        cleanUrl.searchParams.delete("subscriberId");
        cleanUrl.searchParams.delete("order_id");
        cleanUrl.searchParams.delete("id");
        cleanUrl.searchParams.delete("sandbox_demo");
        cleanUrl.searchParams.delete("sandbox_simulated");
        window.history.replaceState({}, "", cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : ""));

        fetch("/api/billing/openpay/confirm-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriberId: subId, orderId, transactionId }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.success) {
              const updatedModal = {
                isOpen: true,
                cardLast4: data.cardLast4 || "4444",
                cardBrand: data.cardBrand || "mastercard",
                transactionId: transactionId || orderId,
              };
              setSuccessModalData(updatedModal);
              try {
                sessionStorage.setItem("pulse_payment_success_modal", JSON.stringify(updatedModal));
              } catch {}
            }
            refreshProfile();
          })
          .catch(() => {});
      }

      // Restaurar persistencia del modal ante recargas / re-renders de Auth
      try {
        const storedModal = sessionStorage.getItem("pulse_payment_success_modal");
        if (storedModal && !successModalData) {
          setSuccessModalData(JSON.parse(storedModal));
        }
      } catch {}
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

  // 3.5. Si el atleta no es admin y su membresía está vencida o bloqueada -> Paywall Bloqueante
  const isTrialExpired = Boolean(
    userProfile?.gmcTrialEndDate &&
    new Date(userProfile.gmcTrialEndDate).getTime() < Date.now()
  );
  const isBillingBlocked =
    user &&
    !isAdmin &&
    !userProfile?.billingExempt &&
    (userProfile?.billingStatus === "OVERDUE" ||
      userProfile?.gmcSubscriptionStatus === "PAST_DUE_LOCKED" ||
      userProfile?.gmcSubscriptionStatus === "CANCELLED_LOCKED" ||
      userProfile?.gmcSubscriptionStatus === "SUSPENDED_FRAUD" ||
      (isTrialExpired && userProfile?.billingStatus !== "PAID" && userProfile?.gmcSubscriptionStatus !== "ACTIVE") ||
      (userProfile?.hasUsedTrial && !userProfile?.isTrialActive && userProfile?.billingStatus !== "PAID" && userProfile?.gmcSubscriptionStatus !== "ACTIVE"));

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
              <p>PULSE ENDURANCE © 2026 • Desarrollado por GMC (Germán Morales Consulting)</p>
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

      <PaymentSuccessModal
        isOpen={Boolean(successModalData?.isOpen)}
        onClose={() => {
          setSuccessModalData(null);
          try {
            sessionStorage.removeItem("pulse_payment_success_modal");
          } catch {}
        }}
        cardBrand={successModalData?.cardBrand}
        cardLast4={successModalData?.cardLast4}
        transactionId={successModalData?.transactionId}
      />
    </div>
  );
}
