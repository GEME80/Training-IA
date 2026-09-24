import { NextRequest, NextResponse } from "next/server";
import { IntervalsClient } from "@/lib/intervals/client";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { athleteId, apiKey, uid, email, runFtp, bikeFtp, weightKg, birthDate, gender, lthr, maxHR, restingHR } = body;

    const { athleteId: effId, apiKey: effKey } = await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });
    if (!effKey || !effId) {
      return NextResponse.json({ success: false, error: "Credenciales de Intervals no configuradas." }, { status: 400 });
    }

    const client = new IntervalsClient(effId, effKey);
    const syncResults: Record<string, any> = {};

    // 1. Sincronizar FTP de carrera (Stryd) y ciclismo en sport-settings
    try {
      const sportSettings = await client.getSportSettings();
      const runSetting = sportSettings.find((s: any) => s.types?.some((t: string) => /run/i.test(t)) || /run/i.test(String(s.id)));
      const rideSetting = sportSettings.find((s: any) => s.types?.some((t: string) => /ride|cycling|bike/i.test(t)) || /ride|cycling|bike/i.test(String(s.id)));

      if (runSetting?.id && (runFtp || lthr || maxHR)) {
        const patch: Record<string, any> = { ...runSetting };
        if (runFtp) patch.ftp = Number(runFtp);
        if (lthr) patch.lthr = Number(lthr);
        if (maxHR) patch.max_hr = Number(maxHR);
        await client.updateSportSettings(runSetting.id, patch);
        if (runFtp) syncResults.runFtp = `${runFtp}W (Stryd)`;
      }
      if (rideSetting?.id && (bikeFtp || lthr || maxHR)) {
        const patch: Record<string, any> = { ...rideSetting };
        if (bikeFtp) patch.ftp = Number(bikeFtp);
        if (lthr) patch.lthr = Number(lthr);
        if (maxHR) patch.max_hr = Number(maxHR);
        await client.updateSportSettings(rideSetting.id, patch);
        if (bikeFtp) syncResults.bikeFtp = `${bikeFtp}W`;
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
