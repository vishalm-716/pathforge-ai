import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const visitSchema = z.object({
  taskId: z.string().min(1),
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
 * GET /api/tasks/visit?taskId=... — tells the page whether the student has
 * already opened the video link (and when), so the UI can restore state.
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

    return NextResponse.json({
      opened: !!opened,
      openedAt: opened?.createdAt ?? null,
    });
  } catch (error) {
    console.error("Video visit check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/tasks/visit — records that the student opened the video link for
 * a task. Called from the Watch Video button BEFORE the link opens. Idempotent:
 * repeated opens keep the first timestamp so the watch-time clock can't be
 * reset by clicking repeatedly.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { taskId } = visitSchema.parse(body);

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const task = await resolveVideoTask(profile.id, taskId);
    if (!task) {
      return NextResponse.json(
        { error: "Video task not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.activityLog.findFirst({
      where: {
        studentProfileId: profile.id,
        action: "VIDEO_OPENED",
        details: taskId,
      },
      orderBy: { createdAt: "asc" },
    });

    if (!existing) {
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
      openedAt: existing?.createdAt ?? new Date(),
    });
  } catch (error) {
    console.error("Video visit error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
