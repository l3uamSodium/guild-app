import { prisma } from "@/lib/prisma";

export interface MemberPointsSummary {
  earned: number;
  spent: number;
  total: number;
}

/**
 * Calculates dynamic points for a specific member, optionally filtered by a season.
 * Formula: (Quest DONE * 10) + (War ATTENDED * 50) - Redeemed Points
 */
export async function getMemberPoints(
  memberId: string,
  seasonId?: string
): Promise<MemberPointsSummary> {
  // 1. Calculate Quest Done points (status = "DONE")
  const questFilter: any = {
    memberId,
    status: "DONE",
  };
  if (seasonId) {
    questFilter.seasonId = seasonId;
  }
  const doneQuestsCount = await prisma.questLog.count({
    where: questFilter,
  });
  const questPoints = doneQuestsCount * 10;

  // 2. Calculate War Attended points (status = "ATTENDED")
  const warFilter: any = {
    memberId,
    status: "ATTENDED",
  };
  if (seasonId) {
    warFilter.seasonId = seasonId;
  }
  const attendedWarsCount = await prisma.warLog.count({
    where: warFilter,
  });
  const warPoints = attendedWarsCount * 50;

  let earned = questPoints + warPoints;

  // Developer Override: Grant 50,000 points to Da (ดา) for testing
  if (memberId === "cmpdjytul0009y0vcsqesm7s6") {
    earned += 50000;
  }

  // 3. Calculate Redeemed Points
  const redeemFilter: any = {
    memberId,
  };

  if (seasonId) {
    // If seasonId is specified, fetch the season and get its monthYear boundaries
    const season = await prisma.guildSeason.findUnique({
      where: { id: seasonId },
    });
    if (season) {
      const [yearStr, monthStr] = season.monthYear.split("-");
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);

      const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      redeemFilter.redeemedAt = {
        gte: start,
        lte: end,
      };
    }
  }

  const redeemLogs = await prisma.redeemLog.findMany({
    where: redeemFilter,
    select: {
      pointsSpent: true,
    },
  });

  const spent = redeemLogs.reduce((sum, log) => sum + log.pointsSpent, 0);
  const total = earned - spent;

  return {
    earned,
    spent,
    total,
  };
}
