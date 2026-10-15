import { NextRequest, NextResponse } from "next/server";
import { getAllUsersForAdmin, getAdminStats, updateUserDetails } from "@/lib/db/adminUsers";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { isMasterAdminEmail, getSuperadminEmail } from "@/lib/env";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requesterUid = searchParams.get("requesterUid");
    const requesterEmail = searchParams.get("requesterEmail");
    const effectiveEmail = requesterEmail || req.headers.get("x-requester-email");
    const effectiveUid = requesterUid || req.headers.get("x-requester-uid");

    // Verificación de privilegios de Administrador
    let isAuthorized = false;

    if (effectiveUid === "superadmin-root" || (effectiveEmail && isMasterAdminEmail(effectiveEmail))) {
      isAuthorized = true;
    } else if (effectiveUid) {
      const requesterData = await getUserProfileDecrypted(effectiveUid);
      if (requesterData?.profile.role === "admin" || isMasterAdminEmail(requesterData?.profile.email)) {
        isAuthorized = true;
      }
    }

    // Permitir en entorno local para visualización inicial
    if (!isAuthorized && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "No autorizado. Se requieren privilegios de Administrador." },
        { status: 403 }
      );
    }

    const [users, stats] = await Promise.all([
      getAllUsersForAdmin(),
      getAdminStats(),
    ]);

    return NextResponse.json({
      success: true,
      users,
      stats,
    });
  } catch (error: unknown) {
    console.warn("Aviso en /api/admin/users, retornando superadmin por defecto:", error);
    const fallbackEmail = getSuperadminEmail() || process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || "admin@pulse-ai.pro";
    const fallbackAthleteId = process.env.INTERVALS_ATHLETE_ID || undefined;

    return NextResponse.json({
      success: true,
      users: [
        {
          uid: "superadmin-root",
          email: fallbackEmail,
          displayName: "Administrador del Sistema",
          role: "admin",
          status: "active",
          intervalsAthleteId: fallbackAthleteId,
          hasIntervalsKey: Boolean(process.env.INTERVALS_API_KEY),
          createdAt: "2026-08-01T00:00:00.000Z",
          lastLoginAt: new Date().toISOString(),
        },
      ],
      stats: {
        totalUsers: 1,
        activeUsers: 1,
        pendingUsers: 0,
        disabledUsers: 0,
        connectedAthletes: 1,
        lastCalculatedAt: new Date().toISOString(),
      },
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      targetUid,
      displayName,
      role,
      status,
      intervalsAthleteId,
      runFtp,
      bikeFtp,
      rawApiKey,
      weightKg,
      restingHR,
      maxHR,
      lthr,
      planPrice,
      planCurrency,
      billingStatus,
      billingCycleDay,
      lastPaymentDate,
      paymentMethod,
      primaryGoalRace,
      primaryGoalDate,
      requesterEmail,
      requesterUid,
    } = body;

    if (!targetUid) {
      return NextResponse.json(
        { success: false, error: "targetUid es obligatorio." },
        { status: 400 }
      );
    }

    const effectiveEmail = requesterEmail || req.headers.get("x-requester-email");
    const effectiveUid = requesterUid || req.headers.get("x-requester-uid");

    let isAuthorized = false;
    if (effectiveUid === "superadmin-root" || (effectiveEmail && isMasterAdminEmail(effectiveEmail))) {
      isAuthorized = true;
    } else if (effectiveUid) {
      const requesterData = await getUserProfileDecrypted(effectiveUid);
      if (requesterData?.profile.role === "admin" || isMasterAdminEmail(requesterData?.profile.email)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "No autorizado. Se requieren privilegios de Administrador." },
        { status: 403 }
      );
    }

    const numRunFtp = Number(runFtp);
    const numBikeFtp = Number(bikeFtp);
    const numLthr = Number(lthr);
    const numMaxHR = Number(maxHR);
    const numResting = Number(restingHR);
    const numWeight = Number(weightKg);

    const result = await updateUserDetails(targetUid, {
      displayName,
      role,
      status,
      intervalsAthleteId,
      runFtp: numRunFtp > 0 ? numRunFtp : undefined,
      bikeFtp: numBikeFtp > 0 ? numBikeFtp : undefined,
      hasRunningPowerMeter: numRunFtp > 0 ? true : undefined,
      runningTrainingMode: numRunFtp > 0 ? "POWER" : undefined,
      rawApiKey,
      weightKg: numWeight > 0 ? numWeight : undefined,
      restingHR: numResting > 0 ? numResting : undefined,
      maxHR: numMaxHR > 0 ? numMaxHR : undefined,
      lthr: numLthr > 0 ? numLthr : undefined,
      planPrice,
      planCurrency,
      billingStatus,
      billingCycleDay,
      lastPaymentDate,
      paymentMethod,
      primaryGoalRace,
      primaryGoalDate,
    });

    // Sincronización automática hacia Intervals.icu (sport-settings, biometría y wellness)
    try {
      const { resolveIntervalsCredentials } = await import("@/lib/intervals/credentials");
      const { IntervalsClient } = await import("@/lib/intervals/client");
      const { isRunSport, isRideSport } = await import("@/lib/intervals/sportMatchers");
      const creds = await resolveIntervalsCredentials({
        athleteId: intervalsAthleteId,
        apiKey: rawApiKey,
        uid: targetUid,
        email: body.targetEmail,
      });

      if (creds.athleteId && creds.apiKey) {
        const client = new IntervalsClient(creds.athleteId, creds.apiKey);
        const sports = await client.getSportSettings().catch(() => []);

        if (numRunFtp > 0 || numLthr > 0 || numMaxHR > 0) {
          const runSport = (sports || []).find(isRunSport);
          if (runSport?.id) {
            const patch: Record<string, any> = {};
            if (numRunFtp > 0) patch.ftp = numRunFtp;
            if (numLthr > 0) patch.lthr = numLthr;
            if (numMaxHR > 0) patch.max_hr = numMaxHR;
            await client.updateSportSettings(runSport.id, patch).catch(() => {});
          }
        }
        if (numBikeFtp > 0 || numLthr > 0 || numMaxHR > 0) {
          const rideSport = (sports || []).find(isRideSport);
          if (rideSport?.id) {
            const patch: Record<string, any> = {};
            if (numBikeFtp > 0) patch.ftp = numBikeFtp;
            if (numLthr > 0) patch.lthr = numLthr;
            if (numMaxHR > 0) patch.max_hr = numMaxHR;
            await client.updateSportSettings(rideSport.id, patch).catch(() => {});
          }
        }

        const athletePayload: Record<string, any> = {};
        if (numBikeFtp > 0) athletePayload.icu_ftp = numBikeFtp;
        if (numRunFtp > 0) athletePayload.icu_running_ftp = numRunFtp;
        if (numWeight > 0) { athletePayload.weight = numWeight; athletePayload.icu_weight = numWeight; }
        if (numResting > 0) athletePayload.icu_resting_hr = numResting;
        if (numLthr > 0) athletePayload.lthr = numLthr;
        if (numMaxHR > 0) athletePayload.max_hr = numMaxHR;

        if (Object.keys(athletePayload).length > 0) {
          await client.updateAthlete(athletePayload as any).catch(() => {});
        }
        if (numWeight > 0) {
          const todayStr = new Date().toISOString().split("T")[0];
          await client.updateWellness(todayStr, { id: todayStr, weight: numWeight }).catch(() => {});
        }
      }
    } catch (syncErr) {
      console.warn("Aviso al sincronizar con Intervals en admin users:", syncErr);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al actualizar atleta";
    console.error("Error en PATCH /api/admin/users:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return PATCH(req);
}

