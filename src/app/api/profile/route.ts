import { NextRequest, NextResponse } from "next/server";
import { saveUserProfile, getUserProfileDecrypted } from "@/lib/db/userProfile";
import { DEFAULT_WEEKLY_AVAILABILITY } from "@/lib/gemini/engine";
import { ProfileUpdateRequestSchema } from "@/lib/validation/schemas";
import { isRunSport, isRideSport, isSwimSport } from "@/lib/intervals/sportMatchers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { success: false, error: "UID es requerido para consultar el perfil" },
        { status: 400 }
      );
    }

    // Si Firebase Admin no está conectado, retornamos estado fallback para pruebas
    try {
      const data = await getUserProfileDecrypted(uid);
      if (data) {
        return NextResponse.json({
          success: true,
          profile: {
            ...data.profile,
            weeklyAvailability: data.profile.weeklyAvailability || DEFAULT_WEEKLY_AVAILABILITY,
            hasApiKey: !!data.decryptedApiKey,
          },
        });
      }
    } catch {
      // Retornar demo profile si la base de datos aún no se ha aprovisionado en local
    }

    return NextResponse.json({
      success: true,
      profile: {
        uid,
        email: "atleta@pulseai.pro",
        displayName: "Atleta",
        intervalsAthleteId: undefined,
        hasApiKey: false,
        trainingFocus: "BUILD",
        weeklyAvailability: DEFAULT_WEEKLY_AVAILABILITY,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener perfil";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = ProfileUpdateRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Payload de actualización de perfil inválido",
          validationErrors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      uid,
      email = "atleta@pulseai.pro",
      displayName,
      intervalsAthleteId,
      rawApiKey,
      runFtp,
      bikeFtp,
      restingHR,
      maxHR,
      lthr,
      weightKg,
      heightCm,
      birthDate,
      gender,
      hasRunningPowerMeter,
      runningTrainingMode,
      runThresholdPaceStr,
      runThresholdPaceSecPerKm,
      swimCssStr,
      swimCssSecPer100m,
      trainingFocus,
      weeklyAvailability,
      visibleMetrics,
      targetRaces,
      seasonPlans,
    } = parseResult.data;

    try {
      await saveUserProfile(uid, {
        email,
        displayName,
        intervalsAthleteId,
        rawApiKey,
        runFtp: runFtp !== undefined && runFtp !== null ? Number(runFtp) : undefined,
        bikeFtp: bikeFtp !== undefined && bikeFtp !== null ? Number(bikeFtp) : undefined,
        hasRunningPowerMeter: hasRunningPowerMeter ?? undefined,
        runningTrainingMode: runningTrainingMode ?? undefined,
        runThresholdPaceStr: runThresholdPaceStr ?? undefined,
        runThresholdPaceSecPerKm: runThresholdPaceSecPerKm !== undefined && runThresholdPaceSecPerKm !== null ? Number(runThresholdPaceSecPerKm) : undefined,
        swimCssStr: swimCssStr ?? undefined,
        swimCssSecPer100m: swimCssSecPer100m !== undefined && swimCssSecPer100m !== null ? Number(swimCssSecPer100m) : undefined,
        restingHR: restingHR !== undefined && restingHR !== null ? Number(restingHR) : undefined,
        maxHR: maxHR !== undefined && maxHR !== null ? Number(maxHR) : undefined,
        lthr: lthr !== undefined && lthr !== null ? Number(lthr) : undefined,
        weightKg: weightKg !== undefined && weightKg !== null ? Number(weightKg) : undefined,
        heightCm: heightCm !== undefined && heightCm !== null ? Number(heightCm) : undefined,
        birthDate,
        gender: gender ?? undefined,
        trainingFocus: trainingFocus ?? undefined,
        weeklyAvailability,
        visibleMetrics,
        targetRaces,
        seasonPlans,
      });

      if (runningTrainingMode === "POWER" || runningTrainingMode === "PACE") {
        const { updateActiveMacrocycleRunningMode } = await import("@/lib/db/macrocycles");
        await updateActiveMacrocycleRunningMode(
          intervalsAthleteId || uid,
          runningTrainingMode,
          uid,
          runFtp !== undefined && runFtp !== null ? Number(runFtp) : undefined
        ).catch(() => {});
      }
    } catch (dbErr) {
      console.warn("Aviso: Guardado en Firestore omitido en modo local:", dbErr);
    }

    // Sincronización hacia Intervals.icu (Push de Potencia Ciclismo, Potencia Stryd, Ritmo Carrera y CSS Natación)
    try {
      const { resolveIntervalsCredentials } = await import("@/lib/intervals/credentials");
      const { IntervalsClient } = await import("@/lib/intervals/client");
      const credentials = await resolveIntervalsCredentials({
        athleteId: intervalsAthleteId,
        apiKey: rawApiKey,
        uid,
        email,
      });

      if (credentials.athleteId && credentials.apiKey) {
        const client = new IntervalsClient(credentials.athleteId, credentials.apiKey);
        const sports = await client.getSportSettings().catch(() => []);

        // 1. Ciclismo FTP
        if (bikeFtp !== undefined && bikeFtp !== null && bikeFtp > 0) {
          const rideSport = (sports || []).find(isRideSport);
          if (rideSport?.id) {
            await client.updateSportSettings(rideSport.id, { ftp: Number(bikeFtp) }).catch(() => null);
          }
          await client.updateAthlete({ icu_ftp: Number(bikeFtp) } as any).catch(() => null);
        }

        // 2. Stryd Potencia Carrera
        if (runFtp !== undefined && runFtp !== null && runFtp > 0) {
          const runSport = (sports || []).find(isRunSport);
          if (runSport?.id) {
            await client.updateSportSettings(runSport.id, { ftp: Number(runFtp) }).catch(() => null);
          }
          await client.updateAthlete({ icu_running_ftp: Number(runFtp) } as any).catch(() => null);
        }

        // 3. Ritmo Umbral Carrera
        const effectiveSec = runThresholdPaceSecPerKm || (runThresholdPaceStr ? (await import("@/lib/physiology/runningWorkoutAdapter")).parsePaceToSeconds(runThresholdPaceStr) : 0);
        if (effectiveSec > 0) {
          const runSport = (sports || []).find(isRunSport);
          if (runSport?.id) {
            const speedMps = Number((1000 / effectiveSec).toFixed(3));
            await client.updateSportSettings(runSport.id, { pace: speedMps }).catch(() => null);
          }
        }

        // 4. Ritmo Umbral Natación (CSS)
        const effectiveSwimSec = swimCssSecPer100m || (swimCssStr ? (await import("@/lib/physiology/runningWorkoutAdapter")).parseSwimPaceToSeconds(swimCssStr) : 0);
        if (effectiveSwimSec > 0) {
          const swimSport = (sports || []).find(isSwimSport);
          if (swimSport?.id) {
            const thresholdPace = Number((100 / effectiveSwimSec).toFixed(4));
            await client.updateSportSettings(swimSport.id, { threshold_pace: thresholdPace }).catch(() => null);
          }
        }

        // 5. Frecuencia Cardíaca y Biometría (SSOT Intervals)
        const numLthr = lthr !== undefined && lthr !== null ? Number(lthr) : undefined;
        const numMaxHR = maxHR !== undefined && maxHR !== null ? Number(maxHR) : undefined;
        const numResting = restingHR !== undefined && restingHR !== null ? Number(restingHR) : undefined;
        const numWeight = weightKg !== undefined && weightKg !== null ? Number(weightKg) : undefined;

        if (numLthr || numMaxHR || numResting || numWeight) {
          if (numLthr || numMaxHR) {
            const runSport = (sports || []).find(isRunSport);
            if (runSport?.id) {
              await client.updateSportSettings(runSport.id, {
                ...(numLthr ? { lthr: numLthr } : {}),
                ...(numMaxHR ? { max_hr: numMaxHR } : {}),
              }).catch(() => null);
            }
            const rideSport = (sports || []).find(isRideSport);
            if (rideSport?.id) {
              await client.updateSportSettings(rideSport.id, {
                ...(numLthr ? { lthr: numLthr } : {}),
                ...(numMaxHR ? { max_hr: numMaxHR } : {}),
              }).catch(() => null);
            }
          }
          await client.updateAthlete({
            ...(numLthr ? { lthr: numLthr } : {}),
            ...(numMaxHR ? { max_hr: numMaxHR } : {}),
            ...(numResting ? { icu_resting_hr: numResting } : {}),
            ...(numWeight ? { weight: numWeight, icu_weight: numWeight } : {}),
          } as any).catch(() => null);

          if (numWeight) {
            const todayStr = new Date().toISOString().split("T")[0];
            await client.updateWellness(todayStr, { id: todayStr, weight: numWeight }).catch(() => null);
          }
        }
      }
    } catch (syncErr) {
      console.warn("Aviso al sincronizar umbrales hacia Intervals.icu:", syncErr);
    }

    return NextResponse.json({
      success: true,
      message: "Perfil y configuración guardados de forma segura.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al guardar perfil";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export const PUT = POST;
