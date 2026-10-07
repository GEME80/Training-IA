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
  testName: "Ramp Test Escalonado Oficial FTP en Rodillo (Modo ERG)",
  sport: "Ride",
  targetMetric: "Bike Functional Threshold Power (FTP)",
  scheduledWeekType: "BASELINE_WEEK",
  recommendedWeekIndex: 2,
  protocolDescription:
    "Protocolo estándar de oro para rodillo inteligente en modo ERG. Escalones continuos de 1 minuto con incremento progresivo del +6% FTP (~15-20W/min) hasta el fallo muscular total. FTP = 75% del último escalón completo (MAP x 0.75).",
  workoutDoc: `Calentamiento Progresivo
- 5m 50% FTP
- 5m 60% FTP

Ramp Test Escalonado en Modo ERG (1 min por escalón hasta el fallo muscular)
- 1m 52% FTP
- 1m 58% FTP
- 1m 64% FTP
- 1m 70% FTP
- 1m 76% FTP
- 1m 82% FTP
- 1m 88% FTP
- 1m 94% FTP
- 1m 100% FTP
- 1m 106% FTP
- 1m 112% FTP
- 1m 118% FTP
- 1m 124% FTP
- 1m 130% FTP
- 1m 136% FTP
- 1m 142% FTP
- 1m 148% FTP
- 1m 154% FTP
- 1m 160% FTP

Enfriamiento Libre
- 10m 45-50% FTP`,
  calculationFormula: "Bike FTP = 75% de la potencia media del último minuto completo (MAP x 0.75).",
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
  workoutDoc: `Warmup
- 300m 70% Pace
4x
- 50m 85% Pace
- 15s recovery

Main
- 400m 100% Pace (Test T400 All-Out)
- 200m 60% Pace
- 5m recovery
- 200m 105% Pace (Test T200 All-Out)

Cooldown
- 200m 60% Pace`,
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
