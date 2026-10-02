"use client";

import React, { useMemo } from "react";
import {
  Coins,
  Cpu,
  Activity,
  Users,
  CheckCircle,
  Clock,
  Flame,
  Calendar,
  Sparkles,
} from "lucide-react";
import { TokenPeriod, TokenTelemetryData, FirestoreStatsData } from "./types";
import { AdminStats, AdminUserListItem } from "@/lib/db/types";
import { calculateBillingStats, calculateSquadAthleticStats } from "@/lib/services/adminBillingService";
import { AdminBillingKpis } from "./AdminBillingKpis";
import { AdminBillingTable } from "./AdminBillingTable";
import { AdminSquadAthleticRadar } from "./AdminSquadAthleticRadar";

interface AdminDashboardTabProps {
  tokenPeriod: TokenPeriod;
  setTokenPeriod: (p: TokenPeriod) => void;
  tokenTelemetry: TokenTelemetryData | null;
  stats: AdminStats | null;
  firestoreStats: FirestoreStatsData | null;
  users?: AdminUserListItem[];
  onRefreshUsers?: () => void;
  showMessage?: (text: string, type: "success" | "error") => void;
  onEditAthlete?: (user: AdminUserListItem) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  tokenPeriod,
  setTokenPeriod,
  tokenTelemetry,
  stats,
  firestoreStats,
  users = [],
  onRefreshUsers = () => {},
  showMessage = () => {},
  onEditAthlete,
}) => {
  // 1. Cálculos de Facturación y Finanzas
  const billingStats = useMemo(() => {
    return calculateBillingStats(users);
  }, [users]);

  // 2. Cálculos Deportivos y de Objetivos de Equipo
  const squadStats = useMemo(() => {
    return calculateSquadAthleticStats(users);
  }, [users]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Titular Principal & Selector de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
              Dashboard General
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
              <Calendar className="h-3.5 w-3.5 text-cyan-600" />
              <span>Octubre 2026 • Mes en Curso</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervisión comercial de suscripciones, salud deportiva del equipo e infraestructura.
          </p>
        </div>

        {/* Selector de Período Temporal */}
        <div className="flex items-center space-x-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTokenPeriod("daily")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              tokenPeriod === "daily" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setTokenPeriod("monthly")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              tokenPeriod === "monthly" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Mes
          </button>
          <button
            type="button"
            onClick={() => setTokenPeriod("yearly")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              tokenPeriod === "yearly" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Año
          </button>
        </div>
      </div>

      {/* 2. CUADRANTE FINANCIERO: Facturación & MRR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
            Control Financiero & Suscripciones de Atletas
          </h2>
          <span className="text-[11px] font-mono text-slate-400 font-semibold">
            Moneda Base: {billingStats.currency}
          </span>
        </div>
        <AdminBillingKpis stats={billingStats} />
      </div>

      {/* 3. WIDGET DE COBROS DEL MES: Control Operativo por Atleta */}
      <AdminBillingTable
        users={users}
        onRefresh={onRefreshUsers}
        showMessage={showMessage}
        onEditAthlete={onEditAthlete}
      />

      {/* 4. CUADRANTE DEPORTIVO: Radar de Fisiología & Próximas Competiciones */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
          Supervisión Atlética & Competiciones del Equipo
        </h2>
        <AdminSquadAthleticRadar stats={squadStats} />
      </div>

      {/* 5. KPIS GENERALES DE PLATAFORMA (Comunidad & Macrociclos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-slate-500">Total Registrados</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {stats?.totalUsers ?? firestoreStats?.users ?? users.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Usuarios en Base de Datos</div>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-slate-500">Atletas Activos</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              {stats?.activeUsers ?? users.filter((u) => u.status === "active").length}
            </div>
            <div className="text-[10px] text-emerald-600 mt-1">Acceso total habilitado</div>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-slate-500">Solicitudes</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
              {stats?.pendingUsers ?? users.filter((u) => u.status === "pending").length}
            </div>
            <div className="text-[10px] text-amber-600 mt-1">Pendientes de aprobación</div>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-slate-500">Macrociclos Diseñados</div>
            <div className="text-2xl sm:text-3xl font-black text-purple-700 mt-1">
              {firestoreStats?.macrocycles ?? 2}
            </div>
            <div className="text-[10px] text-purple-600 mt-1">Planes de temporada activos</div>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Flame className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 6. INFRAESTRUCTURA & FINOPS IA (Sección Secundaria / Compacta al Pie) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Infraestructura & Costos IA</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Always Free ($0.00 USD)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Motor Google Gemini 2.5 Flash • Context Condenser FinOps (-70% tokens) • Caché SWR en memoria
            </div>
          </div>
        </div>

        <div className="text-right font-mono text-[11px] text-slate-400">
          Total tokens período: <strong className="text-slate-700">{(tokenTelemetry?.totalTokens ?? 0).toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
};
