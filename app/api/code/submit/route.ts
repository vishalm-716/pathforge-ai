import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordActivity } from "@/lib/activity";
import { hasRecentInsight } from "@/lib/notifications";
import { TRACK_LANGUAGES, CODE_LANGUAGES, CODE_PASS_THRESHOLD } from "@/lib/constants";
import { z } from "zod";

const codeSubmitSchema = z.object({
  questionId: z.string().min(1),
  code: z.string().min(1),
  language: z.enum(CODE_LANGUAGES),
});

/**
 * MVP sandboxed evaluator / demo validation — not production code execution.
 * Uses deterministic keyword/pattern checks against known expected answers.
 *
 * Scoring is keyword-coverage based (worth 80 pts) so it is fair across every
 * language, including SQL where function/loop/return constructs don't exist.
 * Structure markers add a small bonus (up to +20) — never a hard requirement.
 */
function evaluateCode(
  code: string,
  language: string,
  expectedKeywords: string | null
): { passed: boolean; score: number; feedback: string } {
  if (!expectedKeywords) {
    return {
      passed: true,
      score: CODE_PASS_THRESHOLD,
      feedback: "Code submitted successfully. Manual review recommended.",
    };
  }

  const keywords = expectedKeywords
    .split(",")
    .map((k) => k.trim().toLowerCase());
  const codeLower = code.toLowerCase();
  const matchedKeywords = keywords.filter((k) => codeLower.includes(k));
  const matchRatio = matchedKeywords.length / keywords.length;

  // Check for basic syntax patterns (bonus only — SQL has none of these)
  const hasFunctionOrLoop =
    codeLower.includes("function") ||
    codeLower.includes("def ") ||
    codeLower.includes("for") ||
    codeLower.includes("while") ||
    codeLower.includes("foreach") ||
    codeLower.includes("map") ||
    codeLower.includes("reduce");

  const hasReturn =
    codeLower.includes("return") ||
    codeLower.includes("print") ||
    codeLower.includes("console.log") ||
    codeLower.includes("system.out");

  let score = Math.round(matchRatio * 80);
  if (hasFunctionOrLoop) score += 10;
  if (hasReturn) score += 10;
  score = Math.min(score, 100);

  const passed = score >= CODE_PASS_THRESHOLD;

  const missingKeywords = keywords.filter((k) => !matchedKeywords.includes(k));

  let feedback: string;
  if (passed) {
    feedback = `Excellent! Your ${language} solution covers the key concepts (${matchedKeywords.join(", ")}). Score: ${score}%`;
  } else if (score >= CODE_PASS_THRESHOLD - 25) {
    feedback = `Good attempt! You're close — include all expected keywords and logic to pass (${CODE_PASS_THRESHOLD}%+). Consider using: ${missingKeywords.join(", ")}. Score: ${score}%`;
  } else {
    feedback = `Your solution needs improvement. Key concepts to include: ${missingKeywords.join(", ")}. Score: ${score}%`;
  }

  return { passed, score, feedback };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questionId, code, language } = codeSubmitSchema.parse(body);

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: { learningPlan: { include: { track: true } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // ── Track-scoped enforcement ──────────────────────────────
    // The question must belong to the student's current track, and the
    // submitted language must be the ONLY language allowed for that track.
    // A Python-track student cannot submit Java/JavaScript/SQL, and vice versa.
    const track = profile.learningPlan?.track ?? null;
    if (!track) {
      return NextResponse.json(
        { error: "No active track. Complete onboarding first." },
        { status: 404 }
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (question.trackId !== track.id) {
      return NextResponse.json(
        { error: "This question does not belong to your current track." },
        { status: 403 }
      );
    }

    const allowedLanguage = TRACK_LANGUAGES[track.slug];
    if (allowedLanguage && language !== allowedLanguage) {
      return NextResponse.json(
        {
          error: `This track only allows ${allowedLanguage} solutions. Please write your code in ${allowedLanguage}.`,
          allowedLanguage,
        },
        { status: 400 }
      );
    }

    const { passed, score, feedback } = evaluateCode(
      code,
      language,
      question.expectedKeywords
    );

    const submission = await prisma.codingSubmission.create({
      data: {
        studentProfileId: profile.id,
        questionId,
        code,
        language,
        result: feedback,
        score,
        feedback,
        passed,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        studentProfileId: profile.id,
        action: "CODING_SUBMITTED",
        details: `Coding challenge: ${question.topic} - ${passed ? "Passed" : "Failed"} (${score}%)`,
        minutesSpent: 20,
      },
    });

    // Streak + totalMinutes update (real activity — idempotent per day)
    await recordActivity(profile.id, 20);

    // Create insight if failed (dedupe by risk type + cooldown)
    if (!passed && !(await hasRecentInsight(profile.id, "CODING_GAP"))) {
      await prisma.agentInsight.create({
        data: {
          studentProfileId: profile.id,
          riskType: "CODING_GAP",
          priority: 2,
          signal: `Coding challenge "${question.topic}" not passed (${score}%)`,
          explanation: `Your coding submission for "${question.topic}" scored ${score}%. PathForge AI recommends a guided retry with hints and a focused concept review.`,
          recommendedChanges: JSON.stringify([
            {
              type: "ADD_TASK",
              description: "Guided retry with hints",
              taskData: {
                title: `Guided Retry: ${question.topic}`,
                topic: question.topic,
                taskType: "CODING",
                estimatedMinutes: 25,
                description: "Retry with step-by-step hints",
              },
            },
          ]),
        },
      });
    }

    return NextResponse.json({
      success: true,
      passed,
      score,
      feedback,
      submissionId: submission.id,
    });
  } catch (error) {
    console.error("Coding submission error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
