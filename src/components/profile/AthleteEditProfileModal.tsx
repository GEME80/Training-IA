"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Footprints, Bike, HeartPulse, Moon, Activity, Check, Radio, Key, User, Loader2 } from "lucide-react";

export interface AthleteProfileFormData {
  displayName?: string;
  email?: string;
  birthDate?: string;
  gender?: "M" | "F" | "OTHER";
  weightKg?: number;
  heightCm?: number;
  runFtp?: number;
  bikeFtp?: number;
  lthr?: number;
  restingHR?: number;
  maxHR?: number;
  intervalsAthleteId?: string;
  apiKey?: string;
}

interface AthleteEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: AthleteProfileFormData;
  onSave: (data: AthleteProfileFormData) => Promise<void>;
}

const SyncBadge = () => (
  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">📤 Sincroniza</span>
);

const IntervalsBadge = () => (
  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">📥 Intervals</span>
);

export const AthleteEditProfileModal: React.FC<AthleteEditProfileModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const normalizeHeight = (h?: number) => (!h ? 0 : h < 3 && h > 0 ? Math.round(h * 100) : Math.round(h));

  const [form, setForm] = useState<AthleteProfileFormData>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        displayName: initialData.displayName || "Atleta",
        email: initialData.email || "",
        birthDate: initialData.birthDate || "",
        gender: initialData.gender || "M",
        weightKg: initialData.weightKg || 0,
        heightCm: normalizeHeight(initialData.heightCm),
        runFtp: initialData.runFtp || 0,
        bikeFtp: initialData.bikeFtp || 0,
        lthr: initialData.lthr || 0,
        restingHR: initialData.restingHR || 0,
        maxHR: initialData.maxHR || 0,
        intervalsAthleteId: initialData.intervalsAthleteId || "",
        apiKey: initialData.apiKey || "",
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const update = (k: keyof AthleteProfileFormData, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(form);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 750);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30";
  const numInputClass = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 pr-8 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Fondo oscuro opaco cliqueable para cerrar */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-black/10">
        {/* Header Minimalista */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Perfil del Atleta</h3>
              <p className="text-[11px] text-slate-400">Identidad, biometría y umbrales de rendimiento</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Leyenda Compacta de Flujo de Datos */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 font-bold text-[9px]">📤 Sincroniza</span>
              <span className="text-[10px]">Se envía a Intervals</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
              <span className="px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 font-bold text-[9px]">📥 Intervals</span>
              <span className="text-[10px]">Leído de sensores</span>
            </div>
          </div>

          {/* Bloque 1: Identidad */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Nombre Completo</label>
                <input type="text" required value={form.displayName || ""} onChange={(e) => update("displayName", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Correo Electrónico</label>
                <input type="email" disabled value={form.email || ""} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 px-3 py-2 text-xs font-mono text-slate-500 cursor-not-allowed" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Fecha de Nacimiento</label>
                  <SyncBadge />
                </div>
                <input type="date" value={form.birthDate || ""} onChange={(e) => update("birthDate", e.target.value)} className={inputClass} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Género Biológico</label>
                  <SyncBadge />
                </div>
                <div className="grid grid-cols-3 gap-1 mt-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  {[{ id: "M", label: "Hombre" }, { id: "F", label: "Mujer" }, { id: "OTHER", label: "Otro" }].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => update("gender", g.id)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                        form.gender === g.id ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bloque 2: Biometría & Potencia */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Biometría & Potencia</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Peso Corporal</label>
                  <SyncBadge />
                </div>
                <div className="relative mt-1">
                  <input type="number" step="0.1" value={form.weightKg || ""} onChange={(e) => update("weightKg", Number(e.target.value))} className={numInputClass} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kg</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Altura</label>
                  <SyncBadge />
                </div>
                <div className="relative mt-1">
                  <input type="number" value={form.heightCm || ""} onChange={(e) => update("heightCm", Number(e.target.value))} className={numInputClass} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">cm</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Footprints className="h-3.5 w-3.5 text-amber-500" /> Stryd CP (Carrera)
                  </label>
                  <SyncBadge />
                </div>
                <div className="relative mt-1">
                  <input type="number" value={form.runFtp || ""} onChange={(e) => update("runFtp", Number(e.target.value))} className={numInputClass} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">W</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Bike className="h-3.5 w-3.5 text-sky-500" /> Ciclismo FTP
                  </label>
                  <SyncBadge />
                </div>
                <div className="relative mt-1">
                  <input type="number" value={form.bikeFtp || ""} onChange={(e) => update("bikeFtp", Number(e.target.value))} className={numInputClass} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">W</span>
                </div>
              </div>
            </div>

            {/* Frecuencia Cardíaca */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 truncate">
                    <HeartPulse className="h-3 w-3 text-rose-500 shrink-0" /> FC Umbral
                  </label>
                  <IntervalsBadge />
                </div>
                <input type="number" placeholder="bpm" value={form.lthr || ""} onChange={(e) => update("lthr", Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 truncate">
                    <Moon className="h-3 w-3 text-indigo-500 shrink-0" /> FC Reposo
                  </label>
                  <IntervalsBadge />
                </div>
                <input type="number" placeholder="bpm" value={form.restingHR || ""} onChange={(e) => update("restingHR", Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 truncate">
                    <Activity className="h-3 w-3 text-emerald-500 shrink-0" /> FC Máxima
                  </label>
                  <IntervalsBadge />
                </div>
                <input type="number" placeholder="bpm" value={form.maxHR || ""} onChange={(e) => update("maxHR", Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Bloque 3: Conexión Intervals.icu */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conexión Intervals.icu</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-sky-500" /> Athlete ID
                </label>
                <input type="text" placeholder="Ej. i123456" value={form.intervalsAthleteId || ""} onChange={(e) => update("intervalsAthleteId", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-amber-500" /> API Key
                </label>
                <input type="password" placeholder="Pegar para actualizar" value={form.apiKey || ""} onChange={(e) => update("apiKey", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Sincronización automática con Intervals.icu</span>
            <div className="flex items-center space-x-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer shadow-xs disabled:opacity-70"
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>¡Guardado y Sincronizado!</span>
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
                    <span>Sincronizando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 text-sky-400" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
