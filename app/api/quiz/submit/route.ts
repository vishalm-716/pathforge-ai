import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectRisks } from "@/lib/agent/rules";
import { recordActivity } from "@/lib/activity";
import { createNotificationIfNeeded, hasRecentInsight } from "@/lib/notifications";
import { z } from "zod";

// selectedOption may be -1 for questions the student skipped (the quiz UI
// sends -1 when no option was chosen). -1 must not fail validation — that
// previously made the whole submission error out with a 400.
const quizSubmitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOption: z.number().int().min(-1).max(3),
    })
  ),
  topic: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { answers, topic } = quizSubmitSchema.parse(body);

    if (answers.length === 0) {
      return NextResponse.json(
        { error: "No answers provided" },
        { status: 400 }
      );
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let correctCount = 0;
    // Only questions that can actually be graded count toward the score:
    // skipped questions count as incorrect, questions without a configured
    // correct answer are excluded so broken questions can't skew results.
    let gradedCount = 0;
    const results: Array<{
      questionId: string;
      isCorrect: boolean;
      explanation: string | null;
      correctOption: number | null;
      unanswered?: boolean;
      notGraded?: boolean;
    }> = [];

    for (const answer of answers) {
      const question = await prisma.question.findUnique({
        where: { id: answer.questionId },
      });

      if (!question) continue;

      // Skipped question (front-end sends -1) — recorded, counted as incorrect.
      if (answer.selectedOption === -1) {
        gradedCount++;
        await prisma.quizAttempt.create({
          data: {
            studentProfileId: profile.id,
            questionId: answer.questionId,
            selectedOption: null,
            isCorrect: false,
            score: 0,
            feedback: "You did not answer this question.",
          },
        });
        results.push({
          questionId: answer.questionId,
          isCorrect: false,
          explanation: null,
          correctOption: null,
          unanswered: true,
        });
        continue;
      }

      // Question with no configured correct answer cannot be graded — exclude
      // it from the score instead of marking every answer wrong.
      if (question.correctOption === null || question.correctOption === undefined) {
        await prisma.quizAttempt.create({
          data: {
            studentProfileId: profile.id,
            questionId: answer.questionId,
            selectedOption: answer.selectedOption,
            isCorrect: false,
            score: 0,
            feedback:
              "This question is not graded because no correct answer is configured.",
          },
        });
        results.push({
          questionId: answer.questionId,
          isCorrect: false,
          explanation: question.explanation,
          correctOption: null,
          notGraded: true,
        });
        continue;
      }

      gradedCount++;
      const isCorrect = question.correctOption === answer.selectedOption;
      if (isCorrect) correctCount++;

      await prisma.quizAttempt.create({
        data: {
          studentProfileId: profile.id,
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          isCorrect,
          score: isCorrect ? 100 : 0,
          feedback: isCorrect
            ? "Correct! Well done."
            : `Incorrect. ${question.explanation || "Review this concept."}`,
        },
      });

      results.push({
        questionId: answer.questionId,
        isCorrect,
        explanation: question.explanation,
        correctOption: question.correctOption,
      });
    }

    const scorePercentage =
      gradedCount > 0
        ? Math.round((correctCount / gradedCount) * 100)
        : 0;

    // Log activity
    await prisma.activityLog.create({
      data: {
        studentProfileId: profile.id,
        action: "QUIZ_COMPLETED",
        details: `Quiz on ${topic || "General"}: ${scorePercentage}% (${correctCount}/${gradedCount})`,
        minutesSpent: 15,
      },
    });

    // Streak + totalMinutes update (real activity — idempotent per day)
    await recordActivity(profile.id, 15);

    // Run agent risk detection for quiz score (real weekly minutes)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weeklyLogs = await prisma.activityLog.findMany({
      where: {
        studentProfileId: profile.id,
        createdAt: { gte: weekStart },
      },
    });
    const totalMinutesThisWeek = weeklyLogs.reduce((sum, l) => sum + l.minutesSpent, 0);

    const risks = detectRisks({
      totalMinutesThisWeek,
      plannedMinutesThisWeek: profile.weeklyHours * 60,
      lastActiveDate: new Date(),
      currentStreak: profile.currentStreak,
      latestQuizScore: scorePercentage,
      latestCodingPassed: null,
    });

    // Create insights + notifications (dedupe by risk type + cooldown)
    for (const risk of risks) {
      if (await hasRecentInsight(profile.id, risk.riskType)) continue;

      await prisma.agentInsight.create({
        data: {
          studentProfileId: profile.id,
          riskType: risk.riskType,
          priority: risk.priority,
          signal: risk.signal,
          explanation: risk.explanation,
          recommendedChanges: JSON.stringify(risk.recommendedChanges),
        },
      });

      const title =
        risk.riskType === "MASTERY_GAP"
          ? "📚 PathForge AI: Concept Reinforcement Needed"
          : risk.riskType === "ACCELERATION_OPPORTUNITY"
          ? "🚀 PathForge AI: Ready for a Challenge?"
          : "🔔 PathForge AI Insight";

      await createNotificationIfNeeded({
        studentProfileId: profile.id,
        title,
        message: risk.explanation,
        type: risk.riskType === "ACCELERATION_OPPORTUNITY" ? "success" : "warning",
        actionUrl: "/student/dashboard",
      });
    }

    return NextResponse.json({
      success: true,
      score: scorePercentage,
      correctCount,
      totalQuestions: gradedCount,
      results,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
