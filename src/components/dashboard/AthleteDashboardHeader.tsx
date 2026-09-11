"use client";

import React, { useState } from "react";
import { PulseLogo } from "../PulseLogo";
import { Shield, LayoutDashboard, Home, LogOut } from "lucide-react";
import { isMasterAdminEmail } from "@/lib/env";

interface AthleteDashboardHeaderProps {
  displayName: string;
  email?: string;
  photoURL?: string | null;
  isLiveConnected: boolean;
  isRefreshingTelemetry: boolean;
  onRefreshTelemetry: () => void;
  onSelectView?: (view: "landing" | "dashboard" | "admin") => void;
  signOutUser: () => void;
}

export const AthleteDashboardHeader: React.FC<AthleteDashboardHeaderProps> = ({
  displayName,
  email,
  photoURL,
  isLiveConnected,
  isRefreshingTelemetry,
  onRefreshTelemetry,
  onSelectView,
  signOutUser,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const isMasterAdmin = isMasterAdminEmail(email);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
      <div className="flex items-center space-x-2">
        <div className="md:hidden"><PulseLogo size="sm" showSubtext={false} /></div>
        <button
          type="button"
          onClick={onRefreshTelemetry}
          disabled={isRefreshingTelemetry}
          className="inline-flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isLiveConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          <span>{isRefreshingTelemetry ? "Sync..." : isLiveConnected ? "En Vivo" : "Offline"}</span>
        </button>
      </div>

      <div className="relative ml-auto">
        <button
          type="button"
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl shadow-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
        >
          {photoURL ? (
            <img src={photoURL} alt={displayName} className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white font-black text-[11px] flex items-center justify-center">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold leading-none truncate max-w-[120px] text-slate-900 dark:text-white">{displayName}</span>
            <span className="text-[10px] font-mono text-slate-500 leading-none mt-0.5 font-bold">{isMasterAdmin ? "Admin" : "Atleta"}</span>
          </div>
        </button>

        {showUserDropdown && (
          <>
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowUserDropdown(false)} />
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in">
              <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-900 dark:text-white">{displayName}</div>
                <div className="text-[11px] text-slate-500 truncate font-mono">{email}</div>
              </div>
              <div className="py-1 space-y-0.5 text-xs">
                {isMasterAdmin && onSelectView && (
                  <>
                    <button type="button" onClick={() => { onSelectView("dashboard"); setShowUserDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold">
                      <LayoutDashboard className="h-4 w-4 text-cyan-600" /><span>Panel Atleta</span>
                    </button>
                    <button type="button" onClick={() => { onSelectView("admin"); setShowUserDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-semibold">
                      <Shield className="h-4 w-4 text-purple-600" /><span>Panel Admin</span>
                    </button>
                    <button type="button" onClick={() => { onSelectView("landing"); setShowUserDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold">
                      <Home className="h-4 w-4 text-slate-500" /><span>Inicio</span>
                    </button>
                  </>
                )}
                <button type="button" onClick={() => { signOutUser(); setShowUserDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold">
                  <LogOut className="h-4 w-4" /><span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
