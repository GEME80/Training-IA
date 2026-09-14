"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Footprints, Bike, HeartPulse, Moon, Activity, Check, Info, Radio, Key, HelpCircle } from "lucide-react";

export interface AthleteProfileFormData {
  displayName?: string; email?: string; birthDate?: string;
  gender?: "M" | "F" | "OTHER"; weightKg?: number; heightCm?: number;
  runFtp?: number; bikeFtp?: number; lthr?: number; restingHR?: number;
  maxHR?: number; intervalsAthleteId?: string; apiKey?: string;
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
  const [showInfoLegend, setShowInfoLegend] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sincronizar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setForm({
        displayName: initialData.displayName || "Atleta", email: initialData.email || "",
        birthDate: initialData.birthDate || "", gender: initialData.gender || "M",
        weightKg: initialData.weightKg || 0, heightCm: normalizeHeight(initialData.heightCm),
        runFtp: initialData.runFtp || 0, bikeFtp: initialData.bikeFtp || 0,
        lthr: initialData.lthr || 0, restingHR: initialData.restingHR || 0, maxHR: initialData.maxHR || 0,
        intervalsAthleteId: initialData.intervalsAthleteId || "", apiKey: initialData.apiKey || "",
      });
      setShowInfoLegend(false);
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
      setTimeout(() => { setSavedSuccess(false); onClose(); }, 700);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-fadeIn">
      {/* Click fuera para cerrar */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-black/10">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Editar Perfil Antropométrico & Umbrales</h3>
          </div>
          <button
            type="button" onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Guía Visual de Origen de Datos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-bold">📤 Sincroniza</span>
              <span className="text-[10px]">Datos maestros: se editan aquí y se envían a Intervals</span>
            </div>
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
              <span className="px-1.5 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-[9px] font-bold">📥 Intervals</span>
              <span className="text-[10px]">Telemetría: leída de tus sensores en Intervals</span>
            </div>
          </div>

          {/* Bloque 1: Identidad & Antropometría */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              1. Identidad & Antropometría
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Nombre Completo</label>
                <input
                  type="text" required value={form.displayName || ""} onChange={(e) => update("displayName", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Correo Asociado</label>
                <input
                  type="email" disabled value={form.email || ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 p-2 text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Fecha de Nacimiento</label>
                  <SyncBadge />
                </div>
                <input
                  type="date" value={form.birthDate || ""} onChange={(e) => update("birthDate", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Género</label>
                  <SyncBadge />
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {[
                    { id: "M", label: "Hombre" }, { id: "F", label: "Mujer" }, { id: "OTHER", label: "Otro" },
                  ].map((g) => (
                    <button
                      key={g.id} type="button" onClick={() => update("gender", g.id)}
                      className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        form.gender === g.id
                          ? "bg-emerald-600 border-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-500/30"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Peso Corporal (kg)</label>
                  <SyncBadge />
                </div>
                <input
                  type="number" step="0.1" value={form.weightKg || ""} onChange={(e) => update("weightKg", Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Altura (cm)</label>
                  <SyncBadge />
                </div>
                <input
                  type="number" value={form.heightCm || ""} onChange={(e) => update("heightCm", Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Umbrales Fisiológicos & Rendimiento */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                2. Umbrales Fisiológicos & Rendimiento
              </span>
              <button
                type="button" onClick={() => setShowInfoLegend(!showInfoLegend)}
                className="text-[10px] font-mono text-sky-600 dark:text-sky-400 flex items-center gap-1 hover:underline cursor-pointer transition"
                title="Haz clic para ver u ocultar la guía de obtención de umbrales"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{showInfoLegend ? "Ocultar Guía" : "¿Cómo obtener estos datos?"}</span>
              </button>
            </div>

            {/* Guía Informativa (oculta por defecto) */}
            {showInfoLegend && (
              <div className="p-3 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300 animate-fadeIn">
                <div className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>Guía para obtener tus umbrales exactos:</span>
                </div>
                <ul className="space-y-1 pl-4 list-disc text-[10px] font-mono leading-relaxed text-slate-600 dark:text-slate-400">
                  <li><strong>Stryd CP (Carrera):</strong> Auto-calculada en Stryd o test 3/9 min o 5K a tope.</li>
                  <li><strong>Ciclismo FTP:</strong> 95% de potencia media en test 20 min o prueba de rampa en Zwift.</li>
                  <li><strong>FC Umbral (LTHR):</strong> FC media de los últimos 20 min de un test de 30 min.</li>
                  <li><strong>FC Reposo & Máx:</strong> FC Reposo al despertar. FC Máx: <code>208 - (0.7 × edad)</code>.</li>
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Footprints className="h-3 w-3 text-amber-500" />
                    Stryd CP (Run FTP)
                  </label>
                  <SyncBadge />
                </div>
                <div className="relative mt-1">
                  <input
                    type="number" value={form.runFtp || ""} onChange={(e) => update("runFtp", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 pr-8 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">W</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Bike className="h-3 w-3 text-sky-500" />
                    Ciclismo FTP
                  </label>
                  <SyncBadge />
                </div>
                <div className="relative mt-1">
                  <input
                    type="number" value={form.bikeFtp || ""} onChange={(e) => update("bikeFtp", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 pr-8 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">W</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <HeartPulse className="h-3 w-3 text-rose-500" />
                    FC Umbral (LTHR)
                  </label>
                  <IntervalsBadge />
                </div>
                <input
                  type="number" value={form.lthr || ""} onChange={(e) => update("lthr", Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Moon className="h-3 w-3 text-indigo-500" />
                    FC Reposo
                  </label>
                  <IntervalsBadge />
                </div>
                <input
                  type="number" value={form.restingHR || ""} onChange={(e) => update("restingHR", Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">FC Máxima</label>
                  <IntervalsBadge />
                </div>
                <input
                  type="number" value={form.maxHR || ""} onChange={(e) => update("maxHR", Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Bloque 3: Credenciales Intervals.icu */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              3. Conexión & Credenciales Intervals.icu
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Radio className="h-3 w-3 text-sky-500" />
                  Intervals Athlete ID
                </label>
                <input
                  type="text" placeholder="Ej. i123456" value={form.intervalsAthleteId || ""} onChange={(e) => update("intervalsAthleteId", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Key className="h-3 w-3 text-amber-500" />
                  API Key Intervals.icu
                </label>
                <input
                  type="password" placeholder="Pegar API Key" value={form.apiKey || ""} onChange={(e) => update("apiKey", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={isSaving}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 transition cursor-pointer shadow-xs"
            >
              {savedSuccess ? (
                <><Check className="h-3.5 w-3.5 text-emerald-500" /><span>¡Guardado!</span></>
              ) : (
                <><Save className="h-3.5 w-3.5 text-sky-400" /><span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
