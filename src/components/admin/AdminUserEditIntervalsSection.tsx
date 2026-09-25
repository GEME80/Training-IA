"use client";

import React, { useState } from "react";
import { Activity, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

interface AdminUserEditIntervalsSectionProps {
  intervalsId: string;
  setIntervalsId: (id: string) => void;
  rawApiKey: string;
  setRawApiKey: (key: string) => void;
  hasIntervalsKey?: boolean;
  isTesting: boolean;
  testResult: { success: boolean; message: string; athleteName?: string } | null;
  onTestConnection: () => void;
}

export const AdminUserEditIntervalsSection: React.FC<AdminUserEditIntervalsSectionProps> = ({
  intervalsId,
  setIntervalsId,
  rawApiKey,
  setRawApiKey,
  hasIntervalsKey,
  isTesting,
  testResult,
  onTestConnection,
}) => {
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  return (
    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
          <Activity className="h-4 w-4 text-cyan-600" />
          <span>Conexión & Soporte Intervals.icu</span>
        </div>
        <button
          type="button"
          onClick={onTestConnection}
          disabled={isTesting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <Activity className={`h-3.5 w-3.5 ${isTesting ? "animate-spin text-cyan-600" : ""}`} />
          <span>{isTesting ? "Verificando..." : "Probar Conexión"}</span>
        </button>
      </div>

      {testResult && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
            testResult.success
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
              : "bg-rose-50/90 border-rose-200 text-rose-900"
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed">
            <span className="font-bold">{testResult.success ? "Conexión OK:" : "Atención:"}</span>{" "}
            {testResult.message}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Intervals Athlete ID</label>
          <input
            type="text"
            value={intervalsId}
            onChange={(e) => setIntervalsId(e.target.value)}
            placeholder="Ej. i123456"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Clave API Privada (Soporte)</span>
            {hasIntervalsKey && !rawApiKey && (
              <span className="text-[10px] text-emerald-700 font-mono">Configurada</span>
            )}
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={rawApiKey}
              onChange={(e) => setRawApiKey(e.target.value)}
              placeholder={hasIntervalsKey ? "•••••••••••• (Cifrada)" : "Pegar API Key aquí"}
              className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 leading-tight">
        Si el atleta solicita asistencia técnica porque no puede vincular su cuenta, puedes configurar su Athlete ID y API Key aquí. Se encriptará con AES-256-GCM.
      </p>
    </div>
  );
};
