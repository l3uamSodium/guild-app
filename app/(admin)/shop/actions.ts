"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { ShopItemType, ShopItem } from "@/generated/prisma/client";
import { sendDM } from "@/lib/discord-notify";

/**
 * สร้างสินค้าชิ้นใหม่ในร้านค้ากิลด์ (Admin only)
 */
export async function createShopItem(data: {
  name: string;
  description?: string;
  price: number;
  stock: number;
  type: ShopItemType;
  imageUrl?: string;
  drawClosesAt?: string | null;
}) {
  try {
    const session = await requireRole(["GUILD_MASTER", "VICE_MASTER"]);
    const adminMemberId = session?.user?.memberId;

    if (!adminMemberId) {
      return { success: false, error: "ไม่พบข้อมูลผู้ดำเนินการในระบบสมาชิก" };
    }

    if (!data.name.trim() || data.price < 0 || data.stock < 0) {
      return { success: false, error: "ข้อมูลสินค้าไม่ถูกต้อง" };
    }

    const newItem = await prisma.shopItem.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price: data.price,
        stock: data.stock,
        type: data.type,
        imageUrl: data.imageUrl?.trim() || null,
        drawClosesAt: data.drawClosesAt ? new Date(data.drawClosesAt) : null,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminMemberId,
        action: "CREATE_SHOP_ITEM",
        targetType: "ShopItem",
        targetId: newItem.id,
        newValue: JSON.parse(JSON.stringify(newItem)),
      },
    });

    revalidatePath("/shop");
    revalidatePath("/admin/shop");

    return { success: true, item: newItem };
  } catch (error: any) {
    console.error("Create Shop Item Error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการสร้างสินค้า" };
  }
}

/**
 * แก้ไขรายละเอียดสินค้าในร้านค้ากิลด์ (Admin only)
 */
export async function updateShopItem(
  itemId: string,
  data: Partial<Omit<ShopItem, "id" | "createdAt" | "updatedAt">>
) {
  try {
    const session = await requireRole(["GUILD_MASTER", "VICE_MASTER"]);
    const adminMemberId = session?.user?.memberId;

    if (!adminMemberId) {
      return { success: false, error: "ไม่พบข้อมูลผู้ดำเนินการในระบบสมาชิก" };
    }

    const oldItem = await prisma.shopItem.findUnique({
      where: { id: itemId },
    });

    if (!oldItem) {
      return { success: false, error: "ไม่พบสินค้าที่ต้องการแก้ไข" };
    }

    const updatedItem = await prisma.shopItem.update({
      where: { id: itemId },
      data: {
        ...data,
        name: data.name !== undefined ? data.name.trim() : undefined,
        description: data.description !== undefined ? (data.description?.trim() || null) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminMemberId,
        action: "UPDATE_SHOP_ITEM",
        targetType: "ShopItem",
        targetId: itemId,
        oldValue: JSON.parse(JSON.stringify(oldItem)),
        newValue: JSON.parse(JSON.stringify(updatedItem)),
      },
    });

    revalidatePath("/shop");
    revalidatePath("/admin/shop");

    return { success: true, item: updatedItem };
  } catch (error: any) {
    console.error("Update Shop Item Error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูลสินค้า" };
  }
}

/**
 * อัปเดตสถานะการจัดส่งสินค้าเป็นจัดส่งแล้ว และแจ้งเตือนสมาชิกผ่าน Discord DM
 */
export async function markRedeemDelivered(redeemId: string) {
  try {
    const session = await requireRole(["GUILD_MASTER", "VICE_MASTER"]);
    const adminMemberId = session?.user?.memberId;

    if (!adminMemberId) {
      return { success: false, error: "ไม่พบข้อมูลผู้ดำเนินการในระบบสมาชิก" };
    }

    // 1. ดึงประวัติการแลกสินค้า
    const redeemLog = await prisma.redeemLog.findUnique({
      where: { id: redeemId },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        item: true,
      },
    });

    if (!redeemLog) {
      return { success: false, error: "ไม่พบประวัติการแลกซื้อสินค้านี้" };
    }

    if (redeemLog.status === "DELIVERED") {
      return { success: false, error: "สินค้านี้ได้รับการจัดส่งเรียบร้อยแล้ว" };
    }

    // 2. ดำเนินการอัปเดตสถานะใน Transaction พร้อมกับบันทึก AuditLog
    const updatedRedeem = await prisma.$transaction(async (tx) => {
      const updated = await tx.redeemLog.update({
        where: { id: redeemId },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
          deliveredBy: adminMemberId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminMemberId,
          action: "MARK_REDEEM_DELIVERED",
          targetType: "RedeemLog",
          targetId: redeemId,
          oldValue: JSON.parse(JSON.stringify(redeemLog)),
          newValue: JSON.parse(JSON.stringify(updated)),
        },
      });

      return updated;
    });

    // 3. ส่ง Discord DM แจ้งเตือนผู้แลกของรางวัล
    const discordId = redeemLog.member?.user?.discordId;
    if (discordId) {
      const nickname = redeemLog.member.nickname || redeemLog.member.inGameName;
      const itemName = redeemLog.item.name;
      const message = `สวัสดีคุณ **${nickname}**,\n\nสินค้า "**${itemName}**" ที่คุณแลกรางวัลไว้ได้รับการจัดส่งเรียบร้อยแล้วครับ! 🎁\n\nขอให้มีความสุขกับการเล่นเกมและร่วมสนุกสะสมแต้มกิลด์ไปด้วยกันต่อไปนะ ⚔️`;
      
      await sendDM(discordId, message, "ITEM_DELIVERED");
    }

    revalidatePath("/shop");
    revalidatePath("/admin/shop");

    return { success: true, redeem: updatedRedeem };
  } catch (error: any) {
    console.error("Mark Redeem Delivered Error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการบันทึกจัดส่งสินค้า" };
  }
}
