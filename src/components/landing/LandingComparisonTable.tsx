"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertCircle, Sparkles } from "lucide-react";

export const LandingComparisonTable: React.FC = () => {
  const rows = [
    {
      feature: "Reajuste diario según HRV y descanso",
      traditional: "No (Rígido)",
      trainingPeaks: "Manual (Entrenador $150/mes)",
      pulseAi: "Automático cada mañana",
      highlight: true,
    },
    {
      feature: "Prescripción de vatios por Stryd y FTP",
      traditional: "Rara vez (Ritmo o Pulso)",
      trainingPeaks: "Complejo de configurar",
      pulseAi: "Nativo por % FTP y tiempo",
      highlight: false,
    },
    {
      feature: "Prevención de lesiones (Cap 3h y 3:1)",
      traditional: "Inexistente",
      trainingPeaks: "Requiere interpretación",
      pulseAi: "Reglas fisiológicas inviolables",
      highlight: true,
    },
    {
      feature: "Descarga directa de series a tu reloj",
      traditional: "Tienes que crearlas a mano",
      trainingPeaks: "Requiere suscripción premium",
      pulseAi: "1 Clic vía Intervals.icu",
      highlight: false,
    },
    {
      feature: "Inteligencia adaptativa continua",
      traditional: "Cero",
      trainingPeaks: "Gráficas estáticas",
      pulseAi: "Razonamiento con Google Gemini",
      highlight: true,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
          Diferenciación de Rendimiento
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          La Evolución del Entrenamiento de Resistencia
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Descubre por qué los deportistas abandonan las plantillas fijas y los entrenamientos a ciegas.
        </p>
      </div>

      <div className="bg-white/90 border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/30 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70">
                <th className="py-5 px-6 text-xs font-bold font-mono text-slate-500 uppercase">
                  Capacidad Clave
                </th>
                <th className="py-5 px-5 text-xs font-bold font-mono text-slate-500 uppercase text-center">
                  Planes en PDF / Papel
                </th>
                <th className="py-5 px-5 text-xs font-bold font-mono text-slate-500 uppercase text-center">
                  Apps Tradicionales
                </th>
                <th className="py-5 px-6 text-xs font-black font-mono text-cyan-800 uppercase bg-cyan-50/70 text-center border-x border-cyan-200/60">
                  <div className="flex items-center justify-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                    <span>PULSE AI PRO</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    row.highlight ? "bg-slate-50/40" : "hover:bg-slate-50/60"
                  }`}
                >
                  <td className="py-4.5 px-6 font-semibold text-slate-900 text-xs sm:text-sm">
                    {row.feature}
                  </td>
                  <td className="py-4.5 px-5 text-center text-xs text-slate-500">
                    <div className="inline-flex items-center gap-1.5 text-rose-600 font-medium">
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span>{row.traditional}</span>
                    </div>
                  </td>
                  <td className="py-4.5 px-5 text-center text-xs text-slate-500">
                    <div className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{row.trainingPeaks}</span>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 text-center text-xs font-bold text-slate-950 bg-cyan-50/40 border-x border-cyan-200/60">
                    <div className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{row.pulseAi}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
