import { prisma } from "@/lib/prisma";
import type { RiskType } from "@prisma/client";

/** Re-alert cooldown for the same risk type (any status). */
const INSIGHT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Creates a notification unless an identical one (same title + type) was
 * created for the student within the dedupe window. Prevents duplicate
 * notifications for the same event (track switch, plan update, streak event,
 * risk alert) when a request is retried or double-submitted.
 *
 * Returns true when a new notification was created, false when suppressed.
 */
export async function createNotificationIfNeeded(params: {
  studentProfileId: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string | null;
  dedupeMinutes?: number;
}): Promise<boolean> {
  const { studentProfileId, title, message, type, actionUrl } = params;
  const windowMs = (params.dedupeMinutes ?? 30) * 60 * 1000;
  const since = new Date(Date.now() - windowMs);

  // Dedupe on the exact content too, so two genuinely different events (e.g.
  // switching to a different track) are not suppressed, only true duplicates.
  const existing = await prisma.notification.findFirst({
    where: {
      studentProfileId,
      title,
      type,
      message,
      createdAt: { gte: since },
    },
  });
  if (existing) return false;

  await prisma.notification.create({
    data: { studentProfileId, title, message, type, actionUrl },
  });
  return true;
}

/**
 * True when a risk of the same type should NOT be raised again:
 *  - an open PENDING insight already exists, or
 *  - a resolved insight of the same type was created within the cooldown.
 *
 * Used before creating agent insights so the same signal does not produce
 * repeated alerts for the same student.
 */
export async function hasRecentInsight(
  studentProfileId: string,
  riskType: RiskType
): Promise<boolean> {
  const since = new Date(Date.now() - INSIGHT_COOLDOWN_MS);
  const existing = await prisma.agentInsight.findFirst({
    where: {
      studentProfileId,
      riskType,
      OR: [{ status: "PENDING" }, { createdAt: { gte: since } }],
    },
  });
  return !!existing;
}
