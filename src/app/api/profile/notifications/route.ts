import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.uid) {
      return NextResponse.json({ error: "UID es obligatorio" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: true, offline: true });
    }

    const userRef = adminDb.collection("users").doc(body.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const currentNotifs = (userDoc.data()?.notifications as any[]) || [];
    let updatedNotifs = currentNotifs;

    if (body.action === "markAsRead" && body.id) {
      updatedNotifs = currentNotifs.map((n) => (n.id === body.id ? { ...n, read: true } : n));
    } else if (body.action === "markAllAsRead") {
      updatedNotifs = currentNotifs.map((n) => ({ ...n, read: true }));
    } else if (body.action === "clearAll") {
      updatedNotifs = [];
    } else if (body.action === "add" && body.notification) {
      updatedNotifs = [body.notification, ...currentNotifs.filter((n) => n.id !== body.notification.id)].slice(0, 15);
    }

    await userRef.update({
      notifications: updatedNotifs,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, count: updatedNotifs.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error procesando notificaciones";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
