"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

/**
 * เปิด Season ใหม่ (เฉพาะ GUILD_MASTER)
 * @param monthYear format "YYYY-MM" เช่น "2026-05"
 */
export async function openSeason(monthYear: string) {
  // 1. ตรวจสอบสิทธิ์ว่าต้องเป็น GUILD_MASTER เท่านั้น
  const session = await requireRole("GUILD_MASTER");
  const adminMemberId = session?.user?.memberId;
  
  if (!adminMemberId) {
    throw new Error("UNAUTHORIZED: Member record not found");
  }

  // 2. Validate format "YYYY-MM"
  if (!/^\d{4}-\d{2}$/.test(monthYear)) {
    throw new Error("INVALID_FORMAT: Month-Year must be in YYYY-MM format");
  }

  // 3. เช็คว่าไม่มี season อื่นเปิดอยู่แล้ว
  const openSeasonExists = await prisma.guildSeason.findFirst({
    where: { isOpen: true },
  });

  if (openSeasonExists) {
    throw new Error("ALREADY_OPEN: Another season is currently open");
  }

  // 4. เช็คว่ามี monthYear นี้อยู่แล้วหรือไม่ (เพื่อป้องกันการซ้ำซ้อน)
  const seasonExists = await prisma.guildSeason.findUnique({
    where: { monthYear },
  });

  if (seasonExists) {
    throw new Error("ALREADY_EXISTS: Season for this month-year already exists");
  }

  // 5. บันทึกใน Transaction พร้อม AuditLog
  const newSeason = await prisma.$transaction(async (tx) => {
    const season = await tx.guildSeason.create({
      data: {
        monthYear,
        isOpen: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminMemberId,
        action: "OPEN_SEASON",
        targetType: "GuildSeason",
        targetId: season.id,
        newValue: JSON.parse(JSON.stringify(season)),
      },
    });

    return season;
  });

  revalidatePath("/seasons");
  revalidatePath("/members");
  revalidatePath("/dashboard");

  return { success: true, season: newSeason };
}

/**
 * ปิด Season ปัจจุบัน
 */
export async function closeSeason() {
  // 1. ตรวจสอบสิทธิ์ว่าต้องเป็น GUILD_MASTER เท่านั้น
  const session = await requireRole("GUILD_MASTER");
  const adminMemberId = session?.user?.memberId;
  
  if (!adminMemberId) {
    throw new Error("UNAUTHORIZED: Member record not found");
  }

  // 2. ค้นหา season ปัจจุบันที่กำลังเปิดอยู่
  const activeSeason = await prisma.guildSeason.findFirst({
    where: { isOpen: true },
  });

  if (!activeSeason) {
    throw new Error("NOT_FOUND: No active season is currently open");
  }

  // 3. ปิด Season และสร้าง Snapshot + AuditLog ใน Transaction
  const closedSeason = await prisma.$transaction(async (tx) => {
    // 3.1 ดึงสถิติต่างๆ เพื่อบันทึก Snapshot
    const activeMembersCount = await tx.member.count({
      where: { status: "ACTIVE" },
    });

    const questDoneCount = await tx.questLog.count({
      where: { seasonId: activeSeason.id, status: "DONE" },
    });

    const questAbsentCount = await tx.questLog.count({
      where: { seasonId: activeSeason.id, status: "ABSENT" },
    });

    const questLeaveCount = await tx.questLog.count({
      where: { seasonId: activeSeason.id, status: "LEAVE" },
    });

    const snapshotData = {
      mvp: "TBD",
      topMembers: [],
      stats: {
        totalMembers: activeMembersCount,
        doneQuests: questDoneCount,
        absentQuests: questAbsentCount,
        leaveQuests: questLeaveCount,
      },
      perfectAttendance: [],
      atRisk: [],
    };

    // 3.2 อัปเดตสถานะของ Season
    const updatedSeason = await tx.guildSeason.update({
      where: { id: activeSeason.id },
      data: {
        isOpen: false,
        closedAt: new Date(),
      },
    });

    // 3.3 บันทึก Snapshot
    await tx.seasonSnapshot.create({
      data: {
        seasonId: activeSeason.id,
        data: snapshotData,
      },
    });

    // 3.4 บันทึก AuditLog
    await tx.auditLog.create({
      data: {
        actorId: adminMemberId,
        action: "CLOSE_SEASON",
        targetType: "GuildSeason",
        targetId: activeSeason.id,
        oldValue: JSON.parse(JSON.stringify(activeSeason)),
        newValue: JSON.parse(JSON.stringify(updatedSeason)),
      },
    });

    return updatedSeason;
  });

  revalidatePath("/seasons");
  revalidatePath("/members");
  revalidatePath("/dashboard");

  return { success: true, season: closedSeason };
}
