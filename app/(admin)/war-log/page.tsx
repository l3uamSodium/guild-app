import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import WarLogClientPage from "./WarLogClientPage";

export const metadata = {
  title: "บันทึกกิลด์วอร์ - ONIZUKA",
};

export default async function WarLogPage() {
  const session = await getSession();

  // Route security: Only admins (Guild Master, Vice Master) can view this page
  if (!session || !isAdmin(session)) {
    redirect("/");
  }

  // 1. Fetch active season
  const activeSeason = await prisma.guildSeason.findFirst({
    where: { isOpen: true },
  });

  // 2. Fetch all active members
  const activeMembers = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      inGameName: true,
      nickname: true,
      role: true,
      user: {
        select: {
          image: true,
        },
      },
    },
    orderBy: {
      inGameName: "asc",
    },
  });

  // 3. Fetch all war logs for the active season (if any)
  const warLogs = activeSeason
    ? await prisma.warLog.findMany({
        where: { seasonId: activeSeason.id },
      })
    : [];

  // Map data to be JSON-serializable
  const mappedMembers = activeMembers.map((m) => ({
    id: m.id,
    inGameName: m.inGameName,
    nickname: m.nickname,
    role: m.role,
    avatar: m.user?.image || null,
  }));

  const mappedSeason = activeSeason
    ? {
        id: activeSeason.id,
        monthYear: activeSeason.monthYear,
        isOpen: activeSeason.isOpen,
      }
    : null;

  const mappedWarLogs = warLogs.map((log) => ({
    id: log.id,
    memberId: log.memberId,
    seasonId: log.seasonId,
    date: log.date.toISOString(),
    status: log.status,
  }));

  return (
    <WarLogClientPage
      activeSeason={mappedSeason}
      activeMembers={mappedMembers}
      initialWarLogs={mappedWarLogs}
    />
  );
}
