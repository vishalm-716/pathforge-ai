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
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
      where: { studentProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Notifications error:", error);
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
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Ownership check — only mark your own notifications as read.
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { studentProfileId: true },
    });
    if (!notification || notification.studentProfileId !== profile.id) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
