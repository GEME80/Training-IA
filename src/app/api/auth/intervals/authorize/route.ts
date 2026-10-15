import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid") || "";
    const returnTo = searchParams.get("returnTo") || "/";
    const mode = searchParams.get("mode") || "redirect";

    const clientId = process.env.NEXT_PUBLIC_INTERVALS_CLIENT_ID || process.env.INTERVALS_CLIENT_ID || "1371";

    // Determinar la URL base de redirección de forma dinámica según el host de la petición
    const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const forwardedProto = req.headers.get("x-forwarded-proto") || (forwardedHost.includes("localhost") ? "http" : "https");
    const baseUrl = `${forwardedProto}://${forwardedHost}`;
    const redirectUri = `${baseUrl}/api/auth/intervals/callback`;

    // Empaquetar estado para CSRF y persistencia de UID
    const statePayload = {
      uid,
      returnTo,
      timestamp: Date.now(),
    };
    const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

    // Construcción del enlace oficial de OAuth 2.0 para Intervals.icu
    const authUrl = `https://intervals.icu/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=ACTIVITY,CALENDAR,WELLNESS,SETTINGS&state=${state}`;

    if (mode === "json") {
      return NextResponse.json({
        success: true,
        url: authUrl,
        clientId,
        redirectUri,
      });
    }

    return NextResponse.redirect(authUrl);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al iniciar autorización OAuth con Intervals.icu";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
