import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        learningPlan: {
          include: {
            milestones: {
              include: {
                tasks: {
                  include: { resource: true },
                  orderBy: { orderIndex: "asc" },
                },
              },
              orderBy: { weekNumber: "asc" },
            },
            track: true,
          },
        },
        agentInsights: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        notifications: {
          where: { isRead: false },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get upcoming tasks (not completed)
    const upcomingTasks = profile.learningPlan?.milestones
      .flatMap((m) => m.tasks)
      .filter((t) => t.status !== "COMPLETED" && t.status !== "SKIPPED")
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5) || [];

    const dashboardData = {
      profile: {
        id: profile.id,
        domain: profile.domain,
        currentLevel: profile.currentLevel,
        weeklyHours: profile.weeklyHours,
        targetWeeks: profile.targetWeeks,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        totalMinutes: profile.totalMinutes,
        onboardingDone: profile.onboardingDone,
        lastActiveDate: profile.lastActiveDate,
        learningStyle: profile.learningStyle,
      },
      plan: profile.learningPlan
        ? {
            id: profile.learningPlan.id,
            goal: profile.learningPlan.goal,
            targetDuration: profile.learningPlan.targetDuration,
            overallProgress: profile.learningPlan.overallProgress,
            plannedMinutes: profile.learningPlan.plannedMinutes,
            completedMinutes: profile.learningPlan.completedMinutes,
            startDate: profile.learningPlan.startDate,
            endDate: profile.learningPlan.endDate,
            trackTitle: profile.learningPlan.track.title,
            milestones: profile.learningPlan.milestones,
          }
        : null,
      upcomingTasks,
      pendingInsight: profile.agentInsights[0] || null,
      notifications: profile.notifications,
      recentActivity: profile.activityLogs,
      userName: session.user.name,
      userImage: session.user.image,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
