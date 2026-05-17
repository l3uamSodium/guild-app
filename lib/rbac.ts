// lib/rbac.ts
// Role-Based Access Control helpers — ใช้ใน Server Actions และ Server Components

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import type { Session } from "next-auth";
import type { Role } from "@/generated/prisma/client";

// ─── Types ───────────────────────────────────────────────────────────────────────

export type AuthSession = Session | null;

// ─── checkRole ───────────────────────────────────────────────────────────────
/**
 * ตรวจสอบว่า session มี role ที่ต้องการหรือไม่
 * @returns boolean — ไม่ throw
 */
export function checkRole(
  session: AuthSession,
  role: string | string[]
): boolean {
  if (!session?.user?.role) return false;
  const allowed = Array.isArray(role) ? role : [role];
  return allowed.includes(session.user.role);
}

// ─── requireRole ─────────────────────────────────────────────────────────────
/**
 * ใช้ใน Server Actions — throw Error ถ้า role ไม่ตรง
 * @throws Error("UNAUTHORIZED")
 */
export async function requireRole(role: string | string[]): Promise<AuthSession> {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }

  if (!checkRole(session, role)) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

// ─── getSession ───────────────────────────────────────────────────────────────
/**
 * Wrapper สั้นๆ สำหรับดึง session ใน Server Components
 */
export async function getSession(): Promise<AuthSession> {
  return getServerSession(authOptions);
}

// ─── isAdmin ──────────────────────────────────────────────────────────────────
/**
 * ตรวจสอบว่า user เป็น admin (GUILD_MASTER หรือ VICE_MASTER)
 */
export function isAdmin(session: AuthSession): boolean {
  return checkRole(session, ["GUILD_MASTER", "VICE_MASTER"]);
}
