"use client";

import React from "react";
import { SportCanvasBackground } from "./SportCanvasBackground";
import { LandingHero } from "./landing/LandingHero";
import { LandingControlHub } from "./landing/LandingControlHub";
import { LandingHowItWorks } from "./landing/LandingHowItWorks";
import { LandingComparisonTable } from "./landing/LandingComparisonTable";
import { LandingDisciplineModels } from "./landing/LandingDisciplineModels";
import { LandingCyclePreview } from "./landing/LandingCyclePreview";
import { LandingHeadCoaches } from "./landing/LandingHeadCoaches";
import { LandingEcosystem } from "./landing/LandingEcosystem";
import { LandingFaq } from "./landing/LandingFaq";
import { LandingCtaSection } from "./landing/LandingCtaSection";
import { LandingFooter } from "./landing/LandingFooter";
import { useAuth } from "@/context/AuthContext";
import { X, ExternalLink } from "lucide-react";

interface LandingHomeProps {
  onLoginWithGoogle: () => void;
  onGoToDashboard?: () => void;
  isAuthenticated?: boolean;
  userEmail?: string;
  userName?: string;
  onOpenAuthModal?: (tab?: "login" | "register") => void;
}

export const LandingHome: React.FC<LandingHomeProps> = ({
  onLoginWithGoogle,
  onGoToDashboard,
  isAuthenticated = false,
  onOpenAuthModal,
}) => {
  const { error, clearError, user, loginAsMasterAdminDemo } = useAuth();

  const isConfigError = error === "FIREBASE_AUTH_NOT_CONFIGURED";
  const isUserAuthenticated = isAuthenticated || !!user;

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white font-sans relative overflow-x-hidden">
      {/* 1. Fondo Canvas Interactivo Luminoso (fixed en z-0) */}
      <SportCanvasBackground />

      {/* Contenido en capa z-10 */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Modal Informativo si Firebase Auth requiere activación en consola */}
        {error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-lg w-full rounded-3xl bg-white border border-cyan-500/40 p-6 sm:p-7 shadow-2xl space-y-5 text-left relative">
              <button
                type="button"
                onClick={clearError}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center text-2xl shrink-0">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isConfigError ? "Activar Google Sign-In en Firebase Console" : "Aviso de Autenticación"}
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-600">Proyecto: training-ia-8f67f</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed border-y border-slate-100 py-4">
                {isConfigError ? (
                  <>
                    <p>Google Sign-In debe habilitarse en la consola de Firebase del proyecto:</p>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-700">
                      <li>
                        Ingresa en <strong>Authentication &gt; Sign-in method</strong>.
                      </li>
                      <li>
                        Haz clic en <strong>Google</strong>, activa el interruptor de <strong>Habilitar</strong> y guarda.
                      </li>
                    </ol>
                  </>
                ) : (
                  <p>{error}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    loginAsMasterAdminDemo();
                    clearError();
                  }}
                  className="w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black px-4 py-2.5 text-xs shadow-md cursor-pointer hover:brightness-105"
                >
                  <span>Entrar como Germán Morales</span>
                </button>
                <a
                  href="https://console.firebase.google.com/project/training-ia-8f67f/authentication/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 transition cursor-pointer"
                >
                  <span>Abrir Firebase Console</span>
                  <ExternalLink className="h-3.5 w-3.5 text-cyan-600" />
                </a>
                <button
                  type="button"
                  onClick={clearError}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Hero Section */}
        <LandingHero
          isAuthenticated={isUserAuthenticated}
          onOpenAuthModal={onOpenAuthModal}
          onLoginWithGoogle={onLoginWithGoogle}
          onGoToDashboard={onGoToDashboard}
        />

        {/* 3. Control Hub y Simulador Interactivo */}
        <LandingControlHub />

        {/* 4. Cómo Funciona en 3 Pasos */}
        <LandingHowItWorks />

        {/* 5. Tabla Comparativa (Tradicional vs PULSE AI) */}
        <LandingComparisonTable />

        {/* 6. Modelos Deportivos por Disciplina (Running, Ciclismo, Triatlón) */}
        <LandingDisciplineModels />

        {/* 7. Visualizador Gráfico de Ciclos e Intervalos */}
        <LandingCyclePreview />

        {/* 8. Salón de la Fama de Head Coaches (Fichas de Autoridad) */}
        <LandingHeadCoaches />

        {/* 9. Ecosistema de Dispositivos */}
        <LandingEcosystem />

        {/* 10. Preguntas Frecuentes (FAQ) */}
        <LandingFaq />

        {/* 11. CTA Final */}
        <LandingCtaSection
          isAuthenticated={isUserAuthenticated}
          onOpenAuthModal={onOpenAuthModal}
          onLoginWithGoogle={onLoginWithGoogle}
          onGoToDashboard={onGoToDashboard}
        />

        {/* 12. Footer */}
        <LandingFooter />
      </div>
    </div>
  );
};
