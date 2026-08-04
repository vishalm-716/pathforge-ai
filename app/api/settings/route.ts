import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  weeklyHours: z.number().int().min(1).max(20),
  learningPace: z.enum(["relaxed", "standard", "intensive"]).optional(),
  notifyTaskReminders: z.boolean().optional(),
  notifyInactivityNudges: z.boolean().optional(),
  contentStyle: z.enum(["video-first", "quiz-first", "balanced"]).optional(),
});

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
          include: { track: true },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      weeklyHours: profile.weeklyHours,
      learningPace: profile.learningPace,
      notifyTaskReminders: profile.notifyTaskReminders,
      notifyInactivityNudges: profile.notifyInactivityNudges,
      contentStyle: profile.contentStyle,
      domain: profile.domain,
      currentLevel: profile.currentLevel,
      currentTrack: profile.learningPlan
        ? {
            id: profile.learningPlan.track.id,
            title: profile.learningPlan.track.title,
            slug: profile.learningPlan.track.slug,
          }
        : null,
      // Account info
      userName: session.user.name || null,
      userEmail: session.user.email || null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = settingsSchema.parse(body);

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        weeklyHours: data.weeklyHours,
        ...(data.learningPace !== undefined && { learningPace: data.learningPace }),
        ...(data.notifyTaskReminders !== undefined && { notifyTaskReminders: data.notifyTaskReminders }),
        ...(data.notifyInactivityNudges !== undefined && { notifyInactivityNudges: data.notifyInactivityNudges }),
        ...(data.contentStyle !== undefined && { contentStyle: data.contentStyle }),
      },
    });

    const details = [
      `Weekly hours: ${data.weeklyHours}`,
      data.learningPace ? `Pace: ${data.learningPace}` : null,
      data.contentStyle ? `Content: ${data.contentStyle}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    await prisma.activityLog.create({
      data: {
        studentProfileId: profile.id,
        action: "SETTINGS_UPDATED",
        details: `Updated settings: ${details}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
