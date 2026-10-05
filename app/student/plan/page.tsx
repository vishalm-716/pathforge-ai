"use client";

import { useEffect, useState } from "react";
import StudentSidebar from "@/components/StudentSidebar";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  Play,
  Brain,
  BarChart3,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function PlanPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      next.has(week) ? next.delete(week) : next.add(week);
      return next;
    });
  };

  const taskTypeIcon: Record<string, typeof BookOpen> = {
    VIDEO: Play,
    READING: BookOpen,
    QUIZ: BarChart3,
    CODING: Code2,
    REVISION: Brain,
  };

  const statusColor: Record<string, string> = {
    NOT_STARTED: "text-fg-muted border-line bg-elevated",
    IN_PROGRESS: "text-info border-blue-500/30 bg-blue-500/10",
    COMPLETED: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    SKIPPED: "text-fg-muted border-line bg-elevated",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const plan = data?.plan;

  return (
    <div className="min-h-screen bg-canvas">
      <StudentSidebar />
      <main className="ml-64 p-8">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-fg mb-2">Learning Plan</h1>
            {plan && (
              <div className="flex items-center gap-6 text-sm text-fg-muted">
                <span>🎯 {plan.goal}</span>
                <span>📅 {plan.targetDuration} weeks</span>
                <span>📊 {plan.overallProgress}% complete</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {plan && (
            <div className="rounded-2xl border border-line bg-surface p-6 mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-fg-muted">Overall Progress</span>
                <span className="text-fg font-medium">{plan.overallProgress}%</span>
              </div>
              <div className="w-full bg-elevated rounded-full h-3">
                <div
                  className="bg-accent h-3 rounded-full transition-all"
                  style={{ width: `${plan.overallProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-fg-muted mt-2">
                <span>{Math.round(plan.completedMinutes / 60)}h completed</span>
                <span>{Math.round(plan.plannedMinutes / 60)}h planned</span>
              </div>
            </div>
          )}

          {/* Milestones */}
          {plan?.milestones?.map((milestone: any) => (
            <div key={milestone.id} className="mb-4">
              <button
                onClick={() => toggleWeek(milestone.weekNumber)}
                className="w-full flex items-center justify-between p-5 rounded-2xl border border-line bg-surface hover:bg-elevated transition"
              >
                <div className="flex items-center gap-4">
                  {milestone.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-line" />
                  )}
                  <div className="text-left">
                    <h3 className="font-bold text-fg">{milestone.title}</h3>
                    <p className="text-sm text-fg-muted">
                      Due: {new Date(milestone.dueDate).toLocaleDateString()} ·{" "}
                      {milestone.tasks.filter((t: any) => t.status === "COMPLETED").length}/
                      {milestone.tasks.length} tasks
                    </p>
                  </div>
                </div>
                {expandedWeeks.has(milestone.weekNumber) ? (
                  <ChevronDown className="w-5 h-5 text-fg-muted" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-fg-muted" />
                )}
              </button>

              {expandedWeeks.has(milestone.weekNumber) && (
                <div className="ml-8 mt-2 space-y-2">
                  {milestone.tasks.map((task: any) => {
                    const Icon = taskTypeIcon[task.taskType] || BookOpen;
                    return (
                      <Link
                        key={task.id}
                        href={
                          task.taskType === "QUIZ"
                            ? `/student/quiz/${task.id}`
                            : task.taskType === "CODING"
                            ? `/student/code/${task.id}`
                            : `/student/tasks/${task.id}`
                        }
                        className="flex items-center justify-between p-4 rounded-xl border border-line hover:bg-elevated transition group"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${task.status === "COMPLETED" ? "text-emerald-400" : "text-fg-muted"}`} />
                          <div>
                            <p className={`text-sm font-medium ${task.status === "COMPLETED" ? "text-emerald-400 line-through" : "text-fg"} group-hover:text-accent transition`}>
                              {task.title}
                            </p>
                            <p className="text-xs text-fg-muted">
                              {task.topic} · {task.estimatedMinutes} min · Due{" "}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColor[task.status]}`}>
                          {task.status.replace(/_/g, " ")}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {!plan && (
            <div className="text-center py-16">
              <Brain className="w-12 h-12 text-fg-muted mx-auto mb-4" />
              <p className="text-fg-muted">No learning plan yet. Complete onboarding first.</p>
              <Link href="/student/onboarding" className="text-accent hover:text-accent mt-2 inline-block">
                Start Onboarding →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
