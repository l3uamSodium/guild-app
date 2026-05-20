"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, getSession } from "@/lib/rbac";
import { getCurrentSeason } from "@/lib/season";
import { revalidatePath } from "next/cache";
import { sendDM } from "@/lib/discord-notify";

/**
 * สมาชิกส่งใบลา (สร้าง LeaveRequest)
 * @param dateStr Format: "YYYY-MM-DD"
 * @param reason เหตุผลในการลา
 */
export async function createLeaveRequest(dateStr: string, reason: string) {
  // 1. ตรวจสอบสิทธิ์ว่าผู้ใช้เข้าสู่ระบบและเป็น ACTIVE member หรือไม่
  const session = await getSession();
  const memberId = session?.user?.memberId;
  const status = session?.user?.memberStatus;

  if (!session || !memberId || status !== "ACTIVE") {
    throw new Error("UNAUTHORIZED: สิทธิ์การใช้งานไม่ถูกต้อง หรือบัญชีของคุณยังไม่ได้รับการอนุมัติ");
  }

  if (!dateStr || !reason.trim()) {
    throw new Error("BAD_REQUEST: กรุณาระบุวันที่และเหตุผลการพักกิจกรรม");
  }

  // 2. ดึง Active Season ปัจจุบัน
  const activeSeason = await getCurrentSeason();
  if (!activeSeason) {
    throw new Error("NO_ACTIVE_SEASON: ไม่สามารถแจ้งพักกิจกรรมได้ เนื่องจากไม่มีกิลด์ซีซั่นเปิดอยู่ในขณะนี้");
  }

  // 3. ตรวจสอบว่ามีใบลาของวันนั้นในซีซั่นนั้นอยู่แล้วหรือไม่
  const parsedDate = new Date(dateStr);
  parsedDate.setUTCHours(0, 0, 0, 0); // ทำความสะอาดเวลา

  const leaveExists = await prisma.leaveRequest.findUnique({
    where: {
      memberId_date_seasonId: {
        memberId,
        date: parsedDate,
        seasonId: activeSeason.id,
      },
    },
  });

  if (leaveExists) {
    throw new Error("ALREADY_EXISTS: คุณได้ยื่นขอพักกิจกรรมสำหรับวันนี้ไว้แล้วในระบบ");
  }

  // 4. บันทึกใบลา
  const newLeave = await prisma.leaveRequest.create({
    data: {
      memberId,
      seasonId: activeSeason.id,
      date: parsedDate,
      reason: reason.trim(),
      status: "PENDING",
    },
  });

  revalidatePath("/leave");
  
  return { success: true, leave: newLeave };
}

/**
 * แอดมินตรวจสอบและพิจารณาใบลา
 */
export async function reviewLeaveRequest(leaveId: string, status: "APPROVED" | "REJECTED") {
  // 1. ตรวจสอบสิทธิ์ว่าเป็น GUILD_MASTER หรือ VICE_MASTER เท่านั้น
  const session = await requireRole(["GUILD_MASTER", "VICE_MASTER"]);
  const adminMemberId = session?.user?.memberId;

  if (!adminMemberId) {
    throw new Error("UNAUTHORIZED: Member record not found");
  }

  if (!["APPROVED", "REJECTED"].includes(status)) {
    throw new Error("BAD_REQUEST: สถานะการอนุมัติไม่ถูกต้อง");
  }

  // 2. ดึงใบลาพร้อมกับข้อมูลผู้ใช้และ Discord ID
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: {
      member: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!leave) {
    throw new Error("NOT_FOUND: ไม่พบรายการคำขอพักกิจกรรมที่ต้องการตรวจสอบ");
  }

  // 3. อัปเดตใน Transaction พร้อมสร้าง AuditLog
  const updatedLeave = await prisma.$transaction(async (tx) => {
    const updated = await tx.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status,
        reviewedBy: adminMemberId,
        reviewedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminMemberId,
        action: `REVIEW_LEAVE_${status}`,
        targetType: "LeaveRequest",
        targetId: leaveId,
        oldValue: JSON.parse(JSON.stringify(leave)),
        newValue: JSON.parse(JSON.stringify(updated)),
      },
    });

    return updated;
  });

  // 4. ส่งข้อความแจ้งเตือนผ่าน Discord DM (ทำงานเบื้องหลัง/ไม่ขัดขวางหากล้มเหลว)
  const discordId = leave.member?.user?.discordId;
  if (discordId) {
    const nickname = leave.member.nickname || leave.member.inGameName;
    const leaveDate = new Date(leave.date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const message = status === "APPROVED"
      ? `สวัสดีคุณ **${nickname}**,\n\nการขอพักกิจกรรมกิลด์ของคุณสำหรับวันที่ **${leaveDate}** ได้รับการอนุมัติแล้วเรียบร้อยครับ ⚔️`
      : `สวัสดีคุณ **${nickname}**,\n\nคำขอพักกิจกรรมกิลด์ของคุณสำหรับวันที่ **${leaveDate}** ไม่ได้รับการอนุมัติในรอบนี้ครับ ⚠️`;

    // เรียกส่งข้อความโดยใช้ sendDM
    await sendDM(discordId, message, status);
  }

  revalidatePath("/leave");
  revalidatePath("/quest-check"); // จะต้องใช้ข้อมูลใบลาอัปเดตสถานะ

  return { success: true, leave: updatedLeave };
}
