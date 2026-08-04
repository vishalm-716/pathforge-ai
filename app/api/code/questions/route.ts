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

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: { learningPlan: { include: { track: true } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const trackId = profile.learningPlan?.trackId;
    if (!trackId) {
      return NextResponse.json({ error: "No track found" }, { status: 404 });
    }

    const difficulty = profile.currentLevel as Difficulty;

    // 1. Fetch coding questions filtered by track + difficulty
    const codingQuestions = await prisma.question.findMany({
      where: {
        trackId,
        questionType: "CODING",
        difficulty,
      },
    });

    // 2. Shuffle
    shuffle(codingQuestions);

    return NextResponse.json(
      codingQuestions.map((q) => ({
        id: q.id,
        topic: q.topic,
        questionText: q.questionText,
        codeDescription: q.codeDescription,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        constraints: q.constraints,
        hints: q.hints,
        starterCode: q.starterCode ? JSON.parse(q.starterCode) : {},
        difficulty: q.difficulty,
      }))
    );
  } catch (error) {
    console.error("Coding questions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
