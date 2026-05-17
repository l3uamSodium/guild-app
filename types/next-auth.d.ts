// types/next-auth.d.ts
// Extend next-auth v4 Session type ให้มี role และ memberId

import { Role } from "@/generated/prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      memberId: string | null;
      role: Role | null;
    } & DefaultSession["user"];
  }
}
