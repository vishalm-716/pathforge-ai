import { RiskType } from "@prisma/client";

/**
 * Deterministic explanation templates — used when Gemini is unavailable.
 */

const explanationTemplates: Record<RiskType, (data: Record<string, string | number>) => string> = {
  MASTERY_GAP: (data) =>
    `Your ${data.topic || "recent"} quiz score was ${data.score}%, so PathForge AI added a 20-minute revision video and a guided coding task before moving you to more advanced problems.`,

  CODING_GAP: (data) =>
    `Your coding submission for "${data.topic || "the recent challenge"}" didn't pass. PathForge AI recommends a guided retry with hints and a focused concept review video.`,

  INACTIVITY_RISK: (data) =>
    `You haven't practiced ${data.topic || "your current topic"} for ${data.days || 3} days. To keep your plan realistic, start with the 15-minute recap task, then retry your current challenge.`,

  SCHEDULE_RISK: (data) =>
    `You've used only ${data.percentage || 0}% of your planned study time this week. PathForge AI suggests smaller daily tasks to help you catch up without feeling overwhelmed.`,

  ACCELERATION_OPPORTUNITY: (data) =>
    `Great work! You scored ${data.score}% on your ${data.topic || "recent"} quiz. PathForge AI is offering an optional advanced challenge to accelerate your growth.`,
};

export function getExplanation(
  riskType: RiskType,
  data: Record<string, string | number>
): string {
  const template = explanationTemplates[riskType];
  return template ? template(data) : "PathForge AI has detected a change in your learning pattern and is recommending an adjustment.";
}

export function getNudgeMessage(
  riskType: RiskType,
  data: Record<string, string | number>
): string {
  switch (riskType) {
    case RiskType.INACTIVITY_RISK:
      return `You have not practiced ${data.topic || "your current topic"} for ${data.days || 3} days. To keep your ${data.domain || "learning"} plan realistic, start with the 15-minute ${data.topic || "Topic"} Traversal recap, then retry the current task.`;
    case RiskType.SCHEDULE_RISK:
      return `You're behind on your weekly study goal. Try a quick 10-minute task today to build momentum.`;
    case RiskType.MASTERY_GAP:
      return `Your recent quiz showed some gaps. Review the revision material before attempting the next topic.`;
    case RiskType.CODING_GAP:
      return `Don't worry about the coding challenge — review the concept video and try the guided version.`;
    case RiskType.ACCELERATION_OPPORTUNITY:
      return `You're doing great! Check out the bonus challenge to push your skills further.`;
    default:
      return "PathForge AI has a new recommendation for your learning path.";
  }
}
