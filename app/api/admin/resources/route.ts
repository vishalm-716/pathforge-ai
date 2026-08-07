import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

async function checkAdmin() {
  return requireAdmin();
}

const resourceSchema = z.object({
  trackId: z.string().min(1),
  topic: z.string().min(1),
  title: z.string().min(1),
  youtubeUrl: z.string().url(),
  orderIndex: z.number().int().min(0).default(0),
  estimatedMinutes: z.number().int().min(1).default(15),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE"]),
  description: z.string().optional(),
});

export async function GET() {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const resources = await prisma.resource.findMany({
    include: { track: { select: { title: true } } },
    orderBy: [{ trackId: "asc" }, { orderIndex: "asc" }],
  });
  return NextResponse.json(resources);
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const data = resourceSchema.parse(body);
    const resource = await prisma.resource.create({ data });
    return NextResponse.json(resource, { status: 201 });
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
    const validated = resourceSchema.parse(data);
    const resource = await prisma.resource.update({ where: { id }, data: validated });
    return NextResponse.json(resource);
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

  await prisma.resource.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
