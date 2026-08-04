import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectRisks } from "@/lib/agent/rules";
import { z } from "zod";

const quizSubmitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOption: z.number().int().min(0).max(3),
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

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let correctCount = 0;
    const results = [];

    for (const answer of answers) {
      const question = await prisma.question.findUnique({
        where: { id: answer.questionId },
      });

      if (!question) continue;

      const isCorrect = question.correctOption === answer.selectedOption;
      if (isCorrect) correctCount++;

      const attempt = await prisma.quizAttempt.create({
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

    const totalQuestions = answers.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    // Log activity
    await prisma.activityLog.create({
      data: {
        studentProfileId: profile.id,
        action: "QUIZ_COMPLETED",
        details: `Quiz on ${topic || "General"}: ${scorePercentage}% (${correctCount}/${totalQuestions})`,
        minutesSpent: 15,
      },
    });

    // Update last active
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { lastActiveDate: new Date() },
    });

    // Run agent risk detection for quiz score
    const risks = detectRisks({
      totalMinutesThisWeek: 0,
      plannedMinutesThisWeek: profile.weeklyHours * 60,
      lastActiveDate: new Date(),
      currentStreak: profile.currentStreak,
      latestQuizScore: scorePercentage,
      latestCodingPassed: null,
    });

    // Create insights
    for (const risk of risks) {
      const existingInsight = await prisma.agentInsight.findFirst({
        where: {
          studentProfileId: profile.id,
          riskType: risk.riskType,
          status: "PENDING",
        },
      });

      if (!existingInsight) {
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

        // Create notification for the risk
        await prisma.notification.create({
          data: {
            studentProfileId: profile.id,
            title: risk.riskType === "MASTERY_GAP"
              ? "📚 PathForge AI: Concept Reinforcement Needed"
              : risk.riskType === "ACCELERATION_OPPORTUNITY"
                ? "🚀 PathForge AI: Ready for a Challenge?"
                : "🔔 PathForge AI Insight",
            message: risk.explanation,
            type: risk.riskType === "ACCELERATION_OPPORTUNITY" ? "success" : "warning",
            actionUrl: "/student/dashboard",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      score: scorePercentage,
      correctCount,
      totalQuestions,
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
