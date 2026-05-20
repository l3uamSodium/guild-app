import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/rbac";
import { getCurrentSeason } from "@/lib/season";
import { redirect } from "next/navigation";
import LeaveClientPage from "./LeaveClientPage";

export const metadata = {
  title: "แจ้งพักกิจกรรม - ONIZUKA",
};

export default async function MemberLeavePage() {
  const session = await getSession();
  const memberId = session?.user?.memberId;
  const status = session?.user?.memberStatus;

  // Route security: Only active members can view this page
  if (!session || !memberId || status !== "ACTIVE") {
    redirect("/");
  }

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

  const currentSeason = await getCurrentSeason();
  
  // Fetch history of leave requests for the member in the current season
  let history: any[] = [];
  if (currentSeason) {
    const rawHistory = await prisma.leaveRequest.findMany({
      where: {
        memberId,
        seasonId: currentSeason.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    history = rawHistory.map((h) => ({
      id: h.id,
      date: h.date.toISOString(),
      reason: h.reason,
      status: h.status,
      createdAt: h.createdAt.toISOString(),
    }));
  }

  return (
    <LeaveClientPage
      initialHistory={history}
      hasActiveSeason={!!currentSeason}
      currentSeasonMonthYear={currentSeason ? currentSeason.monthYear : null}
      memberInfo={{
        inGameName: member.inGameName,
        role: member.role,
        avatarUrl: member.user?.image,
      }}
    />
  );
}
