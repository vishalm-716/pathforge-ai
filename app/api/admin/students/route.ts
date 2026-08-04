import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET() {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      studentProfile: {
        include: {
          learningPlan: true,
          quizAttempts: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          agentInsights: {
            where: { status: "PENDING" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const studentData = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    domain: s.studentProfile?.domain || null,
    progress: s.studentProfile?.learningPlan?.overallProgress || 0,
    streak: s.studentProfile?.currentStreak || 0,
    latestQuizScore: s.studentProfile?.quizAttempts?.[0]?.score || null,
    currentRisk: s.studentProfile?.agentInsights?.[0]?.riskType || null,
    pendingRecommendations: s.studentProfile?.agentInsights?.length || 0,
  }));

  return NextResponse.json(studentData);
}

export async function DELETE(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Guard: cannot delete your own account
  if (admin.id === id) return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
