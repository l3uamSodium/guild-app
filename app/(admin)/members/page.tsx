import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import MembersClientPage from "./MembersClientPage";

export default async function MembersPage(props: {
  searchParams: Promise<{ tab?: string }> | { tab?: string };
}) {
  const session = await getSession();

  // Route security: Only admins can view this page
  if (!session || !isAdmin(session)) {
    redirect("/");
  }

  const resolvedSearchParams = await props.searchParams;
  const currentTab = resolvedSearchParams.tab === "active" ? "active" : "pending";

  // Fetch all pending members
  const pendingMembers = await prisma.member.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all active members
  const activeMembers = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map database format to client friendly format
  const mappedPending = pendingMembers.map(m => ({
    id: m.id,
    inGameName: m.inGameName,
    nickname: m.nickname,
    discordTag: m.user?.name || m.user?.email || "Unknown User",
    avatar: m.user?.image || null,
    createdAt: m.createdAt.toISOString(),
  }));

  const mappedActive = activeMembers.map(m => ({
    id: m.id,
    inGameName: m.inGameName,
    nickname: m.nickname,
    discordTag: m.user?.name || m.user?.email || "Unknown User",
    avatar: m.user?.image || null,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <MembersClientPage
      initialPending={mappedPending}
      initialActive={mappedActive}
      defaultTab={currentTab}
    />
  );
}
