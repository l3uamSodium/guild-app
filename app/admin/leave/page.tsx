import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import AdminLeaveClientPage from "./AdminLeaveClientPage";

export const metadata = {
  title: "Review Leave Requests",
};

export default async function AdminLeavePage() {
  const session = await getSession();

  // Route security: Only admins can view this page
  if (!session || !isAdmin(session)) {
    redirect("/");
  }

  // Fetch all pending leave requests
  const pendingLeaves = await prisma.leaveRequest.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      member: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      season: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch recently reviewed leave requests
  const reviewedLeaves = await prisma.leaveRequest.findMany({
    where: {
      status: {
        in: ["APPROVED", "REJECTED"],
      },
    },
    include: {
      member: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      season: true,
    },
    orderBy: {
      reviewedAt: "desc",
    },
    take: 30, // Limit to recent 30 reviews
  });

  const mapLeaveItem = (l: any) => ({
    id: l.id,
    date: l.date.toISOString(),
    reason: l.reason,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
    reviewedAt: l.reviewedAt ? l.reviewedAt.toISOString() : null,
    member: {
      id: l.member.id,
      inGameName: l.member.inGameName,
      nickname: l.member.nickname,
      discordTag: l.member.user?.name || "Unknown",
      avatar: l.member.user?.image || null,
    },
    season: {
      id: l.season.id,
      monthYear: l.season.monthYear,
    },
  });

  return (
    <AdminLeaveClientPage
      initialPending={pendingLeaves.map(mapLeaveItem)}
      initialReviewed={reviewedLeaves.map(mapLeaveItem)}
    />
  );
}
