import React from "react";
import Link from "next/link";
import { AlertTriangle, ShieldAlert, HeartPulse, Brain, ArrowLeft, FileCheck, CheckCircle2, Award, CreditCard, Scale } from "lucide-react";

export const metadata = {
  title: "Términos de Servicio, Pagos y Exención Médica — PULSE ENDURANCE (German Morales Consulting)",
  description: "Contrato de Términos de Uso, Condiciones Comerciales, Retracto, Reversión de Pago y Exención Médica de PULSE ENDURANCE operado por German Morales Consulting.",
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
            <span>Volver a PULSE ENDURANCE</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
              Contrato Legal v1.1
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
            Por favor, lee con detenimiento este contrato antes de acceder o utilizar <strong className="text-white">PULSE ENDURANCE</strong>. Al iniciar sesión, registrarte o ejecutar cualquier sesión prescrita, declaras haber leído, comprendido y aceptado en su totalidad las siguientes cláusulas de exención de responsabilidad y asunción de riesgo.
          </p>
        </div>

        {/* Banner de Advertencia Crítica */}
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 space-y-3">
          <div className="flex items-center gap-2.5 font-bold text-sm text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <span>ADVERTENCIA MÉDICA Y DE SEGURIDAD CRÍTICA</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-amber-100/90">
            PULSE ENDURANCE NO es un proveedor de atención médica, médico especialista ni centro de diagnóstico cardiológico. La práctica de deportes de alta intensidad como atletismo de fondo, ciclismo y triatlón conlleva riesgos físicos graves. Nunca inicies un programa de entrenamiento sin la aprobación médica previa de un profesional de la salud.
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
              PULSE ENDURANCE es una herramienta de asistencia tecnológica que combina cálculos matemáticos deterministas (modelo Banister, potencia Stryd, umbrales de lactato estimados) con modelos de lenguaje de Inteligencia Artificial (IA Generativa como Google Gemini).
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
              Al utilizar el servicio, el usuario <strong>exonera de manera irrevocable y definitiva</strong> a PULSE ENDURANCE, a su creador y director técnico Germán Morales, a sus desarrolladores, directivos y entrenadores de cualquier reclamo legal, demanda judicial, indemnización por perjuicios materiales o morales, incapacidad física o fallecimiento.
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
              PULSE ENDURANCE no se hace responsable por:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li>Averías mecánicas o roturas de bicicletas, sensores de potencia (Stryd), pulsómetros o relojes deportivos (Garmin, Coros, Apple Watch).</li>
              <li>Pérdida de datos, fallos temporales de conectividad, interrupciones de servicio o cambios en las políticas de terceros como Intervals.icu o Garmin Connect.</li>
              <li>Interpretaciones erróneas del usuario respecto a la ejecución técnica de ejercicios de fuerza o ritmos de pista.</li>
            </ul>
          </div>
        </section>

        {/* Cláusula 5: Propiedad Intelectual, Marcas de Terceros y Atribución Científica */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Award className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">5. Propiedad Intelectual, Marcas de Terceros y Atribución Científica</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7 space-y-2">
            <p>
              PULSE ENDURANCE aplica principios biomecánicos, fisiológicos y modelos algorítmicos de dominio público desarrollados e investigados por destacadas figuras de las ciencias del deporte (Renato Canova, Dr. Stephen Seiler, Dr. Andrew Coggan, Dr. Jack Daniels, Eric Banister). La mención de sus nombres, citas pedagógicas o metodologías en esta plataforma tiene fines exclusivamente informativos, académicos y de reconocimiento de autoría científica. Dicha mención no implica patrocinio, certificación oficial, aval comercial ni vínculo societario directo entre dichos autores y PULSE ENDURANCE.
            </p>
            <p>
              Todas las marcas comerciales, nombres de producto y logotipos de terceros citados en la plataforma (incluyendo, sin limitación, Garmin®, Coros®, Apple Watch®, Strava®, Stryd®, Intervals.icu®, TrainingPeaks®, VDOT®, TSS®, FTP) son propiedad exclusiva de sus respectivos titulares. Su uso en esta plataforma se realiza bajo el principio de <strong>Uso Justo Nominativo (Nominative Fair Use)</strong> con el único propósito de identificar la compatibilidad técnica de hardware, protocolos de comunicación y estándares de la industria del rendimiento deportivo.
            </p>
          </div>
        </section>

        {/* Cláusula 6: Identidad Comercial, Facturación en COP y Suscripción Recurrente */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <CreditCard className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">6. Identidad Comercial, Facturación en COP y Suscripción Mensual</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7 space-y-2.5">
            <p>
              <strong>Titularidad del Comercio:</strong> La plataforma digital <strong>PULSE ENDURANCE</strong> (<code>https://pulseendurance.co</code>) es propiedad y está operada comercialmente por <strong>German Morales Consulting</strong>, con domicilio en Bogotá D.C., República de Colombia, y correo oficial de atención al usuario y soporte:{" "}
              <a href="mailto:gerkof@gmail.com" className="text-emerald-400 underline underline-offset-4 hover:text-emerald-300">
                gerkof@gmail.com
              </a>.
            </p>
            <p>
              <strong>Moneda Única Oficial (COP) y Tarjetas Internacionales:</strong> Todos los cobros de la suscripción se liquidan y procesan única y exclusivamente en <strong>Pesos Colombianos (COP)</strong> según la tarifa vigente publicada en la plataforma al momento de la suscripción. Si el usuario realiza el pago desde el exterior o con una tarjeta internacional (Visa, Mastercard o American Express emitida fuera de Colombia), la transacción se procesará en Pesos Colombianos (COP) y la entidad bancaria emisora del comprador realizará automáticamente la conversión a su moneda local conforme a la tasa de cambio y condiciones de dicho banco emisor.
            </p>
            <p>
              <strong>Procesamiento Bancario PCI-DSS y Comprobante de Pago:</strong> Los pagos se procesan a través de la pasarela certificada <strong>Openpay Colombia S.A.S. (Grupo BBVA)</strong> bajo el estándar <strong>PCI-DSS Nivel 1 (Arquitectura SAQ-A)</strong>. Ni PULSE ENDURANCE ni German Morales Consulting capturan, almacenan ni procesan números completos de tarjetas de crédito/débito (PAN) ni códigos de seguridad (CVV). Por cada cobro exitoso, Openpay by BBVA envía automáticamente el comprobante oficial de transacción al correo electrónico registrado por el atleta.
            </p>
            <p>
              <strong>Renovación Mensual y Cancelación sin Cláusula de Permanencia:</strong> La suscripción tiene una periodicidad mensual (ciclos de 30 días) y carece de cláusulas de permanencia mínima o penalidades por retiro. El usuario puede cancelar la renovación automática en cualquier momento con un solo clic desde su panel de control (sección Suscripción), conservando el acceso pleno hasta el último día del periodo ya pagado.
            </p>
          </div>
        </section>

        {/* Cláusula 7: Derecho de Retracto y Reversión del Pago (Ley 1480 de 2011) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Scale className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">7. Derecho de Retracto y Reversión del Pago (Estatuto del Consumidor — Ley 1480 de 2011)</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7 space-y-2.5">
            <p>
              <strong>Derecho de Retracto (Artículo 47, Ley 1480 de 2011):</strong> En las ventas de servicios digitales celebradas por medios electrónicos, el usuario podrá ejercer el derecho de retracto dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la fecha de contratación inicial, siempre y cuando el servicio digital personalizado de generación y ejecución del plan no haya empezado a consumirse con acuerdo expreso del consumidor tras agotar el periodo de prueba gratuito de 7 días.
            </p>
            <p>
              <strong>Reversión del Pago (Artículo 51, Ley 1480 de 2011 y Decreto 587 de 2016):</strong> Cuando el pago se haya realizado mediante tarjeta de crédito, débito o cualquier otro instrumento de pago electrónico en Openpay BBVA, el consumidor podrá solicitar la reversión del pago dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la fecha en que tuvo noticia de la operación, cuando: (i) sea objeto de fraude; (ii) corresponda a una operación no solicitada; (iii) el servicio adquirido no sea habilitado; o (iv) el valor cobrado no corresponda al precio publicado del plan o se haya efectuado un cobro duplicado.
            </p>
            <p>
              Para presentar solicitudes de retracto, reversión de pago o peticiones, quejas y reclamos (PQR), el usuario deberá enviar su solicitud al correo{" "}
              <a href="mailto:gerkof@gmail.com" className="text-emerald-400 underline underline-offset-4 hover:text-emerald-300">
                gerkof@gmail.com
              </a>{" "}
              indicando su nombre completo, correo de cuenta y referencia de la transacción de Openpay.
            </p>
          </div>
        </section>

        {/* Cláusula 8: Aceptación Electrónica y Jurisdicción */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">8. Aceptación Vinculante y Jurisdicción Aplicable</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7">
            La marcación de la casilla de consentimiento electrónico durante el inicio de sesión, registro o pago constituye una firma electrónica con pleno valor probatorio y vinculación contractual conforme a la Ley 527 de 1999 de la República de Colombia. Este contrato se rige por las leyes de la República de Colombia.
          </p>
        </section>

        {/* Pie de Página */}
        <footer className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
          <p>© 2026 PULSE ENDURANCE™ — Operado por <strong className="text-slate-300">German Morales Consulting</strong> (Bogotá D.C., Colombia). Todos los derechos reservados.</p>
          <p className="text-[11px] text-slate-500">Pagos procesados por Openpay Colombia S.A.S. (Grupo BBVA) • Estándar de Seguridad PCI-DSS Nivel 1 (SAQ-A).</p>
          <div className="flex items-center justify-center gap-4 text-slate-400">
            <Link href="/privacy" className="hover:text-emerald-400 transition underline underline-offset-2">
              Política de Privacidad (Ley 1581)
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
