import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import AdminShopClientPage from "./AdminShopClientPage";

export const metadata = {
  title: "จัดการร้านค้ากิลด์ - ONIZUKA",
};

export default async function AdminShopPage() {
  const session = await getSession();

  // Route security: Only admins (Guild Master, Vice Master) can view this page
  if (!session || !isAdmin(session)) {
    redirect("/");
  }

  // Fetch all shop items (both active and inactive)
  const shopItems = await prisma.shopItem.findMany({
    orderBy: [
      { isActive: "desc" },
      { price: "asc" },
    ],
  });

  // Fetch all redeem logs
  const redeemLogs = await prisma.redeemLog.findMany({
    include: {
      member: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
              email: true,
            },
          },
        },
      },
      item: true,
    },
    orderBy: {
      redeemedAt: "desc",
    },
  });

  // Map database format to client friendly format
  const mappedItems = shopItems.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    type: item.type,
    price: item.price,
    stock: item.stock,
    imageUrl: item.imageUrl || "",
    isActive: item.isActive,
    drawClosesAt: item.drawClosesAt ? item.drawClosesAt.toISOString() : null,
    drawWinnerId: item.drawWinnerId,
    createdAt: item.createdAt.toISOString(),
  }));

  const mappedRedeemLogs = redeemLogs.map((log) => ({
    id: log.id,
    pointsSpent: log.pointsSpent,
    status: log.status,
    redeemedAt: log.redeemedAt.toISOString(),
    deliveredAt: log.deliveredAt ? log.deliveredAt.toISOString() : null,
    deliveredBy: log.deliveredBy,
    member: {
      id: log.member.id,
      inGameName: log.member.inGameName,
      nickname: log.member.nickname,
      discordTag: log.member.user?.name || log.member.user?.email || "Unknown User",
      avatar: log.member.user?.image || null,
    },
    item: {
      id: log.item.id,
      name: log.item.name,
      type: log.item.type,
      imageUrl: log.item.imageUrl || "",
    },
  }));

  return (
    <AdminShopClientPage
      initialItems={mappedItems}
      initialRedeemLogs={mappedRedeemLogs}
    />
  );
}
