import { RiskType } from "@prisma/client";
import type { RiskSignal, StudentActivity, RecommendedChange } from "./types";

/**
 * Deterministic risk detection rules for the PathForge AI agent.
 * These rules do NOT depend on Gemini/LLM — they use explicit thresholds.
 */

export function detectRisks(activity: StudentActivity): RiskSignal[] {
  const risks: RiskSignal[] = [];

  // Rule 1: MASTERY_GAP — quiz score < 100%
  if (activity.latestQuizScore !== null && activity.latestQuizScore < 100) {
    risks.push({
      riskType: RiskType.MASTERY_GAP,
      priority: 1,
      signal: `Quiz score: ${activity.latestQuizScore}% (below 100% threshold)`,
      explanation: getMasteryGapExplanation(activity.latestQuizScore),
      recommendedChanges: getMasteryGapChanges(),
    });
  }

  // Rule 2: CODING_GAP — coding task failed
  if (activity.latestCodingPassed === false) {
    risks.push({
      riskType: RiskType.CODING_GAP,
      priority: 2,
      signal: "Latest coding challenge was not passed",
      explanation: getCodingGapExplanation(),
      recommendedChanges: getCodingGapChanges(),
    });
  }

  // Rule 3: INACTIVITY_RISK — inactive 3+ days
  if (activity.lastActiveDate) {
    const daysSinceActive = Math.floor(
      (Date.now() - activity.lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceActive >= 3) {
      risks.push({
        riskType: RiskType.INACTIVITY_RISK,
        priority: 1,
        signal: `No activity for ${daysSinceActive} days`,
        explanation: getInactivityExplanation(daysSinceActive),
        recommendedChanges: getInactivityChanges(),
      });
    }
  }

  // Rule 4: SCHEDULE_RISK — actual < 70% of planned weekly time
  if (
    activity.plannedMinutesThisWeek > 0 &&
    activity.totalMinutesThisWeek < activity.plannedMinutesThisWeek * 0.7
  ) {
    const pct = Math.round(
      (activity.totalMinutesThisWeek / activity.plannedMinutesThisWeek) * 100
    );
    risks.push({
      riskType: RiskType.SCHEDULE_RISK,
      priority: 2,
      signal: `Weekly study time at ${pct}% of planned (${activity.totalMinutesThisWeek}/${activity.plannedMinutesThisWeek} min)`,
      explanation: getScheduleRiskExplanation(pct),
      recommendedChanges: getScheduleRiskChanges(),
    });
  }

  // Rule 5: ACCELERATION_OPPORTUNITY — quiz score >= 80%
  if (activity.latestQuizScore !== null && activity.latestQuizScore >= 80) {
    risks.push({
      riskType: RiskType.ACCELERATION_OPPORTUNITY,
      priority: 3,
      signal: `Quiz score: ${activity.latestQuizScore}% (above 80% threshold)`,
      explanation: getAccelerationExplanation(activity.latestQuizScore),
      recommendedChanges: getAccelerationChanges(),
    });
  }

  return risks.sort((a, b) => a.priority - b.priority);
}

// ─── Mastery Gap ────────────────────────────────────

function getMasteryGapExplanation(score: number): string {
  return `Your quiz score was ${score}%, which indicates gaps in understanding. PathForge AI is adding a focused revision video and a guided coding task to reinforce the concepts before moving forward.`;
}

function getMasteryGapChanges(): RecommendedChange[] {
  return [
    {
      type: "ADD_TASK",
      description: "Add a 20-minute revision video on weak topics",
      taskData: {
        title: "Revision: Core Concept Review",
        topic: "Revision",
        taskType: "REVISION",
        estimatedMinutes: 20,
        description: "Review the fundamental concepts that were challenging in the recent quiz.",
      },
    },
    {
      type: "ADD_TASK",
      description: "Add a guided coding practice task",
      taskData: {
        title: "Guided Practice: Reinforce Basics",
        topic: "Practice",
        taskType: "CODING",
        estimatedMinutes: 25,
        description: "Work through a simpler version of the coding problem to build confidence.",
      },
    },
    {
      type: "POSTPONE_TASK",
      description: "Postpone next advanced task by 2 days",
      postponeDays: 2,
    },
  ];
}

// ─── Coding Gap ─────────────────────────────────────

function getCodingGapExplanation(): string {
  return "Your latest coding challenge wasn't passed. PathForge AI recommends a guided retry with hints and a concept revision task to strengthen your understanding.";
}

function getCodingGapChanges(): RecommendedChange[] {
  return [
    {
      type: "ADD_TASK",
      description: "Add a guided retry with step-by-step hints",
      taskData: {
        title: "Guided Retry: Coding Challenge",
        topic: "Coding Practice",
        taskType: "CODING",
        estimatedMinutes: 30,
        description: "Retry the coding challenge with guided hints and step-by-step approach.",
      },
    },
    {
      type: "ADD_TASK",
      description: "Add concept revision video",
      taskData: {
        title: "Concept Review: Related Topic",
        topic: "Revision",
        taskType: "VIDEO",
        estimatedMinutes: 15,
        description: "Watch a focused video covering the concepts needed for the coding challenge.",
      },
    },
  ];
}

// ─── Inactivity Risk ────────────────────────────────

function getInactivityExplanation(days: number): string {
  return `You haven't practiced for ${days} days. To keep your learning plan realistic, PathForge AI suggests starting with a quick 15-minute recap task to rebuild momentum.`;
}

function getInactivityChanges(): RecommendedChange[] {
  return [
    {
      type: "ADD_TASK",
      description: "Create a 15-minute restart action",
      taskData: {
        title: "Quick Restart: 15-Minute Recap",
        topic: "Recap",
        taskType: "REVISION",
        estimatedMinutes: 15,
        description: "A short recap task to help you get back on track without feeling overwhelmed.",
      },
    },
    {
      type: "ADD_NOTIFICATION",
      description: "Send contextual nudge about inactivity",
    },
  ];
}

// ─── Schedule Risk ──────────────────────────────────

function getScheduleRiskExplanation(pct: number): string {
  return `You've completed only ${pct}% of your planned study time this week. PathForge AI suggests breaking upcoming tasks into smaller daily chunks to help you stay on track.`;
}

function getScheduleRiskChanges(): RecommendedChange[] {
  return [
    {
      type: "MODIFY_TASK",
      description: "Break upcoming tasks into smaller daily tasks",
    },
    {
      type: "POSTPONE_TASK",
      description: "Reschedule upcoming tasks to spread workload",
      postponeDays: 1,
    },
  ];
}

// ─── Acceleration ───────────────────────────────────

function getAccelerationExplanation(score: number): string {
  return `Excellent! You scored ${score}% on your quiz. PathForge AI sees an opportunity to challenge you with an optional harder coding task to accelerate your growth.`;
}

function getAccelerationChanges(): RecommendedChange[] {
  return [
    {
      type: "ADD_TASK",
      description: "Add optional advanced coding challenge",
      taskData: {
        title: "Bonus Challenge: Advanced Problem",
        topic: "Advanced",
        taskType: "CODING",
        estimatedMinutes: 35,
        description: "An optional harder coding challenge to push your skills further. Great job on the quiz!",
      },
    },
  ];
}
