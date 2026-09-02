import { NextRequest, NextResponse } from "next/server";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { adminDb } from "@/lib/firebase/admin";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      requesterUid,
      requesterEmail,
      email,
      displayName,
      role = "athlete",
      status = "active",
      intervalsAthleteId = "",
      runFtp = 300,
      bikeFtp = 250,
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
        { success: false, error: "Acceso no autorizado para pre-autorizar usuarios." },
        { status: 403 }
      );
    }

    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Correo electrónico no válido." },
        { status: 400 }
      );
    }

    // 2. Guardar en colección users / whitelist con Admin SDK (o fallback db)
    const sanitizedEmailId = `preauth_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const now = new Date().toISOString();

    const preAuthProfile = {
      uid: sanitizedEmailId,
      email: cleanEmail,
      displayName: displayName?.trim() || cleanEmail.split("@")[0],
      role: role === "admin" ? "admin" : "athlete",
      status: status === "disabled" ? "disabled" : status === "pending" ? "pending" : "active",
      intervalsAthleteId: intervalsAthleteId?.trim() || "",
      runFtp: Number(runFtp) || 300,
      bikeFtp: Number(bikeFtp) || 250,
      isPreAuthorized: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };

    if (adminDb) {
      const preAuthDocRef = adminDb.collection("users").doc(sanitizedEmailId);
      const existingSnap = await preAuthDocRef.get();
      if (existingSnap.exists) {
        const data = existingSnap.data();
        if (data) {
          preAuthProfile.createdAt = data.createdAt || now;
          preAuthProfile.lastLoginAt = data.lastLoginAt || now;
        }
      }
      await preAuthDocRef.set(preAuthProfile, { merge: true });
    } else {
      const userDocRef = doc(db, "users", sanitizedEmailId);
      const existingSnap = await getDoc(userDocRef);
      if (existingSnap.exists()) {
        preAuthProfile.createdAt = existingSnap.data().createdAt || now;
        preAuthProfile.lastLoginAt = existingSnap.data().lastLoginAt || now;
      }
      await setDoc(userDocRef, preAuthProfile, { merge: true });
    }

    return NextResponse.json({
      success: true,
      message: `Usuario ${cleanEmail} pre-autorizado con éxito como ${role.toUpperCase()}.`,
      user: preAuthProfile,
    });
  } catch (error) {
    console.error("Error en POST /api/admin/users/preauthorize:", error);
    return NextResponse.json(
      { success: false, error: "Error al pre-autorizar usuario." },
      { status: 500 }
    );
  }
}
