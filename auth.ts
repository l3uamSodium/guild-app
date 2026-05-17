// auth.ts — Next-Auth v4 config (root level)
import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // ─── Adapter ────────────────────────────────────────────────────────────────
  // PrismaAdapter จัดการ User, Account, Session, VerificationToken ให้อัตโนมัติ
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  // ─── Providers ──────────────────────────────────────────────────────────────
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],

  // ─── Session Strategy ───────────────────────────────────────────────────────
  // ใช้ database session (เก็บใน Session table) เพราะมี PrismaAdapter แล้ว
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ─── Callbacks ──────────────────────────────────────────────────────────────
  callbacks: {
    /**
     * signIn — เก็บ discordId จาก account.providerAccountId ลงใน User
     * ทำทุกครั้งที่ login เพื่อ sync กรณี user ยังไม่มี discordId
     */
    async signIn({ user, account }) {
      if (account?.provider === "discord" && account.providerAccountId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { discordId: account.providerAccountId },
        });
      }
      return true;
    },

    /**
     * session — เพิ่ม user.id, memberId, role ลง session
     * ดึง Member record เพื่อให้ middleware และ Server Components ใช้ role ได้
     */
    async session({ session, user }) {
      // user.id มาจาก database session (ไม่ใช่ JWT)
      session.user.id = user.id;

      // ดึง Member record (อาจ null ถ้ายังไม่ได้ทำ onboarding)
      const member = await prisma.member.findUnique({
        where: { userId: user.id },
        select: { id: true, role: true },
      });

      session.user.memberId = member?.id ?? null;
      session.user.role = member?.role ?? null;

      return session;
    },
  },

  // ─── Pages ──────────────────────────────────────────────────────────────────
  pages: {
    signIn: "/",          // Landing page มีปุ่ม Login Discord
    error: "/",           // Auth error → กลับ landing
  },

  // ─── Secret ─────────────────────────────────────────────────────────────────
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
