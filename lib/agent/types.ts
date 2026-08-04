import { RiskType, InsightStatus, TaskStatus, TaskType } from "@prisma/client";

export interface RiskSignal {
  riskType: RiskType;
  priority: number;
  signal: string;
  explanation: string;
  recommendedChanges: RecommendedChange[];
}

export interface RecommendedChange {
  type: "ADD_TASK" | "POSTPONE_TASK" | "MODIFY_TASK" | "ADD_NOTIFICATION";
  description: string;
  taskData?: {
    title: string;
    topic: string;
    taskType: TaskType;
    estimatedMinutes: number;
    description?: string;
  };
  postponeDays?: number;
}

export interface AdaptationResult {
  riskType: RiskType;
  signal: string;
  explanation: string;
  recommendedChanges: string;
  priority: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  topic: string;
}

export interface CodingResult {
  passed: boolean;
  score: number;
  topic: string;
}

export interface StudentActivity {
  totalMinutesThisWeek: number;
  plannedMinutesThisWeek: number;
  lastActiveDate: Date | null;
  currentStreak: number;
  latestQuizScore: number | null;
  latestCodingPassed: boolean | null;
}

export interface LearnerProfile {
  domain: string;
  currentLevel: string;
  weeklyHours: number;
  targetWeeks: number;
  learningStyle: string;
}

export interface PlanMilestone {
  title: string;
  weekNumber: number;
  description: string;
  tasks: PlanTask[];
}

export interface PlanTask {
  title: string;
  topic: string;
  taskType: TaskType;
  estimatedMinutes: number;
  description?: string;
  resourceId?: string | null;
  orderIndex: number;
}
