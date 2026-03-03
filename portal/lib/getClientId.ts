import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Returns the effective clientId for the given user.
 * - CLIENT role: returns their own clientId (or null if unlinked).
 * - ADMIN role: returns the first available client's id so admins
 *   can preview all dashboard pages without being bounced to /admin.
 */
export const getEffectiveClientId = cache(async function getEffectiveClientId(user: {
  role?: string;
  clientId?: string;
}): Promise<string | null> {
  if (user.clientId) return user.clientId;
  if (user.role === "ADMIN") {
    const first = await prisma.client.findFirst({ orderBy: { createdAt: "asc" } });
    return first?.id ?? null;
  }
  return null;
});
