import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import SeasonsClientPage from "./SeasonsClientPage";

export const metadata = {
  title: "Season Management",
};

export default async function SeasonsPage() {
  const session = await getSession();

  // Route security: Only admins (Guild Master, Vice Master) can view this page
  if (!session || !isAdmin(session)) {
    redirect("/");
  }

  // Fetch all seasons from database
  const seasons = await prisma.guildSeason.findMany({
    include: {
      snapshot: true,
    },
    orderBy: {
      monthYear: "desc",
    },
  });

  // Map seasons data for client consumption
  const mappedSeasons = seasons.map((s) => ({
    id: s.id,
    monthYear: s.monthYear,
    isOpen: s.isOpen,
    createdAt: s.createdAt.toISOString(),
    closedAt: s.closedAt ? s.closedAt.toISOString() : null,
    snapshot: s.snapshot
      ? {
          id: s.snapshot.id,
          data: s.snapshot.data as {
            mvp: string;
            topMembers: string[];
            stats: {
              totalMembers: number;
              doneQuests: number;
              absentQuests: number;
              leaveQuests: number;
            };
          },
        }
      : null,
  }));

  return <SeasonsClientPage initialSeasons={mappedSeasons} userRole={session.user.role || "MEMBER"} />;
}
