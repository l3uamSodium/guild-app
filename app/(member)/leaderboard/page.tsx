import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { getLeaderboard } from "@/lib/leaderboard";
import LeaderboardClientPage from "./LeaderboardClientPage";

export const metadata = {
  title: "ตารางคะแนนกิลด์ - ONIZUKA",
};

interface LeaderboardPageProps {
  searchParams: Promise<{ season?: string }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const session = await getSession();
  const memberId = session?.user?.memberId;
  const status = session?.user?.memberStatus;

  // Route security: Only active members can view this page
  if (!session || !memberId || status !== "ACTIVE") {
    redirect("/");
  }

  // 1. Fetch all seasons for the filter dropdown
  const seasons = await prisma.guildSeason.findMany({
    orderBy: {
      monthYear: "desc",
    },
  });

  // 2. Determine which season is selected
  const resolvedSearchParams = await searchParams;
  let selectedSeasonId = resolvedSearchParams.season;

  if (!selectedSeasonId) {
    // Default to the open season
    const openSeason = seasons.find((s) => s.isOpen);
    if (openSeason) {
      selectedSeasonId = openSeason.id;
    } else if (seasons.length > 0) {
      // If no open season, default to the latest season
      selectedSeasonId = seasons[0].id;
    }
  }

  // 3. Compile leaderboard ranking
  const leaderboard = selectedSeasonId
    ? await getLeaderboard(memberId, selectedSeasonId)
    : [];

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

  const mappedSeasons = seasons.map((s) => ({
    id: s.id,
    monthYear: s.monthYear,
    isOpen: s.isOpen,
  }));

  return (
    <LeaderboardClientPage
      seasons={mappedSeasons}
      selectedSeasonId={selectedSeasonId || ""}
      leaderboard={leaderboard}
      currentMemberId={memberId}
      memberInfo={{
        inGameName: member.inGameName,
        role: member.role,
        avatarUrl: member.user?.image,
      }}
    />
  );
}
