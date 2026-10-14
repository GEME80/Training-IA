import React from "react";
import Link from "next/link";
import { Shield, Lock, Activity, Eye, FileText, CheckCircle2, ArrowLeft, Mail } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad — PULSE AI",
  description: "Política de Privacidad y Tratamiento de Datos Personales y Biométricos de PULSE AI.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Cabecera de Navegación */}
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
              Vigencia: Octubre 2026 (v1.0)
            </span>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Hero de Política */}
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Protección de Datos & Seguridad Deportiva</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Política de Privacidad y Tratamiento de Datos
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            En <strong className="text-slate-200">PULSE AI</strong> nos tomamos con total rigor la privacidad de tu información personal, biológica y de telemetría de rendimiento deportivo. Este documento detalla cómo recolectamos, procesamos, custodiamos y protegemos tus datos cuando utilizas nuestra plataforma de entrenamiento inteligente.
          </p>
        </div>

        {/* Sección 1: Responsable del Tratamiento */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <FileText className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">1. Responsable del Tratamiento</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7">
            La plataforma tecnológica <strong className="text-slate-100">PULSE AI</strong> es operada bajo la dirección técnica de Germán Morales. Para cualquier duda, ejercicio de derechos de privacidad o supresión de datos, puedes comunicarte directamente al correo institucional:{" "}
            <a href="mailto:gerkof@gmail.com" className="text-emerald-400 underline underline-offset-4 hover:text-emerald-300">
              gerkof@gmail.com
            </a>.
          </p>
        </section>

        {/* Sección 2: Datos que Recopilamos */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Activity className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">2. Datos Recopilados</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7">
            Para formular planes de entrenamiento adaptativo y prescribir cargas con exactitud biológica, recopilamos las siguientes categorías de datos:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">Datos de Cuenta e Identidad</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Nombre y apellidos facilitados en el registro o Google OAuth.</li>
                <li>Dirección de correo electrónico verificada.</li>
                <li>Fotografía de perfil pública (opcional, vía Google).</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">Datos Antropométricos y Biológicos</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Edad, fecha de nacimiento y género biológico.</li>
                <li>Peso corporal (kg) y estatura (cm).</li>
                <li>Frecuencia cardíaca de reposo, FC máxima y umbral anaeróbico (LTHR).</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 md:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">Telemetría de Rendimiento Deportivo (Intervals.icu / Sensores)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cuando conectas tu cuenta de Intervals.icu (mediante OAuth 2.0 o API Key), recopilamos de forma sincronizada:
              </p>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside pt-1">
                <li>Potencia de carrera Stryd (Critical Power - CP) y umbral de ritmo funcional.</li>
                <li>Potencia de ciclismo (FTP en vatios) y zonas de potencia.</li>
                <li>Velocidad Crítica de Natación (CSS por 100m).</li>
                <li>Métricas de Carga y Fatiga (Modelo Banister: CTL, ATL, TSB, Ramp Rate).</li>
                <li>Historial de entrenamientos completados (duración, distancia, pulsaciones, TSS, desvíos).</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sección 3: Finalidad y Uso de Inteligencia Artificial */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Lock className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">3. Finalidad del Tratamiento y Modelos de IA</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7 space-y-2">
            <p>
              Tus datos son utilizados <strong>exclusivamente</strong> para los siguientes fines operativos y deportivos:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li>Generar macrociclos, microciclos y periodización deportiva personalizada (5K, 10K, 21K, 42K, Ciclismo, Triatlón).</li>
              <li>Sincronizar tus entrenamientos programados hacia tu reloj Garmin / cuenta de Intervals.icu.</li>
              <li>Alimentar el agente consultor Head Coach para responder tus consultas fisiológicas con telemetría en tiempo real.</li>
              <li>Calcular alertas tempranas de sobreentrenamiento, fatiga aguda excesiva o desacoplamiento aeróbico.</li>
            </ul>
            <p className="text-slate-400 pt-1">
              <strong>Compromiso FinOps y Ética de Datos:</strong> PULSE AI <strong className="text-slate-200">NO vende, NO arrienda, NO comercializa ni cede</strong> tus datos biométricos ni de rendimiento a agencias publicitarias ni a terceros.
            </p>
          </div>
        </section>

        {/* Sección 4: Cifrado y Seguridad Técnica */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Shield className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">4. Seguridad y Cifrado Criptográfico</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7 space-y-2">
            <p>
              Adoptamos estándares de seguridad de grado bancario para la custodia de tus accesos:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li><strong>Cifrado en Reposo (AES-256-GCM):</strong> Toda clave de acceso externa o token OAuth se cifra en el servidor con un vector de inicialización único y etiqueta de autenticación antes de ser almacenado.</li>
              <li><strong>Aislamiento Estricto por UID:</strong> Es técnicamente imposible que un atleta acceda a la telemetría, perfil o entrenamientos de otro deportista.</li>
              <li><strong>Comunicaciones Seguras:</strong> Todas las transferencias de datos viajan cifradas con TLS/HTTPS bajo certificados SSL actualizados.</li>
            </ul>
          </div>
        </section>

        {/* Sección 5: Integraciones con Terceros */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Eye className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">5. Servicios de Terceros Conectados</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7">
            Nuestra aplicación interactúa con la API oficial de <strong className="text-slate-100">Intervals.icu</strong> y con modelos de lenguaje de alto rendimiento de <strong className="text-slate-100">Google Gemini API</strong>. Los datos enviados a la IA se comprimen exclusivamente como métricas cuantitativas despersonalizadas para optimizar tokens y preservar el anonimato del atleta.
          </p>
        </section>

        {/* Sección 6: Tus Derechos y Supresión de Cuenta */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">6. Derechos del Usuario (Acceso, Rectificación y Olvido)</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7 space-y-2">
            <p>
              Como titular de tus datos, puedes en cualquier momento:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li>Consultar y editar tus métricas antropométricas desde la sección Perfil.</li>
              <li>Desconectar o revocar el acceso a Intervals.icu con un solo clic.</li>
              <li>Solicitar la eliminación total y permanente de tu cuenta y base de datos escribiéndonos a <a href="mailto:gerkof@gmail.com" className="text-emerald-400 underline">gerkof@gmail.com</a>.</li>
            </ul>
          </div>
        </section>

        {/* Pie de Página */}
        <footer className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
          <p>© 2026 PULSE AI™ — Todos los derechos reservados.</p>
          <div className="flex items-center justify-center gap-4 text-slate-400">
            <Link href="/terms" className="hover:text-emerald-400 transition underline underline-offset-2">
              Términos de Servicio y Exención Médica
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
