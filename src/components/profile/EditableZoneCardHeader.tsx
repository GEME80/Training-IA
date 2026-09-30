"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface EditableZoneCardHeaderProps {
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  subtitle: string;
  modeBadge?: React.ReactNode;
}

export const EditableZoneCardHeader: React.FC<EditableZoneCardHeaderProps> = ({
  icon: Icon,
  iconBgColor = "bg-slate-100 dark:bg-slate-800",
  iconColor = "text-slate-600 dark:text-slate-300",
  title,
  subtitle,
  modeBadge,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
      {/* Lado Izquierdo: Icono + Título + Badges */}
      <div className="flex items-center space-x-2 min-w-0">
        <div className={`p-1 rounded-lg ${iconBgColor} ${iconColor} shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
            <span className="truncate">{title}</span>
            {modeBadge}
          </h5>
          <span className="text-[10px] font-mono text-slate-400 block truncate">{subtitle}</span>
        </div>
      </div>
    </div>
  );
};
