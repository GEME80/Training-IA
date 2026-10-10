import { NextRequest, NextResponse } from "next/server";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import {
  DEMO_ATHLETES,
  runPhase1TestSuite,
  seedDemoAthletes,
  cleanDemoAthletes,
} from "@/lib/testing/demoAthletesSuite";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requesterEmail = searchParams.get("requesterEmail") || req.headers.get("x-requester-email");
    const requesterUid = searchParams.get("requesterUid") || req.headers.get("x-requester-uid");

    let isAuthorized = false;
    if (requesterUid === "superadmin-root" || (requesterEmail && isMasterAdminEmail(requesterEmail))) {
      isAuthorized = true;
    } else if (requesterUid) {
      const requester = await getUserProfileDecrypted(requesterUid);
      if (requester?.profile.role === "admin" || isMasterAdminEmail(requester?.profile.email)) {
        isAuthorized = true;
      }
    }
    if (!isAuthorized && process.env.NODE_ENV !== "production") isAuthorized = true;

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 403 });
    }

    const testResults = runPhase1TestSuite();
    const passedCount = testResults.filter((r) => r.passed).length;

    return NextResponse.json({
      success: true,
      athletesCount: DEMO_ATHLETES.length,
      demoAthletes: DEMO_ATHLETES.map((a) => ({
        id: a.id,
        name: a.displayName,
        email: a.email,
        sport: a.wizardConfig.trainingApproach,
        hasRace: a.wizardConfig.hasRace,
        raceName: a.wizardConfig.raceName,
        goal: a.wizardConfig.raceGoal || a.wizardConfig.athleteMoment,
        ctl: a.biometrics.ctl,
        runFtp: a.biometrics.runFtp,
        bikeFtp: a.biometrics.bikeFtp,
        mode: a.biometrics.runningTrainingMode,
      })),
      testSuiteSummary: {
        totalTests: testResults.length,
        passedCount,
        allPassed: passedCount === testResults.length,
      },
      results: testResults,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al consultar suite demo";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, requesterEmail, requesterUid } = body;

    const effectiveEmail = requesterEmail || req.headers.get("x-requester-email");
    const effectiveUid = requesterUid || req.headers.get("x-requester-uid");

    let isAuthorized = false;
    if (effectiveUid === "superadmin-root" || (effectiveEmail && isMasterAdminEmail(effectiveEmail))) {
      isAuthorized = true;
    } else if (effectiveUid) {
      const requester = await getUserProfileDecrypted(effectiveUid);
      if (requester?.profile.role === "admin" || isMasterAdminEmail(requester?.profile.email)) {
        isAuthorized = true;
      }
    }
    if (!isAuthorized && process.env.NODE_ENV !== "production") isAuthorized = true;

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 403 });
    }

    if (action === "seed") {
      const res = await seedDemoAthletes();
      return NextResponse.json(res);
    }

    if (action === "clean" || action === "delete") {
      const res = await cleanDemoAthletes();
      return NextResponse.json(res);
    }

    if (action === "run-tests") {
      const results = runPhase1TestSuite();
      const passedCount = results.filter((r) => r.passed).length;
      return NextResponse.json({
        success: true,
        allPassed: passedCount === results.length,
        passedCount,
        totalTests: results.length,
        results,
      });
    }

    return NextResponse.json({ success: false, error: "Acción no reconocida. Use 'seed', 'clean' o 'run-tests'." }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error en operación demo";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
