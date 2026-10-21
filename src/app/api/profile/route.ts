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

    const parsedLthr = lthr !== undefined && lthr !== null ? Number(lthr) : undefined;
    const parsedMaxHR = maxHR !== undefined && maxHR !== null ? Number(maxHR) : undefined;
    const numLthr = parsedLthr && parsedMaxHR && parsedLthr > parsedMaxHR ? parsedMaxHR : parsedLthr;
    const rawMaxHR = parsedLthr && parsedMaxHR && parsedLthr > parsedMaxHR ? parsedLthr : parsedMaxHR;
    // Guardarraíl fisiológico universal: FC máxima no puede estrangular LTHR (buffer mínimo 10% sobre LTHR para evitar cortes de picos en Intervals)
    const numMaxHR = rawMaxHR
      ? (numLthr ? Math.max(rawMaxHR, Math.round(numLthr * 1.10)) : rawMaxHR)
      : (numLthr ? Math.round(numLthr * 1.10) : undefined);

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
        maxHR: numMaxHR,
        lthr: numLthr,
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
          const ftp = Number(bikeFtp);
          const cogganPowerZones = [
            Math.round(ftp * 0.55),
            Math.round(ftp * 0.75),
            Math.round(ftp * 0.90),
            Math.round(ftp * 1.05),
            Math.round(ftp * 1.20),
            Math.round(ftp * 1.50),
          ];
          const rideSport = (sports || []).find(isRideSport);
          if (rideSport?.id) {
            await client.updateSportSettings(rideSport.id, { ftp, power_zones: cogganPowerZones }).catch(() => null);
          }
          await client.updateAthlete({ icu_ftp: ftp } as any).catch(() => null);
        }

        // 2. Stryd Potencia Carrera (Calibración exacta de 5 zonas Stryd para TSS)
        if (runFtp !== undefined && runFtp !== null && runFtp > 0) {
          const cp = Number(runFtp);
          const strydPowerZones = [
            Math.round(cp * 0.80),
            Math.round(cp * 0.90),
            Math.round(cp * 1.00),
            Math.round(cp * 1.15),
          ];
          const runSport = (sports || []).find(isRunSport);
          if (runSport?.id) {
            await client.updateSportSettings(runSport.id, { ftp: cp, power_zones: strydPowerZones }).catch(() => null);
          }
          await client.updateAthlete({ icu_running_ftp: cp } as any).catch(() => null);
        }

        // 3. Ritmo Umbral Carrera (Sincronización SSOT m/s y orden de carga rTSS para todos los atletas)
        const effectiveSec = runThresholdPaceSecPerKm || (runThresholdPaceStr ? (await import("@/lib/physiology/runningWorkoutAdapter")).parsePaceToSeconds(runThresholdPaceStr) : 0);
        if (effectiveSec > 0) {
          const runSport = (sports || []).find(isRunSport);
          if (runSport?.id) {
            const speedMps = Number((1000 / effectiveSec).toFixed(3));
            const isPaceAthlete = runningTrainingMode === "PACE" || hasRunningPowerMeter === false;
            const pref = isPaceAthlete ? "PACE,HR,POWER" : "POWER,PACE,HR";
            await client.updateSportSettings(runSport.id, {
              threshold_pace: speedMps,
              pace_units: "MINS_KM",
              load_preference: pref,
              time_in_zones_preference: pref,
              plan_load_preference: pref,
              interval_summary_preference: pref,
              ...(isPaceAthlete ? { ftp: null, indoor_ftp: null } : {}),
            }).catch(() => null);
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

        // 5. Frecuencia Cardíaca y Biometría (SSOT Intervals para CTL/ATL/TSS)
        const numResting = restingHR !== undefined && restingHR !== null ? Number(restingHR) : undefined;
        const numWeight = weightKg !== undefined && weightKg !== null ? Number(weightKg) : undefined;

        if (numLthr || numMaxHR || numResting || numWeight || birthDate || gender) {
          const hrZones = numLthr
            ? [
                Math.round(numLthr * 0.81),
                Math.round(numLthr * 0.89),
                Math.round(numLthr * 0.99),
                Math.round(numLthr * 1.05),
              ]
            : undefined;

          if (numLthr || numMaxHR) {
            const runSport = (sports || []).find(isRunSport);
            if (runSport?.id) {
              await client.updateSportSettings(runSport.id, {
                ...(numLthr ? { lthr: numLthr, hr_zones: hrZones } : {}),
                ...(numMaxHR ? { max_hr: numMaxHR } : {}),
              }).catch(() => null);
            }
            const rideSport = (sports || []).find(isRideSport);
            if (rideSport?.id) {
              await client.updateSportSettings(rideSport.id, {
                ...(numLthr ? { lthr: numLthr, hr_zones: hrZones } : {}),
                ...(numMaxHR ? { max_hr: numMaxHR } : {}),
              }).catch(() => null);
            }
          }

          await client.updateAthlete({
            ...(numLthr ? { lthr: numLthr } : {}),
            ...(numMaxHR ? { max_hr: numMaxHR } : {}),
            ...(numResting ? { icu_resting_hr: numResting } : {}),
            ...(numWeight ? { weight: numWeight, icu_weight: numWeight } : {}),
            ...(birthDate ? { dob: birthDate, icu_date_of_birth: birthDate } : {}),
            ...(gender ? { sex: gender, icu_gender: gender } : {}),
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
