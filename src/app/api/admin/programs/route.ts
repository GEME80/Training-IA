import { NextRequest, NextResponse } from "next/server";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import {
  getAllMacrocycleDefinitions,
  saveCustomMacrocycleDefinition,
  deleteCustomMacrocycleDefinition,
  resetMacrocycleLibraryToDefault,
  MacrocycleDefinition,
} from "@/lib/physiology/macrocycleLibrary";

/**
 * Endpoint de SuperAdmin para Gestión de Librerías y Programas Deportivos
 * GET: Obtener catálogo de programas activos
 * POST: Crear nuevo programa o Generar con IA
 * PUT: Actualizar programa existente
 * DELETE: Eliminar programa personalizado
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requesterEmail = searchParams.get("requesterEmail");
    const requesterUid = searchParams.get("requesterUid");

    // Verificación de Administrador
    let isAuthorized = false;
    if (isMasterAdminEmail(requesterEmail)) {
      isAuthorized = true;
    } else if (requesterUid) {
      const userResult = await getUserProfileDecrypted(requesterUid);
      if (userResult?.profile && (userResult.profile.role === "admin" || isMasterAdminEmail(userResult.profile.email))) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado. Se requieren privilegios de SuperAdmin." },
        { status: 403 }
      );
    }

    const programs = getAllMacrocycleDefinitions();
    return NextResponse.json({
      success: true,
      programs,
      count: programs.length,
    });
  } catch (error) {
    console.error("Error al obtener programas en /api/admin/programs:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al consultar las librerías deportivas." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requesterEmail, requesterUid, action, program, aiPrompt, sport, distanceType, defaultMetric } = body;

    // Verificación de Administrador
    let isAuthorized = false;
    if (isMasterAdminEmail(requesterEmail)) {
      isAuthorized = true;
    } else if (requesterUid) {
      const userResult = await getUserProfileDecrypted(requesterUid);
      if (userResult?.profile && (userResult.profile.role === "admin" || isMasterAdminEmail(userResult.profile.email))) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado. Se requieren privilegios de SuperAdmin." },
        { status: 403 }
      );
    }

    // ACCIÓN 1: GENERACIÓN CON IA (Agente 02 - Macrocycle Architect)
    if (action === "GENERATE_AI") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: "No se encuentra configurada la clave GEMINI_API_KEY en el servidor." },
          { status: 500 }
        );
      }

      const promptSystem = `Eres el Arquitecto de Macrociclos y Programas Deportivos (PULSE Macrocycle Architect).
Tu tarea es diseñar un programa de entrenamiento de resistencia de alto nivel basado en la solicitud del SuperAdmin.
Debes devolver estrictamente un objeto JSON con la siguiente estructura (TypeScript MacrocycleDefinition):

{
  "id": string (ej: "trail-50k-custom", "cycling-climbing-pro", "marathon-sub3h"),
  "title": string,
  "subtitle": string,
  "category": "RACE_TARGET" | "ATHLETE_MOMENT",
  "distanceType": string (ej: "42k", "21k", "10k", "5k", "trail_50k", "cycling_fondo", "cycling_climbing", "triathlon_703", "maintenance", "base_building"),
  "sport": "running" | "cycling" | "triathlon" | "trail_running" | "swimming" | "maintenance",
  "supportedMetrics": ("POWER" | "HEART_RATE" | "PACE" | "RPE")[],
  "defaultMetric": "POWER" | "HEART_RATE" | "PACE" | "RPE",
  "icon": string (emoji),
  "badgeColor": string (clases tailwind como "bg-amber-500/20 text-amber-300 border-amber-500/30"),
  "accentColor": string (clases tailwind como "from-amber-500 to-yellow-600"),
  "minWeeks": number,
  "maxWeeks": number,
  "defaultWeeks": number,
  "maxLongRunKm": number,
  "maxLongRunMinutes": number,
  "elevationGainMeters": number (opcional),
  "description": string (explicación fisiológica y metodológica detallada),
  "physiologicalFocus": string[] (4 puntos fisiológicos clave),
  "keyWorkoutsSummary": string[] (4 entrenamientos insignia),
  "recommendedFor": string,
  "phaseRatios": {
    "base": number (ej: 0.25),
    "build": number (ej: 0.40),
    "peak": number (ej: 0.20),
    "taper": number (ej: 0.15)
  }
}

REGLAS FISIOLÓGICAS ESTRICTAS:
1. Si es Maratón (42k), maxLongRunKm DEBE ser 32-34 km (170-180 minutos).
2. Si es Media Maratón (21k), maxLongRunKm DEBE ser 20-22 km (110-120 minutos).
3. Si es Trail Running con desnivel, incluye elevationGainMeters y enfoca la métrica por HEART_RATE y RPE.
4. La suma de phaseRatios (base + build + peak + taper) debe ser exactamente 1.0.
5. Devuelve ÚNICAMENTE el JSON válido sin bloques markdown extra.`;

      const userContent = `SOLICITUD DEL SUPERADMIN:
- Instrucción: ${aiPrompt || "Diseña un programa avanzado"}
- Deporte sugerido: ${sport || "running"}
- Distancia/Tipo: ${distanceType || "42k"}
- Métrica sugerida: ${defaultMetric || "POWER"}`;

      const modelsToTry = ["gemini-3.5-flash", "gemini-3.6-flash"];
      let generatedJson: any = null;

      for (const model of modelsToTry) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                { role: "user", parts: [{ text: `${promptSystem}\n\n${userContent}` }] }
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
              }
            }),
            signal: AbortSignal.timeout(25000),
          });

          if (res.ok) {
            const data = await res.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const clean = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
              generatedJson = JSON.parse(clean);
              break;
            }
          }
        } catch (mErr) {
          console.warn(`Error generando con modelo ${model}:`, mErr);
        }
      }

      if (!generatedJson) {
        return NextResponse.json(
          { success: false, error: "No se pudo generar la definición con la IA de Gemini. Intenta nuevamente." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        generatedProgram: generatedJson,
      });
    }

    // ACCIÓN 2: GUARDAR PROGRAMA
    if (action === "CREATE" || !action) {
      if (!program || !program.id || !program.title) {
        return NextResponse.json(
          { success: false, error: "Datos del programa incompletos (id y title requeridos)." },
          { status: 400 }
        );
      }

      const saved = saveCustomMacrocycleDefinition(program as MacrocycleDefinition);
      return NextResponse.json({
        success: true,
        message: `Programa "${saved.title}" guardado exitosamente en las librerías.`,
        program: saved,
      });
    }

    // ACCIÓN 3: RESTABLECER VALORES DE FÁBRICA
    if (action === "RESET") {
      resetMacrocycleLibraryToDefault();
      return NextResponse.json({
        success: true,
        message: "Librería restablecida a los programas oficiales de fábrica.",
        programs: getAllMacrocycleDefinitions(),
      });
    }

    return NextResponse.json({ success: false, error: "Acción no reconocida." }, { status: 400 });
  } catch (error) {
    console.error("Error en POST /api/admin/programs:", error);
    return NextResponse.json(
      { success: false, error: "Error procesando la solicitud del programa." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { requesterEmail, requesterUid, program } = body;

    // Verificación de Administrador
    let isAuthorized = false;
    if (isMasterAdminEmail(requesterEmail)) {
      isAuthorized = true;
    } else if (requesterUid) {
      const userResult = await getUserProfileDecrypted(requesterUid);
      if (userResult?.profile && (userResult.profile.role === "admin" || isMasterAdminEmail(userResult.profile.email))) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado. Se requieren privilegios de SuperAdmin." },
        { status: 403 }
      );
    }

    if (!program || !program.id) {
      return NextResponse.json(
        { success: false, error: "Identificador de programa no proporcionado." },
        { status: 400 }
      );
    }

    const updated = saveCustomMacrocycleDefinition(program as MacrocycleDefinition);
    return NextResponse.json({
      success: true,
      message: `Programa "${updated.title}" actualizado con éxito.`,
      program: updated,
    });
  } catch (error) {
    console.error("Error en PUT /api/admin/programs:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar el programa." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const requesterEmail = searchParams.get("requesterEmail");
    const requesterUid = searchParams.get("requesterUid");

    // Verificación de Administrador
    let isAuthorized = false;
    if (isMasterAdminEmail(requesterEmail)) {
      isAuthorized = true;
    } else if (requesterUid) {
      const userResult = await getUserProfileDecrypted(requesterUid);
      if (userResult?.profile && (userResult.profile.role === "admin" || isMasterAdminEmail(userResult.profile.email))) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado. Se requieren privilegios de SuperAdmin." },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "ID no proporcionado." }, { status: 400 });
    }

    const deleted = deleteCustomMacrocycleDefinition(id);
    return NextResponse.json({
      success: true,
      deleted,
      message: `Programa ${id} eliminado de las personalizaciones.`,
    });
  } catch (error) {
    console.error("Error en DELETE /api/admin/programs:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar el programa." },
      { status: 500 }
    );
  }
}
