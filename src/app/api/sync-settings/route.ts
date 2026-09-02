import { NextRequest, NextResponse } from "next/server";
import { IntervalsClient } from "@/lib/intervals/client";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      athleteId,
      apiKey,
      uid,
      runFtp,
      bikeFtp,
      weightKg,
      restingHR,
      maxHR,
      lthr,
    } = body;

    const { athleteId: effectiveAthleteId, apiKey: effectiveApiKey } =
      await resolveIntervalsCredentials({ athleteId, apiKey, uid });

    if (!effectiveApiKey || !effectiveAthleteId) {
      return NextResponse.json(
        { success: false, error: "Credenciales de Intervals.icu no configuradas." },
        { status: 400 }
      );
    }

    console.log("🔄 [API sync-settings] Iniciando sincronización hacia Intervals.icu:", {
      athleteId: effectiveAthleteId,
      runFtp,
      bikeFtp,
      weightKg,
      lthr,
      maxHR,
    });

    const client = new IntervalsClient(effectiveAthleteId, effectiveApiKey);
    const syncResults: Record<string, any> = {};

    // 1. Obtener los sport settings actuales de Intervals para conocer los IDs exactos (Run, Ride, etc.)
    try {
      const sportSettings = await client.getSportSettings();
      const runSetting = sportSettings.find((s: any) =>
        s.types?.some((t: string) => /run|running|virtualrun|trailrun/i.test(t)) ||
        /run/i.test(String(s.id)) ||
        s.id === 1844382
      );
      const rideSetting = sportSettings.find((s: any) =>
        s.types?.some((t: string) => /ride|cycling|bike|virtualride|ebikeride/i.test(t)) ||
        /ride|cycling|bike/i.test(String(s.id)) ||
        s.id === 1844381
      );

      // Actualizar Run FTP (Stryd)
      if (runFtp && runSetting?.id) {
        const updatePayload: Record<string, any> = {
          ...runSetting,
          ftp: Number(runFtp),
        };
        if (lthr) updatePayload.lthr = Number(lthr);
        if (maxHR) updatePayload.max_hr = Number(maxHR);

        const updatedRun = await client.updateSportSettings(runSetting.id, updatePayload);
        syncResults.runFtp = `Actualizado a ${updatedRun.ftp || runFtp}W en Intervals (Sport ID: ${runSetting.id})`;
        console.log("✓ [API sync-settings] Run FTP actualizado en Intervals:", syncResults.runFtp);
      }

      // Actualizar Bike FTP
      if (bikeFtp && rideSetting?.id) {
        const updatePayload: Record<string, any> = {
          ...rideSetting,
          ftp: Number(bikeFtp),
        };
        const updatedRide = await client.updateSportSettings(rideSetting.id, updatePayload);
        syncResults.bikeFtp = `Actualizado a ${updatedRide.ftp || bikeFtp}W en Intervals (Sport ID: ${rideSetting.id})`;
        console.log("✓ [API sync-settings] Bike FTP actualizado en Intervals:", syncResults.bikeFtp);
      }
    } catch (sportErr: any) {
      console.warn("⚠️ Aviso al actualizar sport-settings en Intervals:", sportErr?.message);
      syncResults.sportSettingsWarning = sportErr?.message;
    }

    // 2. Actualizar perfil de atleta (peso, FC reposo, icu_ftp, icu_running_ftp)
    try {
      const athletePayload: Record<string, any> = {};
      if (bikeFtp) athletePayload.icu_ftp = Number(bikeFtp);
      if (runFtp) athletePayload.icu_running_ftp = Number(runFtp);
      if (weightKg) athletePayload.weight = Number(weightKg);
      if (restingHR) athletePayload.icu_resting_hr = Number(restingHR);

      if (Object.keys(athletePayload).length > 0) {
        await client.updateAthlete(athletePayload);
        syncResults.athleteProfile = "Umbrales y métricas generales actualizadas en Intervals.";
        console.log("✓ [API sync-settings] Perfil de atleta actualizado en Intervals:", athletePayload);
      }
    } catch (athleteErr: any) {
      console.warn("⚠️ Aviso al actualizar atleta en Intervals:", athleteErr?.message);
      syncResults.athleteWarning = athleteErr?.message;
    }

    return NextResponse.json({
      success: true,
      message: "Sincronización con Intervals.icu completada con éxito.",
      syncResults,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al sincronizar con Intervals.icu";
    console.error("❌ Error en /api/sync-settings:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
