import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { getAbsentees, getHighLeaveTakers } from "@/lib/watchlist";
import WatchlistClientPage from "./WatchlistClientPage";

export const metadata = {
  title: "รายชื่อเฝ้าระวัง - ONIZUKA",
};

export default async function WatchlistPage() {
  const session = await getSession();

  // Route security: Only admins (Guild Master, Vice Master) can view this page
  if (!session || !isAdmin(session)) {
    redirect("/");
  }

  // 1. Fetch active season
  const activeSeason = await prisma.guildSeason.findFirst({
    where: { isOpen: true },
  });

  // 2. Fetch watchlist data
  const absentees = await getAbsentees();
  const leaveTakers = activeSeason
    ? await getHighLeaveTakers(activeSeason.id)
    : [];

  const mappedSeason = activeSeason
    ? {
        id: activeSeason.id,
        monthYear: activeSeason.monthYear,
        isOpen: activeSeason.isOpen,
      }
    : null;

  return (
    <WatchlistClientPage
      activeSeason={mappedSeason}
      absentees={absentees}
      leaveTakers={leaveTakers}
    />
  );
}
