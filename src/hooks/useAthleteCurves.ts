"use client";

import { useState, useEffect } from "react";
import { SportCurvesResponse } from "@/lib/intervals/curvesTypes";
import { getUserStorage } from "@/lib/storage/userStorage";

interface UseAthleteCurvesProps {
  athleteId?: string;
  apiKey?: string;
  email?: string;
  weightKg?: number;
}

export function useAthleteCurves({ athleteId, apiKey, email, weightKg = 82 }: UseAthleteCurvesProps) {
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
        const storage = getUserStorage();

        const effAthleteId = athleteId && !athleteId.startsWith("demo")
          ? athleteId
          : (storage.getItem("athlete_id") || process.env.NEXT_PUBLIC_INTERVALS_ATHLETE_ID || "i442091");

        const effApiKey = apiKey
          ? apiKey
          : (storage.getItem("intervals_api_key") || process.env.NEXT_PUBLIC_INTERVALS_API_KEY || "48eje8t1wnj95t0sbjx2oumkq");

        if (effAthleteId) queryParams.set("athleteId", effAthleteId);
        if (effApiKey) queryParams.set("apiKey", effApiKey);
        if (email) queryParams.set("email", email);
        if (weightKg) queryParams.set("weightKg", String(weightKg));

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
  }, [athleteId, apiKey, email, weightKg]);

  return { rideCurves, runCurves, isLoading, error };
}
