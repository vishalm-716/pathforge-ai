import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePlanWithResources, getDomainDisplayName } from "@/lib/agent/plan-generator";
import { z } from "zod";
import { Difficulty } from "@prisma/client";

const onboardingSchema = z.object({
  domain: z.string().min(1),
  currentLevel: z.enum(["BEGINNER", "INTERMEDIATE"]),
  weeklyHours: z.number().int().min(1).max(20),
  targetWeeks: z.number().int().min(1).max(12),
  learningStyle: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = onboardingSchema.parse(body);

    // Find or create student profile
    let profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      profile = await prisma.studentProfile.create({
        data: { userId: session.user.id },
      });
    }

    // Find or create the track
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
          estimatedHours: data.weeklyHours * data.targetWeeks,
        },
      });
    }

    // Update student profile
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        domain: data.domain,
        currentLevel: data.currentLevel as Difficulty,
        weeklyHours: data.weeklyHours,
        targetWeeks: data.targetWeeks,
        learningStyle: data.learningStyle,
        onboardingDone: true,
      },
    });

    // Generate the plan
    const milestones = await generatePlanWithResources(
      {
        domain: data.domain,
        currentLevel: data.currentLevel,
        weeklyHours: data.weeklyHours,
        targetWeeks: data.targetWeeks,
        learningStyle: data.learningStyle,
      },
      prisma
    );

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + data.targetWeeks * 7);

    const totalPlannedMinutes = milestones.reduce(
      (sum, m) => sum + m.tasks.reduce((s, t) => s + t.estimatedMinutes, 0),
      0
    );

    // Delete existing plan if any
    const existingPlan = await prisma.learningPlan.findUnique({
      where: { studentProfileId: profile.id },
    });
    if (existingPlan) {
      await prisma.learningPlan.delete({
        where: { id: existingPlan.id },
      });
    }

    // Create learning plan with milestones and tasks
    const plan = await prisma.learningPlan.create({
      data: {
        studentProfileId: profile.id,
        trackId: track.id,
        goal: `Master ${getDomainDisplayName(data.domain)}`,
        targetDuration: data.targetWeeks,
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
      include: {
        milestones: {
          include: { tasks: true },
        },
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        studentProfileId: profile.id,
        title: "Welcome to PathForge AI! 🚀",
        message: `Your personalized ${getDomainDisplayName(data.domain)} learning path is ready! You have ${data.targetWeeks} weeks of curated content ahead. Start with your first task to build momentum.`,
        type: "success",
        actionUrl: "/student/plan",
      },
    });

    // Log onboarding activity
    await prisma.activityLog.create({
      data: {
        studentProfileId: profile.id,
        action: "ONBOARDING_COMPLETE",
        details: `Started ${getDomainDisplayName(data.domain)} track, ${data.currentLevel} level, ${data.weeklyHours} hrs/week for ${data.targetWeeks} weeks`,
      },
    });

    return NextResponse.json({ success: true, planId: plan.id });
  } catch (error) {
    console.error("Onboarding error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
