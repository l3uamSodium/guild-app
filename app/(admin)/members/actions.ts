"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { MemberType } from "@/generated/prisma/client";
import { sendDM } from "@/lib/discord-notify";

export async function approveMember(memberId: string) {
  try {
    const adminSession = await requireRole(["GUILD_MASTER", "VICE_MASTER"]);
    const adminMemberId = adminSession?.user?.memberId;

    if (!adminMemberId) {
      return { success: false, error: "ไม่พบข้อมูลผู้ดำเนินการในระบบสมาชิก" };
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      return { success: false, error: "ไม่พบรายชื่อสมาชิกนี้ในระบบ" };
    }

    if (member.status === "ACTIVE") {
      return { success: false, error: "สมาชิกนี้ได้รับการอนุมัติอยู่แล้ว" };
    }

    // Update member and create audit log in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.member.update({
        where: { id: memberId },
        data: { status: "ACTIVE" },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminMemberId,
          action: "APPROVE_MEMBER",
          targetType: "Member",
          targetId: memberId,
          oldValue: JSON.stringify({ status: member.status }),
          newValue: JSON.stringify({ status: "ACTIVE" }),
        },
      });
    });

    // Send welcoming Discord DM
    const discordId = member.user?.discordId;
    if (discordId) {
      const nickname = member.nickname || member.inGameName;
      const message = `ยินดีต้อนรับคุณ ${nickname}! บัญชีของคุณได้รับการอนุมัติเรียบร้อยแล้ว ยินดีต้อนรับเข้าสู่กิลด์ ONIZUKA อย่างเป็นทางการ ⚔️`;
      await sendDM(discordId, message, "APPROVED");
    }

    revalidatePath("/members");
    return { success: true };
  } catch (error: any) {
    console.error("Approve Member Error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการอนุมัติสมาชิก" };
  }
}

export async function deactivateMember(memberId: string) {
  try {
    const adminSession = await requireRole(["GUILD_MASTER", "VICE_MASTER"]);
    const adminMemberId = adminSession?.user?.memberId;

    if (!adminMemberId) {
      return { success: false, error: "ไม่พบข้อมูลผู้ดำเนินการในระบบสมาชิก" };
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return { success: false, error: "ไม่พบรายชื่อสมาชิกนี้ในระบบ" };
    }

    if (member.status === "INACTIVE") {
      return { success: false, error: "สมาชิกนี้ถูกปิดใช้งานอยู่แล้ว" };
    }

    // Update member and create audit log in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.member.update({
        where: { id: memberId },
        data: { status: "INACTIVE" },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminMemberId,
          action: "DEACTIVATE_MEMBER",
          targetType: "Member",
          targetId: memberId,
          oldValue: JSON.stringify({ status: member.status }),
          newValue: JSON.stringify({ status: "INACTIVE" }),
        },
      });
    });

    revalidatePath("/members");
    return { success: true };
  } catch (error: any) {
    console.error("Deactivate Member Error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการปิดใช้งานสมาชิก" };
  }
}

export async function updateMemberType(memberId: string, type: MemberType) {
  try {
    const adminSession = await requireRole(["GUILD_MASTER", "VICE_MASTER"]);
    const adminMemberId = adminSession?.user?.memberId;

    if (!adminMemberId) {
      return { success: false, error: "ไม่พบข้อมูลผู้ดำเนินการในระบบสมาชิก" };
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return { success: false, error: "ไม่พบรายชื่อสมาชิกนี้ในระบบ" };
    }

    if (member.memberType === type) {
      return { success: false, error: "ประเภทสมาชิกนี้ตรงกับค่าปัจจุบันอยู่แล้ว" };
    }

    // Update member type and create audit log in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.member.update({
        where: { id: memberId },
        data: { memberType: type },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminMemberId,
          action: "UPDATE_MEMBER_TYPE",
          targetType: "Member",
          targetId: memberId,
          oldValue: JSON.stringify({ memberType: member.memberType }),
          newValue: JSON.stringify({ memberType: type }),
        },
      });
    });

    revalidatePath("/members");
    revalidatePath("/admin/watchlist");
    return { success: true };
  } catch (error: any) {
    console.error("Update Member Type Error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนประเภทสมาชิก" };
  }
}
