"use client";

import React, { useEffect, useState } from "react";
import { notificationService } from "@/lib/notifications/notificationService";
import { NotificationItem } from "@/lib/notifications/types";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const NotificationToast: React.FC = () => {
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const unsubscribe = notificationService.subscribe((items) => {
      if (items.length > 0) {
        const latest = items[0];
        // Solo mostrar toast para notificaciones nuevas creadas hace menos de 5 segundos
        const diffMs = Date.now() - new Date(latest.timestamp).getTime();
        if (diffMs < 5000) {
          setActiveToast(latest);
          clearTimeout(timer);
          timer = setTimeout(() => {
            setActiveToast(null);
          }, 3500);
        }
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  if (!activeToast) return null;

  const isSuccess = activeToast.severity === "success";
  const isWarning = activeToast.severity === "warning" || activeToast.severity === "error";

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-fadeIn transition-all pointer-events-auto">
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white shadow-2xl border border-slate-700/60 backdrop-blur-md">
        <div
          className={`p-2 rounded-xl shrink-0 ${
            isSuccess
              ? "bg-emerald-500/20 text-emerald-400"
              : isWarning
              ? "bg-amber-500/20 text-amber-400"
              : "bg-cyan-500/20 text-cyan-400"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : isWarning ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{activeToast.title}</p>
          <p className="text-[11px] text-slate-300 line-clamp-1">{activeToast.message}</p>
        </div>
        <button
          type="button"
          onClick={() => setActiveToast(null)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
          aria-label="Cerrar notificación"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
