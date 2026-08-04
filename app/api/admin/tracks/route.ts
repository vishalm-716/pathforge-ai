import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

const trackSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE"]),
  estimatedHours: z.number().int().min(1),
});

export async function GET() {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tracks = await prisma.track.findMany({
    include: {
      resources: true,
      questions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const enrichedTracks = tracks.map(t => {
    const coverage = {
      beginner: { resources: 0, mcq: 0, coding: 0 },
      intermediate: { resources: 0, mcq: 0, coding: 0 }
    };
    
    t.resources.forEach(r => {
      const diff = r.difficulty.toLowerCase() as 'beginner' | 'intermediate';
      if (coverage[diff]) coverage[diff].resources++;
    });

    t.questions.forEach(q => {
      const diff = q.difficulty.toLowerCase() as 'beginner' | 'intermediate';
      if (coverage[diff]) {
        if (q.questionType === 'MCQ') coverage[diff].mcq++;
        if (q.questionType === 'CODING') coverage[diff].coding++;
      }
    });

    const warnings: string[] = [];
    if (coverage.beginner.resources === 0) warnings.push("No beginner resources");
    if (coverage.beginner.mcq === 0) warnings.push("No beginner MCQs");
    if (t.questions.length === 0 && t.resources.length > 0) warnings.push("No questions");
    if (t.resources.length === 0 && t.questions.length > 0) warnings.push("No resources");

    // Remove resources and questions arrays to reduce payload size
    const { resources, questions, ...trackData } = t;

    return {
      ...trackData,
      coverage,
      warnings,
      totals: { resources: resources.length, questions: questions.length }
    };
  });

  return NextResponse.json(enrichedTracks);
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const data = trackSchema.parse(body);
    const track = await prisma.track.create({ data });
    return NextResponse.json(track, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { id, ...data } = body;
    const validated = trackSchema.parse(data);
    const track = await prisma.track.update({ where: { id }, data: validated });
    return NextResponse.json(track);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.track.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
