import { NextRequest, NextResponse } from "next/server";
import { Difficulty } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TRACK_LANGUAGES } from "@/lib/constants";

/** Fisher-Yates in-place shuffle — returns the same array for convenience */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Parse stored JSON without crashing the whole endpoint on malformed data. */
function safeJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") || "";

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: { learningPlan: { include: { track: true } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const track = profile.learningPlan?.track ?? null;
    if (!track) {
      return NextResponse.json({ error: "No track found" }, { status: 404 });
    }

    const difficulty = profile.currentLevel as Difficulty;

    // 1. Exact-topic coding questions first (when a topic is provided)
    let codingQuestions = await prisma.question.findMany({
      where: {
        trackId: track.id,
        questionType: "CODING",
        difficulty,
        ...(topic ? { topic: { equals: topic, mode: "insensitive" } } : {}),
      },
    });

    // 2. If the exact topic has no coding question at this level, fall back to
    //    any coding question from the same track + difficulty so every track
    //    and every topic still yields a challenge.
    if (codingQuestions.length === 0) {
      codingQuestions = await prisma.question.findMany({
        where: {
          trackId: track.id,
          questionType: "CODING",
          difficulty,
        },
      });
    }

    // 3. Shuffle
    shuffle(codingQuestions);

    // Only the track's language is allowed — the client renders just this one.
    const languages = [TRACK_LANGUAGES[track.slug] ?? "javascript"];

    return NextResponse.json({
      trackSlug: track.slug,
      languages,
      questions: codingQuestions.map((q) => ({
        id: q.id,
        topic: q.topic,
        questionText: q.questionText,
        codeDescription: q.codeDescription,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        constraints: q.constraints,
        hints: q.hints,
        starterCode: safeJson<Record<string, string>>(q.starterCode, {}),
        difficulty: q.difficulty,
      })),
    });
  } catch (error) {
    console.error("Coding questions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
