import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const codeSubmitSchema = z.object({
  questionId: z.string().min(1),
  code: z.string().min(1),
  language: z.enum(["javascript", "python", "java"]),
});

/**
 * MVP sandboxed evaluator / demo validation — not production code execution.
 * Uses deterministic keyword/pattern checks against known expected answers.
 */
function evaluateCode(
  code: string,
  language: string,
  expectedKeywords: string | null
): { passed: boolean; score: number; feedback: string } {
  if (!expectedKeywords) {
    return {
      passed: true,
      score: 70,
      feedback: "Code submitted successfully. Manual review recommended.",
    };
  }

  const keywords = expectedKeywords
    .split(",")
    .map((k) => k.trim().toLowerCase());
  const codeLower = code.toLowerCase();
  const matchedKeywords = keywords.filter((k) => codeLower.includes(k));
  const matchRatio = matchedKeywords.length / keywords.length;

  // Check for basic syntax patterns
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

  let score = Math.round(matchRatio * 60);
  if (hasFunctionOrLoop) score += 20;
  if (hasReturn) score += 20;
  score = Math.min(score, 100);

  const passed = score === 100;

  let feedback: string;
  if (passed) {
    feedback = `Excellent! Your ${language} solution covers all key concepts (${matchedKeywords.join(", ")}). Score: ${score}%`;
  } else if (score >= 60) {
    feedback = `Good attempt! Your solution covers some concepts, but you must include all expected keywords and logic to pass. Consider using: ${keywords.filter((k) => !matchedKeywords.includes(k)).join(", ")}. Score: ${score}%`;
  } else {
    feedback = `Your solution needs improvement. Key concepts to include: ${keywords.filter((k) => !matchedKeywords.includes(k)).join(", ")}. Score: ${score}%`;
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
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
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

    // Update last active
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { lastActiveDate: new Date() },
    });

    // Create insight if failed
    if (!passed) {
      const existingInsight = await prisma.agentInsight.findFirst({
        where: {
          studentProfileId: profile.id,
          riskType: "CODING_GAP",
          status: "PENDING",
        },
      });

      if (!existingInsight) {
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
