import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectRisks } from "@/lib/agent/rules";
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

    // Update the task
    await prisma.learningTask.update({
      where: { id: taskId },
      data: {
        status: "COMPLETED",
        actualMinutes,
      },
    });

    // Update progress
    const allTasks = profile.learningPlan.milestones.flatMap((m) => m.tasks);
    const completedCount = allTasks.filter((t) => t.status === "COMPLETED").length + 1;
    const totalTasks = allTasks.length;
    const newProgress = Math.round((completedCount / totalTasks) * 100);
    const newCompletedMinutes = profile.learningPlan.completedMinutes + actualMinutes;

    await prisma.learningPlan.update({
      where: { id: profile.learningPlan.id },
      data: {
        overallProgress: newProgress,
        completedMinutes: newCompletedMinutes,
      },
    });

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = profile.lastActiveDate
      ? new Date(profile.lastActiveDate)
      : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    let newStreak = profile.currentStreak;
    if (!lastActive || lastActive.getTime() < today.getTime()) {
      if (
        lastActive &&
        today.getTime() - lastActive.getTime() <= 2 * 24 * 60 * 60 * 1000
      ) {
        newStreak += 1;
      } else if (!lastActive) {
        newStreak = 1;
      } else {
        newStreak = 1;
      }
    }

    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        totalMinutes: profile.totalMinutes + actualMinutes,
        currentStreak: newStreak,
        longestStreak: Math.max(profile.longestStreak, newStreak),
        lastActiveDate: new Date(),
      },
    });

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
      const milestoneTasks = milestone.tasks;
      const milestoneCompletedAll = milestoneTasks.every(
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

    // Create new insights (avoid duplicates)
    for (const risk of risks) {
      const existingInsight = await prisma.agentInsight.findFirst({
        where: {
          studentProfileId: profile.id,
          riskType: risk.riskType,
          status: "PENDING",
        },
      });

      if (!existingInsight) {
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
