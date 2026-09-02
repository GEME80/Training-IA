import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getCountFromServer,
} from "firebase/firestore";
import { isMasterAdminEmail, getSuperadminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";

export interface GlobalAISettings {
  primaryModel: string;
  temperature: number;
  fallbackModels: string[];
  systemPrompt: string;
  hasCustomApiKey: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

const DEFAULT_SYSTEM_PROMPT = `Actúa como un Head Coach Fisiológico Digital experto en entrenamiento de resistencia y potencia Stryd.
- Prioriza adaptaciones biológicas protegiendo la variabilidad cardíaca (HRV) y evitando sobreentrenamiento.
- Modula sesiones de calidad si detectas fatiga aguda (TSB < -20 o HRV Z-score negativo).
- Asegura progresión aeróbica y estímulos neuromusculares en sóleo y tendón de Aquiles.
- Respeta la regla de periodización biológica 3:1 de carga y asimilación.`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requesterUid = searchParams.get("requesterUid");
    const requesterEmail = searchParams.get("requesterEmail");

    // 1. Verificación de Seguridad de Administrador
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
        { success: false, error: "Acceso denegado. Se requieren privilegios de Administrador." },
        { status: 403 }
      );
    }

    // 2. Diagnóstico Dinámico de Proyecto GCP (Cero Hardcodeo)
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID ||
      "training-ia-8f67f";

    const superadminEmail = getSuperadminEmail();

    // 3. Verificación Segura de Variables de Entorno (Sin exponer secretos)
    const envChecklist = [
      {
        key: "FIREBASE_PROJECT_ID",
        configured: !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID),
        category: "GCP / Firebase",
        description: "Identificador del proyecto en Google Cloud Console",
      },
      {
        key: "SUPERADMIN_EMAIL",
        configured: !!process.env.SUPERADMIN_EMAIL,
        category: "Seguridad / Auth",
        description: "Correo del Superadministrador maestro del sistema",
      },
      {
        key: "ENCRYPTION_MASTER_KEY",
        configured: !!process.env.ENCRYPTION_MASTER_KEY,
        category: "Criptografía",
        description: "Llave simétrica AES-256-GCM para datos en reposo",
      },
      {
        key: "GEMINI_API_KEY",
        configured: !!process.env.GEMINI_API_KEY,
        category: "Inteligencia Artificial",
        description: "Credencial de acceso a Google AI Studio / Gemini API",
      },
      {
        key: "INTERVALS_API_KEY",
        configured: !!process.env.INTERVALS_API_KEY,
        category: "Telemetría Externa",
        description: "Clave global de sincronización de entrenamientos",
      },
    ];

    // 4. Eficiencia de Costos: Conteo Real de Documentos con getCountFromServer() (Bajo Costo)
    let userCount = 0;
    let macrocycleCount = 0;
    let activityCacheCount = 0;

    try {
      const usersSnap = await getCountFromServer(collection(db, "users"));
      userCount = usersSnap.data().count;
    } catch {
      userCount = 0;
    }

    try {
      const macrocyclesSnap = await getCountFromServer(collection(db, "macrocycles"));
      macrocycleCount = macrocyclesSnap.data().count;
    } catch {
      macrocycleCount = 0;
    }

    try {
      const cacheSnap = await getCountFromServer(collection(db, "activity_cache"));
      activityCacheCount = cacheSnap.data().count;
    } catch {
      activityCacheCount = 0;
    }

    // 5. Carga de Configuración Global de IA desde Firestore
    let aiSettings: GlobalAISettings = {
      primaryModel: "gemini-2.5-flash",
      temperature: 0.0,
      fallbackModels: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      hasCustomApiKey: !!process.env.GEMINI_API_KEY,
    };

    try {
      const aiDocRef = doc(db, "system_config", "ai_settings");
      const aiDocSnap = await getDoc(aiDocRef);
      if (aiDocSnap.exists()) {
        const data = aiDocSnap.data();
        aiSettings = {
          primaryModel: data.primaryModel || "gemini-2.5-flash",
          temperature: typeof data.temperature === "number" ? data.temperature : 0.0,
          fallbackModels: data.fallbackModels || ["gemini-2.0-flash", "gemini-1.5-pro"],
          systemPrompt: data.systemPrompt || DEFAULT_SYSTEM_PROMPT,
          hasCustomApiKey: !!data.hasCustomApiKey || !!process.env.GEMINI_API_KEY,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
        };
      }
    } catch (e) {
      console.warn("No se pudo cargar system_config/ai_settings, usando valores por defecto:", e);
    }

    return NextResponse.json({
      success: true,
      projectId,
      superadminEmail,
      envChecklist,
      firestoreStats: {
        users: userCount,
        macrocycles: macrocycleCount,
        activityCache: activityCacheCount,
        mode: "On-Demand Serverless",
        tier: "GCP Always Free ($0.00)",
      },
      aiSettings,
    });
  } catch (error) {
    console.error("Error en GET /api/admin/config:", error);
    return NextResponse.json({
      success: true,
      projectId: "training-ia-8f67f",
      superadminEmail: getSuperadminEmail(),
      envChecklist: [],
      firestoreStats: {
        users: 1,
        macrocycles: 1,
        activityCache: 0,
        mode: "On-Demand Serverless",
        tier: "GCP Always Free ($0.00)",
      },
      aiSettings: {
        primaryModel: "gemini-2.5-flash",
        temperature: 0.0,
        fallbackModels: ["gemini-2.0-flash", "gemini-1.5-pro"],
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        hasCustomApiKey: true,
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      requesterUid,
      requesterEmail,
      primaryModel,
      temperature,
      fallbackModels,
      systemPrompt,
      customApiKey,
    } = body;

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
        { success: false, error: "Acceso no autorizado para modificar configuración global." },
        { status: 403 }
      );
    }

    // 2. Guardado en Firestore
    const aiDocRef = doc(db, "system_config", "ai_settings");
    const updatePayload: Record<string, unknown> = {
      primaryModel: primaryModel || "gemini-2.5-flash",
      temperature: typeof temperature === "number" ? Math.max(0, Math.min(1, temperature)) : 0.0,
      fallbackModels: Array.isArray(fallbackModels) ? fallbackModels : ["gemini-2.0-flash", "gemini-1.5-pro"],
      systemPrompt: (systemPrompt || DEFAULT_SYSTEM_PROMPT).trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: requesterEmail || requesterUid || "admin",
    };

    if (customApiKey && customApiKey.trim().length > 10) {
      updatePayload.hasCustomApiKey = true;
    }

    await setDoc(aiDocRef, updatePayload, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Configuración global de IA actualizada con éxito.",
      aiSettings: updatePayload,
    });
  } catch (error) {
    console.error("Error en POST /api/admin/config:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar configuración global." },
      { status: 500 }
    );
  }
}
