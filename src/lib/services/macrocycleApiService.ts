import { MacrocycleAIEngine } from "@/lib/gemini/macrocycleAI";
import { IntervalsClient } from "@/lib/intervals/client";
import { PhysiologicalEngine } from "@/lib/physiology/engine";
import { AthleteProfile, AthleteWellness } from "@/lib/intervals/types";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { computePMCHistoricalSummary } from "@/lib/physiology/pmcEngine";

export interface MacrocycleAiRequestBody {
  athleteId?: string;
  apiKey?: string;
  uid?: string;
  email?: string;
  customGeminiKey?: string;
  selectedModel?: string;
  wizardConfig?: any;
  runFtp?: number;
  bikeFtp?: number;
  weightKg?: number;
  heightCm?: number;
  birthDate?: string;
  gender?: "M" | "F" | "OTHER";
  restingHR?: number;
  maxHR?: number;
  lthr?: number;
  historicalMetrics?: any;
}

export async function generateMacrocycleAiService(body: MacrocycleAiRequestBody) {
  const {
    athleteId,
    apiKey,
    uid,
    email,
    customGeminiKey,
    selectedModel,
    wizardConfig,
    runFtp,
    bikeFtp,
  } = body;

  const storedUser = uid ? await getUserProfileDecrypted(uid).catch(() => null) : null;
  const { athleteId: effectiveAthleteId, apiKey: effectiveApiKey } =
    await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });

  let profile: AthleteProfile = {
    id: effectiveAthleteId,
    name: storedUser?.profile.displayName || "Atleta",
    ctl: 0,
    atl: 0,
    tsb: 0,
    rampRate: 0,
    run_ftp: runFtp || storedUser?.profile.runFtp,
    bike_ftp: bikeFtp || storedUser?.profile.bikeFtp,
    weight: body.weightKg || storedUser?.profile.weightKg,
    heightCm: body.heightCm || storedUser?.profile.heightCm,
    birthDate: body.birthDate || storedUser?.profile.birthDate,
    gender: body.gender || (storedUser?.profile.gender as any),
  };
  let wellness: AthleteWellness[] = [];

  if (effectiveAthleteId && effectiveApiKey) {
    try {
      const client = new IntervalsClient(effectiveAthleteId, effectiveApiKey);
      const today = new Date();
      const past365 = new Date();
      past365.setDate(today.getDate() - 365);

      const [ath, wel, sports] = await Promise.all([
        client.getAthlete().catch(() => null),
        client.getWellness(past365.toISOString().split("T")[0], today.toISOString().split("T")[0]).catch(() => []),
        client.getSportSettings().catch(() => []),
      ]);

      if (ath) {
        const runSport = (sports || []).find((s: any) =>
          s.types?.some((t: string) => /run|running|virtualrun|trailrun/i.test(t)) ||
          /run/i.test(String(s.id))
        );
        const rideSport = (sports || []).find((s: any) =>
          s.types?.some((t: string) => /ride|cycling|bike|virtualride|ebikeride/i.test(t)) ||
          /ride|cycling|bike/i.test(String(s.id))
        );

        const anyAth = ath as any;
        const icuDob = anyAth.icu_date_of_birth || anyAth.dob || anyAth.date_of_birth || body.birthDate || storedUser?.profile.birthDate;
        let computedAge: number | undefined = undefined;
        if (icuDob) {
          const b = new Date(icuDob);
          if (!isNaN(b.getTime())) {
            const now = new Date();
            let a = now.getFullYear() - b.getFullYear();
            const mDiff = now.getMonth() - b.getMonth();
            if (mDiff < 0 || (mDiff === 0 && now.getDate() < b.getDate())) a--;
            if (a > 0 && a < 120) computedAge = a;
          }
        }

        const rawH = (anyAth.icu_height as number) || (anyAth.height as number) || undefined;
        const normH = rawH ? (rawH < 3 ? Math.round(rawH * 100) : Math.round(rawH)) : undefined;
        const latestWel = wel.length > 0 ? wel[wel.length - 1] : undefined;

        profile = {
          ...ath,
          id: ath.id || effectiveAthleteId || "",
          name: ath.name || profile.name,
          birthDate: icuDob,
          age: computedAge,
          gender: body.gender || (storedUser?.profile.gender as any) || anyAth.sex || anyAth.gender,
          weight: body.weightKg || storedUser?.profile.weightKg || ath.weight || (latestWel as any)?.weight,
          heightCm: body.heightCm || storedUser?.profile.heightCm || normH,
          restingHR: (latestWel as any)?.restingHR || anyAth.resting_hr || anyAth.restingHR || ath.restingHR,
          maxHR: anyAth.max_hr || anyAth.maxHR || ath.maxHR,
          lthr: runSport?.lthr || rideSport?.lthr || anyAth.lthr || ath.lthr,
          run_ftp: runSport?.ftp || anyAth.icu_running_ftp || ath.run_ftp || runFtp || storedUser?.profile.runFtp,
          bike_ftp: rideSport?.ftp || anyAth.icu_ftp || ath.bike_ftp || bikeFtp || storedUser?.profile.bikeFtp,
        };
      }
      wellness = wel;
    } catch (err) {
      console.warn("Aviso al consultar Intervals para IA de macrociclo:", err);
    }
  }

  const physioStatus = PhysiologicalEngine.evaluateAthlete(profile, wellness);
  profile.ctl = physioStatus.ctl;
  profile.atl = physioStatus.atl;
  profile.tsb = physioStatus.tsb;
  profile.rampRate = physioStatus.rampRate;

  const historicalProfile = wellness.length > 0
    ? computePMCHistoricalSummary(wellness)
    : (body.historicalMetrics || (wizardConfig as any)?.historicalMetrics);

  const aiResult = await MacrocycleAIEngine.generatePersonalizedMacrocycle(
    profile,
    physioStatus,
    {
      ...wizardConfig,
      weeklyAvailability: wizardConfig?.weeklyAvailability || null,
    },
    {
      geminiApiKey: customGeminiKey,
      selectedModel,
      historicalProfile,
    }
  );

  return {
    success: true,
    aiResult,
    physioStatus,
    profile,
  };
}
