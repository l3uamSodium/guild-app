// types/next-auth.d.ts
// Extend next-auth v4 types ให้มี guild-specific fields

import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      memberId: string | null;
      role: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId: string;
    memberId: string | null;
    memberStatus: string | null;
    role: string | null;
  }
}
