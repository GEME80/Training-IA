"use client";

import React from "react";
import { BookOpen, Sparkles, Plus, RotateCcw } from "lucide-react";

interface AdminProgramHeaderProps {
  onOpenAiModal: () => void;
  onNewProgram: () => void;
  onResetPrograms: () => void;
}

export const AdminProgramHeader: React.FC<AdminProgramHeaderProps> = ({
  onOpenAiModal,
  onNewProgram,
  onResetPrograms,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl text-white shadow-xl">
      <div className="space-y-1">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-black tracking-tight">Librerías & Programas Deportivos</h1>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Catálogo maestro de planes de periodización. Haz clic en cualquier tarjeta para ver la metodología completa o pulsa Editar para calibrarla.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenAiModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>Crear con Asistente IA</span>
        </button>

        <button
          type="button"
          onClick={onNewProgram}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Programa</span>
        </button>

        <button
          type="button"
          onClick={onResetPrograms}
          title="Restablecer catálogo oficial de fábrica"
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 transition cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
