"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Loader2, Footprints, Bike, HeartPulse, Timer, Waves } from "lucide-react";

export type EditableThresholdMetric = "RUN_FTP" | "RUN_PACE" | "BIKE_FTP" | "LTHR" | "SWIM_CSS";

interface QuickThresholdModalProps {
  isOpen: boolean;
  metric: EditableThresholdMetric | null;
  currentValue: string | number;
  onClose: () => void;
  onSave: (metric: EditableThresholdMetric, value: string | number) => Promise<void>;
}

const METRIC_CONFIG: Record<
  EditableThresholdMetric,
  { title: string; subtitle: string; unit: string; icon: any; iconColor: string; isNumeric: boolean; placeholder: string }
> = {
  RUN_FTP: {
    title: "Potencia de Carrera (CP / FTP)",
    subtitle: "Ajusta tu potencia crítica para calibrar las zonas de potencia de carrera (Z1-Z5)",
    unit: "W",
    icon: Footprints,
    iconColor: "text-amber-500",
    isNumeric: true,
    placeholder: "245",
  },
  RUN_PACE: {
    title: "Ritmo Umbral de Carrera",
    subtitle: "Ajusta tu ritmo funcional para recalcular las zonas de ritmo (min/km)",
    unit: "/km",
    icon: Timer,
    iconColor: "text-emerald-500",
    isNumeric: false,
    placeholder: "4:45",
  },
  BIKE_FTP: {
    title: "Ciclismo FTP",
    subtitle: "Ajusta tu umbral de potencia funcional para ciclismo (Z1-Z7)",
    unit: "W",
    icon: Bike,
    iconColor: "text-sky-500",
    isNumeric: true,
    placeholder: "220",
  },
  LTHR: {
    title: "Frecuencia Cardíaca Umbral (LTHR)",
    subtitle: "Ajusta tu umbral de lactato para las zonas cardíacas Friel (Z1-Z5c)",
    unit: "bpm",
    icon: HeartPulse,
    iconColor: "text-rose-500",
    isNumeric: true,
    placeholder: "168",
  },
  SWIM_CSS: {
    title: "Ritmo Umbral Natación (CSS)",
    subtitle: "Ajusta tu velocidad crítica de nado (CSS) para recalcular las zonas de ritmo acuático (min/100m)",
    unit: "/100m",
    icon: Waves,
    iconColor: "text-cyan-500",
    isNumeric: false,
    placeholder: "1:45",
  },
};

export const QuickThresholdModal: React.FC<QuickThresholdModalProps> = ({
  isOpen,
  metric,
  currentValue,
  onClose,
  onSave,
}) => {
  const [val, setVal] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && metric) {
      setVal(String(currentValue || ""));
    }
  }, [isOpen, metric, currentValue]);

  if (!isOpen || !metric) return null;

  const config = METRIC_CONFIG[metric];
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!val || val.trim() === "") return;
    try {
      setIsSaving(true);
      const finalVal = config.isNumeric ? Number(val.trim()) : val.trim();
      await onSave(metric, finalVal);
      onClose();
    } catch {
      // error gestionado en handler superior
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scaleUp">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${config.iconColor}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">{config.title}</h4>
              <p className="text-[10px] text-slate-400 font-mono">Actualización y Sincronización</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <p className="text-xs text-slate-600 dark:text-slate-300">{config.subtitle}</p>

          <div className="relative">
            <input
              type={config.isNumeric ? "number" : "text"}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={config.placeholder}
              required
              autoFocus
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-base font-mono font-black text-slate-900 dark:text-white pr-12 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
              {config.unit}
            </span>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Guardar y Sincronizar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
