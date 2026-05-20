"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

/**
 * ปรับลดชั่วโมงและเวลาของ Date ให้เป็น UTC Midnight
 */
function cleanDate(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * ปรับสมาชิกที่ไม่ผ่านเควสในวันนั้นให้เป็น ABSENT โดยอัตโนมัติ (เฉพาะ ACTIVE ที่ไม่มี APPROVED leave และไม่มี QuestLog)
 */
export async function bulkAbsent(dateInput: Date | string, seasonId: string) {
  // 1. ตรวจสอบสิทธิ์ว่าต้องเป็นแอดมิน (GUILD_MASTER หรือ VICE_MASTER)
  const session = await requireRole(["GUILD_MASTER", "VICE_MASTER"]);
  const adminMemberId = session?.user?.memberId;

  if (!adminMemberId) {
    throw new Error("UNAUTHORIZED: Member record not found");
  }

  const targetDate = cleanDate(new Date(dateInput));

  // 2. ดึง ACTIVE members ทั้งหมด
  const activeMembers = await prisma.member.findMany({
    where: { status: "ACTIVE" },
  });

  // 3. หา member ที่มี APPROVED LeaveRequest ในวันนั้น
  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: {
      seasonId,
      date: targetDate,
      status: "APPROVED",
    },
  });
  const excludeIds = approvedLeaves.map((l) => l.memberId);

  // 4. หา member ที่มี QuestLog ในวันนั้นของ season นี้อยู่แล้ว (เพื่อข้าม)
  const existingQuestLogs = await prisma.questLog.findMany({
    where: {
      seasonId,
      date: targetDate,
    },
  });
  const skipIds = existingQuestLogs.map((q) => q.memberId);

  // 5. คัดกรองผู้ใช้ที่ควรปรับเป็น ABSENT (ACTIVE - Leaves - Existing logs)
  const filteredMembers = activeMembers.filter(
    (m) => !excludeIds.includes(m.id) && !skipIds.includes(m.id)
  );

  // 6. ดำเนินการสร้าง QuestLog = ABSENT ใน Transaction
  const result = await prisma.$transaction(async (tx) => {
    const dataToInsert = filteredMembers.map((m) => ({
      memberId: m.id,
      seasonId,
      date: targetDate,
      status: "ABSENT" as const,
      createdBy: adminMemberId,
    }));

    if (dataToInsert.length > 0) {
      await tx.questLog.createMany({
        data: dataToInsert,
      });
    }

    // บันทึก AuditLog
    await tx.auditLog.create({
      data: {
        actorId: adminMemberId,
        action: "BULK_ABSENT",
        targetType: "QuestLog",
        targetId: seasonId,
        newValue: {
          date: targetDate.toISOString(),
          count: dataToInsert.length,
          affectedIds: filteredMembers.map((m) => m.id),
        },
      },
    });

    return {
      created: dataToInsert.length,
      skipped: skipIds.length,
      excluded: excludeIds.length,
    };
  });

  revalidatePath("/quest-check");
  revalidatePath("/dashboard");

  return result;
}

/**
 * บันทึกประวัติเควสรายวันแบบเลือกรายคน (Done/Absent/Leave)
 */
export async function saveDailyQuestChecks(
  dateInput: Date | string,
  seasonId: string,
  completedMemberIds: string[],
  proofImageUrl?: string
) {
  // 1. ตรวจสอบสิทธิ์ว่าต้องเป็นแอดมิน
  const session = await requireRole(["GUILD_MASTER", "VICE_MASTER"]);
  const adminMemberId = session?.user?.memberId;

  if (!adminMemberId) {
    throw new Error("UNAUTHORIZED: Member record not found");
  }

  const targetDate = cleanDate(new Date(dateInput));

  // 2. ดึง ACTIVE members และ APPROVED leaves ทั้งหมดในวันนั้น
  const activeMembers = await prisma.member.findMany({
    where: { status: "ACTIVE" },
  });

  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: {
      seasonId,
      date: targetDate,
      status: "APPROVED",
    },
  });
  const leaveMemberIds = approvedLeaves.map((l) => l.memberId);

  // 3. ดำเนินการลบประวัติเดิมของวันนั้น แล้วบันทึกใหม่ทั้งหมดใน Transaction
  const savedLogsCount = await prisma.$transaction(async (tx) => {
    // 3.1 ลบประวัติเดิมของวันนั้น
    await tx.questLog.deleteMany({
      where: {
        seasonId,
        date: targetDate,
      },
    });

    // 3.2 สร้างชุดข้อมูลใหม่
    const logsToCreate = activeMembers.map((m) => {
      let status: "DONE" | "ABSENT" | "LEAVE" = "ABSENT";
      let image: string | undefined = undefined;

      if (leaveMemberIds.includes(m.id)) {
        status = "LEAVE";
      } else if (completedMemberIds.includes(m.id)) {
        status = "DONE";
        image = proofImageUrl;
      }

      return {
        memberId: m.id,
        seasonId,
        date: targetDate,
        status,
        proofImageUrl: image,
        createdBy: adminMemberId,
      };
    });

    // 3.3 บันทึก
    if (logsToCreate.length > 0) {
      await tx.questLog.createMany({
        data: logsToCreate,
      });
    }

    // 3.4 บันทึก AuditLog
    await tx.auditLog.create({
      data: {
        actorId: adminMemberId,
        action: "SAVE_DAILY_QUEST_CHECKS",
        targetType: "QuestLog",
        targetId: seasonId,
        newValue: {
          date: targetDate.toISOString(),
          completedCount: completedMemberIds.length,
          leaveCount: leaveMemberIds.length,
          absentCount: logsToCreate.filter((l) => l.status === "ABSENT").length,
          proofImageUrl,
        },
      },
    });

    return logsToCreate.length;
  });

  revalidatePath("/quest-check");
  revalidatePath("/dashboard");

  return { success: true, count: savedLogsCount };
}
