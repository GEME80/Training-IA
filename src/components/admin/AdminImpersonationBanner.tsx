"use client";

import React from "react";
import { Eye, ArrowLeft, ShieldAlert, Zap, User } from "lucide-react";
import { AdminUserListItem } from "@/lib/db/types";

interface AdminImpersonationBannerProps {
  athlete: AdminUserListItem;
  onExit: () => void;
}

export const AdminImpersonationBanner: React.FC<AdminImpersonationBannerProps> = ({
  athlete,
  onExit,
}) => {
  return (
    <aside
      aria-label="Barra de Auditoría de Atleta"
      className="sticky top-0 z-50 w-full bg-slate-950 text-white border-b-2 border-purple-500/80 shadow-2xl backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Lado Izquierdo: Insignia de Auditoría y Datos del Atleta */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] sm:text-xs font-mono font-bold tracking-wide uppercase shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            <Eye className="h-3.5 w-3.5" />
            <span>Auditoría (Solo Lectura)</span>
          </div>

          <div className="flex items-center space-x-2 text-xs truncate">
            <span className="text-slate-400 hidden sm:inline">Viendo a:</span>
            <span className="font-black text-slate-100 truncate flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              {athlete.displayName || athlete.email}
            </span>
            {athlete.intervalsAthleteId && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                ID: {athlete.intervalsAthleteId}
              </span>
            )}
          </div>
        </div>

        {/* Centro: Fisiología de Referencia (Desktop) */}
        <div className="hidden lg:flex items-center space-x-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" />
            <span>{athlete.runningTrainingMode === "PACE" || (!athlete.runFtp && athlete.hasRunningPowerMeter === false) ? "Run Pace:" : "Run CP:"}</span>
            <strong className="text-slate-200">
              {athlete.runningTrainingMode === "PACE" || (!athlete.runFtp && athlete.hasRunningPowerMeter === false)
                ? `${athlete.runThresholdPaceStr || "4:45"}/km`
                : `${athlete.runFtp || 0}W`}
            </strong>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-cyan-400" />
            <span>Bike FTP:</span>
            <strong className="text-slate-200">{athlete.bikeFtp || 0}W</strong>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-slate-300">
            <ShieldAlert className="h-3 w-3 text-amber-400" />
            <span>Mutaciones bloqueadas</span>
          </div>
        </div>

        {/* Lado Derecho: Botón Salir */}
        <div className="flex items-center justify-end w-full md:w-auto">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center justify-center space-x-1.5 w-full md:w-auto px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-950/50 transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Salir y volver a Admin</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
