import { PhysiologicalTestDefinition } from "./types";

/**
 * Protocolos oficiales de test de campo para determinar Potencia Crítica (Stryd CP) y Umbral Funcional (Bike FTP).
 * Prescripción 100% compliant con la sintaxis de Intervals.icu y Stryd (% CP/FTP + Tiempo).
 */

export const RUN_TEST_STRYD_3_9: PhysiologicalTestDefinition = {
  testId: "run_test_stryd_3_9",
  testName: "Test Oficial Stryd CP 3/9 Minutos (Paladino)",
  sport: "Run",
  targetMetric: "Stryd Critical Power (CP)",
  scheduledWeekType: "BASELINE_WEEK",
  recommendedWeekIndex: 2,
  protocolDescription:
    "Protocolo de referencia para modelar la curva de potencia crítica (CP) y capacidad anaeróbica (W'). Requiere esfuerzo máximo (All-Out) en los bloques de 3m y 9m.",
  workoutDoc: `Calentamiento
- 15m 65-72% FTP

Strides de Activación
4x
- 20s 110-115% FTP
- 40s 60% FTP

Recuperación
- 5m 60% FTP

Bloque 1 - Esfuerzo Máximo 3 Minutos
- 3m 105-115% FTP

Recuperación Activa Suave
- 15m 50-55% FTP

Bloque 2 - Esfuerzo Máximo 9 Minutos
- 9m 98-105% FTP

Enfriamiento
- 10m 60% FTP`,
  calculationFormula: "Calculado automáticamente por el modelo MMP de 2 parámetros (Stryd Power Curve / Intervals.icu).",
};

export const calculateDynamic20mTTFactor = (ctl: number = 35): number => {
  // Ajuste fino del factor CP según el CTL del atleta: 0.90 en novatos (CTL < 30) a 0.96 en élite
  const baseFactor = 0.95;
  const ctlPenalty = 0.002 * Math.max(0, 30 - ctl);
  const ctlBonus = 0.001 * Math.max(0, ctl - 60);
  return Number((Math.min(0.96, Math.max(0.89, baseFactor - ctlPenalty + ctlBonus))).toFixed(3));
};

export const RUN_TEST_20M_TT: PhysiologicalTestDefinition = {
  testId: "run_test_20m_tt",
  testName: "Test 20 Minutos Contrarreloj (Stryd CP TT)",
  sport: "Run",
  targetMetric: "Stryd Critical Power (CP)",
  scheduledWeekType: "MID_BUILD_WEEK",
  recommendedWeekIndex: 8,
  protocolDescription:
    "Test contrarreloj en pista llana o cinta para re-evaluar la potencia crítica con calibración dinámica de factor según CTL.",
  workoutDoc: `Calentamiento
- 15m 68-75% FTP

Strides de Activación
3x
- 30s 105% FTP
- 45s 60% FTP

Recuperación
- 3m 55% FTP

Test 20m Contrarreloj a Potencia Máxima Constante
- 20m 95-102% FTP

Enfriamiento
- 10m 60% FTP`,
  calculationFormula: "Stryd CP = Factor Dinámico (0.90 a 0.96 según CTL) x Potencia Media en 20m.",
};


export const BIKE_TEST_20M_FTP: PhysiologicalTestDefinition = {
  testId: "bike_test_20m_ftp",
  testName: "Test 20 Minutos FTP de Ciclismo (Coggan / Allen)",
  sport: "Ride",
  targetMetric: "Bike Functional Threshold Power (FTP)",
  scheduledWeekType: "BASELINE_WEEK",
  recommendedWeekIndex: 1,
  protocolDescription:
    "Protocolo estándar de oro para potenciómetro o rodillo. Incluye bloque de limpieza anaeróbica de 5 min antes del test de 20 min.",
  workoutDoc: `Calentamiento Progresivo
- 20m 55-70% FTP

Limpieza Anaeróbica
- 5m 105-110% FTP

Recuperación Fácil
- 10m 50-60% FTP

Test Principal 20m FTP Máximo Esfuerzo Constante
- 20m 95-105% FTP

Enfriamiento
- 10m 50% FTP`,
  calculationFormula: "Bike FTP = 95% de la potencia media en vatios obtenida en el bloque de 20 min.",
};

export const BIKE_TEST_RAMP: PhysiologicalTestDefinition = {
  testId: "bike_test_ramp",
  testName: "Ramp Test Progresivo para Rodillo (Indoor)",
  sport: "Ride",
  targetMetric: "Bike Functional Threshold Power (FTP)",
  scheduledWeekType: "MID_BUILD_WEEK",
  recommendedWeekIndex: 6,
  protocolDescription:
    "Test incremental continuo ideal para rodillo interactivo. Escalones de 20W cada minuto hasta el agotamiento voluntario.",
  workoutDoc: `Calentamiento
- 10m 50-60% FTP

Escalones Incrementales hasta el Fallo
- 1m 65% FTP
- 1m 75% FTP
- 1m 85% FTP
- 1m 95% FTP
- 1m 105% FTP
- 1m 115% FTP
- 1m 125% FTP
- 1m 135% FTP

Enfriamiento Libre
- 10m 45-55% FTP`,
  calculationFormula: "Bike FTP = 75% de la potencia del último escalón completo de 1 minuto.",
};

export const SWIM_TEST_CSS_400_200: PhysiologicalTestDefinition = {
  testId: "swim_test_css_400_200",
  testName: "Test CSS de Natación (400m + 200m Contrarreloj)",
  sport: "Swim",
  targetMetric: "CSS Swim Pace",
  scheduledWeekType: "BASELINE_WEEK",
  recommendedWeekIndex: 2,
  protocolDescription:
    "Protocolo estándar para determinar el Ritmo Crítico de Nado (Critical Swim Speed). Permite calcular las zonas de entrenamiento aeróbico.",
  workoutDoc: `Calentamiento
- 300m Nado suave variado (estilo libre y espalda)
- 4x 50m Progresivos con 15s descanso

Test 1 - 400m Contrarreloj a Máximo Esfuerzo Constante
- 400m All-Out (Registrar tiempo exacto T400)

Recuperación Activa
- 200m Nado suave y soltura con 5 min descanso fuera del agua

Test 2 - 200m Contrarreloj a Máximo Esfuerzo Constante
- 200m All-Out (Registrar tiempo exacto T200)

Soltura y Enfriamiento
- 200m Nado muy suave regenerativo`,
  calculationFormula: "CSS (m/s) = (400 - 200) / (T400 - T200 en segundos). Ritmo CSS = 100 / CSS (segundos/100m).",
};

export const RUN_TEST_5K_VAM: PhysiologicalTestDefinition = {
  testId: "run_test_5k_vam",
  testName: "Test 5K / VAM de Potencia Aeróbica Máxima",
  sport: "Run",
  targetMetric: "Stryd Critical Power (CP)",
  scheduledWeekType: "BASELINE_WEEK",
  recommendedWeekIndex: 2,
  protocolDescription:
    "Test de campo de 5 km contrarreloj para calibrar la Velocidad Aeróbica Máxima (VAM) y la Potencia Crítica en distancias cortas.",
  workoutDoc: `Calentamiento
- 15m 65-72% FTP

Strides de Activación Neuromuscular
3x
- 30s 110% FTP
- 45s 55% FTP

Recuperación
- 3m Caminata y soltura

Test 5K Contrarreloj a Ritmo Máximo Sostenible
- 20m 100-105% FTP

Enfriamiento
- 10m 60% FTP Trote suave regenerativo`,
  calculationFormula: "Stryd CP ≈ Potencia media de los 5 km para atletas sub-20m, o 97% de la potencia media para atletas de 20-30 min.",
};
