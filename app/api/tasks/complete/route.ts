import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectRisks } from "@/lib/agent/rules";
import { recordActivity } from "@/lib/activity";
import { hasRecentInsight } from "@/lib/notifications";
import { requiredWatchMinutes, VIDEO_COMPLETE_PROGRESS } from "@/lib/constants";
import { isPlaylistUrl, parseVideoProgress } from "@/lib/video";
import { z } from "zod";

const completeTaskSchema = z.object({
  taskId: z.string().min(1),
  actualMinutes: z.number().int().min(1).max(300),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, actualMinutes } = completeTaskSchema.parse(body);

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        learningPlan: {
          include: {
            milestones: { include: { tasks: true } },
          },
        },
      },
    });

    if (!profile || !profile.learningPlan) {
      return NextResponse.json({ error: "No learning plan found" }, { status: 404 });
    }

    // ── Ownership check ─────────────────────────────────────────────
    // Only allow completing a task that actually belongs to this student's plan.
    const task = await prisma.learningTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        milestoneId: true,
        status: true,
        taskType: true,
        estimatedMinutes: true,
        resource: {
          select: { youtubeUrl: true, estimatedMinutes: true },
        },
      },
    });

    const belongsToPlan = profile.learningPlan.milestones.some(
      (m) => m.id === task?.milestoneId
    );
    if (!task || !belongsToPlan) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // ── Idempotency ─────────────────────────────────────────────────
    // A repeated "complete" request (double-click, refresh, retry) must not
    // double-count minutes, progress, or streak.
    if (task.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        progress: profile.learningPlan.overallProgress,
        streak: profile.currentStreak,
        completedMinutes: profile.learningPlan.completedMinutes,
      });
    }

    // ── Anti-cheat: video tasks require real playback ──────────────
    // Single videos are embedded with the YouTube IFrame API and heartbeat
    // progress to /api/tasks/visit. Completion requires at least
    // VIDEO_COMPLETE_PROGRESS (80%) of the video to have actually played,
    // verified server-side. Playlists can't be progress-tracked, so they fall
    // back to the older open-link + minimum dwell-time rule.
    if (task.taskType === "VIDEO" && task.resource?.youtubeUrl) {
      const url = task.resource.youtubeUrl;

      if (isPlaylistUrl(url)) {
        // ── Playlist fallback: open + dwell time ────────────────
        const opened = await prisma.activityLog.findFirst({
          where: {
            studentProfileId: profile.id,
            action: "VIDEO_OPENED",
            details: taskId,
          },
          orderBy: { createdAt: "asc" },
        });

        if (!opened) {
          return NextResponse.json(
            {
              error:
                "Please open the playlist link first — this task can only be completed after you open the video.",
              code: "VIDEO_NOT_OPENED",
            },
            { status: 400 }
          );
        }

        const requiredMin = requiredWatchMinutes(
          task.resource.estimatedMinutes || task.estimatedMinutes || 15
        );
        const elapsedMs = Date.now() - opened.createdAt.getTime();
        const remainingMs = requiredMin * 60 * 1000 - elapsedMs;
        if (remainingMs > 0) {
          const remainingMin = Math.ceil(remainingMs / 60000);
          return NextResponse.json(
            {
              error: `Playlist watch time not reached yet — please spend at least ${requiredMin} minute${requiredMin === 1 ? "" : "s"} with the playlist open. About ${remainingMin} more minute${remainingMin === 1 ? "" : "s"} to go.`,
              code: "VIDEO_WATCH_TIME_NOT_MET",
              remainingMinutes: remainingMin,
            },
            { status: 400 }
          );
        }
      } else {
        // ── Single video: require 80% verified playback ─────────
        const progressLog = await prisma.activityLog.findFirst({
          where: {
            studentProfileId: profile.id,
            action: "VIDEO_PROGRESS",
            details: { contains: taskId },
          },
          // minutesSpent carries the progress value (guarded, monotonic) so
          // ordering by it reads the authoritative max even mid-write.
          orderBy: { minutesSpent: "desc" },
        });
        const progress = parseVideoProgress(progressLog?.details ?? null)?.progress ?? null;

        if (progress === null || progress <= 0) {
          return NextResponse.json(
            {
              error:
                "Please watch the video in the embedded player first — this task can only be completed after at least 80% of the video has played.",
              code: "VIDEO_NOT_OPENED",
              requiredProgress: VIDEO_COMPLETE_PROGRESS,
            },
            { status: 400 }
          );
        }

        if (progress < VIDEO_COMPLETE_PROGRESS) {
          return NextResponse.json(
            {
              error: `Keep watching — completion unlocks at ${VIDEO_COMPLETE_PROGRESS}% of the video. You're at ${Math.round(progress)}%.`,
              code: "VIDEO_PROGRESS_NOT_MET",
              progress: Math.round(progress),
              requiredProgress: VIDEO_COMPLETE_PROGRESS,
            },
            { status: 400 }
          );
        }
      }
    }

    // Update the task
    await prisma.learningTask.update({
      where: { id: taskId },
      data: {
        status: "COMPLETED",
        actualMinutes,
      },
    });

    // Update progress (task is now COMPLETED in the DB snapshot above is stale,
    // so count the just-completed task explicitly)
    const allTasks = profile.learningPlan.milestones.flatMap((m) => m.tasks);
    const completedCount = allTasks.filter(
      (t) => t.status === "COMPLETED" || t.id === taskId
    ).length;
    const totalTasks = allTasks.length;
    const newProgress =
      totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    const newCompletedMinutes = profile.learningPlan.completedMinutes + actualMinutes;

    await prisma.learningPlan.update({
      where: { id: profile.learningPlan.id },
      data: {
        overallProgress: newProgress,
        completedMinutes: newCompletedMinutes,
      },
    });

    // Update streak + totalMinutes (idempotent per calendar day)
    const activity = await recordActivity(profile.id, actualMinutes);
    const newStreak = activity?.currentStreak ?? profile.currentStreak;

    // Log activity
    await prisma.activityLog.create({
      data: {
        studentProfileId: profile.id,
        action: "TASK_COMPLETED",
        details: `Completed task: ${taskId}`,
        minutesSpent: actualMinutes,
      },
    });

    // Check milestone completion
    for (const milestone of profile.learningPlan.milestones) {
      const milestoneCompletedAll = milestone.tasks.every(
        (t) => t.status === "COMPLETED" || t.id === taskId
      );
      if (milestoneCompletedAll && !milestone.isCompleted) {
        await prisma.milestone.update({
          where: { id: milestone.id },
          data: { isCompleted: true },
        });
      }
    }

    // Run agent risk detection
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weeklyLogs = await prisma.activityLog.findMany({
      where: {
        studentProfileId: profile.id,
        createdAt: { gte: weekStart },
        // VIDEO_PROGRESS/VIDEO_OPENED rows carry playback progress (0-100) in
        // minutesSpent, not real minutes — exclude them from weekly totals.
        action: { notIn: ["VIDEO_PROGRESS", "VIDEO_OPENED"] },
      },
    });

    const totalMinutesThisWeek = weeklyLogs.reduce((sum, l) => sum + l.minutesSpent, 0);

    const latestQuiz = await prisma.quizAttempt.findFirst({
      where: { studentProfileId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    const latestCoding = await prisma.codingSubmission.findFirst({
      where: { studentProfileId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    const risks = detectRisks({
      totalMinutesThisWeek,
      plannedMinutesThisWeek: profile.weeklyHours * 60,
      lastActiveDate: new Date(),
      currentStreak: newStreak,
      latestQuizScore: latestQuiz ? latestQuiz.score : null,
      latestCodingPassed: latestCoding ? latestCoding.passed : null,
    });

    // Create new insights (dedupe by risk type + cooldown)
    for (const risk of risks) {
      if (await hasRecentInsight(profile.id, risk.riskType)) continue;

      await prisma.agentInsight.create({
        data: {
          studentProfileId: profile.id,
          riskType: risk.riskType,
          priority: risk.priority,
          signal: risk.signal,
          explanation: risk.explanation,
          recommendedChanges: JSON.stringify(risk.recommendedChanges),
        },
      });
    }

    return NextResponse.json({
      success: true,
      progress: newProgress,
      streak: newStreak,
      completedMinutes: newCompletedMinutes,
    });
  } catch (error) {
    console.error("Task completion error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
