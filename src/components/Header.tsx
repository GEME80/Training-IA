"use client";

import React, { useState } from "react";
import { Shield, LayoutDashboard, Home, LogOut, User as UserIcon } from "lucide-react";
import { PulseLogo } from "./PulseLogo";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  athleteName?: string;
  athleteId?: string;
  onOpenSettings?: () => void;
  onOpenSettingsTab?: (tab: "connections" | "physiology" | "availability" | "races" | "macrocycle" | "ai" | "intervals") => void;
  onOpenSeasonStudio?: (tab?: "races" | "plan_generator") => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isIntervalsConnected?: boolean;
  isLiveConnected?: boolean;
  isGeminiConnected?: boolean;
  activeView?: "landing" | "dashboard" | "admin";
  onSelectView?: (view: "landing" | "dashboard" | "admin") => void;
}

export const Header: React.FC<HeaderProps> = ({
  athleteName,
  activeView = "dashboard",
  onSelectView,
}) => {
  const { user, userProfile, isAdmin, signOutUser, signInWithGoogle } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const displayName = userProfile?.displayName || user?.displayName || athleteName || "Germán Morales";
  const email = userProfile?.email || user?.email || "gerkof@gmail.com";
  const photoURL = userProfile?.photoURL || user?.photoURL;
  const userRole = userProfile?.role || (isAdmin ? "admin" : "athlete");
  const isLanding = activeView === "landing";

  const isMasterAdmin = email === "gerkof@gmail.com" || isAdmin;

  return (
    <header className="sticky top-0 z-40 w-full transition-colors backdrop-blur-xl border-b border-slate-200/80 bg-white/90 text-slate-900 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* 1. Izquierda: Brand & Logo (Visible en Landing o Móvil; en Desktop Dashboard el Sidebar ya contiene el Logo) */}
        <div className="flex items-center shrink-0">
          {isLanding ? (
            <div
              onClick={() => onSelectView && onSelectView("landing")}
              className="cursor-pointer flex items-center shrink-0"
            >
              <PulseLogo size="md" showSubtext={false} />
            </div>
          ) : (
            <div className="flex md:hidden items-center shrink-0">
              <PulseLogo size="sm" showSubtext={false} />
            </div>
          )}
        </div>

        {/* 2. Centro: Enlaces en Landing Page */}
        {isLanding && (
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-cyan-700 transition">
              Funcionalidades
            </a>
            <a href="#pmc" className="hover:text-emerald-700 transition">
              Modelo PMC
            </a>
            <a href="#ecosystem" className="hover:text-cyan-700 transition">
              Ecosistema
            </a>
          </nav>
        )}

        {/* 3. Derecha: Perfil de Usuario & Acciones */}
        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
          {user || userProfile ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl transition cursor-pointer shadow-xs bg-white border border-slate-200 hover:bg-slate-50"
              >
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className="h-6 w-6 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white font-black text-[11px] flex items-center justify-center">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold leading-none truncate max-w-[120px] text-slate-900">
                    {displayName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 leading-none mt-0.5 font-bold">
                    {isMasterAdmin ? "Admin" : "Atleta"}
                  </span>
                </div>
              </button>

              {/* Menú Desplegable de Usuario */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
                  <div className="p-2.5 border-b border-slate-100 space-y-0.5">
                    <div className="font-bold text-xs text-slate-900">{displayName}</div>
                    <div className="text-[11px] text-slate-500 truncate font-mono">{email}</div>
                  </div>

                  <div className="py-1 space-y-0.5 text-xs">
                    {/* Opciones exclusivas para el Administrador (gerkof@gmail.com / isAdmin) */}
                    {isMasterAdmin && (
                      <>
                        {onSelectView && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectView("dashboard");
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
                          >
                            <LayoutDashboard className="h-4 w-4 text-cyan-600" />
                            <span>Panel Atleta</span>
                          </button>
                        )}

                        {onSelectView && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectView("admin");
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-purple-700 hover:bg-purple-50 font-semibold transition cursor-pointer"
                          >
                            <Shield className="h-4 w-4 text-purple-600" />
                            <span>Panel Admin</span>
                          </button>
                        )}

                        {onSelectView && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectView("landing");
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
                          >
                            <Home className="h-4 w-4 text-slate-500" />
                            <span>Inicio</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* Cerrar Sesión */}
                    <button
                      type="button"
                      onClick={() => {
                        signOutUser();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold transition cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-md shadow-cyan-500/20 transition cursor-pointer"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>✨ Iniciar con Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
