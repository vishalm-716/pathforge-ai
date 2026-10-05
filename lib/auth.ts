import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    role: UserRole;
  }
}

declare module "next-auth" {
  interface JWT {
    role: UserRole;
    id: string;
  }
}

// ── Brute-force protection for the credentials (admin) provider ─────────
// Lightweight in-memory limiter: 5 failed attempts per email per 15 minutes.
// Note: in serverless (Vercel) this is per-instance memory — it still raises
// the bar and should be paired with a hosted rate limiter for hard guarantees.
const LOGIN_ATTEMPTS = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function isLoginRateLimited(key: string): boolean {
  const entry = LOGIN_ATTEMPTS.get(key);
  return !!entry && entry.resetAt > Date.now() && entry.count >= MAX_LOGIN_ATTEMPTS;
}

function recordFailedLogin(key: string) {
  // Opportunistically prune expired entries so the map stays bounded on
  // long-running instances.
  if (LOGIN_ATTEMPTS.size > 1000) {
    const now = Date.now();
    for (const [k, v] of LOGIN_ATTEMPTS) {
      if (v.resetAt < now) LOGIN_ATTEMPTS.delete(k);
    }
  }

  const now = Date.now();
  const entry = LOGIN_ATTEMPTS.get(key);
  if (!entry || entry.resetAt < now) {
    LOGIN_ATTEMPTS.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearFailedLogins(key: string) {
  LOGIN_ATTEMPTS.delete(key);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const emailKey = (credentials.email as string).toLowerCase().trim();
        if (isLoginRateLimited(emailKey)) return null;

        // Case-insensitive lookup so accounts stored with mixed-case emails
        // keep working (lowercase is used only for the rate-limit key).
        const user = await prisma.user.findFirst({
          where: { email: { equals: emailKey, mode: "insensitive" } },
        });

        if (!user || !user.password) {
          recordFailedLogin(emailKey);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          recordFailedLogin(emailKey);
          return null;
        }

        clearFailedLogins(emailKey);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { studentProfile: true },
        });

        if (existingUser && existingUser.role !== "ADMIN" && !existingUser.studentProfile) {
          await prisma.studentProfile.create({
            data: { userId: existingUser.id },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role;
        token.id = user.id!;
      }
      if (trigger === "signIn" || trigger === "signUp") {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create student profile for new Google sign-ups
      if (user.id) {
        const existing = await prisma.studentProfile.findUnique({
          where: { userId: user.id },
        });
        if (!existing) {
          await prisma.studentProfile.create({
            data: { userId: user.id },
          });
        }
      }
    },
  },
});
