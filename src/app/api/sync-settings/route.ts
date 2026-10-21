import { NextRequest, NextResponse } from "next/server";
import { IntervalsClient } from "@/lib/intervals/client";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
import { isRunSport, isRideSport, isSwimSport } from "@/lib/intervals/sportMatchers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      athleteId, apiKey, uid, email,
      runFtp, bikeFtp, runThresholdPaceSec, runThresholdPaceStr,
      hasRunningPowerMeter, runningTrainingMode, swimCssSecPer100m,
      weightKg, birthDate, gender, lthr, maxHR, restingHR,
    } = body;
    const numLthr = lthr ? Number(lthr) : undefined;
    const numMaxHR = maxHR ? Number(maxHR) : undefined;
    const safeLthr = numLthr && numMaxHR && numLthr > numMaxHR ? numMaxHR : numLthr;
    const baseMaxHR = numLthr && numMaxHR && numLthr > numMaxHR ? numLthr : numMaxHR;
    // Guardarraíl fisiológico universal: FC máxima con buffer de al menos 10% sobre LTHR
    const safeMaxHR = baseMaxHR
      ? (safeLthr ? Math.max(baseMaxHR, Math.round(safeLthr * 1.10)) : baseMaxHR)
      : (safeLthr ? Math.round(safeLthr * 1.10) : undefined);

    let effectiveRunSec = runThresholdPaceSec ? Number(runThresholdPaceSec) : undefined;
    if (!effectiveRunSec && runThresholdPaceStr) {
      const { parsePaceToSeconds } = await import("@/lib/physiology/runningWorkoutAdapter");
      effectiveRunSec = parsePaceToSeconds(runThresholdPaceStr);
    }
    if (!effectiveRunSec && uid) {
      const { getUserProfileDecrypted } = await import("@/lib/db/userProfile");
      const uDoc = await getUserProfileDecrypted(uid).catch(() => null);
      if (uDoc?.profile?.runThresholdPaceSecPerKm) {
        effectiveRunSec = uDoc.profile.runThresholdPaceSecPerKm;
      } else if (uDoc?.profile?.runThresholdPaceStr) {
        const { parsePaceToSeconds } = await import("@/lib/physiology/runningWorkoutAdapter");
        effectiveRunSec = parsePaceToSeconds(uDoc.profile.runThresholdPaceStr);
      }
    }

    const { athleteId: effId, apiKey: effKey } = await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });
    if (!effKey || !effId) {
      return NextResponse.json({ success: false, error: "Credenciales de Intervals no configuradas." }, { status: 400 });
    }

    const client = new IntervalsClient(effId, effKey);
    const syncResults: Record<string, any> = {};

    // 1. Sincronizar FTP de carrera, ciclismo y CSS de natación en sport-settings
    try {
      const sportSettings = await client.getSportSettings();
      const runSetting = (sportSettings || []).find(isRunSport);
      const rideSetting = (sportSettings || []).find(isRideSport);
      const swimSetting = (sportSettings || []).find(isSwimSport);

      if (runSetting?.id) {
        const patch: Record<string, any> = { ...runSetting };
        const isPaceAthlete = runningTrainingMode === "PACE" || hasRunningPowerMeter === false;
        if (isPaceAthlete) {
          patch.ftp = null;
          patch.indoor_ftp = null;
        } else if (runFtp) {
          patch.ftp = Number(runFtp);
        }
        if (effectiveRunSec && effectiveRunSec > 0) {
          patch.threshold_pace = Number((1000 / effectiveRunSec).toFixed(3));
          patch.pace_units = "MINS_KM";
          const pMin = Math.floor(effectiveRunSec / 60);
          const pSec = String(effectiveRunSec % 60).padStart(2, "0");
          syncResults.thresholdPace = `${pMin}:${pSec}/km`;
        }
        const pref = isPaceAthlete ? "PACE,HR,POWER" : "POWER,PACE,HR";
        patch.load_preference = pref;
        patch.time_in_zones_preference = pref;
        patch.plan_load_preference = pref;
        patch.interval_summary_preference = pref;
        if (safeLthr) patch.lthr = safeLthr;
        if (safeMaxHR) patch.max_hr = safeMaxHR;
        await client.updateSportSettings(runSetting.id, patch);
        if (!isPaceAthlete && runFtp) syncResults.runFtp = `${runFtp}W (Stryd)`;
      }
      if (rideSetting?.id && (bikeFtp || safeLthr || safeMaxHR)) {
        const patch: Record<string, any> = { ...rideSetting };
        if (bikeFtp) patch.ftp = Number(bikeFtp);
        if (safeLthr) patch.lthr = safeLthr;
        if (safeMaxHR) patch.max_hr = safeMaxHR;
        await client.updateSportSettings(rideSetting.id, patch);
        if (bikeFtp) syncResults.bikeFtp = `${bikeFtp}W`;
      }
      if (swimSetting?.id && (swimCssSecPer100m || safeLthr || safeMaxHR)) {
        const patch: Record<string, any> = { ...swimSetting };
        if (swimCssSecPer100m && Number(swimCssSecPer100m) > 0) {
          patch.threshold_pace = Number((100 / Number(swimCssSecPer100m)).toFixed(4));
        }
        if (safeLthr) patch.lthr = safeLthr;
        if (safeMaxHR) patch.max_hr = safeMaxHR;
        await client.updateSportSettings(swimSetting.id, patch);
        if (swimCssSecPer100m) syncResults.swimCss = `${swimCssSecPer100m}s/100m`;
      }
    } catch (sErr: any) {
      syncResults.sportWarning = sErr?.message;
    }

    // 2. Sincronizar métricas maestras en perfil de atleta: Stryd CP, Bike FTP, peso, edad/fecha, sexo y FC reposo
    try {
      const athletePayload: Record<string, any> = {};
      if (bikeFtp) athletePayload.icu_ftp = Number(bikeFtp);
      if (runFtp) athletePayload.icu_running_ftp = Number(runFtp);
      if (weightKg) athletePayload.weight = Number(weightKg);
      if (restingHR) athletePayload.icu_resting_hr = Number(restingHR);
      if (safeLthr) athletePayload.lthr = safeLthr;
      if (safeMaxHR) athletePayload.max_hr = safeMaxHR;
      if (birthDate) { athletePayload.icu_date_of_birth = birthDate; athletePayload.dob = birthDate; }
      if (gender) athletePayload.sex = gender === "M" ? "M" : gender === "F" ? "F" : undefined;

      if (Object.keys(athletePayload).length > 0) {
        await client.updateAthlete(athletePayload);
        syncResults.athleteProfile = "Perfil actualizado en Intervals.icu";
      }

      // Sincronizar peso en el registro diario de Wellness para reflejarlo en gráficas PMC
      if (weightKg) {
        const todayStr = new Date().toISOString().split("T")[0];
        await client.updateWellness(todayStr, { id: todayStr, weight: Number(weightKg) });
        syncResults.wellnessWeight = `${weightKg} kg sincronizado en Wellness`;
      }
    } catch (aErr: any) {
      syncResults.athleteWarning = aErr?.message;
    }

    return NextResponse.json({ success: true, message: "Sincronización con Intervals.icu completada.", syncResults });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al sincronizar con Intervals.icu";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
