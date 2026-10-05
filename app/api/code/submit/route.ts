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
  // The learning task this challenge belongs to — used to auto-complete the
  // task in the student's plan when the submission passes.
  taskId: z.string().min(1).optional(),
});

interface CodeEvaluation {
  passed: boolean;
  score: number;
  feedback: string;
  details: {
    matchedKeywords: string[];
    missingKeywords: string[];
    keywordPoints: number;
    hasFunctionOrLoop: boolean;
    hasReturn: boolean;
  };
}

/**
 * MVP sandboxed evaluator / demo validation — not production code execution.
 * Uses deterministic keyword/pattern checks against known expected answers.
 *
 * Scoring is keyword-coverage based (worth 80 pts) so it is fair across every
 * language, including SQL where function/loop/return constructs don't exist.
 * Structure markers add a small bonus (up to +20) — never a hard requirement.
 *
 * The feedback is built to tell the student exactly WHAT is wrong when they
 * fail: which expected concepts are missing, plus language-appropriate hints
 * about structure and returning a result (SQL skips those hints because SQL
 * queries legitimately have no function/loop/return constructs).
 */
function evaluateCode(
  code: string,
  language: string,
  expectedKeywords: string | null
): CodeEvaluation {
  if (!expectedKeywords) {
    return {
      passed: true,
      score: CODE_PASS_THRESHOLD,
      feedback: "Code submitted successfully. Manual review recommended.",
      details: {
        matchedKeywords: [],
        missingKeywords: [],
        keywordPoints: 0,
        hasFunctionOrLoop: false,
        hasReturn: false,
      },
    };
  }

  const keywords = expectedKeywords
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  const codeLower = code.toLowerCase();
  const matchedKeywords = keywords.filter((k) => codeLower.includes(k));
  const matchRatio =
    keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;

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

  const keywordPoints = Math.round(matchRatio * 80);
  let score = keywordPoints;
  if (hasFunctionOrLoop) score += 10;
  if (hasReturn) score += 10;
  score = Math.min(score, 100);

  const passed = score >= CODE_PASS_THRESHOLD;
  const missingKeywords = keywords.filter((k) => !matchedKeywords.includes(k));

  const details = {
    matchedKeywords,
    missingKeywords,
    keywordPoints,
    hasFunctionOrLoop,
    hasReturn,
  };

  let feedback: string;
  if (passed) {
    feedback = `Passed with a score of ${score}% (threshold ${CODE_PASS_THRESHOLD}%). Your solution covers the required concepts${
      matchedKeywords.length > 0 ? ` (${matchedKeywords.join(", ")})` : ""
    }.`;
  } else {
    const missing =
      missingKeywords.length > 0
        ? `Missing expected concepts: ${missingKeywords.join(", ")}.`
        : "None of the expected concepts for this challenge were found in your code.";
    // SQL has no function/loop/return constructs — only give structure hints
    // in the languages where they apply.
    const structureHints =
      language === "sql"
        ? ""
        : `${!hasFunctionOrLoop ? " Your solution also needs a loop or function (for/while/def/function)." : ""}${
            !hasReturn ? " It must return or print the result (return/print/console.log)." : ""
          }`;
    feedback = `Not passed — score ${score}% (need ${CODE_PASS_THRESHOLD}% or more). ${missing}${structureHints} Review the sample output and hints, then try again.`;
  }

  return { passed, score, feedback, details };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questionId, code, language, taskId } = codeSubmitSchema.parse(body);

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        learningPlan: {
          include: {
            track: true,
            milestones: { include: { tasks: true } },
          },
        },
      },
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

    const { passed, score, feedback, details } = evaluateCode(
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

    // ── On pass: mark the coding task complete in the student's plan ──
    // Passing the challenge completes the CODING task it belongs to (this is
    // the "it shows Passed! but the task never becomes Completed" fix). The
    // task must genuinely belong to this student's plan, be a CODING task,
    // and not already be completed — repeated passing submissions are
    // idempotent and never re-credit progress or minutes.
    let taskCompleted = false;
    const plan = profile.learningPlan;
    if (passed && taskId && plan) {
      const learningTask = await prisma.learningTask.findUnique({
        where: { id: taskId },
        select: { id: true, milestoneId: true, status: true, taskType: true },
      });

      const belongsToPlan = plan.milestones.some(
        (m) => m.id === learningTask?.milestoneId
      );

      if (
        learningTask &&
        belongsToPlan &&
        learningTask.taskType === "CODING" &&
        learningTask.status !== "COMPLETED"
      ) {
        await prisma.learningTask.update({
          where: { id: taskId },
          data: { status: "COMPLETED", actualMinutes: 20 },
        });

        // Recompute plan progress (snapshot is stale — count this task).
        const allTasks = plan.milestones.flatMap((m) => m.tasks);
        const completedCount = allTasks.filter(
          (t) => t.status === "COMPLETED" || t.id === taskId
        ).length;
        const totalTasks = allTasks.length;
        const newProgress =
          totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

        await prisma.learningPlan.update({
          where: { id: plan.id },
          data: {
            overallProgress: newProgress,
            completedMinutes: { increment: 20 },
          },
        });

        // Mark the milestone complete when every task in it is done.
        for (const milestone of plan.milestones) {
          const allDone = milestone.tasks.every(
            (t) => t.status === "COMPLETED" || t.id === taskId
          );
          if (allDone && !milestone.isCompleted) {
            await prisma.milestone.update({
              where: { id: milestone.id },
              data: { isCompleted: true },
            });
          }
        }

        await prisma.activityLog.create({
          data: {
            studentProfileId: profile.id,
            action: "TASK_COMPLETED",
            details: `Completed task: ${taskId}`,
            minutesSpent: 20,
          },
        });
        taskCompleted = true;
      }
    }

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
      details,
      taskCompleted,
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
