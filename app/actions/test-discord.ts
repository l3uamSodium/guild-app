"use server";

import { sendDM } from "@/lib/discord-notify";
import { getSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * Server action to dispatch a real-time Discord DM test notification to the logged-in member.
 */
export async function sendTestNotificationAction() {
  try {
    const session = await getSession();
    const memberId = session?.user?.memberId;

    if (!session || !memberId) {
      return { success: false, error: "UNAUTHORIZED: กรุณาเข้าสู่ระบบเพื่อใช้งาน" };
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: true,
      },
    });

    if (!member || !member.user?.discordId) {
      return { success: false, error: "NOT_FOUND: ไม่พบข้อมูล Discord ID ของคุณในระบบ" };
    }

    const discordId = member.user.discordId;
    const nickname = member.nickname || member.inGameName;
    const message = `สวัสดีคุณ **${nickname}**,\n\nนี่คือข้อความแจ้งเตือนทดสอบอัตโนมัติจากระบบจัดการกิลด์ของเราแบบเรียลไทม์ ⚔️`;

    const success = await sendDM(discordId, message, "TEST_NOTIFICATION");

    if (success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: "ไม่สามารถส่งข้อความเข้า DM ได้ กรุณาตรวจสอบว่าบอตถูกเชิญเข้ากิลด์ และคุณเปิด Direct Messages จากเซิร์ฟเวอร์แล้ว",
      };
    }
  } catch (error: any) {
    console.error("Test Notification Action Error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการประมวลผลระบบแจ้งเตือน" };
  }
}
