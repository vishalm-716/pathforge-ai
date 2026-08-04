import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TaskType } from "@prisma/client";

const insightResponseSchema = z.object({
  insightId: z.string().min(1),
  decision: z.enum(["ACCEPTED", "REJECTED", "RESCHEDULED"]),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { insightId, decision, reason } = insightResponseSchema.parse(body);

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        learningPlan: {
          include: {
            milestones: {
              include: { tasks: true },
              orderBy: { weekNumber: "asc" },
            },
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const insight = await prisma.agentInsight.findUnique({
      where: { id: insightId },
    });

    if (!insight || insight.studentProfileId !== profile.id) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    // Update insight status
    await prisma.agentInsight.update({
      where: { id: insightId },
      data: {
        status: decision,
        learnerDecision: decision,
        decisionReason: reason || null,
        resolvedAt: new Date(),
      },
    });

    // If accepted, apply the recommended changes
    if (decision === "ACCEPTED" && profile.learningPlan) {
      const changes = JSON.parse(insight.recommendedChanges) as Array<{
        type: string;
        description: string;
        taskData?: {
          title: string;
          topic: string;
          taskType: TaskType;
          estimatedMinutes: number;
          description?: string;
        };
        postponeDays?: number;
      }>;

      const currentMilestone = profile.learningPlan.milestones.find(
        (m) => !m.isCompleted
      ) || profile.learningPlan.milestones[profile.learningPlan.milestones.length - 1];

      for (const change of changes) {
        if (change.type === "ADD_TASK" && change.taskData && currentMilestone) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 2);

          await prisma.learningTask.create({
            data: {
              milestoneId: currentMilestone.id,
              title: change.taskData.title,
              topic: change.taskData.topic,
              taskType: change.taskData.taskType,
              estimatedMinutes: change.taskData.estimatedMinutes,
              description: change.taskData.description || "",
              dueDate,
              orderIndex: currentMilestone.tasks.length,
            },
          });
        }

        if (change.type === "POSTPONE_TASK" && change.postponeDays) {
          // Postpone the next NOT_STARTED task
          const nextTask = profile.learningPlan.milestones
            .flatMap((m) => m.tasks)
            .find((t) => t.status === "NOT_STARTED");

          if (nextTask) {
            const newDate = new Date(nextTask.dueDate);
            newDate.setDate(newDate.getDate() + change.postponeDays);
            await prisma.learningTask.update({
              where: { id: nextTask.id },
              data: { dueDate: newDate },
            });
          }
        }
      }

      // Log the acceptance
      await prisma.activityLog.create({
        data: {
          studentProfileId: profile.id,
          action: "INSIGHT_ACCEPTED",
          details: `Accepted ${insight.riskType} recommendation: ${insight.signal}`,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          studentProfileId: profile.id,
          title: "✅ Learning Plan Updated",
          message: `Your learning plan has been updated based on the ${insight.riskType.replace("_", " ").toLowerCase()} insight. New tasks have been added to help you progress.`,
          type: "success",
          actionUrl: "/student/plan",
        },
      });
    } else if (decision === "REJECTED") {
      await prisma.activityLog.create({
        data: {
          studentProfileId: profile.id,
          action: "INSIGHT_REJECTED",
          details: `Rejected ${insight.riskType} recommendation: ${reason || "No reason given"}`,
        },
      });
    } else if (decision === "RESCHEDULED") {
      await prisma.activityLog.create({
        data: {
          studentProfileId: profile.id,
          action: "INSIGHT_RESCHEDULED",
          details: `Rescheduled ${insight.riskType} recommendation: ${reason || "No reason given"}`,
        },
      });

      await prisma.notification.create({
        data: {
          studentProfileId: profile.id,
          title: "📅 Recommendation Rescheduled",
          message: `You chose to reschedule the ${insight.riskType.replace("_", " ").toLowerCase()} recommendation. We'll check back later.`,
          type: "info",
          actionUrl: "/student/dashboard",
        },
      });
    }

    return NextResponse.json({ success: true, decision });
  } catch (error) {
    console.error("Insight response error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
