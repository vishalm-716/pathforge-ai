import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Singleton Prisma client.
 *
 * - Reads DATABASE_URL from the environment (Prisma datasource). The same
 *   client works for local PostgreSQL and Vercel's hosted Postgres without
 *   schema changes.
 * - The `global` cache prevents exhausting connections during `next dev` hot
 *   reloads. In production the module is only loaded once per serverless
 *   instance, so each cold start gets exactly one client.
 * - `datasourceUrl` is passed explicitly so misconfiguration surfaces as a
 *   clear Prisma error instead of a silent undefined URL.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
