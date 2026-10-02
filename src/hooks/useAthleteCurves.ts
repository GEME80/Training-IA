"use client";

import { useState, useEffect } from "react";
import { SportCurvesResponse } from "@/lib/intervals/curvesTypes";

interface UseAthleteCurvesProps {
  athleteId?: string;
  apiKey?: string;
  weightKg?: number;
}

export function useAthleteCurves({ athleteId, apiKey, weightKg = 82 }: UseAthleteCurvesProps) {
  const [rideCurves, setRideCurves] = useState<SportCurvesResponse | null>(null);
  const [runCurves, setRunCurves] = useState<SportCurvesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCurves() {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (athleteId) queryParams.set("athleteId", athleteId);
        if (apiKey) queryParams.set("apiKey", apiKey);
        if (weightKg) queryParams.set("weightKg", String(weightKg));

        // Consultar curvas de ciclismo y carrera en paralelo
        const [resRide, resRun] = await Promise.all([
          fetch(`/api/athlete-curves?sport=Ride&${queryParams.toString()}`, { cache: "no-store" }),
          fetch(`/api/athlete-curves?sport=Run&${queryParams.toString()}`, { cache: "no-store" }),
        ]);

        if (isMounted) {
          if (resRide.ok) {
            const dataRide: SportCurvesResponse = await resRide.json();
            if (dataRide.success) setRideCurves(dataRide);
          }
          if (resRun.ok) {
            const dataRun: SportCurvesResponse = await resRun.json();
            if (dataRun.success) setRunCurves(dataRun);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Error al cargar curvas";
          setError(msg);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCurves();

    return () => {
      isMounted = false;
    };
  }, [athleteId, apiKey, weightKg]);

  return { rideCurves, runCurves, isLoading, error };
}
