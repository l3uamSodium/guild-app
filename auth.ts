// auth.ts — Next-Auth v4 config (root level)
import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  // ─── Providers ──────────────────────────────────────────────────────────────
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],

  // ─── Session Strategy ───────────────────────────────────────────────────────
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  // ─── Callbacks ──────────────────────────────────────────────────────────────
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        token.userId = user.id;

        // Sync discordId ตอน sign-in ครั้งแรก
        if (account.provider === "discord" && account.providerAccountId) {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { discordId: account.providerAccountId },
            });
          } catch {
            // ignore
          }
        }

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

    async session({ session, token }) {
      session.user.id = (token.userId as string) ?? "";
      session.user.memberId = (token.memberId as string) ?? null;
      session.user.role = (token.role as string) ?? null;
      return session;
    },
  },

  // ─── Pages ──────────────────────────────────────────────────────────────────
  pages: {
    signIn: "/",
    error: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
