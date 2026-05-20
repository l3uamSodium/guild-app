"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

/**
 * Clean up the hours and timezone of a Date object to store it as UTC Midnight.
 */
function cleanDate(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Saves and updates the Guild War attendance log for all active members on a specific date.
 */
export async function saveWarLogs(
  dateInput: Date | string,
  seasonId: string,
  attendedMemberIds: string[]
) {
  // 1. Verify that the user has admin credentials
  const session = await requireRole(["GUILD_MASTER", "VICE_MASTER"]);
  const adminMemberId = session?.user?.memberId;

  if (!adminMemberId) {
    throw new Error("UNAUTHORIZED: Member record not found");
  }

  const targetDate = cleanDate(new Date(dateInput));

  // 2. Query all ACTIVE members in the guild
  const activeMembers = await prisma.member.findMany({
    where: { status: "ACTIVE" },
  });

  // 3. Clear existing logs for this date, insert the updated statuses, and record the action in a transaction
  const savedLogsCount = await prisma.$transaction(async (tx) => {
    // Delete any old logs for this specific date and season
    await tx.warLog.deleteMany({
      where: {
        seasonId,
        date: targetDate,
      },
    });

    // Construct the updated status list for all active members
    const logsToCreate = activeMembers.map((m) => {
      const status: "ATTENDED" | "MISSED" = attendedMemberIds.includes(m.id)
        ? "ATTENDED"
        : "MISSED";

      return {
        memberId: m.id,
        seasonId,
        date: targetDate,
        status,
      };
    });

    // Bulk insert the new status logs
    if (logsToCreate.length > 0) {
      await tx.warLog.createMany({
        data: logsToCreate,
      });
    }

    // Save administrative audit trail
    await tx.auditLog.create({
      data: {
        actorId: adminMemberId,
        action: "SAVE_WAR_LOGS",
        targetType: "WarLog",
        targetId: seasonId,
        newValue: {
          date: targetDate.toISOString(),
          attendedCount: attendedMemberIds.length,
          missedCount: logsToCreate.filter((l) => l.status === "MISSED").length,
          totalCount: logsToCreate.length,
        },
      },
    });

    return logsToCreate.length;
  });

  // 4. Force Next.js route caches to update immediately
  revalidatePath("/admin/war-log");
  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");

  return { success: true, count: savedLogsCount };
}
