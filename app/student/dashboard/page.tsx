"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/StudentSidebar";
import AgentInsightCard from "@/components/AgentInsightCard";
import {
  Flame,
  Clock,
  Target,
  Calendar,
  BookOpen,
  Code2,
  Play,
  Bell,
  Brain,
  ArrowRight,
  BarChart3,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleInsightRespond = async (insightId: string, decision: string) => {
    await fetch("/api/insights/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insightId, decision }),
    });
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-400">Failed to load dashboard. Please refresh.</p>
        </div>
      </div>
    );
  }

  const { profile, plan, upcomingTasks, pendingInsight, notifications, recentActivity, userName } = data;

  const taskTypeIcon: Record<string, typeof BookOpen> = {
    VIDEO: Play,
    READING: BookOpen,
    QUIZ: BarChart3,
    CODING: Code2,
    REVISION: Brain,
  };

  const taskTypeBadge: Record<string, string> = {
    VIDEO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    READING: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    QUIZ: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    CODING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    REVISION: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <StudentSidebar />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {userName || "Learner"} 👋
            </h1>
            <p className="text-slate-400 mt-1">
              {plan ? `Working on: ${plan.goal}` : "Start your learning journey"}
            </p>
          </div>
          <Link
            href="/student/notifications"
            className="relative p-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition"
          >
            <Bell className="w-5 h-5 text-slate-400" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center pulse-dot">
                {notifications.length}
              </span>
            )}
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 glow-cyan">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-sm text-slate-400">Progress</span>
            </div>
            <p className="text-3xl font-bold text-white">{plan?.overallProgress || 0}%</p>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                style={{ width: `${plan?.overallProgress || 0}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-sm text-slate-400">Current Streak</span>
            </div>
            <p className="text-3xl font-bold text-white">{profile.currentStreak}</p>
            <p className="text-sm text-slate-500 mt-1">days (best: {profile.longestStreak})</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-400">Time Spent</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {Math.round(profile.totalMinutes / 60 * 10) / 10}h
            </p>
            <p className="text-sm text-slate-500 mt-1">
              of {plan ? Math.round(plan.plannedMinutes / 60) : 0}h planned
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">Weekly Goal</span>
            </div>
            <p className="text-3xl font-bold text-white">{profile.weeklyHours}h</p>
            <p className="text-sm text-slate-500 mt-1">per week</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Agent Insight */}
            {pendingInsight && (
              <AgentInsightCard
                insight={pendingInsight}
                onRespond={handleInsightRespond}
              />
            )}

            {/* Today's Next Best Action */}
            {upcomingTasks.length > 0 && (
              <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-bold text-white">Today&apos;s Next Best Action</h2>
                </div>
                <div className="flex items-center justify-between bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${taskTypeBadge[upcomingTasks[0].taskType] || "bg-slate-700"} flex items-center justify-center border`}>
                      {(() => {
                        const Icon = taskTypeIcon[upcomingTasks[0].taskType] || BookOpen;
                        return <Icon className="w-5 h-5" />;
                      })()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{upcomingTasks[0].title}</p>
                      <p className="text-sm text-slate-400">
                        {upcomingTasks[0].topic} · {upcomingTasks[0].estimatedMinutes} min
                      </p>
                    </div>
                  </div>
                  <Link
                    href={
                      upcomingTasks[0].taskType === "QUIZ"
                        ? `/student/quiz/${upcomingTasks[0].id}`
                        : upcomingTasks[0].taskType === "CODING"
                        ? `/student/code/${upcomingTasks[0].id}`
                        : `/student/tasks/${upcomingTasks[0].id}`
                    }
                    className="px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 text-sm font-medium transition flex items-center gap-2"
                  >
                    Start <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Upcoming Tasks */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Upcoming Tasks</h2>
                <Link
                  href="/student/plan"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                >
                  View Plan <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {upcomingTasks.map((task: any) => {
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
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-800 hover:bg-slate-800/50 transition group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-lg ${taskTypeBadge[task.taskType] || "bg-slate-700"} flex items-center justify-center border`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-cyan-400 transition text-sm">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {task.topic} · {task.estimatedMinutes} min ·{" "}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${taskTypeBadge[task.taskType]}`}>
                        {task.taskType}
                      </span>
                    </Link>
                  );
                })}

                {upcomingTasks.length === 0 && (
                  <p className="text-center text-slate-500 py-8">
                    No upcoming tasks. Great job! 🎉
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Smart Nudges */}
            {notifications.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Smart Nudges
                </h3>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((n: any) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl text-sm ${
                        n.type === "warning"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                          : n.type === "success"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                          : "bg-slate-800/50 border border-slate-700 text-slate-300"
                      }`}
                    >
                      <p className="font-medium mb-1">{n.title}</p>
                      <p className="text-xs opacity-80">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((a: any) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-300">{a.action.replace(/_/g, " ")}</p>
                      {a.details && (
                        <p className="text-xs text-slate-500 mt-0.5">{a.details}</p>
                      )}
                      <p className="text-xs text-slate-600 mt-0.5">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                {recentActivity.length === 0 && (
                  <p className="text-sm text-slate-500">No activity yet</p>
                )}
              </div>
            </div>

            {/* Plan Summary */}
            {plan && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-4">Plan Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Track</span>
                    <span className="text-white font-medium">{plan.trackTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-white font-medium">{plan.targetDuration} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Planned</span>
                    <span className="text-white font-medium">{Math.round(plan.plannedMinutes / 60)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completed</span>
                    <span className="text-emerald-400 font-medium">{Math.round(plan.completedMinutes / 60)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ends</span>
                    <span className="text-white font-medium">
                      {new Date(plan.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
