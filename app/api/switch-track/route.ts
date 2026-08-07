import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePlanWithResources, getDomainDisplayName } from "@/lib/agent/plan-generator";
import { createNotificationIfNeeded } from "@/lib/notifications";
import { z } from "zod";
import { Difficulty } from "@prisma/client";

const switchSchema = z.object({
  domain: z.string().min(1),
  currentLevel: z.enum(["BEGINNER", "INTERMEDIATE"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = switchSchema.parse(body);

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        learningPlan: { include: { track: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // ── Log the old track in activity before switching ────────
    const oldDomain = profile.domain;
    const oldTrackTitle = profile.learningPlan?.track.title || oldDomain;

    if (oldDomain) {
      await prisma.activityLog.create({
        data: {
          studentProfileId: profile.id,
          action: "TRACK_SWITCHED",
          details: `Paused ${oldTrackTitle} (progress: ${profile.learningPlan?.overallProgress || 0}%). Switched to ${getDomainDisplayName(data.domain)}.`,
        },
      });
    }

    // ── Delete existing plan (archive via activity log above) ─
    if (profile.learningPlan) {
      await prisma.learningPlan.delete({
        where: { id: profile.learningPlan.id },
      });
    }

    // ── Find or create the new track ──────────────────────────
    let track = await prisma.track.findFirst({
      where: { slug: data.domain.toLowerCase() },
    });

    if (!track) {
      track = await prisma.track.create({
        data: {
          title: getDomainDisplayName(data.domain),
          slug: data.domain.toLowerCase(),
          description: `Learn ${getDomainDisplayName(data.domain)} from scratch with curated resources.`,
          difficulty: data.currentLevel as Difficulty,
          estimatedHours: profile.weeklyHours * profile.targetWeeks,
        },
      });
    }

    // ── Update profile ────────────────────────────────────────
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        domain: data.domain,
        currentLevel: data.currentLevel as Difficulty,
      },
    });

    // ── Generate new plan ─────────────────────────────────────
    const milestones = await generatePlanWithResources(
      {
        domain: data.domain,
        currentLevel: data.currentLevel,
        weeklyHours: profile.weeklyHours,
        targetWeeks: profile.targetWeeks,
        learningStyle: profile.learningStyle,
      },
      prisma
    );

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + profile.targetWeeks * 7);

    const totalPlannedMinutes = milestones.reduce(
      (sum, m) => sum + m.tasks.reduce((s, t) => s + t.estimatedMinutes, 0),
      0
    );

    const plan = await prisma.learningPlan.create({
      data: {
        studentProfileId: profile.id,
        trackId: track.id,
        goal: `Master ${getDomainDisplayName(data.domain)}`,
        targetDuration: profile.targetWeeks,
        plannedMinutes: totalPlannedMinutes,
        startDate,
        endDate,
        milestones: {
          create: milestones.map((m) => {
            const milestoneDate = new Date(startDate);
            milestoneDate.setDate(milestoneDate.getDate() + m.weekNumber * 7);

            return {
              title: m.title,
              weekNumber: m.weekNumber,
              description: m.description,
              dueDate: milestoneDate,
              tasks: {
                create: m.tasks.map((t, index) => {
                  const taskDate = new Date(startDate);
                  taskDate.setDate(
                    taskDate.getDate() +
                    (m.weekNumber - 1) * 7 +
                    Math.floor((index / m.tasks.length) * 7)
                  );
                  return {
                    title: t.title,
                    topic: t.topic,
                    taskType: t.taskType,
                    estimatedMinutes: t.estimatedMinutes,
                    description: t.description,
                    orderIndex: t.orderIndex,
                    dueDate: taskDate,
                    resourceId: t.resourceId || null,
                  };
                }),
              },
            };
          }),
        },
      },
    });

    // ── Notification (deduped — no repeated "Track Switched" alerts) ─
    await createNotificationIfNeeded({
      studentProfileId: profile.id,
      title: "🔄 Track Switched!",
      message: `You've switched from ${oldTrackTitle} to ${getDomainDisplayName(data.domain)}. Your new personalized plan is ready!`,
      type: "info",
      actionUrl: "/student/plan",
    });

    return NextResponse.json({ success: true, planId: plan.id });
  } catch (error) {
    console.error("Switch track error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
