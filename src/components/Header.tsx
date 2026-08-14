"use client";

import React from "react";
import { Activity, ShieldCheck, Settings, RefreshCw } from "lucide-react";

interface HeaderProps {
  athleteName: string;
  athleteId: string;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  athleteName,
  athleteId,
  onOpenSettings,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 font-bold text-black shadow-lg shadow-emerald-500/20">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-white">SGEA</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Head Coach Fisiológico Digital</p>
          </div>
        </div>

        {/* Athlete Info & Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden text-right sm:block">
            <div className="flex items-center justify-end space-x-1.5 text-sm font-semibold text-slate-200">
              <span>{athleteName || "Germán Morales"}</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 font-mono">ID: {athleteId || "i442091"}</p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
            <span className="hidden sm:inline">Recargar</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Configuración</span>
          </button>
        </div>
      </div>
    </header>
  );
};
