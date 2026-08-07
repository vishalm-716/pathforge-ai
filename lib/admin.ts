import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Verifies the current session belongs to a real ADMIN user in the database.
 * Returns the admin user (with password excluded) or null when the request is
 * unauthenticated or the user is not an admin. Admin routes should respond
 * 403 when this returns null.
 *
 * Centralizes the previously copy-pasted `checkAdmin` logic so every admin
 * route enforces the same authorization.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || user.role !== "ADMIN") return null;

  return user;
}
