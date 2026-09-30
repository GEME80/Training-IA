"use client";

import React, { useState } from "react";
import { Zap, Check, X, Loader2, Timer } from "lucide-react";

export interface ThresholdSuggestionItem {
  id: string;
  metric: "BIKE_FTP" | "RUN_FTP" | "RUN_PACE";
  activityName: string;
  date?: string;
  currentValue: number | string;
  suggestedValue: number | string;
  deltaLabel: string;
  message: string;
}

interface SuggestedThresholdBannerProps {
  suggestion: ThresholdSuggestionItem;
  onApply: (suggestion: ThresholdSuggestionItem) => Promise<void>;
  onDismiss: (suggestion: ThresholdSuggestionItem) => void;
}

export const SuggestedThresholdBanner: React.FC<SuggestedThresholdBannerProps> = ({
  suggestion,
  onApply,
  onDismiss,
}) => {
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    try {
      setIsApplying(true);
      await onApply(suggestion);
    } finally {
      setIsApplying(false);
    }
  };

  const isBike = suggestion.metric === "BIKE_FTP";
  const borderClass = isBike ? "border-sky-500/40 bg-sky-500/10 text-sky-950 dark:text-sky-200" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200";
  const iconColor = isBike ? "text-sky-500" : "text-emerald-500";

  return (
    <div className={`p-2.5 rounded-xl border ${borderClass} animate-fadeIn space-y-1.5 text-xs`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold">
          {isBike ? <Zap className={`h-3.5 w-3.5 ${iconColor}`} /> : <Timer className={`h-3.5 w-3.5 ${iconColor}`} />}
          <span className="text-[11px] font-mono uppercase tracking-wide">
            Test detectado ({suggestion.date || "reciente"})
          </span>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(suggestion)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
          title="Descartar sugerencia"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="text-[11px] leading-tight opacity-90">
        <strong>{suggestion.activityName}</strong>: Sugiere actualizar de{" "}
        <span className="font-mono line-through opacity-70">{suggestion.currentValue}</span> a{" "}
        <strong className="font-mono underline decoration-2">{suggestion.suggestedValue}</strong> (
        <span className="font-mono font-bold">{suggestion.deltaLabel}</span>).
      </p>

      <div className="flex items-center justify-end gap-2 pt-0.5">
        <button
          type="button"
          disabled={isApplying}
          onClick={() => onDismiss(suggestion)}
          className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
        >
          Descartar
        </button>
        <button
          type="button"
          disabled={isApplying}
          onClick={handleApply}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer text-white shadow-xs ${
            isBike ? "bg-sky-600 hover:bg-sky-500" : "bg-emerald-600 hover:bg-emerald-500"
          }`}
        >
          {isApplying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          <span>Aplicar y Sincronizar</span>
        </button>
      </div>
    </div>
  );
};
