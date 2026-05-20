import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/rbac";
import { getCurrentSeason } from "@/lib/season";
import { redirect } from "next/navigation";
import QuestCheckClientPage from "./QuestCheckClientPage";

export const metadata = {
  title: "Quest Daily Attendance",
};

export default async function QuestCheckPage() {
  const session = await getSession();

  // Route security: Only admins can view this page
  if (!session || !isAdmin(session)) {
    redirect("/");
  }

  const currentSeason = await getCurrentSeason();

  // Fetch all active members
  const activeMembers = await prisma.member.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      inGameName: "asc",
    },
  });

  // Fetch all approved leaves for the current season
  let approvedLeaves: any[] = [];
  let existingLogs: any[] = [];

  if (currentSeason) {
    approvedLeaves = await prisma.leaveRequest.findMany({
      where: {
        seasonId: currentSeason.id,
        status: "APPROVED",
      },
      select: {
        memberId: true,
        date: true,
      },
    });

    existingLogs = await prisma.questLog.findMany({
      where: {
        seasonId: currentSeason.id,
      },
      select: {
        memberId: true,
        date: true,
        status: true,
        proofImageUrl: true,
      },
    });
  }

  const mappedMembers = activeMembers.map((m) => ({
    id: m.id,
    inGameName: m.inGameName,
    nickname: m.nickname,
    discordTag: m.user?.name || "Unknown",
    avatar: m.user?.image || null,
  }));

  const mappedLeaves = approvedLeaves.map((l) => ({
    memberId: l.memberId,
    date: l.date.toISOString(),
  }));

  const mappedLogs = existingLogs.map((l) => ({
    memberId: l.memberId,
    date: l.date.toISOString(),
    status: l.status,
    proofImageUrl: l.proofImageUrl,
  }));

  return (
    <QuestCheckClientPage
      members={mappedMembers}
      approvedLeaves={mappedLeaves}
      existingLogs={mappedLogs}
      activeSeason={
        currentSeason
          ? { id: currentSeason.id, monthYear: currentSeason.monthYear }
          : null
      }
    />
  );
}
