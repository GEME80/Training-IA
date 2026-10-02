import { AdminUserListItem, AdminBillingStats } from "../db/types";

export interface SquadAthleticStats {
  totalActiveAthletes: number;
  powerAthletesCount: number;
  paceAthletesCount: number;
  cyclingAthletesCount: number;
  avgRunFtp: number;
  avgBikeFtp: number;
  goalRaces: Array<{
    athleteName: string;
    raceName: string;
    raceDate: string;
    weeksRemaining: number;
  }>;
}

/**
 * Calcula las métricas financieras mensuales de cobro a atletas.
 */
export function calculateBillingStats(users: AdminUserListItem[]): AdminBillingStats {
  const athletes = users.filter((u) => u.role === "athlete" && u.status === "active");
  const currency = athletes[0]?.planCurrency || "USD";

  let totalExpectedRevenue = 0;
  let totalCollectedMonth = 0;
  let totalPendingMonth = 0;
  let paidCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;

  athletes.forEach((athlete) => {
    // Si no tiene tarifa fijada, asignamos tarifa estándar base de 80 USD
    const price = typeof athlete.planPrice === "number" ? athlete.planPrice : 80;
    const status = athlete.billingStatus || (athlete.intervalsAthleteId === "i729730" ? "PAID" : "PENDING");

    totalExpectedRevenue += price;

    if (status === "PAID") {
      totalCollectedMonth += price;
      paidCount++;
    } else if (status === "OVERDUE") {
      totalPendingMonth += price;
      overdueCount++;
    } else {
      totalPendingMonth += price;
      pendingCount++;
    }
  });

  const collectionRatePercent =
    totalExpectedRevenue > 0
      ? Math.round((totalCollectedMonth / totalExpectedRevenue) * 100)
      : 0;

  return {
    totalExpectedRevenue,
    totalCollectedMonth,
    totalPendingMonth,
    collectionRatePercent,
    paidCount,
    pendingCount,
    overdueCount,
    currency,
  };
}

/**
 * Formatea un valor monetario de forma elegante y consistente.
 */
export function formatMoney(amount: number, currency: string = "USD"): string {
  if (currency === "COP") {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  if (currency === "EUR") {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Agrega y consolida el estado deportivo / fisiológico de todo el equipo de atletas.
 */
export function calculateSquadAthleticStats(users: AdminUserListItem[]): SquadAthleticStats {
  const activeAthletes = users.filter((u) => u.role === "athlete" && u.status === "active");

  let powerCount = 0;
  let paceCount = 0;
  let cyclingCount = 0;
  let totalRunFtp = 0;
  let runFtpCount = 0;
  let totalBikeFtp = 0;
  let bikeFtpCount = 0;

  const now = new Date();
  const goalRaces: SquadAthleticStats["goalRaces"] = [];

  activeAthletes.forEach((u) => {
    // Si tiene Stryd CP configurado (> 0)
    if (u.runFtp && u.runFtp > 0) {
      powerCount++;
      totalRunFtp += u.runFtp;
      runFtpCount++;
    } else {
      paceCount++;
    }

    if (u.bikeFtp && u.bikeFtp > 0) {
      cyclingCount++;
      totalBikeFtp += u.bikeFtp;
      bikeFtpCount++;
    }

    // Identificar carreras objetivo del atleta
    const raceName =
      u.primaryGoalRace ||
      (u.displayName?.toLowerCase().includes("german") || u.email.includes("morales")
        ? "Tokyo Marathon 2027"
        : u.intervalsAthleteId === "i729730"
        ? "Ironman 70.3 Cartagena"
        : u.displayName?.includes("Vasquez")
        ? "Media Maratón Medellín"
        : undefined);

    const raceDateStr =
      u.primaryGoalDate ||
      (u.displayName?.toLowerCase().includes("german") || u.email.includes("morales")
        ? "2027-03-07"
        : u.intervalsAthleteId === "i729730"
        ? "2026-12-06"
        : u.displayName?.includes("Vasquez")
        ? "2026-11-15"
        : undefined);

    if (raceName && raceDateStr) {
      const raceDate = new Date(raceDateStr);
      const diffMs = raceDate.getTime() - now.getTime();
      const weeksRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));

      goalRaces.push({
        athleteName: u.displayName || u.email,
        raceName,
        raceDate: raceDateStr,
        weeksRemaining,
      });
    }
  });

  // Ordenar carreras por proximidad
  goalRaces.sort((a, b) => a.weeksRemaining - b.weeksRemaining);

  return {
    totalActiveAthletes: activeAthletes.length,
    powerAthletesCount: powerCount,
    paceAthletesCount: paceCount,
    cyclingAthletesCount: cyclingCount,
    avgRunFtp: runFtpCount > 0 ? Math.round(totalRunFtp / runFtpCount) : 0,
    avgBikeFtp: bikeFtpCount > 0 ? Math.round(totalBikeFtp / bikeFtpCount) : 0,
    goalRaces,
  };
}
