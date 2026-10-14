"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldAlert, HeartPulse, Brain, AlertTriangle, FileText, CheckCircle2, ArrowRight } from "lucide-react";

interface TermsConsentModalProps {
  isOpen: boolean;
  onAccepted: () => void;
  userUid: string;
  userEmail?: string;
}

export const TermsConsentModal: React.FC<TermsConsentModalProps> = ({
  isOpen,
  onAccepted,
  userUid,
  userEmail,
}) => {
  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAcceptTerms = async () => {
    if (!hasAgreed || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const nowIso = new Date().toISOString();
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: userUid,
          email: userEmail || "atleta@pulseai.pro",
          termsAcceptedAt: nowIso,
          termsVersion: "1.0",
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo registrar la aceptación en el servidor.");
      }

      onAccepted();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar la aceptación.";
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-white shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Cabecera del Contrato */}
        <div className="space-y-2 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Consentimiento Obligatorio de Usuario (v1.0)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Términos de Servicio y Exención de Responsabilidad Médica & IA
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Para garantizar tu seguridad y la transparencia legal en el uso de modelos de Inteligencia Artificial, debes aceptar las siguientes condiciones antes de continuar.
          </p>
        </div>

        {/* Resumen Estructurado con Scroll */}
        <div className="space-y-3 overflow-y-auto pr-1 text-xs text-slate-300 leading-relaxed border border-slate-800 rounded-2xl p-4 bg-slate-950/60 divide-y divide-slate-800/80">
          <div className="space-y-1.5 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Brain className="w-4 h-4 shrink-0" />
              <span className="uppercase tracking-wider text-[11px]">1. Asistencia de Inteligencia Artificial (No Médico)</span>
            </div>
            <p>
              PULSE AI es una plataforma de software que utiliza algoritmos y modelos de Inteligencia Artificial. <strong className="text-white">NO es un médico, ni un cardiólogo ni sustituye el diagnóstico o criterio médico profesional</strong>. Sus prescripciones y sugerencias tienen carácter orientativo.
            </p>
          </div>

          <div className="space-y-1.5 py-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <HeartPulse className="w-4 h-4 shrink-0" />
              <span className="uppercase tracking-wider text-[11px]">2. Exención Total de Responsabilidad por Daños Físicos</span>
            </div>
            <p>
              El deporte de resistencia implica riesgos de lesiones, deshidratación, fatiga crónica, fallos cardíacos y accidentes. Declaras contar con aptitud médica certificada y <strong className="text-white">asumes el 100% de la responsabilidad civil y física</strong>, exonerando a PULSE AI y a su equipo de cualquier reclamo por lesiones, daños corporales o muerte.
            </p>
          </div>

          <div className="space-y-1.5 py-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="uppercase tracking-wider text-[11px]">3. Deber de Autorregulación Inmediata</span>
            </div>
            <p>
              Eres el único responsable de escuchar las señales de tu cuerpo. Debes suspender inmediatamente el entrenamiento ante cualquier dolor punzante, opresión torácica, mareo o malestar, sin forzar intensidades o ritmos sugeridos por la app.
            </p>
          </div>

          <div className="space-y-1.5 pt-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <FileText className="w-4 h-4 shrink-0" />
              <span className="uppercase tracking-wider text-[11px]">4. Documentos Legales Completos</span>
            </div>
            <p className="text-slate-400">
              Puedes consultar los textos oficiales completos en cualquier momento:
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/terms"
                target="_blank"
                className="text-emerald-400 hover:text-emerald-300 underline font-semibold"
              >
                Términos de Servicio & Exención Completa ↗
              </Link>
              <span>•</span>
              <Link
                href="/privacy"
                target="_blank"
                className="text-emerald-400 hover:text-emerald-300 underline font-semibold"
              >
                Política de Privacidad ↗
              </Link>
            </div>
          </div>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-600/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Checkbox de Consentimiento Obligatorio */}
        <div className="space-y-4 shrink-0">
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-emerald-500/50 transition cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-600 cursor-pointer"
            />
            <span className="text-xs text-slate-200 leading-relaxed">
              He leído, comprendo y acepto expresamente los <strong className="text-white">Términos de Servicio</strong>, la <strong className="text-white">Exención de Responsabilidad Médica y por Inteligencia Artificial</strong> y la <strong className="text-white">Política de Privacidad</strong> de PULSE AI.
            </span>
          </label>

          <button
            type="button"
            disabled={!hasAgreed || isSubmitting}
            onClick={handleAcceptTerms}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            {isSubmitting ? (
              <span>Registrando aceptación legal...</span>
            ) : (
              <>
                <span>Aceptar y Entrar a la Plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
