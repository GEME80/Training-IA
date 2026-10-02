import { generateCustomMacrocycleBlueprint } from "@/lib/physiology/macrocycleGenerator";
import { saveMacrocycleToFirestore } from "@/lib/db/macrocycles";

export async function executeRecalibrateBoth() {
  const results: any[] = [];

  // 1. GERMÁN MORALES (Maratón de Tokio 2027)
  const germanMatrix = {
    Lunes: ["Descanso"],
    Martes: ["Ciclismo"],
    Miércoles: ["Carrera", "Fuerza"],
    Jueves: ["Ciclismo", "Fuerza"],
    Viernes: ["Carrera", "Fuerza"],
    Sábado: ["Ciclismo"],
    Domingo: ["Carrera"],
  };

  const germanBlueprint = generateCustomMacrocycleBlueprint({
    distanceType: "42k",
    startDate: "2026-09-14",
    weeksCount: 25,
    customGoal: "Maratón de Tokio 2027 (42.195 km) - Sub 3h15",
    periodization: "3:1",
    primaryRace: {
      id: "race-german-tokio-marathon",
      name: "🏆 Maratón de Tokio 2027 (42.195 km)",
      date: "2027-03-07",
      distance: "42k" as any,
      priority: "A",
      goalTarget: "Pico de Forma & Marca Personal Sub 3h15",
    },
    athleteMetrics: {
      ctl: 37.5, atl: 42.0, tsb: -4.5, runFtp: 336, bikeFtp: 240,
      weightKg: 84, heightCm: 185, restingHR: 49, maxHR: 185, lthr: 168, age: 46, gender: "M",
      weeklyAvailability: germanMatrix as any,
      historicalMetrics: {
        peakCtlLastYear: 86.9, annualVolumeTss: 19426, maxAtlRecorded: 135, minTsbRecorded: -28, avgRampRate: 2.8, recordedDaysCount: 365,
      } as any,
    },
  });

  const germanMacroId = await saveMacrocycleToFirestore("i442091", germanBlueprint, germanBlueprint.primaryRace, "WIZARD_CUSTOM");
  results.push({
    athlete: "Germán Morales", athleteId: "i442091", macrocycleId: germanMacroId,
    weeks: germanBlueprint.totalWeeks, primaryRace: germanBlueprint.primaryRace?.name,
  });

  // 2. JUAN PABLO VÁSQUEZ (Triseries Paipa 2026)
  const juanMatrix = {
    Lunes: ["Descanso"], Martes: ["Carrera"], Miércoles: ["Ciclismo"],
    Jueves: ["Fuerza"], Viernes: ["Natacion"], Sábado: ["Ciclismo"], Domingo: ["Carrera"],
  };

  const juanBlueprint = generateCustomMacrocycleBlueprint({
    distanceType: "triathlon_short",
    startDate: "2026-09-14",
    weeksCount: 7,
    customGoal: "Triseries Paipa 2026 (Triatlón Olímpico)",
    periodization: "2:1",
    primaryRace: {
      id: "race-juan-triseries",
      name: "🏆 Triseries Paipa 2026 (Lago Sochagota)",
      date: "2026-11-01",
      distance: "triathlon_short" as any,
      priority: "A",
      goalTarget: "Completar con Pico de Rendimiento",
    },
    athleteMetrics: {
      ctl: 42.0, atl: 45.0, tsb: -3.0, runFtp: 275, bikeFtp: 215,
      weightKg: 74, heightCm: 177, restingHR: 52, maxHR: 182, lthr: 165, age: 43, gender: "M",
      weeklyAvailability: juanMatrix as any,
      historicalMetrics: {
        peakCtlLastYear: 68.0, annualVolumeTss: 14200, maxAtlRecorded: 110, minTsbRecorded: -22, avgRampRate: 2.2, recordedDaysCount: 365,
      } as any,
    },
  });

  const juanMacroId = await saveMacrocycleToFirestore("juan.vasquez.1983@gmail.com", juanBlueprint, juanBlueprint.primaryRace, "WIZARD_CUSTOM");
  await saveMacrocycleToFirestore("i444697", juanBlueprint, juanBlueprint.primaryRace, "WIZARD_CUSTOM");
  results.push({
    athlete: "Juan Pablo Vásquez", athleteId: "i444697", macrocycleId: juanMacroId,
    weeks: juanBlueprint.totalWeeks, primaryRace: juanBlueprint.primaryRace?.name,
  });

  // 3. GEORG SCHMITT (Ironman 70.3 Cartagena 2026 + Giro de Rigo Tipo B)
  const georgMatrix = {
    Lunes: ["Descanso"], Martes: ["Ciclismo", "Natacion"], Miércoles: ["Carrera"],
    Jueves: ["Fuerza", "Ciclismo"], Viernes: ["Carrera"], Sábado: ["Ciclismo", "Fuerza"], Domingo: ["Carrera", "Natacion"],
  };

  const georgBlueprint = generateCustomMacrocycleBlueprint({
    distanceType: "triathlon_703",
    startDate: "2026-09-28",
    weeksCount: 9,
    customGoal: "Ironman Cartagena 2026 70.3",
    periodization: "3:1",
    primaryRace: {
      id: "race-georg-cartagena-703",
      name: "🏆 Ironman Cartagena 2026 70.3",
      date: "2026-11-29",
      distance: "triathlon_703" as any,
      priority: "A",
      goalTarget: "Pico de forma óptimo",
    },
    athleteMetrics: {
      ctl: 38.0, atl: 40.0, tsb: -2.0, runFtp: 0, bikeFtp: 214,
      weightKg: 78, heightCm: 180, restingHR: 50, maxHR: 180, lthr: 162, age: 40, gender: "M",
      weeklyAvailability: georgMatrix as any,
      historicalMetrics: {
        peakCtlLastYear: 62.0, annualVolumeTss: 13500, maxAtlRecorded: 95, minTsbRecorded: -18, avgRampRate: 2.0, recordedDaysCount: 365,
      } as any,
    },
  });

  const georgMacroId = await saveMacrocycleToFirestore("i729730", georgBlueprint, georgBlueprint.primaryRace, "WIZARD_CUSTOM");
  results.push({
    athlete: "Georg Schmitt", athleteId: "i729730", macrocycleId: georgMacroId,
    weeks: georgBlueprint.totalWeeks, primaryRace: georgBlueprint.primaryRace?.name,
  });

  return results;
}
