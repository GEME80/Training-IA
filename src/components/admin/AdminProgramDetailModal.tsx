"use client";

import React, { useState, useEffect } from "react";
import { X, Edit3, CheckCircle2 } from "lucide-react";
import { MacrocycleDefinition } from "@/lib/physiology/macrocycleLibrary";
import { AdminProgramDetailViewSection } from "./AdminProgramDetailViewSection";
import { AdminProgramDetailEditSection } from "./AdminProgramDetailEditSection";

interface AdminProgramDetailModalProps {
  program: MacrocycleDefinition | null;
  isOpen: boolean;
  initialMode?: "view" | "edit";
  onClose: () => void;
  onSave: (program: MacrocycleDefinition) => Promise<void>;
  isSaving: boolean;
}

export const AdminProgramDetailModal: React.FC<AdminProgramDetailModalProps> = ({
  program,
  isOpen,
  initialMode = "view",
  onClose,
  onSave,
  isSaving,
}) => {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [form, setForm] = useState<MacrocycleDefinition | null>(null);

  useEffect(() => {
    if (program) {
      setForm({ ...program });
      setMode(initialMode);
    }
  }, [program, initialMode]);

  if (!isOpen || !program || !form) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera del Modal */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white text-xl shadow-md shrink-0">
              {form.icon || "🏃‍♂️"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold truncate">{form.title}</h2>
                {form.isCustom ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    Personalizado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Oficial SSOT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">{form.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {mode === "view" ? (
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-400/30 transition cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Editar Metodología</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("view")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Modo Vista
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenido Scrolleable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-900">
          {mode === "view" ? (
            <AdminProgramDetailViewSection program={form} />
          ) : (
            <AdminProgramDetailEditSection
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        {/* Footer con Acciones */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            {mode === "edit" ? "Cancelar" : "Cerrar"}
          </button>

          {mode === "edit" ? (
            <button
              type="submit"
              form="edit-program-form"
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode("edit")}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Editar Este Programa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
