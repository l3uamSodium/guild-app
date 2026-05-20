import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/rbac";
import { getCurrentSeason } from "@/lib/season";
import { getMemberPoints } from "@/lib/points";
import ShopClientPage from "./ShopClientPage";

export const metadata = {
  title: "ร้านค้ากิลด์ - ONIZUKA",
};

export default async function MemberShopPage() {
  // 1. Authenticate user
  const session = await getSession();
  const memberId = session?.user?.memberId;
  const status = session?.user?.memberStatus;

  if (!session || !memberId || status !== "ACTIVE") {
    redirect("/");
  }

  // 2. Fetch active season & dynamic point balance
  const currentSeason = await getCurrentSeason();
  const points = await getMemberPoints(memberId, currentSeason?.id);

  // 3. Fetch active shop items
  const shopItems = await prisma.shopItem.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      price: "asc",
    },
  });

  // 4. Fetch Member Profile Info (for MemberNavbar)
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      inGameName: true,
      role: true,
      user: {
        select: {
          image: true,
        },
      },
    },
  });

  if (!member) {
    redirect("/");
  }

  // 5. Fetch completed redemption count of member (total orders)
  const totalRedeemed = await prisma.redeemLog.count({
    where: { memberId },
  });

  const serializedItems = shopItems.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    type: item.type,
    price: item.price,
    stock: item.stock,
    imageUrl: item.imageUrl,
    drawClosesAt: item.drawClosesAt ? item.drawClosesAt.toISOString() : null,
    drawWinnerId: item.drawWinnerId,
  }));

  return (
    <ShopClientPage
      shopItems={serializedItems}
      pointsBalance={points.total}
      earnedPoints={points.earned}
      totalRedeemed={totalRedeemed}
      memberInfo={{
        inGameName: member.inGameName,
        role: member.role,
        avatarUrl: member.user?.image,
      }}
    />
  );
}
