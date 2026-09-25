"use client";

import React from "react";
import {
  MacrocycleDefinition,
  SportType,
  MacrocycleCategory,
} from "@/lib/physiology/macrocycleLibrary";

interface AdminProgramDetailEditSectionProps {
  form: MacrocycleDefinition;
  setForm: React.Dispatch<React.SetStateAction<MacrocycleDefinition | null>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const AdminProgramDetailEditSection: React.FC<AdminProgramDetailEditSectionProps> = ({
  form,
  setForm,
  onSubmit,
}) => {
  return (
    <form id="edit-program-form" onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">Título del Programa *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">Subtítulo / Enfoque Breve</label>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Deporte</label>
          <select
            value={form.sport}
            onChange={(e) => setForm({ ...form, sport: e.target.value as SportType })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="running">Carrera en Ruta (Running)</option>
            <option value="cycling">Ciclismo</option>
            <option value="triathlon">Triatlón</option>
            <option value="trail_running">Trail Running</option>
            <option value="swimming">Natación</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Categoría</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as MacrocycleCategory })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="RACE_TARGET">Carrera Objetivo (Race Target)</option>
            <option value="ATHLETE_MOMENT">Momento del Atleta (Base / Transición)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Semanas por Defecto</label>
          <input
            type="number"
            min={4}
            max={36}
            value={form.defaultWeeks}
            onChange={(e) => setForm({ ...form, defaultWeeks: Number(e.target.value) })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Fondo Pico Máximo (km)</label>
          <input
            type="number"
            min={5}
            max={60}
            value={form.maxLongRunKm || 25}
            onChange={(e) => setForm({ ...form, maxLongRunKm: Number(e.target.value) })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">Descripción Metodológica Detallada</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">
            Adaptaciones Fisiológicas (Separadas por comas)
          </label>
          <input
            type="text"
            value={form.physiologicalFocus?.join(", ") || ""}
            onChange={(e) =>
              setForm({
                ...form,
                physiologicalFocus: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="Capacidad aeróbica, Umbral funcional, Biomecánica..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">
            Entrenamientos Clave Rectores (Separados por comas)
          </label>
          <input
            type="text"
            value={form.keyWorkoutsSummary?.join(", ") || ""}
            onChange={(e) =>
              setForm({
                ...form,
                keyWorkoutsSummary: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="Tirada larga progresiva, Series 3x10 min CP, Fartlek..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">Perfil de Atleta Recomendado</label>
          <input
            type="text"
            value={form.recommendedFor || ""}
            onChange={(e) => setForm({ ...form, recommendedFor: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
          />
        </div>
      </div>
    </form>
  );
};
