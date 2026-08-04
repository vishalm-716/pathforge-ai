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

const questionSchema = z.object({
  trackId: z.string().min(1),
  topic: z.string().min(1),
  questionType: z.enum(["MCQ", "CODING"]),
  questionText: z.string().min(1),
  options: z.string().optional(),
  correctOption: z.number().int().optional(),
  explanation: z.string().optional(),
  codeDescription: z.string().optional(),
  sampleInput: z.string().optional(),
  sampleOutput: z.string().optional(),
  constraints: z.string().optional(),
  hints: z.string().optional(),
  starterCode: z.string().optional(),
  expectedKeywords: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE"]),
});

export async function GET() {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const questions = await prisma.question.findMany({
    include: { track: { select: { title: true } } },
    orderBy: [{ trackId: "asc" }, { topic: "asc" }],
  });
  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const data = questionSchema.parse(body);
    const question = await prisma.question.create({ data });
    return NextResponse.json(question, { status: 201 });
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
    const validated = questionSchema.parse(data);
    const question = await prisma.question.update({ where: { id }, data: validated });
    return NextResponse.json(question);
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

  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
