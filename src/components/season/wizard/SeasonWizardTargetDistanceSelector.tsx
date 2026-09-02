"use client";

import React from "react";

interface SeasonWizardTargetDistanceSelectorProps {
  targetDistance: string;
  onChangeDistance: (d: string) => void;
  customDistanceText: string;
  onChangeCustomDistanceText: (t: string) => void;
  isCustomDistance: boolean;
  onToggleCustomDistance: (v: boolean) => void;
}

export const SeasonWizardTargetDistanceSelector: React.FC<SeasonWizardTargetDistanceSelectorProps> = ({
  targetDistance,
  onChangeDistance,
  customDistanceText,
  onChangeCustomDistanceText,
  isCustomDistance,
  onToggleCustomDistance,
}) => {
  const distanceOptions = [
    { label: "42K (Maratón)", value: "42k" },
    { label: "21K (Media)", value: "21k" },
    { label: "10K", value: "10k" },
    { label: "5K", value: "5k" },
    { label: "Gran Fondo Ciclismo", value: "cycling_fondo" },
    { label: "Triatlón Sprint / Olímpico", value: "triathlon_short" },
    { label: "Triatlón 70.3", value: "triathlon_703" },
    { label: "Full 140.6 (IRONMAN)", value: "triathlon_1406" },
    { label: "Ultra Trail", value: "ultra" },
    { label: "Mantenimiento", value: "maintenance" },
  ];

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">
        Distancia / Tipo de Evento
      </label>
      <div className="flex flex-wrap gap-1.5">
        {distanceOptions.map((opt) => {
          const isSelected = !isCustomDistance && targetDistance === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onToggleCustomDistance(false);
                onChangeDistance(opt.value);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                isSelected
                  ? "bg-emerald-500 text-white font-black shadow-xs ring-2 ring-emerald-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onToggleCustomDistance(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
            isCustomDistance
              ? "bg-emerald-500 text-white font-black shadow-xs ring-2 ring-emerald-500/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          ✏️ Personalizado
        </button>
      </div>

      {isCustomDistance && (
        <input
          type="text"
          placeholder="Escribe la prueba (ej. 15K, 12 Millas, 100K Ultra, Gran Fondo 140K)..."
          value={customDistanceText}
          onChange={(e) => {
            onChangeCustomDistanceText(e.target.value);
            onChangeDistance(e.target.value.toLowerCase());
          }}
          className="w-full mt-1.5 rounded-xl border border-emerald-400 dark:border-emerald-600 bg-emerald-50/40 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
        />
      )}
    </div>
  );
};
