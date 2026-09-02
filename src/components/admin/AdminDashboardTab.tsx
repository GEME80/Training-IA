"use client";

import React from "react";
import {
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Cpu,
  Activity,
  Users,
  CheckCircle,
  Clock,
  Flame,
} from "lucide-react";
import { TokenPeriod, TokenTelemetryData, FirestoreStatsData } from "./types";
import { AdminStats } from "@/lib/db/types";

interface AdminDashboardTabProps {
  tokenPeriod: TokenPeriod;
  setTokenPeriod: (p: TokenPeriod) => void;
  tokenTelemetry: TokenTelemetryData | null;
  stats: AdminStats | null;
  firestoreStats: FirestoreStatsData | null;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  tokenPeriod,
  setTokenPeriod,
  tokenTelemetry,
  stats,
  firestoreStats,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Titular y Selector de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-950 tracking-tight">Dashboard General</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consumo de tokens de Gemini, telemetría fisiológica y rendimiento de infraestructura.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setTokenPeriod("daily")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              tokenPeriod === "daily" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📅 Hoy
          </button>
          <button
            type="button"
            onClick={() => setTokenPeriod("monthly")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              tokenPeriod === "monthly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📆 Mes
          </button>
          <button
            type="button"
            onClick={() => setTokenPeriod("yearly")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              tokenPeriod === "yearly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🗓️ Año
          </button>
        </div>
      </div>

      {/* SECCIÓN A: MONITOR DE CONSUMO DE TOKENS GEMINI */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200/70 flex items-center justify-center">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">Consumo de IA & Presupuesto Gemini</h2>
              <p className="text-xs text-slate-500 font-medium">
                Período: <strong className="font-semibold text-slate-700">{tokenPeriod === "daily" ? "Hoy (24h)" : tokenPeriod === "monthly" ? "Mes Actual" : "Año en Curso"}</strong> • Inferencia Fisiológica PULSE AI PRO
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 sm:p-0 rounded-2xl bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-200/70">
            <div className="text-sm sm:text-base font-mono font-bold text-slate-900">
              ${(tokenTelemetry?.estimatedCostUsd ?? 0).toFixed(4)} <span className="text-xs font-semibold text-slate-500">USD</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Costo Estimado Acumulado</div>
          </div>
        </div>

        {/* Grid de 4 Métricas de Tokens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-500">Total Tokens</span>
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mt-2">
              {(tokenTelemetry?.totalTokens ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Prompt + Generación</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-cyan-700 flex items-center gap-1">
                <ArrowDownLeft className="h-3.5 w-3.5 text-cyan-600" />
                <span>Tokens Entrada</span>
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mt-2">
              {(tokenTelemetry?.promptTokens ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Contexto Fisiológico</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-emerald-700 flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                <span>Tokens Salida</span>
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mt-2">
              {(tokenTelemetry?.candidatesTokens ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Planes & Prescripciones</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-purple-700 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-purple-600" />
                <span>Invocaciones IA</span>
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mt-2">
              {tokenTelemetry?.requests ?? 0}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Invocaciones Exitosas</div>
          </div>
        </div>

        {/* Desglose por Modelo y Funcionalidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-cyan-600" />
              <span>Consumo por Modelo</span>
            </div>
            <div className="space-y-2">
              {tokenTelemetry?.byModel && Object.keys(tokenTelemetry.byModel).length > 0 ? (
                Object.entries(tokenTelemetry.byModel).map(([mName, mStats]) => (
                  <div key={mName} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200/70 last:border-0">
                    <span className="font-mono font-semibold text-slate-800">{mName}</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{mStats.totalTokens.toLocaleString()} tokens</span>
                      <span className="text-[11px] text-slate-500 font-medium ml-2">({mStats.requests} reqs)</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic py-2">Sin llamadas registradas en este período (gemini-2.5-flash activo)</div>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              <span>Consumo por Función</span>
            </div>
            <div className="space-y-2">
              {tokenTelemetry?.byFeature && Object.keys(tokenTelemetry.byFeature).length > 0 ? (
                Object.entries(tokenTelemetry.byFeature).map(([fName, fStats]) => (
                  <div key={fName} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200/70 last:border-0">
                    <span className="font-mono font-semibold text-slate-800">{fName}</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{fStats.totalTokens.toLocaleString()} tokens</span>
                      <span className="text-[11px] text-slate-500 font-medium ml-2">(${fStats.costUsd.toFixed(4)})</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic py-2">Sin llamadas registradas en este período</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN B: KPIS GENERALES DE PLATAFORMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-slate-500">Total Registrados</div>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {stats?.totalUsers ?? firestoreStats?.users ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Usuarios en Base de Datos</div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-slate-500">Atletas Activos</div>
            <div className="text-3xl font-black text-emerald-700 mt-1">
              {stats?.activeUsers ?? 0}
            </div>
            <div className="text-[10px] text-emerald-600 mt-1">Acceso total habilitado</div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-slate-500">Solicitudes</div>
            <div className="text-3xl font-black text-amber-600 mt-1">
              {stats?.pendingUsers ?? 0}
            </div>
            <div className="text-[10px] text-amber-600 mt-1">Pendientes de aprobación</div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-slate-500">Macrociclos Diseñados</div>
            <div className="text-3xl font-black text-purple-700 mt-1">
              {firestoreStats?.macrocycles ?? 0}
            </div>
            <div className="text-[10px] text-purple-600 mt-1">Planes de temporada activos</div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Flame className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
