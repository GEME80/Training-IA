"use client";

import React from "react";
import { Sparkles, AlertCircle } from "lucide-react";

export interface SyncNotificationData {
  title: string;
  message: string;
  details?: string;
  type: "success" | "error";
}

interface SyncNotificationModalProps {
  notification: SyncNotificationData | null;
  onClose: () => void;
}

export const SyncNotificationModal: React.FC<SyncNotificationModalProps> = ({
  notification,
  onClose,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="card-gradient rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scaleUp">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                : "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
            }`}
          >
            {notification.type === "success" ? (
              <Sparkles className="h-6 w-6" />
            ) : (
              <AlertCircle className="h-6 w-6" />
            )}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {notification.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Intervals.icu & Garmin Connect
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {notification.message}
        </p>

        {notification.details && (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
            {notification.details}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
