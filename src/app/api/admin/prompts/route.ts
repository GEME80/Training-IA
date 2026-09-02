import { NextRequest, NextResponse } from "next/server";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { adminDb } from "@/lib/firebase/admin";
import { AgentPromptsLibrary, DEFAULT_PROMPTS } from "@/lib/ai/prompts";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requesterUid = searchParams.get("requesterUid");
    const requesterEmail = searchParams.get("requesterEmail");

    // 1. Verificación de Seguridad
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
        { success: false, error: "Acceso no autorizado." },
        { status: 403 }
      );
    }

    // 2. Cargar desde Firestore o defaults
    let prompts: AgentPromptsLibrary = DEFAULT_PROMPTS;
    if (adminDb) {
      try {
        const docRef = adminDb.collection("system_config").doc("prompts");
        const snap = await docRef.get();

        if (snap.exists) {
          const data = snap.data() || {};
          prompts = {
            headCoachPrompt: data.headCoachPrompt || DEFAULT_PROMPTS.headCoachPrompt,
            macrocyclePrompt: data.macrocyclePrompt || DEFAULT_PROMPTS.macrocyclePrompt,
            dailyAuditPrompt: data.dailyAuditPrompt || DEFAULT_PROMPTS.dailyAuditPrompt,
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy,
          };
        }
      } catch (firestoreErr) {
        console.warn("Aviso al leer prompts de Firestore, usando defaults:", firestoreErr);
      }
    }

    return NextResponse.json({
      success: true,
      prompts,
    });
  } catch (error) {
    console.error("Error en GET /api/admin/prompts:", error);
    return NextResponse.json({
      success: true,
      prompts: DEFAULT_PROMPTS,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requesterUid, requesterEmail, headCoachPrompt, macrocyclePrompt, dailyAuditPrompt } = body;

    // 1. Verificación de Seguridad
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
        { success: false, error: "Acceso no autorizado para editar prompts." },
        { status: 403 }
      );
    }

    // 2. Guardar en Firestore
    const updatedPayload = {
      headCoachPrompt: (headCoachPrompt || DEFAULT_PROMPTS.headCoachPrompt).trim(),
      macrocyclePrompt: (macrocyclePrompt || DEFAULT_PROMPTS.macrocyclePrompt).trim(),
      dailyAuditPrompt: (dailyAuditPrompt || DEFAULT_PROMPTS.dailyAuditPrompt).trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: requesterEmail || requesterUid || "admin",
    };

    if (adminDb) {
      try {
        const docRef = adminDb.collection("system_config").doc("prompts");
        await docRef.set(updatedPayload, { merge: true });
      } catch (err) {
        console.warn("Aviso: No se pudo escribir prompts en Firestore:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Biblioteca de prompts del agente guardada con éxito en Firestore.",
      prompts: updatedPayload,
    });
  } catch (error) {
    console.error("Error en POST /api/admin/prompts:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar biblioteca de prompts." },
      { status: 500 }
    );
  }
}
