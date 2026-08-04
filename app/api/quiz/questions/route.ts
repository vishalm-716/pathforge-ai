import { NextRequest, NextResponse } from "next/server";
import { Difficulty } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Fisher-Yates in-place shuffle — returns the same array for convenience */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") || "Arrays Basics";

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: { learningPlan: { include: { track: true } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const trackId = profile.learningPlan?.trackId;
    const difficulty = profile.currentLevel as Difficulty;

    // 1. Fetch up to 5 MCQ questions — exact topic match first
    let primaryQuestions = await prisma.question.findMany({
      where: {
        ...(trackId ? { trackId } : {}),
        questionType: "MCQ",
        difficulty,
        ...(topic ? { topic: { equals: topic, mode: "insensitive" } } : {}),
      },
      take: 5,
    });

    // If exact match doesn't yield enough, try substring match
    if (primaryQuestions.length < 5 && topic) {
      const extras = await prisma.question.findMany({
        where: {
          ...(trackId ? { trackId } : {}),
          questionType: "MCQ",
          difficulty,
          topic: { contains: topic, mode: "insensitive" },
          id: { notIn: primaryQuestions.map((q) => q.id) },
        },
        take: 5 - primaryQuestions.length,
      });
      primaryQuestions = [...primaryQuestions, ...extras];
    }

    let fallbackUsed = false;
    const questions = [...primaryQuestions];

    // 2. If fewer than 5, fill remaining slots from any difficulty (same track + type)
    if (questions.length < 5 && trackId) {
      const remaining = 5 - questions.length;
      const fallbackQuestions = await prisma.question.findMany({
        where: {
          trackId,
          questionType: "MCQ",
          id: { notIn: questions.map((q) => q.id) },
        },
        take: remaining,
      });

      if (fallbackQuestions.length > 0) {
        questions.push(...fallbackQuestions);
        fallbackUsed = true;
      }
    }

    // 3. Shuffle
    shuffle(questions);

    return NextResponse.json({
      questions: questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options ? JSON.parse(q.options) : [],
        topic: q.topic,
        difficulty: q.difficulty,
      })),
      fallbackUsed,
    });
  } catch (error) {
    console.error("Quiz questions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
