"use client";

import React, { useState, useEffect, useRef } from "react";
import { Edit3, Check, X, LucideIcon, Loader2 } from "lucide-react";

interface EditableZoneCardHeaderProps {
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  subtitle: string;
  modeBadge?: React.ReactNode;
  currentDisplayValue: string;
  unit: string;
  subLabel: string;
  isNumericOnly?: boolean;
  onLiveChange?: (rawVal: string) => void;
  onCommit: (newVal: string) => Promise<void>;
}

export const EditableZoneCardHeader: React.FC<EditableZoneCardHeaderProps> = ({
  icon: Icon,
  iconBgColor = "bg-slate-100 dark:bg-slate-800",
  iconColor = "text-slate-600 dark:text-slate-300",
  title,
  subtitle,
  modeBadge,
  currentDisplayValue,
  unit,
  subLabel,
  isNumericOnly = false,
  onLiveChange,
  onCommit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(currentDisplayValue);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditVal(currentDisplayValue);
    }
  }, [currentDisplayValue, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditVal(val);
    if (onLiveChange) {
      onLiveChange(val);
    }
  };

  const handleSave = async () => {
    if (!editVal || editVal.trim() === "") {
      handleCancel();
      return;
    }
    try {
      setIsSaving(true);
      await onCommit(editVal.trim());
      setIsEditing(false);
    } catch {
      // Si falla, se mantiene en edición
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditVal(currentDisplayValue);
    if (onLiveChange) {
      onLiveChange(currentDisplayValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

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

      {/* Lado Derecho: Click-to-Edit */}
      <div className="text-right shrink-0 pl-2">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <div className="relative">
              <input
                ref={inputRef}
                type={isNumericOnly ? "number" : "text"}
                value={editVal}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className="w-20 px-2 py-0.5 rounded-lg border border-sky-500 bg-white dark:bg-slate-950 font-mono font-bold text-xs text-slate-900 dark:text-white text-right focus:outline-hidden ring-2 ring-sky-500/20"
              />
              <span className="text-[9px] font-mono text-slate-400 ml-1">{unit}</span>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition cursor-pointer"
              title="Guardar"
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="p-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition cursor-pointer"
              title="Cancelar"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="group flex items-baseline justify-end gap-1.5 text-right cursor-pointer hover:opacity-80 transition select-none"
            title="Haz clic para editar este umbral"
          >
            <div>
              <span className="text-xs font-black font-mono text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                {currentDisplayValue} {unit}
                <Edit3 className="h-2.5 w-2.5 text-slate-400 group-hover:text-sky-500 transition" />
              </span>
              <span className="block text-[9px] font-mono text-slate-400">{subLabel}</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
