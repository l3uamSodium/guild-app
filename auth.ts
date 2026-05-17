// auth.ts — Next-Auth v4 config (root level)
import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // ─── Adapter ────────────────────────────────────────────────────────────────
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  // ─── Providers ──────────────────────────────────────────────────────────────
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],

  // ─── Session Strategy ───────────────────────────────────────────────────────
  // ใช้ JWT เพื่อให้ middleware (Edge Runtime) อ่าน token ได้โดยไม่ต้องแตะ DB
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ─── Callbacks ──────────────────────────────────────────────────────────────
  callbacks: {
    /**
     * signIn — เก็บ discordId จาก account.providerAccountId ลงใน User
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
     * jwt — encode memberId, memberStatus, role ลง JWT token
     * ทำงานทุกครั้งที่ token ถูก create หรือ update
     */
    async jwt({ token, user }) {
      // `user` มีค่าเฉพาะตอน sign-in ครั้งแรก
      if (user) {
        token.userId = user.id;

        const member = await prisma.member.findUnique({
          where: { userId: user.id },
          select: { id: true, role: true, status: true },
        });

        token.memberId = member?.id ?? null;
        token.memberStatus = member?.status ?? null;
        token.role = member?.role ?? null;
      }
      return token;
    },

    /**
     * session — map JWT token fields ลง session object
     * ใช้ใน Server Components ผ่าน getServerSession()
     */
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.memberId = (token.memberId as string | null) ?? null;
      session.user.role = (token.role as string | null) ?? null;
      return session;
    },
  },

  // ─── Pages ──────────────────────────────────────────────────────────────────
  pages: {
    signIn: "/",
    error: "/",
  },

  // ─── Secret ─────────────────────────────────────────────────────────────────
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
