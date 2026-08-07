import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Records real learning activity (task completion, quiz, coding submission)
 * for a student and updates streak fields + totalMinutes atomically.
 *
 * Streak rules — idempotent per calendar day, so repeated refreshes or
 * duplicate requests can never inflate the streak:
 *   - First ever activity          -> streak = 1
 *   - Activity later on the SAME day -> streak unchanged (already counted)
 *   - Activity exactly 1 day after last -> streak + 1 (consecutive day)
 *   - Gap of 2+ days              -> streak resets to 1
 *
 * Also accumulates `totalMinutes` and refreshes `lastActiveDate`.
 * Returns the updated streak state, or null when the profile doesn't exist.
 */
export async function recordActivity(
  profileId: string,
  minutesSpent: number
): Promise<{ currentStreak: number; longestStreak: number } | null> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: profileId },
  });
  if (!profile) return null;

  const today = startOfDay(new Date());
  const lastActive = profile.lastActiveDate
    ? startOfDay(new Date(profile.lastActiveDate))
    : null;

  let newStreak = profile.currentStreak;
  if (!lastActive) {
    newStreak = 1;
  } else if (lastActive.getTime() !== today.getTime()) {
    if (today.getTime() - lastActive.getTime() === DAY_MS) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }
  // lastActive === today -> same-day duplicate activity, streak unchanged.

  const updated = await prisma.studentProfile.update({
    where: { id: profileId },
    data: {
      totalMinutes: { increment: Math.max(0, Math.round(minutesSpent)) },
      currentStreak: newStreak,
      longestStreak: Math.max(profile.longestStreak, newStreak),
      lastActiveDate: new Date(),
    },
  });

  return {
    currentStreak: updated.currentStreak,
    longestStreak: updated.longestStreak,
  };
}
