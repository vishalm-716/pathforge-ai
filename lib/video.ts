/**
 * Shared helpers for YouTube video tasks — used by the API routes and the
 * student task page so parsing/verification logic lives in one place.
 */

/** True for playlist URLs, which can't be embedded/progress-tracked. */
export function isPlaylistUrl(url: string): boolean {
  return url.includes("/playlist") || url.includes("list=");
}

/** Extract a single video id from common YouTube URL shapes, or null. */
export function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    const v = u.searchParams.get("v");
    if (v) return v;
    if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
    if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
  } catch {
    // fall through
  }
  return null;
}

/**
 * Parse the progress payload stored by /api/tasks/visit heartbeats
 * (JSON: { taskId, progress, secondsWatched }).
 */
export function parseVideoProgress(
  details: string | null | undefined
): { progress: number; secondsWatched: number } | null {
  if (!details) return null;
  try {
    const parsed = JSON.parse(details);
    if (typeof parsed.progress !== "number") return null;
    return {
      progress: Math.min(100, Math.max(0, parsed.progress)),
      secondsWatched:
        typeof parsed.secondsWatched === "number" ? parsed.secondsWatched : 0,
    };
  } catch {
    return null;
  }
}
