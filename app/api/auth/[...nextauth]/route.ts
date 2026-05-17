// app/api/auth/[...nextauth]/route.ts
// Next.js App Router — delegate all /api/auth/* requests to NextAuth handler

import NextAuth from "next-auth";
import { authOptions } from "@/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
