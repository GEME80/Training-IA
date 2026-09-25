"use client";

import React from "react";
import { Zap, Activity, Clock, Sparkles } from "lucide-react";

export const AdminProgramMetricsHud: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
        <div className="flex items-center space-x-2 text-amber-600">
          <Zap className="h-4 w-4" />
          <span className="text-xs font-bold">⚡ Potencia</span>
        </div>
        <p className="text-[11px] text-slate-500">Stryd CP (% CP) & Bike FTP (% FTP)</p>
      </div>

      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
        <div className="flex items-center space-x-2 text-rose-600">
          <Activity className="h-4 w-4" />
          <span className="text-xs font-bold">💓 FC</span>
        </div>
        <p className="text-[11px] text-slate-500">% LTHR, % FC Máx & Zonas Z1-Z5</p>
      </div>

      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
        <div className="flex items-center space-x-2 text-cyan-600">
          <Clock className="h-4 w-4" />
          <span className="text-xs font-bold">⏱️ Ritmo</span>
        </div>
        <p className="text-[11px] text-slate-500">Ritmos min/km, min/mile & % VAM</p>
      </div>

      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
        <div className="flex items-center space-x-2 text-emerald-600">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold">🧠 Sensaciones</span>
        </div>
        <p className="text-[11px] text-slate-500">Escala de Borg 1-10 & RPE</p>
      </div>
    </div>
  );
};
