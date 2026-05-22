"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import type { ShopItem } from "@/generated/prisma/client";

/**
 * Handles atomic item redemption for guild members using transaction locks.
 * Safely handles normal items and lucky draw entries.
 */
export async function redeemItem(
  itemId: string,
  quantity: number = 1
): Promise<{ success: boolean; log?: any; error?: string }> {
  try {
    // 1. Authenticate user
    const session = await getSession();
    const memberId = session?.user?.memberId;
    const status = session?.user?.memberStatus;

    if (!session || !memberId || status !== "ACTIVE") {
      return { success: false, error: "UNAUTHORIZED" };
    }

    // 2. Perform transaction
    const result = await prisma.$transaction(async (tx) => {
      // A. Acquire a pessimistic lock on the Member record to prevent race conditions / double spends
      await tx.$queryRaw`
        SELECT id FROM "Member"
        WHERE id = ${memberId}
        FOR UPDATE
      `;

      if (quantity < 1 || !Number.isInteger(quantity) || quantity > 100) {
        throw new Error("INVALID_QUANTITY");
      }

      // B. Decrement inventory stock atomically using raw SQL (concurrency lock)
      // Double check table case and capitalization (Prisma defaults to PascalCase table names like "ShopItem")
      const updatedItems = await tx.$queryRaw<ShopItem[]>`
        UPDATE "ShopItem"
        SET stock = stock - ${quantity}
        WHERE id = ${itemId} AND stock >= ${quantity} AND "isActive" = true
        RETURNING *
      `;

      if (!updatedItems || updatedItems.length === 0) {
        throw new Error("OUT_OF_STOCK");
      }

      const item = updatedItems[0];

      // C. Check if Lucky Draw is still open
      if (item.type === "LUCKY_DRAW" && item.drawClosesAt) {
        const closesAt = new Date(item.drawClosesAt);
        if (closesAt.getTime() < Date.now()) {
          throw new Error("DRAW_CLOSED");
        }
      }

      // D. Get member's dynamic points balance inside the transaction
      const season = await tx.guildSeason.findFirst({
        where: { isOpen: true },
      });
      const seasonId = season?.id;

      // Done Quests
      const doneQuestsCount = await tx.questLog.count({
        where: {
          memberId,
          status: "DONE",
          ...(seasonId ? { seasonId } : {}),
        },
      });
      const questPoints = doneQuestsCount * 10;

      // Attended Wars
      const attendedWarsCount = await tx.warLog.count({
        where: {
          memberId,
          status: "ATTENDED",
          ...(seasonId ? { seasonId } : {}),
        },
      });
      const warPoints = attendedWarsCount * 50;

      let earned = questPoints + warPoints;

      // Developer Override: Grant 50,000 points to Da (ดา) for testing
      if (memberId === "cmpdjytul0009y0vcsqesm7s6") {
        earned += 50000;
      }

      // Redeemed points in this season
      const redeemFilter: any = { memberId };
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

      const redeemLogs = await tx.redeemLog.findMany({
        where: redeemFilter,
        select: {
          pointsSpent: true,
        },
      });

      const spent = redeemLogs.reduce((sum, log) => sum + log.pointsSpent, 0);
      const totalPoints = earned - spent;

      const totalPrice = item.price * quantity;

      // E. Verify sufficient balance
      if (totalPoints < totalPrice) {
        throw new Error("INSUFFICIENT_POINTS");
      }

      // F. Create Redeem Log
      const logs = [];
      const redeemEntries = Array.from({ length: quantity }).map(() => ({
        memberId,
        itemId: item.id,
        pointsSpent: item.price,
        status: "PENDING" as const,
      }));
      
      await tx.redeemLog.createMany({
        data: redeemEntries,
      });

      // G. If lucky draw, create LuckyDrawEntry
      if (item.type === "LUCKY_DRAW") {
        const luckyDrawEntries = Array.from({ length: quantity }).map(() => ({
          memberId,
          itemId: item.id,
        }));
        await tx.luckyDrawEntry.createMany({
          data: luckyDrawEntries,
        });
      }

      return { success: true, log: { quantity } };
    });

    // 3. Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/shop");

    return result;
  } catch (error: any) {
    console.error("Redeem error:", error);
    // Return structured errors based on throw
    if (error.message === "OUT_OF_STOCK") {
      return { success: false, error: "OUT_OF_STOCK" };
    }
    if (error.message === "INSUFFICIENT_POINTS") {
      return { success: false, error: "INSUFFICIENT_POINTS" };
    }
    if (error.message === "DRAW_CLOSED") {
      return { success: false, error: "DRAW_CLOSED" };
    }
    if (error.message === "INVALID_QUANTITY") {
      return { success: false, error: "INVALID_QUANTITY" };
    }
    return { success: false, error: "TRANSACTION_FAILED" };
  }
}
