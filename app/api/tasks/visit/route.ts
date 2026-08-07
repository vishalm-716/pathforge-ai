import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseVideoProgress } from "@/lib/video";
import {
  VIDEO_HEARTBEAT_MAX_SPEED,
  VIDEO_HEARTBEAT_GRACE_SECONDS,
} from "@/lib/constants";
import { z } from "zod";

const visitSchema = z.object({
  taskId: z.string().min(1),
});

const heartbeatSchema = z.object({
  taskId: z.string().min(1),
  progress: z.number().min(0).max(100),
  secondsWatched: z.number().min(0),
});

/**
 * Returns the task (with resource) only when it belongs to the student's
 * active plan and is a VIDEO task that has a YouTube link to verify.
 */
async function resolveVideoTask(studentProfileId: string, taskId: string) {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    include: {
      learningPlan: {
        include: { milestones: { include: { tasks: true } } },
      },
    },
  });
  if (!profile?.learningPlan) return null;

  const task = await prisma.learningTask.findUnique({
    where: { id: taskId },
    include: { resource: true },
  });
  const belongsToPlan = profile.learningPlan.milestones.some(
    (m) => m.id === task?.milestoneId
  );
  if (!task || !belongsToPlan || task.taskType !== "VIDEO") return null;
  if (!task.resource?.youtubeUrl) return null;
  return task;
}

/**
 * GET /api/tasks/visit?taskId=... — returns whether the student opened the
 * video, when, and the highest verified playback progress so far, so the page
 * can restore state on refresh.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId") || "";

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (!(await resolveVideoTask(profile.id, taskId))) {
      return NextResponse.json({ error: "Video task not found" }, { status: 404 });
    }

    const opened = await prisma.activityLog.findFirst({
      where: {
        studentProfileId: profile.id,
        action: "VIDEO_OPENED",
        details: taskId,
      },
      orderBy: { createdAt: "asc" },
    });

    const progressLog = await prisma.activityLog.findFirst({
      where: {
        studentProfileId: profile.id,
        action: "VIDEO_PROGRESS",
        details: { contains: taskId },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = parseVideoProgress(progressLog?.details);

    return NextResponse.json({
      opened: !!opened,
      openedAt: opened?.createdAt ?? null,
      progress: parsed?.progress ?? 0,
      secondsWatched: parsed?.secondsWatched ?? 0,
    });
  } catch (error) {
    console.error("Video visit check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/tasks/visit
 *
 * Two modes:
 *  - { taskId }                    → records that the student opened the video
 *                                    link. Idempotent — the first timestamp wins
 *                                    so the clock can't be reset by re-clicking.
 *  - { taskId, progress, secondsWatched } → heartbeat from the embedded
 *                                    YouTube player. The server stores the
 *                                    HIGHEST progress seen for the task, and
 *                                    rejects heartbeats whose watched seconds
 *                                    exceed the wall-clock time since the video
 *                                    was opened (allowing up to 1.75x speed
 *                                    plus a grace window). This prevents faked
 *                                    progress without actually playing.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Strict mode detection: if the body carries EITHER playback field, it is
    // a heartbeat and must validate as one (a malformed heartbeat — wrong
    // types — fails with a 400 instead of silently becoming an open record).
    const isHeartbeat =
      body &&
      ("progress" in body || "secondsWatched" in body);

    const parsed = isHeartbeat ? heartbeatSchema : visitSchema;
    const { taskId } = parsed.parse(body);

    const task = await resolveVideoTask(profile.id, taskId);
    if (!task) {
      return NextResponse.json(
        { error: "Video task not found" },
        { status: 404 }
      );
    }

    const opened = await prisma.activityLog.findFirst({
      where: {
        studentProfileId: profile.id,
        action: "VIDEO_OPENED",
        details: taskId,
      },
      orderBy: { createdAt: "asc" },
    });

    // ── Mode 1: record the open ────────────────────────────────────
    if (!isHeartbeat) {
      if (!opened) {
        await prisma.activityLog.create({
          data: {
            studentProfileId: profile.id,
            action: "VIDEO_OPENED",
            details: taskId,
            minutesSpent: 0,
          },
        });
      }
      return NextResponse.json({
        success: true,
        opened: true,
        openedAt: opened?.createdAt ?? new Date(),
      });
    }

    // ── Mode 2: playback heartbeat ─────────────────────────────────
    const heartbeat = heartbeatSchema.parse(body);
    const { progress, secondsWatched } = heartbeat;

    // Heartbeats before the video was ever opened are invalid — the player
    // must have been started first.
    if (!opened) {
      return NextResponse.json(
        {
          error: "Open the video first before reporting playback.",
          code: "VIDEO_NOT_OPENED",
        },
        { status: 400 }
      );
    }

    // Plausibility: watched seconds can't exceed real elapsed time since the
    // video was opened (× max playback speed + grace). Prevents a student from
    // claiming 80% the instant the page loads.
    const elapsedSeconds = (Date.now() - opened.createdAt.getTime()) / 1000;
    const maxPlausibleSeconds =
      elapsedSeconds * VIDEO_HEARTBEAT_MAX_SPEED +
      VIDEO_HEARTBEAT_GRACE_SECONDS;

    if (secondsWatched > maxPlausibleSeconds) {
      return NextResponse.json(
        {
          error: "Playback progress could not be verified — watch the video in the embedded player.",
          code: "VIDEO_HEARTBEAT_IMPLAUSIBLE",
        },
        { status: 400 }
      );
    }

    // Store the highest progress seen for this task. The update is guarded by
    // `minutesSpent < progress` so two concurrent heartbeats can never regress
    // the stored max (read-compare-write without the guard would race).
    // minutesSpent intentionally carries the progress value (0–100) — it is
    // excluded from weekly-minute totals by consumers via the VIDEO_PROGRESS
    // action.
    const existing = await prisma.activityLog.findFirst({
      where: {
        studentProfileId: profile.id,
        action: "VIDEO_PROGRESS",
        details: { contains: taskId },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      await prisma.activityLog.updateMany({
        where: {
          id: existing.id,
          minutesSpent: { lt: progress },
        },
        data: {
          details: JSON.stringify({ taskId, progress, secondsWatched }),
          minutesSpent: Math.round(progress),
        },
      });
    } else {
      await prisma.activityLog.create({
        data: {
          studentProfileId: profile.id,
          action: "VIDEO_PROGRESS",
          details: JSON.stringify({ taskId, progress, secondsWatched }),
          minutesSpent: Math.round(progress),
        },
      });
    }

    // Re-read the authoritative stored value (guarded update may have skipped
    // a stale lower heartbeat).
    const stored = await prisma.activityLog.findFirst({
      where: {
        studentProfileId: profile.id,
        action: "VIDEO_PROGRESS",
        details: { contains: taskId },
      },
      orderBy: { minutesSpent: "desc" },
    });
    const storedParsed = parseVideoProgress(stored?.details);

    return NextResponse.json({
      success: true,
      progress: storedParsed?.progress ?? progress,
      secondsWatched: storedParsed?.secondsWatched ?? secondsWatched,
    });
  } catch (error) {
    console.error("Video visit error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
