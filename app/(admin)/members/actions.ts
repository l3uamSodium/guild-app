"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function approveMember(memberId: string) {
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
