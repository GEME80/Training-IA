import { adminDb } from "../firebase/admin";
import { DecisionLog } from "./types";

/**
 * Registra un log de auditoría y decisión del agente inteligente en Firestore bajo la subcolección users/{uid}/decision_logs.
 */
export async function logAgentDecision(
  uid: string,
  log: Omit<DecisionLog, "id">
): Promise<string> {
  if (!adminDb) {
    return "local-mock-log-id";
  }

  const logRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("decision_logs")
    .doc();

  await logRef.set({
    ...log,
    id: logRef.id,
  });

  return logRef.id;
}
