"use client";

import React from "react";
import { ShieldCheck, RefreshCw, ArrowLeft, Footprints } from "lucide-react";
import { NotificationBellButton } from "../notifications/NotificationBellButton";
import { getUserStorage, UserStorage } from "@/lib/storage/userStorage";

interface AdminMobileHeaderProps {
  onGoBackToDashboard?: () => void;
  onRefreshAll?: () => void;
  isLoading?: boolean;
  userStorage?: UserStorage;
}

export const AdminMobileHeader: React.FC<AdminMobileHeaderProps> = ({
  onGoBackToDashboard,
  onRefreshAll,
  isLoading,
  userStorage,
}) => {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3.5 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-2">
        {/* Identidad de Marca: PULSE AI PRO + Badge Admin */}
        <div className="flex items-center space-x-2 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-950 dark:text-white tracking-tight truncate">
                PULSE AI PRO
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                Centro de Control
              </span>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas: Campanita + Actualizar Telemetría + Retorno a Modo Atleta */}
        <div className="flex items-center gap-1.5 shrink-0">
          <NotificationBellButton userStorage={userStorage || getUserStorage()} />

          {onRefreshAll && (
            <button
              type="button"
              onClick={onRefreshAll}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
              title="Actualizar telemetría"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          )}

          {onGoBackToDashboard && (
            <button
              type="button"
              onClick={onGoBackToDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer active:scale-95"
              title="Volver al panel personal del atleta"
            >
              <Footprints className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mi Entreno</span>
              <span className="sm:hidden">Entreno</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
