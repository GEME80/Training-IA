"use client";

import React, { useState, useEffect, useMemo } from "react";
import { User, Calendar, Scale, Ruler, Check, Loader2, Save } from "lucide-react";

interface AthleteBioProfileTabProps {
  athleteName: string;
  email?: string;
  birthDate?: string;
  gender?: "M" | "F" | "OTHER";
  weightKg?: number;
  heightCm?: number;
  onSaveBio: (data: {
    displayName: string;
    birthDate?: string;
    gender?: "M" | "F" | "OTHER";
    weightKg?: number;
    heightCm?: number;
  }) => Promise<void>;
}

export const AthleteBioProfileTab: React.FC<AthleteBioProfileTabProps> = ({
  athleteName: initialName,
  email = "",
  birthDate: initialBirthDate = "",
  gender: initialGender,
  weightKg: initialWeight,
  heightCm: initialHeight,
  onSaveBio,
}) => {
  const [displayName, setDisplayName] = useState(initialName || "");
  const [birthDate, setBirthDate] = useState(initialBirthDate || "");
  const [gender, setGender] = useState<"M" | "F" | "OTHER" | undefined>(initialGender);
  const [weightKg, setWeightKg] = useState<number | undefined>(initialWeight);
  const [heightCm, setHeightCm] = useState<number | undefined>(initialHeight);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setDisplayName(initialName || "");
    setBirthDate(initialBirthDate || "");
    setGender(initialGender);
    setWeightKg(initialWeight);
    setHeightCm(initialHeight);
  }, [initialName, initialBirthDate, initialGender, initialWeight, initialHeight]);

  const liveAge = useMemo(() => {
    if (!birthDate) return null;
    const diff = Date.now() - new Date(birthDate).getTime();
    if (isNaN(diff) || diff <= 0) return null;
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }, [birthDate]);

  const liveBmi = useMemo(() => {
    if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
    return (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1);
  }, [weightKg, heightCm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveBio({
        displayName,
        birthDate,
        gender,
        weightKg,
        heightCm,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-xs">
        {/* Cabecera de la sección */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Perfil Antropométrico & Identidad</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Datos personales utilizados para calibrar VO2max, IMC y gasto metabólico.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/20">
              📤 Sincroniza con Intervals
            </span>
          </div>
        </div>

        {/* Campos de Identidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nombre Completo</label>
            <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} placeholder="Ej. Juan Pérez" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Correo Electrónico</label>
            <input type="email" disabled value={email} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs font-mono text-slate-500 cursor-not-allowed" />
          </div>
        </div>

        {/* Campos Fisiológicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Fecha de Nacimiento */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-sky-500" /> Fecha Nacimiento
              </label>
              {liveAge !== null && (
                <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400">{liveAge} años</span>
              )}
            </div>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
          </div>

          {/* Género Biológico */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Género Biológico</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {([
                { id: "M", label: "Hombre" },
                { id: "F", label: "Mujer" },
                { id: "OTHER", label: "Otro" },
              ] as const).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGender(g.id)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                    gender === g.id
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Peso */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-amber-500" /> Peso Corporal
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={weightKg || ""}
                onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : undefined)}
                className={inputClass}
                placeholder="70"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kg</span>
            </div>
          </div>

          {/* Altura */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 text-teal-500" /> Altura
              </label>
              {liveBmi !== null && (
                <span className="text-[10px] font-mono font-bold text-slate-500">IMC {liveBmi}</span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min="100"
                max="250"
                value={heightCm || ""}
                onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : undefined)}
                className={inputClass}
                placeholder="175"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">cm</span>
            </div>
          </div>
        </div>

        {/* Botón de Guardar */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Guardado y sincronizado con Intervals</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? "Guardando..." : "Guardar Perfil"}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
