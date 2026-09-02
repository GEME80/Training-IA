"use client";

import React, { useState } from "react";
import { BookOpen, FlaskConical, TestTube2 } from "lucide-react";
import { AdminProgramLibrariesTab } from "./AdminProgramLibrariesTab";
import { AdminScientificModelsTab } from "./AdminScientificModelsTab";
import { MacrocycleDefinition } from "@/lib/physiology/macrocycleLibrary";

interface AdminMethodologyTabProps {
  programs: MacrocycleDefinition[];
  isLoadingPrograms: boolean;
  onRefreshPrograms: () => void;
  showMessage: (text: string, type: "success" | "error") => void;
  getAuthParams: () => { requesterUid: string; requesterEmail: string };
  initialSubTab?: "programs" | "models" | "tests";
}

export const AdminMethodologyTab: React.FC<AdminMethodologyTabProps> = ({
  programs,
  isLoadingPrograms,
  onRefreshPrograms,
  showMessage,
  getAuthParams,
  initialSubTab = "programs",
}) => {
  const [subTab, setSubTab] = useState<"programs" | "models" | "tests">(initialSubTab);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Selector Unificado Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-950 tracking-tight">
            Ciencia & Programas Deportivos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Base metodológica SSOT, protocolos de test de potencia y catálogo de planes de temporada.
          </p>
        </div>

        {/* Segmented Control de 3 Vías */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setSubTab("programs")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === "programs"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-600" />
            <span>Plantillas ({programs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("models")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === "models"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5 text-cyan-600" />
            <span>Modelos Científicos</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("tests")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === "tests"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <TestTube2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Tests de Campo</span>
          </button>
        </div>
      </div>

      {/* Contenido según la pestaña seleccionada */}
      {subTab === "programs" && (
        <AdminProgramLibrariesTab
          programs={programs}
          isLoadingPrograms={isLoadingPrograms}
          onRefreshPrograms={onRefreshPrograms}
          showMessage={showMessage}
          getAuthParams={getAuthParams}
        />
      )}

      {subTab === "models" && (
        <AdminScientificModelsTab initialView="models" />
      )}

      {subTab === "tests" && (
        <AdminScientificModelsTab initialView="tests" />
      )}
    </div>
  );
};
