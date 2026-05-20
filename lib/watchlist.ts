import { prisma } from "@/lib/prisma";

export interface AbsenteeWatchInfo {
  member: {
    id: string;
    inGameName: string;
    nickname: string;
    avatar: string | null;
  };
  absentCount: number;
  dates: string[];
}

export interface LeaveWatchInfo {
  member: {
    id: string;
    inGameName: string;
    nickname: string;
    avatar: string | null;
  };
  leaveCount: number;
}

/**
 * Type A — Frequent Absentees:
 * Finds ACTIVE members who have QuestLog status=ABSENT >= threshold times in a rolling 7-day window.
 */
export async function getAbsentees(
  threshold = 3,
  days = 7
): Promise<AbsenteeWatchInfo[]> {
  // Set date boundary: rolling days window ending at the end of today
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);

  const pastDate = new Date(today);
  pastDate.setUTCDate(today.getUTCDate() - days + 1);
  pastDate.setUTCHours(0, 0, 0, 0);

  // Fetch all ACTIVE members
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

  const absentees: AbsenteeWatchInfo[] = [];

  // Query absences per member in the rolling window
  for (const m of activeMembers) {
    const absentLogs = await prisma.questLog.findMany({
      where: {
        memberId: m.id,
        status: "ABSENT",
        date: {
          gte: pastDate,
          lte: today,
        },
      },
      orderBy: {
        date: "desc",
      },
      select: {
        date: true,
      },
    });

    if (absentLogs.length >= threshold) {
      absentees.push({
        member: {
          id: m.id,
          inGameName: m.inGameName,
          nickname: m.nickname,
          avatar: m.user?.image || null,
        },
        absentCount: absentLogs.length,
        dates: absentLogs.map((l) => l.date.toISOString()),
      });
    }
  }

  // Sort descending by count
  absentees.sort((a, b) => b.absentCount - a.absentCount);

  return absentees;
}

/**
 * Type B — High Leave Takers:
 * Counts APPROVED LeaveRequest per active member in the active season, sorted descending.
 */
export async function getHighLeaveTakers(
  seasonId: string
): Promise<LeaveWatchInfo[]> {
  // 1. Fetch active members
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

  // 2. Fetch approved leaves grouped by member
  const leaves = await prisma.leaveRequest.groupBy({
    by: ["memberId"],
    where: {
      seasonId,
      status: "APPROVED",
    },
    _count: {
      id: true,
    },
  });

  // 3. Compile statistics
  const leaveCounts: LeaveWatchInfo[] = activeMembers
    .map((m) => {
      const match = leaves.find((l) => l.memberId === m.id);
      return {
        member: {
          id: m.id,
          inGameName: m.inGameName,
          nickname: m.nickname,
          avatar: m.user?.image || null,
        },
        leaveCount: match ? match._count.id : 0,
      };
    })
    .filter((item) => item.leaveCount > 0); // Only include those who have leaves

  // Sort descending by leaveCount
  leaveCounts.sort((a, b) => b.leaveCount - a.leaveCount);

  return leaveCounts;
}
