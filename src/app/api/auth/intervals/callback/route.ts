import { NextRequest, NextResponse } from "next/server";
import { saveUserProfile } from "@/lib/db/userProfile";
import { IntervalsClient } from "@/lib/intervals/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const errorParam = searchParams.get("error") || searchParams.get("error_description");

  // Decodificar estado previo
  let uid = "";
  let returnTo = "/";
  if (stateRaw) {
    try {
      const decoded = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf8"));
      uid = decoded.uid || "";
      returnTo = decoded.returnTo || "/";
    } catch {
      // Ignorar error de parsing si el estado viene en otro formato
    }
  }

  const separator = returnTo.includes("?") ? "&" : "?";

  // Determinar la URL base pública de redirección respetando proxies de Cloud Run / App Hosting
  const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const forwardedHost = rawHost && !rawHost.includes("0.0.0.0") ? rawHost : "pulseendurance.co";
  const forwardedProto = req.headers.get("x-forwarded-proto") || (forwardedHost.includes("localhost") ? "http" : "https");
  const baseUrl = `${forwardedProto}://${forwardedHost}`;

  // Manejo de rechazo por parte del usuario en la pantalla de autorización
  if (errorParam || !code) {
    const errorMsg = errorParam || "Autorización cancelada o código ausente.";
    return NextResponse.redirect(new URL(`${returnTo}${separator}intervals_error=${encodeURIComponent(errorMsg)}`, baseUrl));
  }

  const clientId = process.env.NEXT_PUBLIC_INTERVALS_CLIENT_ID || process.env.INTERVALS_CLIENT_ID || "1371";
  const clientSecret = process.env.INTERVALS_CLIENT_SECRET || "";

  try {
    // 1. Intercambiar código de autorización por token de acceso en Intervals.icu
    const tokenParams = new URLSearchParams();
    tokenParams.append("client_id", clientId);
    tokenParams.append("client_secret", clientSecret);
    tokenParams.append("code", code);

    const tokenRes = await fetch("https://intervals.icu/api/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Error al intercambiar token OAuth en Intervals.icu:", errText);
      return NextResponse.redirect(new URL(`${returnTo}${separator}intervals_error=token_exchange_failed`, baseUrl));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    // Intervals.icu devuelve el ID en tokenData.athlete.id
    const rawAthleteId = String(tokenData.athlete?.id || tokenData.athlete_id || tokenData.id || "");
    const athleteName = tokenData.athlete?.name || tokenData.name || "";

    if (!accessToken || !rawAthleteId) {
      console.error("Payload de token inválido recibido de Intervals:", JSON.stringify(tokenData));
      return NextResponse.redirect(new URL(`${returnTo}${separator}intervals_error=invalid_token_payload`, baseUrl));
    }

    // Normalizar ID de atleta para garantizar prefijo i
    const effectiveAthleteId = rawAthleteId.startsWith("i") ? rawAthleteId : `i${rawAthleteId}`;
    const bearerKey = `Bearer ${accessToken}`;

    // 2. Extraer parámetros fisiológicos iniciales mediante IntervalsClient
    let detectedProfile: any = {};
    try {
      const client = new IntervalsClient(effectiveAthleteId, bearerKey);
      const testResult = await client.testConnection();
      if (testResult.success) {
        detectedProfile = testResult;
      }
    } catch (testErr) {
      console.warn("Aviso al consultar perfil tras OAuth:", testErr);
    }

    // 3. Persistir en Firestore si el usuario está autenticado en PULSE AI
    if (uid) {
      await saveUserProfile(uid, {
        intervalsAthleteId: effectiveAthleteId,
        rawApiKey: bearerKey,
        displayName: detectedProfile.athleteName || athleteName,
        runFtp: detectedProfile.runFtp,
        bikeFtp: detectedProfile.bikeFtp,
        restingHR: detectedProfile.restingHR,
        maxHR: detectedProfile.maxHR,
        lthr: detectedProfile.lthr,
        weightKg: detectedProfile.weight,
        swimCssSecPer100m: detectedProfile.swimCssSecPer100m,
        swimCssStr: detectedProfile.swimCssStr,
      });
    }

    // 4. Redireccionar al usuario de regreso a la interfaz de PULSE AI con éxito
    const successUrl = `${returnTo}${separator}intervals_connected=true&athleteId=${effectiveAthleteId}&token=${encodeURIComponent(
      bearerKey
    )}`;
    return NextResponse.redirect(new URL(successUrl, baseUrl));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado en callback OAuth";
    console.error("Fallo crítico en /api/auth/intervals/callback:", message);
    return NextResponse.redirect(new URL(`${returnTo}${separator}intervals_error=${encodeURIComponent(message)}`, baseUrl));
  }
}

