"use client";

import React from "react";
import { Zap, Trophy, Clock, Activity, Calendar, ShieldAlert, Award } from "lucide-react";
import { SquadAthleticStats } from "@/lib/services/adminBillingService";

interface AdminSquadAthleticRadarProps {
  stats: SquadAthleticStats;
}

export const AdminSquadAthleticRadar: React.FC<AdminSquadAthleticRadarProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* TARJETA 1: Salud Fisiológica & Distribución de Modalidades */}
      <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200/70 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Salud Fisiológica del Equipo</h3>
              <p className="text-[11px] text-slate-500">Distribución de telemetría y modalidades activas</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
            {stats.totalActiveAthletes} Atletas
          </span>
        </div>

        {/* Métricas Fisiológicas del Grupo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-amber-700">
              <Zap className="h-3 w-3 text-amber-600" />
              <span>Stryd Potencia</span>
            </div>
            <div className="text-xl font-black text-slate-900">{stats.powerAthletesCount}</div>
            <div className="text-[10px] text-slate-500 font-medium">Promedio: {stats.avgRunFtp > 0 ? `${stats.avgRunFtp}W` : "—"}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-emerald-700">
              <Clock className="h-3 w-3 text-emerald-600" />
              <span>Ritmo Daniels</span>
            </div>
            <div className="text-xl font-black text-slate-900">{stats.paceAthletesCount}</div>
            <div className="text-[10px] text-slate-500 font-medium">Modo Pace activo</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-cyan-700">
              <Zap className="h-3 w-3 text-cyan-600" />
              <span>Ciclismo FTP</span>
            </div>
            <div className="text-xl font-black text-slate-900">{stats.cyclingAthletesCount}</div>
            <div className="text-[10px] text-slate-500 font-medium">Promedio: {stats.avgBikeFtp > 0 ? `${stats.avgBikeFtp}W` : "—"}</div>
          </div>
        </div>

        {/* Estado y Gobernanza */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-emerald-950">Planificación Biológica en Curso</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-800 font-bold">100% Sincronizado</span>
        </div>
      </div>

      {/* TARJETA 2: Radar de Próximas Competiciones del Equipo */}
      <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/70 flex items-center justify-center">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Radar de Competiciones</h3>
              <p className="text-[11px] text-slate-500">Próximos objetivos deportivos de la temporada</p>
            </div>
          </div>
          <Award className="h-4 w-4 text-purple-600" />
        </div>

        {/* Listado de Carreras Objetivo */}
        <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
          {stats.goalRaces.length > 0 ? (
            stats.goalRaces.map((race, idx) => (
              <div
                key={`${race.athleteName}-${idx}`}
                className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-3 text-xs hover:bg-slate-100/70 transition"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{race.raceName}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>🏃 {race.athleteName}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{race.raceDate}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    <Calendar className="h-3 w-3 text-purple-600" />
                    <span>W-{race.weeksRemaining}</span>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No hay carreras objetivo registradas próximamente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
