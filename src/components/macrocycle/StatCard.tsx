"use client";

import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  badge?: {
    text: string;
    variant?: "success" | "warning" | "info" | "neutral";
  };
  highlightColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  badge,
  highlightColor = "text-slate-900 dark:text-white",
}) => {
  const badgeClasses = {
    success: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    warning: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    info: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    neutral: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  }[badge?.variant || "neutral"];

  return (
    <div className="bg-slate-50/90 dark:bg-slate-800/40 rounded-2xl p-2 sm:p-2.5 text-center border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between gap-1 w-full">
        <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider font-sans truncate">
          {label}
        </span>
        {badge && (
          <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border leading-tight shrink-0 ${badgeClasses}`}>
            {badge.text}
          </span>
        )}
      </div>

      <div className="my-0.5">
        <span className={`text-sm sm:text-base font-black font-mono leading-tight block truncate ${highlightColor}`}>
          {value}
        </span>
      </div>

      {subValue && (
        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 truncate block">
          {subValue}
        </span>
      )}
    </div>
  );
};
