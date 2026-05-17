// proxy.ts — Next.js 16 Route Protection (previously middleware.ts)
// ทำงาน Edge Runtime: ทุก request ผ่านที่นี่ก่อน

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Public Routes (ไม่ต้อง auth) ───────────────────────────────────────────
const PUBLIC_ROUTES = ["/", "/api/auth"];

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

// ─── Middleware Logic ─────────────────────────────────────────────────────────
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // 1. Public routes → ผ่านได้เสมอ
    if (isPublic(pathname)) {
      return NextResponse.next();
    }

    // 2. ไม่มี token → redirect /  (landing + login)
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const memberId = token.memberId as string | null;
    const memberStatus = token.memberStatus as string | null;
    const role = token.role as string | null;

    // 3. ไม่มี Member record → redirect /onboarding
    if (!memberId && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // 4. Member.status = PENDING → redirect /pending
    if (memberStatus === "PENDING" && pathname !== "/pending") {
      return NextResponse.redirect(new URL("/pending", req.url));
    }

    // 5. Member.status = INACTIVE → redirect /deactivated
    if (memberStatus === "INACTIVE" && pathname !== "/deactivated") {
      return NextResponse.redirect(new URL("/deactivated", req.url));
    }

    // 6. เข้า /admin/* แต่ไม่ใช่ GUILD_MASTER หรือ VICE_MASTER → redirect /dashboard
    if (
      pathname.startsWith("/admin") &&
      role !== "GUILD_MASTER" &&
      role !== "VICE_MASTER"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    // next-auth/middleware จะ inject token ให้ผ่าน req.nextauth.token
    callbacks: {
      authorized: () => true, // จัดการ auth logic ข้างบนเอง
    },
  }
);

// ─── Matcher ─────────────────────────────────────────────────────────────────
// ทำงานทุก route ยกเว้น static files และ _next internals
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
