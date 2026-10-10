"use client";

import React from "react";
import { BookOpen, ShieldCheck, Footprints, Activity, Zap, CheckCircle2, Award } from "lucide-react";

interface SeasonMethodologyHighlightsProps {
  aiNotes: string[];
}

export const SeasonMethodologyHighlights: React.FC<SeasonMethodologyHighlightsProps> = ({ aiNotes }) => {
  if (!aiNotes || aiNotes.length === 0) return null;

  // Extraer notas por categoría
  const methodNote = aiNotes.find((n) => /metodolog[íi]a|modelo|canova|daniels|pfitzinger/i.test(n));
  const ratioNote = aiNotes.find((n) => /periodizaci[óo]n|ratio|asimilaci[óo]n|semanas/i.test(n) && !/metodolog/i.test(n));
  const longRunNote = aiNotes.find((n) => /tirada|fondo|long run|progresi[óo]n de/i.test(n));
  const testsNote = aiNotes.find((n) => /tests?|evaluaci[óo]n|campo|paladino|contrarreloj/i.test(n));
  const calibNote = aiNotes.find((n) => /calibraci[óo]n|vatios|stryd|bike ftp|pace/i.test(n));

  // Otras notas que no hayan calzado en los 5 pilares
  const otherNotes = aiNotes.filter(
    (n) => n !== methodNote && n !== ratioNote && n !== longRunNote && n !== testsNote && n !== calibNote
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5 shadow-xs animate-fadeIn">
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Pilares de Periodización & Metodología
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Arquitectura científica aplicada para tu objetivo competitivo
            </p>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Validado Head Coach
        </span>
      </div>

      {/* Grid de 4 Pilares Visuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* PILAR 1: METODOLOGÍA CIENTÍFICA */}
        {methodNote && (
          <div className="p-3 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <strong className="text-xs font-black">Modelo Científico Aplicado</strong>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {methodNote.replace(/^Metodología oficial aplicada:\s*/i, "")}
            </p>
          </div>
        )}

        {/* PILAR 2: RATIO Y PERIODIZACIÓN */}
        {ratioNote && (
          <div className="p-3 rounded-xl border border-teal-200/60 dark:border-teal-900/40 bg-gradient-to-br from-teal-50/50 to-white dark:from-teal-950/20 dark:to-slate-900 space-y-1.5">
            <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <strong className="text-xs font-black">Estructura & Ratio de Carga</strong>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {ratioNote.replace(/^Periodización en\s*/i, "Estructurado en ")}
            </p>
          </div>
        )}

        {/* PILAR 3: TIRADA LARGA (LONG RUN) */}
        {longRunNote && (
          <div className="p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
              <Footprints className="h-3.5 w-3.5 shrink-0" />
              <strong className="text-xs font-black">Pauta de Tirada Larga (LSD)</strong>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {longRunNote.replace(/^Pauta de Tirada Larga:\s*/i, "")}
            </p>
          </div>
        )}

        {/* PILAR 4: TESTS FISIOLÓGICOS Y CALIBRACIÓN */}
        {(testsNote || calibNote) && (
          <div className="p-3 rounded-xl border border-purple-200/60 dark:border-purple-900/40 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-slate-900 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
              <Activity className="h-3.5 w-3.5 shrink-0" />
              <strong className="text-xs font-black">Hitos & Tests Fisiológicos</strong>
            </div>
            {testsNote && (
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {testsNote.replace(/^Tests de Campo Fisiológicos programados:\s*/i, "")}
              </p>
            )}
            {calibNote && (
              <div className="pt-1 border-t border-purple-100 dark:border-purple-900/30 flex items-center gap-1.5 text-[10px] font-mono text-purple-700 dark:text-purple-300 font-bold">
                <Zap className="h-3 w-3 shrink-0" />
                <span>{calibNote}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Otras notas si existen */}
      {otherNotes.length > 0 && (
        <div className="pt-1.5 space-y-1">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">
            Directrices Estratégicas Adicionales:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {otherNotes.map((note, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5 font-sans"
              >
                <span className="text-emerald-500 font-bold shrink-0">•</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
