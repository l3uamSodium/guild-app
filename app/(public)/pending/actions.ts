"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

/**
 * Checks the current real-time status of the logged-in member in the database.
 * This is used for polling to automatically redirect members once approved.
 */
export async function checkMemberStatus() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { status: "UNAUTHENTICATED" };
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { status: true },
  });

  return { status: member?.status || "NOT_REGISTERED" };
}
