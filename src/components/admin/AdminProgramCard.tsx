"use client";

import React from "react";
import { Edit, Plus, Trash2, Eye } from "lucide-react";
import { MacrocycleDefinition } from "@/lib/physiology/macrocycleLibrary";

interface AdminProgramCardProps {
  prog: MacrocycleDefinition;
  onInspect: (prog: MacrocycleDefinition) => void;
  onEdit: (prog: MacrocycleDefinition) => void;
  onDuplicate: (prog: MacrocycleDefinition) => void;
  onDelete: (id: string) => void;
}

export const AdminProgramCard: React.FC<AdminProgramCardProps> = ({
  prog,
  onInspect,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onInspect(prog)}
      className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group hover:border-cyan-400 cursor-pointer"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{prog.icon || "🏃‍♂️"}</span>
            <div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-cyan-600 transition-colors">
                {prog.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-snug">
                {prog.subtitle}
              </p>
            </div>
          </div>
          {prog.isCustom && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
              Personalizado
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
            {prog.category === "RACE_TARGET" ? "🏆 Carrera Objetivo" : "🌱 Momento del Atleta"}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
            {prog.distanceType.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-white">
            {prog.defaultWeeks} Semanas
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Métricas de Intensidad
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {prog.supportedMetrics?.map((m) => (
              <span
                key={m}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  m === "POWER"
                    ? "bg-amber-100 text-amber-800"
                    : m === "HEART_RATE"
                    ? "bg-rose-100 text-rose-800"
                    : m === "PACE"
                    ? "bg-cyan-100 text-cyan-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {m === "POWER" ? "⚡ Potencia" : m === "HEART_RATE" ? "💓 FC" : m === "PACE" ? "⏱️ Ritmo" : "🧠 RPE"}
                {m === prog.defaultMetric && " ★"}
              </span>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>🔥 Tirada Pico Máxima</span>
            <span className="font-mono text-amber-700 font-black">
              {prog.maxLongRunKm ? `${prog.maxLongRunKm} km` : `${prog.maxLongRunMinutes} min`}
            </span>
          </div>
          <p className="text-[10px] text-amber-800 font-medium">
            {prog.maxLongRunKm && prog.maxLongRunKm >= 30
              ? `Incluye fondos rectores de 30 a 34 km para maratón.`
              : `Duración máxima: ~${prog.maxLongRunMinutes} minutos.`}
          </p>
        </div>

        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
          {prog.description}
        </p>

        {/* Indicador visual de Click para ver metodología */}
        <div className="flex items-center space-x-1 text-[11px] font-bold text-cyan-600 pt-1 group-hover:text-cyan-700">
          <Eye className="h-3.5 w-3.5" />
          <span>Ver metodología completa & fases...</span>
        </div>
      </div>

      <div
        className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onEdit(prog)}
          className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200/80 text-slate-800 text-xs font-bold transition cursor-pointer"
        >
          <Edit className="h-3.5 w-3.5 text-cyan-600" />
          <span>Editar</span>
        </button>

        <button
          type="button"
          onClick={() => onDuplicate(prog)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
          title="Duplicar programa"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        {prog.isCustom && (
          <button
            type="button"
            onClick={() => onDelete(prog.id)}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
            title="Eliminar programa personalizado"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
