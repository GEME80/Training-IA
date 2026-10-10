/**
 * demoAthletesData.ts
 * Catálogo de Personas y Perfiles Dummy Demo para Pruebas del Sistema.
 */

import { WeeklyAvailabilityMap } from "../gemini/engine";
import { MacrocycleDistanceType } from "../physiology/macrocycleLibrary";

export interface DemoAthletePersona {
  id: string;
  email: string;
  displayName: string;
  role: "athlete";
  status: "active";
  intervalsAthleteId?: string;
  biometrics: {
    runFtp?: number;
    bikeFtp?: number;
    weightKg?: number;
    ctl?: number;
    lthr?: number;
    runningTrainingMode: "POWER" | "PACE";
    hasRunningPowerMeter: boolean;
    runThresholdPaceStr?: string;
    runThresholdPaceSec?: number;
  };
  wizardConfig: {
    hasRace: boolean;
    raceName?: string;
    raceDistance?: MacrocycleDistanceType;
    raceDate?: string;
    raceGoal?: string;
    athleteMoment?: "maintenance" | "base_building" | "post_race_recovery" | "injury_rehab";
    weeksCount: number;
    startDate: string;
    trainingApproach: "Solo Running" | "Entrenamiento Cruzado" | "Solo Ciclismo" | "Triatlón";
    periodization: "3:1" | "2:1";
    weeklyAvailability: WeeklyAvailabilityMap;
  };
  expectedCriteria: {
    expectedModelKeyword: string;
    expectedFeasibilityStatus?: "REALISTIC" | "CHALLENGING" | "HIGHLY_ASPIRATIONAL";
    shouldHavePowerTargetInWatts: boolean;
    shouldAvoidRunningOnBikingDays?: boolean;
    phase1Description: string;
  };
}

export const DEMO_ATHLETES: DemoAthletePersona[] = [
  {
    id: "demo_runner_tokio_305",
    email: "demo_german_tokio305@pulse-demo.com",
    displayName: "Germán Morales (Maratón Tokio 3:05)",
    role: "athlete",
    status: "active",
    intervalsAthleteId: "i99001",
    biometrics: {
      runFtp: 280,
      bikeFtp: 228,
      weightKg: 68,
      ctl: 45,
      lthr: 168,
      runningTrainingMode: "POWER",
      hasRunningPowerMeter: true,
    },
    wizardConfig: {
      hasRace: true,
      raceName: "Maratón Tokio",
      raceDistance: "42k",
      raceDate: "2026-10-18",
      raceGoal: "3h05",
      weeksCount: 16,
      startDate: "2026-06-29",
      trainingApproach: "Entrenamiento Cruzado",
      periodization: "3:1",
      weeklyAvailability: {
        Lunes: ["Descanso"],
        Martes: ["Carrera"],
        Miércoles: ["Carrera", "Fuerza"],
        Jueves: ["Ciclismo"],
        Viernes: ["Carrera"],
        Sábado: ["Descanso"],
        Domingo: ["Carrera"],
      },
    },
    expectedCriteria: {
      expectedModelKeyword: "Canova",
      expectedFeasibilityStatus: "REALISTIC",
      shouldHavePowerTargetInWatts: true,
      phase1Description: "Base con cuestas cortas (10x 100m -> 6x 300m -> 4x 100m) y tirada dominical progresiva.",
    },
  },
  {
    id: "demo_runner_valencia_230",
    email: "demo_sofia_valencia230@pulse-demo.com",
    displayName: "Sofía Arango (Aspiracional Valencia 2:30)",
    role: "athlete",
    status: "active",
    intervalsAthleteId: "i99002",
    biometrics: {
      runFtp: 240,
      weightKg: 70,
      ctl: 35,
      lthr: 172,
      runningTrainingMode: "POWER",
      hasRunningPowerMeter: true,
    },
    wizardConfig: {
      hasRace: true,
      raceName: "Maratón Valencia",
      raceDistance: "42k",
      raceDate: "2026-12-06",
      raceGoal: "2h30",
      weeksCount: 16,
      startDate: "2026-08-17",
      trainingApproach: "Solo Running",
      periodization: "3:1",
      weeklyAvailability: {
        Lunes: ["Descanso"],
        Martes: ["Carrera"],
        Miércoles: ["Carrera"],
        Jueves: ["Fuerza"],
        Viernes: ["Carrera"],
        Sábado: ["Descanso"],
        Domingo: ["Carrera"],
      },
    },
    expectedCriteria: {
      expectedModelKeyword: "Canova",
      expectedFeasibilityStatus: "HIGHLY_ASPIRATIONAL",
      shouldHavePowerTargetInWatts: true,
      phase1Description: "Stepping stone protector al 92% para romper 3h23 seguro sin lesiones miofibrilares.",
    },
  },
  {
    id: "demo_runner_pace_daniels",
    email: "demo_carlos_pace21k@pulse-demo.com",
    displayName: "Carlos Mendoza (21K Ritmo Daniels)",
    role: "athlete",
    status: "active",
    intervalsAthleteId: "i99003",
    biometrics: {
      runFtp: 0,
      weightKg: 65,
      ctl: 38,
      lthr: 174,
      runningTrainingMode: "PACE",
      hasRunningPowerMeter: false,
      runThresholdPaceStr: "4:20",
      runThresholdPaceSec: 260,
    },
    wizardConfig: {
      hasRace: true,
      raceName: "Media Maratón Bogotá",
      raceDistance: "21k",
      raceDate: "2026-09-20",
      raceGoal: "1h35",
      weeksCount: 14,
      startDate: "2026-06-15",
      trainingApproach: "Solo Running",
      periodization: "3:1",
      weeklyAvailability: {
        Lunes: ["Descanso"],
        Martes: ["Carrera"],
        Miércoles: ["Fuerza"],
        Jueves: ["Carrera"],
        Viernes: ["Carrera"],
        Sábado: ["Descanso"],
        Domingo: ["Carrera"],
      },
    },
    expectedCriteria: {
      expectedModelKeyword: "Daniels",
      expectedFeasibilityStatus: "REALISTIC",
      shouldHavePowerTargetInWatts: false,
      phase1Description: "Series en min/km sin referencias a vatios de Stryd.",
    },
  },
  {
    id: "demo_cyclist_gran_fondo",
    email: "demo_mateo_granfondo@pulse-demo.com",
    displayName: "Mateo Vélez (Gran Fondo Ciclismo 140K)",
    role: "athlete",
    status: "active",
    intervalsAthleteId: "i99004",
    biometrics: {
      bikeFtp: 270,
      weightKg: 72,
      ctl: 55,
      lthr: 165,
      runningTrainingMode: "PACE",
      hasRunningPowerMeter: false,
    },
    wizardConfig: {
      hasRace: true,
      raceName: "Gran Fondo Nairo Quintana",
      raceDistance: "cycling_fondo",
      raceDate: "2026-10-25",
      raceGoal: "4h30",
      weeksCount: 16,
      startDate: "2026-07-06",
      trainingApproach: "Solo Ciclismo",
      periodization: "2:1",
      weeklyAvailability: {
        Lunes: ["Descanso"],
        Martes: ["Ciclismo"],
        Miércoles: ["Fuerza"],
        Jueves: ["Ciclismo"],
        Viernes: ["Descanso"],
        Sábado: ["Ciclismo"],
        Domingo: ["Ciclismo"],
      },
    },
    expectedCriteria: {
      expectedModelKeyword: "Coggan",
      shouldHavePowerTargetInWatts: true,
      shouldAvoidRunningOnBikingDays: true,
      phase1Description: "Ciclismo exclusivo entre semana y fondo dominical, 0 sesiones de carrera.",
    },
  },
  {
    id: "demo_triathlete_703",
    email: "demo_valentina_tri703@pulse-demo.com",
    displayName: "Valentina Ríos (Triatlón 70.3)",
    role: "athlete",
    status: "active",
    intervalsAthleteId: "i99005",
    biometrics: {
      runFtp: 290,
      bikeFtp: 250,
      weightKg: 60,
      ctl: 58,
      lthr: 170,
      runningTrainingMode: "POWER",
      hasRunningPowerMeter: true,
    },
    wizardConfig: {
      hasRace: true,
      raceName: "Ironman 70.3 Cartagena",
      raceDistance: "triathlon_703",
      raceDate: "2026-11-29",
      raceGoal: "4h50",
      weeksCount: 18,
      startDate: "2026-07-27",
      trainingApproach: "Triatlón",
      periodization: "2:1",
      weeklyAvailability: {
        Lunes: ["Descanso"],
        Martes: ["Natacion", "Carrera"],
        Miércoles: ["Ciclismo"],
        Jueves: ["Natacion", "Fuerza"],
        Viernes: ["Carrera"],
        Sábado: ["Ciclismo"],
        Domingo: ["Carrera"],
      },
    },
    expectedCriteria: {
      expectedModelKeyword: "Friel",
      shouldHavePowerTargetInWatts: true,
      phase1Description: "Balance triatlón con técnica de natación, rodaje Z2 y tirada dominical.",
    },
  },
  {
    id: "demo_base_mitochondrial",
    email: "demo_alejandro_basegpp@pulse-demo.com",
    displayName: "Alejandro Gómez (Base Building Salud)",
    role: "athlete",
    status: "active",
    intervalsAthleteId: "i99006",
    biometrics: {
      runFtp: 250,
      bikeFtp: 190,
      weightKg: 75,
      ctl: 25,
      lthr: 160,
      runningTrainingMode: "POWER",
      hasRunningPowerMeter: true,
    },
    wizardConfig: {
      hasRace: false,
      athleteMoment: "base_building",
      weeksCount: 10,
      startDate: "2026-06-01",
      trainingApproach: "Entrenamiento Cruzado",
      periodization: "2:1",
      weeklyAvailability: {
        Lunes: ["Descanso"],
        Martes: ["Carrera"],
        Miércoles: ["Ciclismo"],
        Jueves: ["Fuerza"],
        Viernes: ["Carrera"],
        Sábado: ["Ciclismo"],
        Domingo: ["Carrera"],
      },
    },
    expectedCriteria: {
      expectedModelKeyword: "Seiler",
      shouldHavePowerTargetInWatts: true,
      phase1Description: "Zona 2 polarizada Attia/Seiler sin presión de carrera ni tapering.",
    },
  },
  {
    id: "demo_rehab_post_race",
    email: "demo_diana_rehab@pulse-demo.com",
    displayName: "Diana Morales (Recuperación & Rehab)",
    role: "athlete",
    status: "active",
    intervalsAthleteId: "i99007",
    biometrics: {
      runFtp: 220,
      bikeFtp: 170,
      weightKg: 58,
      ctl: 32,
      lthr: 155,
      runningTrainingMode: "POWER",
      hasRunningPowerMeter: true,
    },
    wizardConfig: {
      hasRace: false,
      athleteMoment: "injury_rehab",
      weeksCount: 6,
      startDate: "2026-06-01",
      trainingApproach: "Entrenamiento Cruzado",
      periodization: "2:1",
      weeklyAvailability: {
        Lunes: ["Descanso"],
        Martes: ["Carrera"],
        Miércoles: ["Fuerza"],
        Jueves: ["Ciclismo"],
        Viernes: ["Carrera"],
        Sábado: ["Descanso"],
        Domingo: ["Carrera"],
      },
    },
    expectedCriteria: {
      expectedModelKeyword: "Attia",
      shouldHavePowerTargetInWatts: true,
      phase1Description: "Regeneración activa, prehab articular y volumen suave de asimilación.",
    },
  },
];
