"use client";

import { useState, useEffect, useCallback } from "react";
import { UserStorage } from "@/lib/storage/userStorage";
import {
  MacrocycleUpgradeProposal,
  evaluateTestForUpgrade,
} from "@/lib/physiology/ctlPotentialEngine";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { SyncNotificationData } from "@/components/dashboard/SyncNotificationModal";

interface UseMacrocycleUpgradeProps {
  athleteId: string;
  blueprint: MacrocycleBlueprint | null;
  userStorage: UserStorage;
  onApplyUpdatedBlueprint?: (newBlueprint: MacrocycleBlueprint) => Promise<void> | void;
  setSyncNotification?: (data: SyncNotificationData | null) => void;
  isReadOnly?: boolean;
}

export function useMacrocycleUpgrade({
  athleteId,
  blueprint,
  userStorage,
  onApplyUpdatedBlueprint,
  setSyncNotification,
  isReadOnly = false,
}: UseMacrocycleUpgradeProps) {
  const [proposal, setProposal] = useState<MacrocycleUpgradeProposal | null>(() => {
    try {
      if (typeof window !== "undefined") {
        return userStorage.getJSON<MacrocycleUpgradeProposal>("macrocycle_upgrade_proposal") || null;
      }
    } catch {}
    return null;
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Guardar proposal en storage cuando cambie
  useEffect(() => {
    try {
      if (proposal) {
        userStorage.setJSON("macrocycle_upgrade_proposal", proposal);
      } else {
        userStorage.removeItem("macrocycle_upgrade_proposal");
      }
    } catch {}
  }, [proposal, userStorage]);

  /**
   * Decisión A: El atleta aprueba el upgrade de rendimiento
   */
  const handleAcceptUpgrade = useCallback(async (acceptedProposal: MacrocycleUpgradeProposal) => {
    if (isReadOnly) {
      setSyncNotification?.({
        title: "Modo Auditoría",
        message: "No se pueden aplicar cambios en modo solo lectura.",
        type: "error",
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (blueprint && onApplyUpdatedBlueprint) {
        // Clonar y actualizar el pico de CTL cumbre manteniendo inmutable el pasado
        const updatedBlueprint: MacrocycleBlueprint = {
          ...blueprint,
          targetPeakCtl: acceptedProposal.proposedPeakCtl,
          weeks: (blueprint.weeks || []).map((w) => {
            // Solo semanas futuras se benefician del upgrade
            if (w.isFutureWeek) {
              const boostRatio = acceptedProposal.proposedPeakCtl / (acceptedProposal.currentPeakCtl || 1);
              return {
                ...w,
                targetTss: Math.round(w.targetTss * Math.min(1.08, boostRatio)),
                focusDescription: `${w.focusDescription} (Optimizado +${(acceptedProposal.proposedPeakCtl - acceptedProposal.currentPeakCtl).toFixed(1)} CTL)`,
              };
            }
            return w;
          }),
        };

        await onApplyUpdatedBlueprint(updatedBlueprint);
      }

      setProposal(null);
      userStorage.removeItem("macrocycle_upgrade_proposal");

      setSyncNotification?.({
        title: "🚀 ¡Macrociclo Optimizado con Éxito!",
        message: `Tu nuevo Target Peak CTL es ${acceptedProposal.proposedPeakCtl} CTL. Las semanas futuras han sido calibradas con tu nuevo nivel de rendimiento.`,
        type: "success",
      });
    } catch (err) {
      console.error("Error al aplicar propuesta de upgrade:", err);
      setSyncNotification?.({
        title: "Error al actualizar",
        message: "No se pudo actualizar el plan. Tu macrociclo actual sigue intacto.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [blueprint, onApplyUpdatedBlueprint, isReadOnly, setSyncNotification, userStorage]);

  /**
   * Decisión B: El atleta elige continuar con su plan actual (cero modificaciones)
   */
  const handleDismissUpgrade = useCallback(() => {
    setProposal(null);
    userStorage.removeItem("macrocycle_upgrade_proposal");

    setSyncNotification?.({
      title: "🛡️ Plan Actual Conservado",
      message: "Tu macrociclo se mantiene 100% intacto con las metas y volúmenes originales.",
      type: "neutral" as any,
    });
  }, [userStorage, setSyncNotification]);

  /**
   * Evalúa un test completado para generar propuesta si aplica
   */
  const evaluateFieldTest = useCallback((
    testSport: "Ride" | "Run" | "Swim",
    newVal: number,
    oldVal: number,
    weeksUntilRace: number = 10
  ) => {
    const evalRes = evaluateTestForUpgrade(
      athleteId,
      testSport,
      newVal,
      oldVal,
      blueprint,
      weeksUntilRace
    );

    if (evalRes.eligibleForUpgrade && evalRes.proposal) {
      setProposal(evalRes.proposal);
    } else if (evalRes.isMalDia) {
      setSyncNotification?.({
        title: "⚠️ Nota del Head Coach: Rendimiento Atípico",
        message: evalRes.reason,
        type: "neutral" as any,
      });
    }
  }, [athleteId, blueprint, setSyncNotification]);

  return {
    proposal,
    setProposal,
    isProcessing,
    handleAcceptUpgrade,
    handleDismissUpgrade,
    evaluateFieldTest,
  };
}
