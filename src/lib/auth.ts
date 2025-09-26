import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
  providers.push(
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: "2.0",
    })
  );
}

// Always include CredentialsProvider to support email/password logins alongside OAuth
providers.push(
  CredentialsProvider({
    name: "Email+Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const email = String(credentials.email).toLowerCase();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;
      const ok = await compare(String(credentials.password), user.passwordHash);
      if (!ok) return null;
      return { id: user.id, name: user.name ?? email, email } as any;
    },
  })
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // attach role from DB on initial sign in
        const dbUser = await prisma.user.findUnique({ where: { id: user.id as string } });
        let role = dbUser?.role || "USER";
        // optional: promote to ADMIN if email matches allowlist
        const allow = (process.env.ADMIN_EMAILS || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        if (user.email && allow.includes(user.email.toLowerCase()) && role !== "ADMIN") {
          await prisma.user.update({ where: { id: user.id as string }, data: { role: "ADMIN" as any } });
          role = "ADMIN";
        }
        token.role = role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role || "USER";
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always land on homepage after a successful sign-in/sign-out unless an internal relative path is provided
      try {
        // Allow relative redirects (e.g., /admin)
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        const parsed = new URL(url);
        if (parsed.origin === baseUrl) return url;
      } catch (_) {
        // ignore parse errors and fall back
      }
      return `${baseUrl}/`;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  cookies: {
    // default cookies are fine on Vercel/HTTPS; customize if needed
  },
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
  // Provide a safe development fallback to avoid crashes when NEXTAUTH_SECRET isn't set locally.
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === "development" ? "devsecret" : undefined),
};
