import { prisma } from "@/lib/prisma";

export interface LeaderboardEntry {
  memberId: string;
  inGameName: string;
  nickname: string;
  avatar: string | null;
  questCount: number;
  warCount: number;
  pointsSpent: number;
  totalPoints: number;
  isCurrentUser: boolean;
  rank: number;
}

/**
 * Compiles a real-time leaderboard of all active guild members, sorted descending by total points.
 * Employs high-performance aggregates to minimize DB queries.
 */
export async function getLeaderboard(
  currentMemberId: string,
  seasonId?: string
): Promise<LeaderboardEntry[]> {
  // 1. Fetch all ACTIVE guild members
  const activeMembers = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      inGameName: true,
      nickname: true,
      user: {
        select: {
          image: true,
        },
      },
    },
  });

  if (activeMembers.length === 0) {
    return [];
  }

  // 2. Fetch Quest DONE logs aggregates
  const questGroup = await prisma.questLog.groupBy({
    by: ["memberId"],
    where: {
      status: "DONE",
      ...(seasonId ? { seasonId } : {}),
    },
    _count: {
      id: true,
    },
  });

  // 3. Fetch War ATTENDED logs aggregates
  const warGroup = await prisma.warLog.groupBy({
    by: ["memberId"],
    where: {
      status: "ATTENDED",
      ...(seasonId ? { seasonId } : {}),
    },
    _count: {
      id: true,
    },
  });

  // 4. Fetch Redeem aggregates
  const redeemFilter: any = {};
  if (seasonId) {
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

  const redeemGroup = await prisma.redeemLog.groupBy({
    by: ["memberId"],
    where: redeemFilter,
    _sum: {
      pointsSpent: true,
    },
  });

  // 5. Build lookup maps for fast lookups
  const questMap = new Map<string, number>(
    questGroup.map((q) => [q.memberId, q._count.id])
  );
  const warMap = new Map<string, number>(
    warGroup.map((w) => [w.memberId, w._count.id])
  );
  const redeemMap = new Map<string, number>(
    redeemGroup.map((r) => [r.memberId, r._sum.pointsSpent || 0])
  );

  // 6. Map and calculate scores for every active member
  const entries: Omit<LeaderboardEntry, "rank">[] = activeMembers.map((m) => {
    const questCount = questMap.get(m.id) || 0;
    const warCount = warMap.get(m.id) || 0;
    const pointsSpent = redeemMap.get(m.id) || 0;

    let earned = questCount * 10 + warCount * 50;

    // Developer Override: Grant 50,000 points to Da (ดา) for testing
    if (m.id === "cmpdjytul0009y0vcsqesm7s6") {
      earned += 50000;
    }

    const totalPoints = earned - pointsSpent;

    return {
      memberId: m.id,
      inGameName: m.inGameName,
      nickname: m.nickname,
      avatar: m.user?.image || null,
      questCount,
      warCount,
      pointsSpent,
      totalPoints,
      isCurrentUser: m.id === currentMemberId,
    };
  });

  // 7. Sort by points desc, then by IGN alphabetically to ensure stable ordering
  entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return a.inGameName.localeCompare(b.inGameName);
  });

  // 8. Assign Standard Competitive Ranks (1, 1, 3...)
  let currentRank = 1;
  let prevPoints: number | null = null;
  let rankIncrement = 1;

  const rankedEntries: LeaderboardEntry[] = entries.map((entry, index) => {
    if (prevPoints !== null) {
      if (entry.totalPoints === prevPoints) {
        rankIncrement++;
      } else {
        currentRank += rankIncrement;
        rankIncrement = 1;
      }
    }
    prevPoints = entry.totalPoints;

    return {
      ...entry,
      rank: currentRank,
    };
  });

  return rankedEntries;
}
