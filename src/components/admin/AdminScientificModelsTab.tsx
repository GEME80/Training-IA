"use client";

import React, { useState } from "react";
import {
  FlaskConical,
  Award,
  Calendar,
  Activity,
  Flame,
  Dumbbell,
  Clock,
  Zap,
  Footprints,
  Bike,
  Waves,
  Mountain,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { ALL_CURATED_TRAINING_MODELS, CuratedTrainingModel, SportDisciplineGoal } from "@/lib/ai/knowledge";
import {
  RUN_TEST_STRYD_3_9,
  RUN_TEST_20M_TT,
  BIKE_TEST_20M_FTP,
  BIKE_TEST_RAMP,
} from "@/lib/ai/knowledge/testingProtocols";

interface AdminScientificModelsTabProps {
  initialView?: "models" | "tests";
}

export const AdminScientificModelsTab: React.FC<AdminScientificModelsTabProps> = ({
  initialView = "models",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeView, setActiveView] = useState<"models" | "tests">(initialView);

  React.useEffect(() => {
    if (initialView) {
      setActiveView(initialView);
    }
  }, [initialView]);

  const [copiedTestId, setCopiedTestId] = useState<string | null>(null);

  const modelsList = Object.values(ALL_CURATED_TRAINING_MODELS);
  const testProtocols = [RUN_TEST_STRYD_3_9, RUN_TEST_20M_TT, BIKE_TEST_20M_FTP, BIKE_TEST_RAMP];

  const filteredModels = modelsList.filter((m) => {
    if (selectedCategory === "ALL") return true;
    return m.sportCategory.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleCopyDoc = (id: string, doc: string) => {
    navigator.clipboard.writeText(doc);
    setCopiedTestId(id);
    setTimeout(() => setCopiedTestId(null), 2500);
  };

  const renderSportIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "running":
        return <Footprints className="h-5 w-5 text-amber-500" />;
      case "cycling":
        return <Bike className="h-5 w-5 text-sky-500" />;
      case "triathlon":
        return <Waves className="h-5 w-5 text-cyan-500" />;
      case "trail":
        return <Mountain className="h-5 w-5 text-emerald-500" />;
      default:
        return <ShieldCheck className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera Principal */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <FlaskConical className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-black tracking-tight">Modelos Científicos & Tests Fisiológicos</h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Base de conocimiento metodológica SSOT que gobierna al Agente Diseñador de Macrociclos (Canova, Pfitzinger, Coggan, Friel, Koop, Seiler) y protocolos de test de potencia (Stryd CP / Bike FTP).
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
            📚 Modelos ({modelsList.length})
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
            🧪 Tests de Campo ({testProtocols.length})
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
                {cat === "ALL" ? "🌐 Todos los Deportes" : cat}
              </button>
            ))}
          </div>

          {/* Grid de Modelos */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filteredModels.map((model) => (
              <div
                key={model.modelId}
                className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 hover:border-cyan-400"
              >
                {/* Cabecera del Modelo */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 shrink-0">
                      {renderSportIcon(model.sportCategory)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{model.displayName}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">{model.periodizationStyle}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 shrink-0">
                    {model.sportCategory}
                  </span>
                </div>

                {/* Autores Científicos */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fundamento Científico</span>
                  <div className="flex flex-wrap gap-1.5">
                    {model.scientificAuthors.map((author, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white text-slate-700 border border-slate-200">
                        👨‍🔬 {author}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Distribución de Fases con Barras Porcentuales */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Distribución de Fases Macrocíclicas</span>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {model.phaseDistributions.map((p) => (
                      <div key={p.phaseKey} className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">{p.phaseKey}</span>
                        <span className="text-xs font-black text-slate-900">{Math.round(p.percentageDuration * 100)}%</span>
                        <span className="text-[9px] text-slate-400 block font-mono">{p.weeklyTssRange.min}-{p.weeklyTssRange.max} TSS</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pauta de Tirada Larga & Tests Programados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
                      <Flame className="h-3 w-3 text-amber-600" /> Tirada Pico
                    </span>
                    <strong className="text-amber-950 block text-[11px]">{model.longRunRules.targetIntensityPercentCpOrFtp}</strong>
                    <span className="text-[10px] text-amber-800 font-mono">Pico: {model.longRunRules.peakKm} km ({model.longRunRules.peakMinutes} min)</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-cyan-900 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-cyan-600" /> Tests Fisiológicos
                    </span>
                    <span className="text-[10px] text-cyan-800 font-medium block">
                      {model.mandatoryTests.map((t) => `Sem ${t.recommendedWeekIndex}: ${t.testName.slice(0, 20)}...`).join(" • ") || "Calibración Continua"}
                    </span>
                  </div>
                </div>

                {/* Rampa Banister & Cross Training */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>📐 Rampa CTL: +{model.banisterRampRateLimits.minCtlPerWeek} a +{model.banisterRampRateLimits.maxCtlPerWeek}/sem</span>
                  <span>{model.crossTrainingRules.notes.slice(0, 45)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 2: TESTS FISIOLÓGICOS DE CAMPO */}
      {activeView === "tests" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testProtocols.map((test) => (
            <div
              key={test.testId}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4 hover:border-cyan-400 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {test.sport === "Run" ? "👟 Stryd Running CP" : "🚴 Bike FTP"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">Semana Recomendada: {test.recommendedWeekIndex}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900">{test.testName}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyDoc(test.testId, test.workoutDoc)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  title="Copiar sintaxis estructurada para Intervals"
                >
                  {copiedTestId === test.testId ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                      <span>Copiar Workout</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{test.protocolDescription}</p>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-900 uppercase">Fórmula de Cálculo</span>
                <p className="text-[11px] font-mono text-emerald-800 font-bold">{test.calculationFormula}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Estructura de Bloques (Sintaxis Stryd / Intervals.icu)</span>
                <pre className="p-3 rounded-2xl bg-slate-900 text-cyan-300 font-mono text-[10px] leading-snug overflow-x-auto max-h-48">
                  {test.workoutDoc}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
