import React from "react";
import Link from "next/link";
import { AlertTriangle, ShieldAlert, HeartPulse, Brain, ArrowLeft, FileCheck, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Términos de Servicio y Exención Médica — PULSE AI",
  description: "Contrato de Términos de Uso, Exención de Responsabilidad Médica y Descargo de IA de PULSE AI.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Cabecera */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a PULSE AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
              Contrato Legal v1.0
            </span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Hero */}
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Aviso Legal Vinculante & Exención Médica</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Términos de Servicio y Exención de Responsabilidad
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Por favor, lee con detenimiento este contrato antes de acceder o utilizar <strong className="text-white">PULSE AI</strong>. Al iniciar sesión, registrarte o ejecutar cualquier sesión prescrita, declaras haber leído, comprendido y aceptado en su totalidad las siguientes cláusulas de exención de responsabilidad y asunción de riesgo.
          </p>
        </div>

        {/* Banner de Advertencia Crítica */}
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 space-y-3">
          <div className="flex items-center gap-2.5 font-bold text-sm text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <span>ADVERTENCIA MÉDICA Y DE SEGURIDAD CRÍTICA</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-amber-100/90">
            PULSE AI NO es un proveedor de atención médica, médico especialista ni centro de diagnóstico cardiológico. La práctica de deportes de alta intensidad como atletismo de fondo, ciclismo y triatlón conlleva riesgos físicos graves. Nunca inicies un programa de entrenamiento sin la aprobación médica previa de un profesional de la salud.
          </p>
        </div>

        {/* Cláusula 1: Naturaleza del Software y Modelos de IA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Brain className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">1. Naturaleza del Servicio e Inteligencia Artificial</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7 space-y-2">
            <p>
              PULSE AI es una herramienta de asistencia tecnológica que combina cálculos matemáticos deterministas (modelo Banister, potencia Stryd, umbrales de lactato estimados) con modelos de lenguaje de Inteligencia Artificial (IA Generativa como Google Gemini).
            </p>
            <p>
              El usuario reconoce expresamente que los modelos de Inteligencia Artificial proporcionan sugerencias automatizadas basadas en telemetría histórica, pero carecen de capacidad diagnóstica humana directa y pueden presentar aproximaciones o desvíos. Las rutinas, ritmos, potencias y volúmenes generados tienen carácter estrictamente informativo y orientativo.
            </p>
          </div>
        </section>

        {/* Cláusula 2: Exención Total de Responsabilidad Médica y por Daños Físicos */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <HeartPulse className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">2. Exención Total de Responsabilidad por Daños Físicos y Lesiones</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7 space-y-3">
            <p>
              El usuario asume el <strong>100% de la responsabilidad civil y física</strong> derivada de la ejecución de cualquier entrenamiento sugerido en la plataforma.
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Riesgos Reconocidos y Asumidos por el Atleta:</h3>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li>Lesiones osteomusculares, tendinopatías, fracturas por estrés o fatiga crónica.</li>
                <li>Deshidratación severa, golpes de calor, hiponatremia o rabdomiólisis.</li>
                <li>Eventos cardiovasculares agudos, arritmias cardíacas, infarto agudo de miocardio o muerte súbita.</li>
                <li>Accidentes viales, colisiones, caídas o atropellamientos en vías públicas o pistas durante entrenamientos de carrera o ciclismo.</li>
              </ul>
            </div>
            <p>
              Al utilizar el servicio, el usuario <strong>exonera de manera irrevocable y definitiva</strong> a PULSE AI, a su creador y director técnico Germán Morales, a sus desarrolladores, directivos y entrenadores de cualquier reclamo legal, demanda judicial, indemnización por perjuicios materiales o morales, incapacidad física o fallecimiento.
            </p>
          </div>
        </section>

        {/* Cláusula 3: Obligación de Autorregulación y Cese Inmediato */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">3. Deber de Autorregulación y Juicio Crítico del Atleta</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7 space-y-2">
            <p>
              El usuario es el único soberano sobre su esfuerzo y cuerpo. Ningún valor prescrito por la plataforma (vatios, pulsaciones o ritmo) prevalece sobre la sintomatología real del deportista.
            </p>
            <p>
              El atleta tiene la obligación indelegable de <strong>detener inmediatamente la actividad deportiva</strong> si experimenta dolor agudo, mareo, opresión en el pecho, náuseas, pérdida de equilibrio o visión borrosa, y acudir de inmediato a los servicios de urgencias médicas.
            </p>
          </div>
        </section>

        {/* Cláusula 4: Daños a Equipos, Dispositivos y Servicios Externos */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <FileCheck className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">4. Exclusión de Responsabilidad por Equipos y Servicios de Terceros</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7 space-y-2">
            <p>
              PULSE AI no se hace responsable por:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li>Averías mecánicas o roturas de bicicletas, sensores de potencia (Stryd), pulsómetros o relojes deportivos (Garmin, Coros, Apple Watch).</li>
              <li>Pérdida de datos, fallos temporales de conectividad, interrupciones de servicio o cambios en las políticas de terceros como Intervals.icu o Garmin Connect.</li>
              <li>Interpretaciones erróneas del usuario respecto a la ejecución técnica de ejercicios de fuerza o ritmos de pista.</li>
            </ul>
          </div>
        </section>

        {/* Cláusula 5: Aceptación Electrónica y Jurisdicción */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">5. Aceptación Vinculante y Validez Legal</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7">
            La marcación de la casilla de consentimiento electrónico durante el inicio de sesión o registro constituye una firma electrónica con pleno valor probatorio y vinculación contractual. Si no estás de acuerdo con alguna de estas disposiciones, debes abstenerte de utilizar la plataforma y suspender tu cuenta.
          </p>
        </section>

        {/* Pie de Página */}
        <footer className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
          <p>© 2026 PULSE AI™ — Todos los derechos reservados.</p>
          <div className="flex items-center justify-center gap-4 text-slate-400">
            <Link href="/privacy" className="hover:text-emerald-400 transition underline underline-offset-2">
              Política de Privacidad
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-emerald-400 transition underline underline-offset-2">
              Inicio
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
