import { NextRequest, NextResponse } from "next/server";
import { resolveTrainingModel } from "@/lib/ai/knowledge";
import { generateCustomMacrocycleBlueprint } from "@/lib/physiology/macrocycleGenerator";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";

export async function GET(req: NextRequest) {
  const testCases = [
    {
      id: "TC-01",
      name: "Maratón Tokio 42K (Caso Real Atleta: 20 Semanas Cuenta Regresiva)",
      config: {
        targetDistance: "42k",
        weeksCount: 20,
        startDate: "2026-10-19",
        trainingApproach: "Entrenamiento Cruzado",
        periodization: "2:1" as const,
        weeklyAvailability: {
          Lunes: ["Descanso"],
          Martes: ["Ciclismo"],
          Miércoles: ["Carrera", "Fuerza"],
          Jueves: ["Carrera", "Fuerza"],
          Viernes: ["Carrera", "Fuerza"],
          Sábado: ["Ciclismo"],
          Domingo: ["Carrera"],
        },
        athleteMetrics: { ctl: 42, runFtp: 327, bikeFtp: 240, lthr: 168 },
      },
      expected: {
        modelAuthor: "Canova",
        targetPeakDistanceKm: 36,
        disciplinesOnTuesday: ["Ciclismo"],
        disciplinesOnWednesday: ["Carrera", "Fuerza"],
      },
    },
    {
      id: "TC-02",
      name: "Media Maratón 21K (Solo Running - 16 Semanas)",
      config: {
        targetDistance: "21k",
        weeksCount: 16,
        startDate: "2026-09-01",
        trainingApproach: "Solo Running",
        periodization: "3:1" as const,
        weeklyAvailability: {
          Lunes: ["Descanso"],
          Martes: ["Carrera"],
          Miércoles: ["Carrera"],
          Jueves: ["Fuerza"],
          Viernes: ["Carrera"],
          Sábado: ["Descanso"],
          Domingo: ["Carrera"],
        },
        athleteMetrics: { ctl: 38, runFtp: 310, bikeFtp: 220, lthr: 172 },
      },
      expected: {
        modelAuthor: "Daniels",
        targetPeakDistanceKm: 22,
        disciplinesOnTuesday: ["Carrera"],
        disciplinesOnWednesday: ["Carrera"],
      },
    },
    {
      id: "TC-03",
      name: "Gran Fondo Ciclismo (16 Semanas - Enfoque Ciclismo)",
      config: {
        targetDistance: "cycling_fondo",
        weeksCount: 16,
        startDate: "2026-09-01",
        trainingApproach: "Entrenamiento Cruzado",
        periodization: "2:1" as const,
        weeklyAvailability: {
          Lunes: ["Descanso"],
          Martes: ["Ciclismo"],
          Miércoles: ["Fuerza"],
          Jueves: ["Ciclismo"],
          Viernes: ["Descanso"],
          Sábado: ["Ciclismo"],
          Domingo: ["Ciclismo"],
        },
        athleteMetrics: { ctl: 45, runFtp: 300, bikeFtp: 260, lthr: 165 },
      },
      expected: {
        modelAuthor: "Coggan",
        disciplinesOnTuesday: ["Ciclismo"],
        disciplinesOnWednesday: ["Fuerza"],
      },
    },
    {
      id: "TC-04",
      name: "Triatlón Media Distancia 70.3 (20 Semanas)",
      config: {
        targetDistance: "triathlon_703",
        weeksCount: 20,
        startDate: "2026-09-01",
        trainingApproach: "Triatlón",
        periodization: "2:1" as const,
        weeklyAvailability: {
          Lunes: ["Descanso"],
          Martes: ["Natacion", "Carrera"],
          Miércoles: ["Ciclismo"],
          Jueves: ["Natacion", "Fuerza"],
          Viernes: ["Carrera"],
          Sábado: ["Ciclismo"],
          Domingo: ["Carrera"],
        },
        athleteMetrics: { ctl: 50, runFtp: 320, bikeFtp: 250, lthr: 168 },
      },
      expected: {
        modelAuthor: "Friel",
        disciplinesOnTuesday: ["Natacion", "Carrera"],
        disciplinesOnWednesday: ["Ciclismo"],
      },
    },
    {
      id: "TC-05",
      name: "Base Mitocondrial GPP (12 Semanas Salud y Longevidad)",
      config: {
        targetDistance: "maintenance",
        weeksCount: 12,
        startDate: "2026-09-01",
        trainingApproach: "Mantenimiento",
        periodization: "2:1" as const,
        weeklyAvailability: {
          Lunes: ["Descanso"],
          Martes: ["Carrera"],
          Miércoles: ["Ciclismo"],
          Jueves: ["Fuerza"],
          Viernes: ["Carrera"],
          Sábado: ["Ciclismo"],
          Domingo: ["Carrera"],
        },
        athleteMetrics: { ctl: 35, runFtp: 290, bikeFtp: 210, lthr: 160 },
      },
      expected: {
        modelAuthor: "Seiler",
        disciplinesOnTuesday: ["Carrera"],
        disciplinesOnWednesday: ["Ciclismo"],
      },
    },
  ];

  const results = testCases.map((tc) => {
    const model = resolveTrainingModel({
      targetDistance: tc.config.targetDistance,
      trainingApproach: tc.config.trainingApproach,
    });

    const authorMatch = model.scientificAuthors.some((a) =>
      a.toLowerCase().includes(tc.expected.modelAuthor.toLowerCase())
    );

    const blueprint = generateCustomMacrocycleBlueprint({
      distanceType: tc.config.targetDistance as any,
      startDate: tc.config.startDate,
      weeksCount: tc.config.weeksCount,
      customGoal: tc.name,
      periodization: tc.config.periodization,
      athleteMetrics: {
        ...tc.config.athleteMetrics,
        weeklyAvailability: tc.config.weeklyAvailability as any,
      },
    });

    const week1 = blueprint.weeks[0];
    const week2 = blueprint.weeks[1];
    const week3 = blueprint.weeks[2];

    const week1Items = week1
      ? generateWeekTemplate(
          week1,
          tc.config.athleteMetrics.runFtp,
          tc.config.athleteMetrics.bikeFtp,
          tc.config.weeklyAvailability as any,
          tc.config.targetDistance as any,
          tc.config.athleteMetrics.ctl
        )
      : [];

    const week2Items = week2
      ? generateWeekTemplate(
          week2,
          tc.config.athleteMetrics.runFtp,
          tc.config.athleteMetrics.bikeFtp,
          tc.config.weeklyAvailability as any,
          tc.config.targetDistance as any,
          tc.config.athleteMetrics.ctl
        )
      : [];

    const week3Items = week3
      ? generateWeekTemplate(
          week3,
          tc.config.athleteMetrics.runFtp,
          tc.config.athleteMetrics.bikeFtp,
          tc.config.weeklyAvailability as any,
          tc.config.targetDistance as any,
          tc.config.athleteMetrics.ctl
        )
      : [];

    const tueItems = week1Items.filter((i) => i.day === "Martes").map((i) => i.discipline);
    const wedItems = week1Items.filter((i) => i.day === "Miércoles").map((i) => i.discipline);

    const tuePass = JSON.stringify(tueItems.sort()) === JSON.stringify([...tc.expected.disciplinesOnTuesday].sort());
    const wedPass = JSON.stringify(wedItems.sort()) === JSON.stringify([...tc.expected.disciplinesOnWednesday].sort());

    const w1Names = week1Items.map((i) => `${i.day}:${i.workoutName}`);
    const w2Names = week2Items.map((i) => `${i.day}:${i.workoutName}`);
    const w3Names = week3Items.map((i) => `${i.day}:${i.workoutName}`);

    const varietyPass = JSON.stringify(w1Names) !== JSON.stringify(w2Names) && JSON.stringify(w2Names) !== JSON.stringify(w3Names);

    let maxLongRun = 0;
    if (tc.expected.targetPeakDistanceKm) {
      const allWeeksItems = blueprint.weeks.flatMap((w) =>
        generateWeekTemplate(
          w,
          tc.config.athleteMetrics.runFtp,
          tc.config.athleteMetrics.bikeFtp,
          tc.config.weeklyAvailability as any,
          tc.config.targetDistance as any,
          tc.config.athleteMetrics.ctl
        )
      );

      maxLongRun = Math.max(
        ...allWeeksItems
          .filter((i) => i.day === "Domingo" && i.discipline === "Carrera")
          .map((i) => {
            const match = i.workoutName.match(/(\d+)\s*km/i);
            return match ? parseInt(match[1], 10) : 0;
          })
      );
    }

    const peakPass = !tc.expected.targetPeakDistanceKm || maxLongRun >= tc.expected.targetPeakDistanceKm;

    return {
      id: tc.id,
      name: tc.name,
      modelAssigned: `${model.displayName} (${model.scientificAuthors.join(", ")})`,
      weeksGenerated: `${blueprint.weeks.length} / ${tc.config.weeksCount}`,
      weeksMatch: blueprint.weeks.length === tc.config.weeksCount,
      tuesdayMatch: { actual: tueItems, expected: tc.expected.disciplinesOnTuesday, pass: tuePass },
      wednesdayMatch: { actual: wedItems, expected: tc.expected.disciplinesOnWednesday, pass: wedPass },
      varietyPass,
      sampleWorkouts: {
        sem1Martes: week1Items.find((i) => i.day === "Martes")?.workoutName,
        sem2Martes: week2Items.find((i) => i.day === "Martes")?.workoutName,
        sem1Miercoles: week1Items.filter((i) => i.day === "Miércoles").map((i) => i.workoutName).join(" + "),
        sem2Miercoles: week2Items.filter((i) => i.day === "Miércoles").map((i) => i.workoutName).join(" + "),
      },
      peakLongRunKm: maxLongRun,
      peakLongRunPass: peakPass,
      overallPass: authorMatch && blueprint.weeks.length === tc.config.weeksCount && tuePass && wedPass && varietyPass && peakPass,
    };
  });

  const totalPassed = results.filter((r) => r.overallPass).length;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    engineVersion: "Motor Fisiológico SGEA v3.2",
    summary: `${totalPassed} / ${results.length} casos de prueba superados al 100%`,
    allPassed: totalPassed === results.length,
    results,
  });
}
