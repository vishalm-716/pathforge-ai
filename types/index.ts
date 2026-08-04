import { UserRole, Difficulty, TaskType, TaskStatus, InsightStatus, RiskType } from "@prisma/client";

export type { UserRole, Difficulty, TaskType, TaskStatus, InsightStatus, RiskType };

export interface DashboardData {
  profile: {
    id: string;
    domain: string | null;
    currentLevel: string;
    weeklyHours: number;
    targetWeeks: number;
    currentStreak: number;
    longestStreak: number;
    totalMinutes: number;
    onboardingDone: boolean;
    lastActiveDate: Date | null;
  };
  plan: {
    id: string;
    goal: string;
    targetDuration: number;
    overallProgress: number;
    plannedMinutes: number;
    completedMinutes: number;
    startDate: Date;
    endDate: Date;
  } | null;
  upcomingTasks: {
    id: string;
    title: string;
    topic: string;
    taskType: TaskType;
    status: TaskStatus;
    estimatedMinutes: number;
    dueDate: Date;
    resourceId: string | null;
  }[];
  pendingInsight: {
    id: string;
    riskType: RiskType;
    priority: number;
    signal: string;
    explanation: string;
    recommendedChanges: string;
    status: InsightStatus;
    createdAt: Date;
  } | null;
  notifications: {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
  }[];
  recentActivity: {
    id: string;
    action: string;
    details: string | null;
    minutesSpent: number;
    createdAt: Date;
  }[];
}

export interface OnboardingData {
  domain: string;
  currentLevel: Difficulty;
  weeklyHours: number;
  targetWeeks: number;
  learningStyle: string;
}

export interface AdminStudentView {
  id: string;
  name: string | null;
  email: string;
  domain: string | null;
  progress: number;
  streak: number;
  latestQuizScore: number | null;
  currentRisk: RiskType | null;
  pendingRecommendations: number;
}
