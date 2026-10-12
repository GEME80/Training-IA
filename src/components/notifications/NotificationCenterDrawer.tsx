"use client";

import React from "react";
import {
  X,
  RefreshCw,
  Brain,
  Zap,
  CheckCircle2,
  AlertCircle,
  CheckCheck,
  Trash2,
  Calendar,
} from "lucide-react";
import { NotificationItem } from "@/lib/notifications/types";
import { notificationService } from "@/lib/notifications/notificationService";
import { UserStorage } from "@/lib/storage/userStorage";

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  userStorage?: UserStorage;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  userStorage,
}) => {
  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead(userStorage);
  };

  const handleClearAll = () => {
    notificationService.clearAll(userStorage);
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Ahora";
      if (diffMins < 60) return `Hace ${diffMins}m`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Hace ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      return `Hace ${diffDays}d`;
    } catch {
      return "";
    }
  };

  const getCategoryIcon = (category: string, severity: string) => {
    if (severity === "warning" || severity === "error") {
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
    switch (category) {
      case "SYNC":
        return <RefreshCw className="h-4 w-4 text-emerald-500" />;
      case "COACH":
        return <Brain className="h-4 w-4 text-cyan-500" />;
      case "ZONES":
        return <Zap className="h-4 w-4 text-amber-500" />;
      case "SEASON":
        return <Calendar className="h-4 w-4 text-emerald-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-2 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] overflow-hidden animate-scaleUp">
        {/* Cabecera del Centro de Notificaciones */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Actividad & Sincronización
            </h3>
            {notifications.some((n) => !n.read) && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            )}
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                  title="Vaciar historial"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="Cerrar panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Lista de Notificaciones */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 sm:p-3 space-y-1">
          {notifications.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sin actividad pendiente
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                Tu plan se mantiene sincronizado de forma continua e invisible en segundo plano con tu reloj Garmin e Intervals.icu.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => notificationService.markAsRead(userStorage, item.id)}
                className={`p-3 rounded-2xl transition cursor-pointer flex gap-3 items-start ${
                  !item.read
                    ? "bg-slate-50/90 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/30 opacity-80"
                }`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/80 dark:border-slate-700/80 shrink-0 mt-0.5">
                  {getCategoryIcon(item.category, item.severity)}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.message}
                  </p>
                  {item.details && (
                    <p className="text-[10px] text-slate-400 font-mono pt-1">
                      {item.details}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Informativo */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-500 text-center">
          Sincronización continua de 3 semanas (Garmin & Intervals)
        </div>
      </div>
    </div>
  );
};
