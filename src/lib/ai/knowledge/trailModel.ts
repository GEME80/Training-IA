import { CuratedTrainingModel } from "./types";
import { RUN_TEST_5K_VAM, RUN_TEST_20M_TT } from "./testingProtocols";

/**
 * Modelo Científico para Trail Running y Ultradistancia de Montaña (Kilian Jornet + Canova aplicado a D+)
 */
export const TRAIL_ULTRA_MODEL: CuratedTrainingModel = {
  modelId: "TRAIL_ULTRA",
  sportCategory: "Trail",
  displayName: "PULSE Trail & Ultra — Montaña y Desnivel",
  scientificAuthors: [
    "Kilian Jornet (Eficiencia en D+, Economía de Paso y Propiocepción)",
    "Dr. Guillaume Millet (Fatiga Neuromuscular y Daño Excéntrico en Ultras)",
  ],
  description:
    "Estructurado para tolerar grandes desniveles acumulados (D+ y D-), optimizar el ritmo en subidas técnicas y amortiguar el impacto excéntrico en bajadas.",
  targetDistanceKm: 50.0,
  periodizationStyle: "Periodización por Bloques Ondulados con Enfoque en Desnivel y Resistencia Muscular (3:1)",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Fuerza Estructural, D+ y Base Aeróbica",
      percentageDuration: 0.35,
      focusDescription: "Aclimatación al desnivel, fortalecimiento de sóleos/tendón rotuliano y eficiencia de paso en subida.",
      weeklyTssRange: { min: 300, max: 420 },
      longRunGuideline: "Tirada de montaña: 2h a 3h en terreno mixto con 600m a 1000m D+ a ritmo conversacional.",
      recommendedIntensityZones: ["Zona 2 Aeróbica (65-75% CP)", "Power Hiking en rampas >15%"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Potencia en Subida y Resistencia Excéntrica",
      percentageDuration: 0.40,
      focusDescription: "Intervalos de umbral en cuesta, técnica de descenso controlado y gestión de bastones.",
      weeklyTssRange: { min: 420, max: 580 },
      longRunGuideline: "Tirada específica: 3h30m a 4h30m con 1200m a 1800m D+ y tramos a ritmo de competición.",
      recommendedIntensityZones: ["Umbral en Cuesta (90-98% CP)", "Descensos Técnicos Controlados"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Simulación de Carrera de Montaña y Nutrición",
      percentageDuration: 0.15,
      focusDescription: "Ensayos con mochila de hidratación, estrategia nutricional y asimilación de fatiga prolongada.",
      weeklyTssRange: { min: 380, max: 520 },
      longRunGuideline: "Tirada cumbre: 4h a 5h sobre terreno técnico similar al objetivo (1500m-2000m D+).",
      recommendedIntensityZones: ["Ritmo de Prueba (70-80% CP)", "Gestión de Energía"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Descarga, Descanso Articular y Reactividad",
      percentageDuration: 0.10,
      focusDescription: "Reducción drástica del volumen e impacto excéntrico para regenerar cartílagos y tendones.",
      weeklyTssRange: { min: 180, max: 260 },
      longRunGuideline: "Tirada de puesta a punto: 1h15m a 1h30m en terreno llano o sendero suave con poco desnivel.",
      recommendedIntensityZones: ["Activación Suave", "Trote Regenerativo"],
    },
  ],
  mandatoryTests: [
    { ...RUN_TEST_5K_VAM, recommendedWeekIndex: 2 },
    { ...RUN_TEST_20M_TT, recommendedWeekIndex: 6 },
  ],
  longRunRules: {
    startKm: 16,
    peakKm: 36,
    startMinutes: 90,
    peakMinutes: 240,
    targetIntensityPercentCpOrFtp: "65-75% CP / RPE 4-6 en subidas",
    description: "Progresión por tiempo y desnivel desde 1h30m (+500m) hasta 4h00m (+1700m D+) con 3 semanas de tapering.",
    taperKmSequence: [20, 12, 6],
    taperMinutesSequence: [120, 75, 45],
  },
  maxLongRunMinutesCap: 240,
  taperingRules: {
    taperingWeeks: 3,
    volumeDropSequencePercent: [0.20, 0.45, 0.65],
    maintainRacePaceIntensity: true,
  },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 30, maxLongRunKm: 18, maxLongRunMinutes: 135, tssScaleFactor: 0.80 },
    INTERMEDIATE: { ctlThresholdMax: 60, maxLongRunKm: 28, maxLongRunMinutes: 180, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 36, maxLongRunMinutes: 240, tssScaleFactor: 1.10 },
  },
  recommendedStrengthModelIds: ["strength_downhill_eccentric", "strength_spring_ankle_soleus", "water_hydrotherapy_strength"],
  recommendedCrossTrainingModelIds: ["cross_bike_z2_mito", "water_regenerative_aqua_run"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Fartlek de Cuestas y Power Hiking (50m)",
          powerTarget: "95% CP en subida",
          justification: "Reclutamiento de potencia de piernas y zancada corta eficiente.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n6x\n- 1m 95% FTP (Subida)\n- 1m30s 55% FTP (Bajada suave)\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Cuestas Cortas de Potencia Elástica (45m con 8x 45s en rampa)",
          powerTarget: "100% CP en cuesta",
          justification: "Estímulo de reactividad en tobillos y gemelos con mínimo impacto excéntrico.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n8x\n- 45s 100% FTP (Cuesta)\n- 1m30s 50% FTP (Descenso trote)\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Carrera Continua con Desnivel Moderado (50m en sendero ondulado)",
          powerTarget: "72-80% CP",
          justification: "Adaptación del ritmo cardíaco a la pendiente continua.",
          workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain (Sendero Ondulado)\n- 35m 75% FTP\n\nCooldown\n- 5m 55% FTP",
        },
        {
          name: "Series de Subida a Ritmo Constante (4x 3m @ 92% CP)",
          powerTarget: "92% CP en cuesta",
          justification: "Eficiencia mitocondrial y gestión de cadencia corta en subida sostenida.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n4x\n- 3m 92% FTP (Subida)\n- 2m 50% FTP (Bajada)\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Fartlek de Montaña Progresivo (45m con cambios Z2-Z4)",
          powerTarget: "70-94% CP",
          justification: "Flexibilidad motriz y lectura del terreno irregular.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n5x\n- 2m 90% FTP\n- 2m 65% FTP\n\nCooldown\n- 8m 55% FTP",
        },
      ],
      build: [
        {
          name: "Intervalos de Umbral en Subida Continua (3x8m @ 98% CP)",
          powerTarget: "98% CP",
          justification: "Capacidad glucolítica y potencia sostenible en desniveles prolongados.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n3x (Cuesta Continua)\n- 8m 98% FTP\n- 3m 50% FTP (Trote regreso)\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Series de Cuestas Largas de Umbral (4x 5m @ 96% CP)",
          powerTarget: "96% CP en cuesta",
          justification: "Sostenimiento metabólico en ascensiones prolongadas de media montaña.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n4x\n- 5m 96% FTP (Subida)\n- 3m 50% FTP (Descenso)\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Transiciones Subida-Bajada Técnica (4x 3m Up + 2m Down ágil)",
          powerTarget: "95% CP subiendo / Control excéntrico bajando",
          justification: "Adaptación del cuádriceps a la alternancia concéntrico-excéntrica.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n4x\n- 3m 95% FTP (Subida)\n- 2m Ritmo vivo (Bajada técnica)\n- 1m30s Trote suave\n\nCooldown\n- 8m 55% FTP",
        },
        {
          name: "Power Hiking Sostenido en Pendiente Dura (45m con bastones @ 86% CP)",
          powerTarget: "86% CP",
          justification: "Economía de paso caminando rápido con bastones en desniveles >20%.",
          workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain (Power Hiking con Bastones)\n- 30m 86% FTP en rampa\n\nCooldown\n- 5m 50% FTP",
        },
        {
          name: "Fartlek Mixto de Sendero Quebrado (50m con 6x 2m30s @ 94% CP)",
          powerTarget: "94% CP en tramos rápidos",
          justification: "Aceleraciones dinámicas en terreno técnico sorteando rocas y raíces.",
          workoutDoc: "Warmup\n- 14m 65% FTP\n\n6x\n- 2m30s 94% FTP\n- 1m30s 60% FTP\n\nCooldown\n- 8m 55% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación de Ritmo de Trail con Cambios de Pendiente (1h15m)",
          powerTarget: "75-85% CP",
          justification: "Gestión de esfuerzo y transición entre trote y caminata con bastones.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\nMain (Terreno Mixto)\n- 45m 80% FTP\n\nCooldown\n- 15m 60% FTP",
        },
        {
          name: "Bloques Específicos de Desnivel Acumulado (3x 10m @ 94% CP)",
          powerTarget: "94% CP",
          justification: "Fijación del ritmo cumbre en la fase previa a la prueba.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n3x\n- 10m 94% FTP (Ascenso continuo)\n- 4m 50% FTP (Descenso)\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Descensos Técnicos Controlados + Tramo Llano (50m)",
          powerTarget: "75-90% CP",
          justification: "Entrenamiento de agilidad motriz post-bajada cuando las piernas están cargadas.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\nMain\n- 25m Trabajo técnico en bajada y llano ágil\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Afinamiento Específico de Montaña (45m con 4 aceleraciones cortas)",
          powerTarget: "95% CP",
          justification: "Toques de ritmo y comprobación de zapatillas y material obligatorio.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n4x\n- 1m 95% FTP en sendero\n- 2m 55% FTP\n\nCooldown\n- 10m 55% FTP",
        },
      ],
      taper: [
        {
          name: "Carrera Continua Suave en Llano con Strides (35m)",
          powerTarget: "70% CP",
          justification: "Soltura articular sin carga excéntrica.",
          workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 20m 70% FTP\n\nCooldown\n- 5m 60% FTP",
        },
        {
          name: "Trote Muy Suave en Terreno Limpio (30m Z1)",
          powerTarget: "65% CP",
          justification: "Mantenimiento del flujo sanguíneo evitando cualquier irregularidad de terreno.",
          workoutDoc: "Main\n- 30m 65% FTP",
        },
        {
          name: "Activación del Día Previo en Hierba (20m con 3 progresiones)",
          powerTarget: "65-90% CP",
          justification: "Puesta a punto final y relajación miofascial antes del dorsal.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n3x\n- 20s 90% FTP\n- 40s 50% FTP\n\nCooldown\n- 5m 55% FTP",
        },
        {
          name: "Soltura de Piernas y Movilidad Articular (25m)",
          powerTarget: "62% CP",
          justification: "Descarga absoluta sin fatiga cardiovascular.",
          workoutDoc: "Main\n- 25m 62% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Z2 Regenerativo sin Impacto (55m)",
        powerTarget: "60% FTP",
        justification: "Volumen cardiovascular protegiendo rodillas y tobillos de los descensos.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 35m 60% FTP\n\nCooldown\n- 10m 45% FTP",
        durationMin: 55,
      },
      {
        name: "Ciclismo de Cadencia Ágil a 95 rpm (45m)",
        powerTarget: "65% FTP",
        justification: "Soltura neuromuscular y estimulación de las fibras rápidas sin impacto.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 25m 65% FTP (95 rpm)\n\nCooldown\n- 10m 45% FTP",
        durationMin: 45,
      },
      {
        name: "Ciclismo en Rodillo de Lavado Metabólico (45m Z1-Z2)",
        powerTarget: "58% FTP",
        justification: "Favorece la regeneración del cartílago rotuliano y la descarga lumbar.",
        workoutDoc: "Main\n- 45m 58% FTP",
        durationMin: 45,
      },
      {
        name: "Pedaleo Suave con Cambios Cortos de Ritmo (50m)",
        powerTarget: "55-75% FTP",
        justification: "Activación cardiovascular suave para trail runners.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\n4x\n- 1m 75% FTP\n- 2m 55% FTP\n\nCooldown\n- 10m 45% FTP",
        durationMin: 50,
      },
      {
        name: "Ciclismo Regenerativo de Asimilación Biológica (40m)",
        powerTarget: "52% FTP",
        justification: "Mueve las piernas con carga cero para asimilar el desnivel del fin de semana.",
        workoutDoc: "Main\n- 40m 52% FTP",
        durationMin: 40,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Trote Regenerativo en Césped / Blando (40m)",
        powerTarget: "68% CP",
        justification: "Oxigenación miofascial sobre superficie amortiguada.",
        workoutDoc: "Warmup\n- 10m 60% FTP\n\nMain\n- 25m 68% FTP\n\nCooldown\n- 5m 55% FTP",
        durationMin: 40,
      },
      {
        name: "Carrera Suave en Llano de Lavado Láctico (30m)",
        powerTarget: "65% CP",
        justification: "Favorece la eliminación de microinflamación excéntrica.",
        workoutDoc: "Main\n- 30m 65% FTP",
        durationMin: 30,
      },
      {
        name: "Caminata Dinámica en Llano y Movilidad de Cadera (35m)",
        powerTarget: "55% CP",
        justification: "Estimulación del sistema linfático sin fatiga osteomuscular.",
        workoutDoc: "Main\n- 35m 55% FTP",
        durationMin: 35,
      },
      {
        name: "Trote Muy Ligero Regenerativo (35m en Z1 suave)",
        powerTarget: "66% CP",
        justification: "Activación parasimpática y relajación profunda.",
        workoutDoc: "Main\n- 35m 66% FTP",
        durationMin: 35,
      },
      {
        name: "Descarga Neuromuscular de Piernas (30m)",
        powerTarget: "64% CP",
        justification: "Recuperación biológica activa protegiendo tendones de Aquiles.",
        workoutDoc: "Main\n- 30m 64% FTP",
        durationMin: 30,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Excéntrica de Cuádriceps & Propiocepción de Tobillo",
        focus: "Cuádriceps, Tobillo y Estabilidad",
        justification: "Prevención del daño muscular inducido por las bajadas de montaña.",
        workoutDoc: "Warmup\n- 5m Mobility\n\nMain\n- 20m Sentadillas Excéntricas, Bosu & Sóleo",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.30,
    recoveryDropPercent: 0.28,
    weeklyLoadStepTss: 12,
  },
  crossTrainingRules: {
    recommendedStrengthSessionsPerWeek: 2,
    recommendedBikeZ2WeeklyMin: 90,
    notes: "Fuerza excéntrica de cuádriceps, estabilidad de tobillo (propiocepción) y rodillo para sumar horas sin impacto.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.5,
    maxCtlPerWeek: 4.0,
  },
};
