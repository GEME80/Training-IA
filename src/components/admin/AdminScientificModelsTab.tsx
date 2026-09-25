"use client";

import React, { useState } from "react";
import {
  FlaskConical,
  Footprints,
  Bike,
  Waves,
  Mountain,
  ShieldCheck,
} from "lucide-react";
import { ALL_CURATED_TRAINING_MODELS, CuratedTrainingModel } from "@/lib/ai/knowledge";
import {
  RUN_TEST_STRYD_3_9,
  RUN_TEST_20M_TT,
  RUN_TEST_5K_VAM,
  BIKE_TEST_20M_FTP,
  BIKE_TEST_RAMP,
  SWIM_TEST_CSS_400_200,
} from "@/lib/ai/knowledge/testingProtocols";
import { PhysiologicalTestDefinition } from "@/lib/ai/knowledge/types";
import { AdminScientificModelCard } from "./AdminScientificModelCard";
import { AdminScientificModelDetailModal } from "./AdminScientificModelDetailModal";
import { AdminFieldTestCard } from "./AdminFieldTestCard";
import { AdminFieldTestDetailModal } from "./AdminFieldTestDetailModal";

interface AdminScientificModelsTabProps {
  initialView?: "models" | "tests";
}

export const AdminScientificModelsTab: React.FC<AdminScientificModelsTabProps> = ({
  initialView = "models",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeView, setActiveView] = useState<"models" | "tests">(initialView);

  // Estados para modales de inspección detallada
  const [selectedModel, setSelectedModel] = useState<CuratedTrainingModel | null>(null);
  const [selectedTest, setSelectedTest] = useState<PhysiologicalTestDefinition | null>(null);

  React.useEffect(() => {
    if (initialView) {
      setActiveView(initialView);
    }
  }, [initialView]);

  const modelsList = Object.values(ALL_CURATED_TRAINING_MODELS);
  const testProtocols = [
    RUN_TEST_STRYD_3_9,
    RUN_TEST_20M_TT,
    RUN_TEST_5K_VAM,
    BIKE_TEST_20M_FTP,
    BIKE_TEST_RAMP,
    SWIM_TEST_CSS_400_200,
  ];

  const filteredModels = modelsList.filter((m) => {
    if (selectedCategory === "ALL") return true;
    return m.sportCategory.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera Principal */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <FlaskConical className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-black tracking-tight">
              Modelos Científicos & Tests Fisiológicos
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Base metodológica SSOT que rige los macrociclos (Canova, Pfitzinger, Coggan, Friel, Koop, Seiler) y protocolos de campo de calibración de potencia y ritmo (Stryd CP / Bike FTP / CSS).
          </p>
        </div>

        {/* Selector de Vista: Modelos vs Tests */}
        <div className="flex items-center p-1 bg-white/10 rounded-2xl border border-white/15 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView("models")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === "models"
                ? "bg-cyan-500 text-slate-950 shadow-md font-black"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Modelos Fisiológicos ({modelsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView("tests")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === "tests"
                ? "bg-cyan-500 text-slate-950 shadow-md font-black"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Tests de Campo ({testProtocols.length})
          </button>
        </div>
      </div>

      {/* VISTA 1: MODELOS CIENTÍFICOS */}
      {activeView === "models" && (
        <div className="space-y-5">
          {/* Filtros de Categoría */}
          <div className="flex flex-wrap items-center gap-2">
            {["ALL", "Running", "Cycling", "Triathlon", "Trail", "General"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat === "ALL" ? "Todos los Deportes" : cat}
              </button>
            ))}
          </div>

          {/* Grid de Modelos Científicos Interactivos */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filteredModels.map((model) => (
              <AdminScientificModelCard
                key={model.modelId}
                model={model}
                onSelect={(m) => setSelectedModel(m)}
              />
            ))}
          </div>
        </div>
      )}

      {/* VISTA 2: TESTS FISIOLÓGICOS DE CAMPO */}
      {activeView === "tests" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testProtocols.map((test) => (
            <AdminFieldTestCard
              key={test.testId}
              test={test}
              onSelect={(t) => setSelectedTest(t)}
            />
          ))}
        </div>
      )}

      {/* Modal Inspector Detallado de Modelo Científico */}
      <AdminScientificModelDetailModal
        isOpen={Boolean(selectedModel)}
        onClose={() => setSelectedModel(null)}
        model={selectedModel}
      />

      {/* Modal Inspector Detallado de Test de Campo */}
      <AdminFieldTestDetailModal
        isOpen={Boolean(selectedTest)}
        onClose={() => setSelectedTest(null)}
        test={selectedTest}
      />
    </div>
  );
};
