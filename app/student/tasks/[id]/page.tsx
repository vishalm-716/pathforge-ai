"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  ArrowLeft,
  PlayCircle,
  Video,
} from "lucide-react";

// Determine whether a YouTube URL points to a playlist
function isPlaylist(url: string): boolean {
  return url.includes("/playlist") || url.includes("list=");
}

// Difficulty badge colour mapping
const difficultyStyle: Record<string, string> = {
  BEGINNER: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  INTERMEDIATE: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [minutes, setMinutes] = useState(15);
  const [completed, setCompleted] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        const allTasks =
          data.plan?.milestones?.flatMap((m: any) => m.tasks) || [];
        const found = allTasks.find((t: any) => t.id === params.id);
        setTask(found || null);
        if (found) setMinutes(found.estimatedMinutes ?? 15);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleComplete = async () => {
    setCompleting(true);
    setCompleteError(null);
    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: params.id, actualMinutes: minutes }),
      });
      if (res.ok) {
        setCompleted(true);
      } else {
        let msg = "Failed to mark task as complete. Please try again.";
        try {
          const body = await res.json();
          if (body?.error) msg = body.error;
          else if (body?.message) msg = body.message;
        } catch {
          // keep default message
        }
        setCompleteError(msg);
      }
    } catch {
      setCompleteError("Network error. Please check your connection and try again.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Resolve resource data
  const resource = task?.resource ?? null;
  const hasVideo = resource && resource.youtubeUrl;
  const playlist = hasVideo ? isPlaylist(resource.youtubeUrl) : false;
  const watchLabel = playlist ? "Open Playlist" : "Watch Video";

  return (
    <div className="min-h-screen bg-slate-950">
      <StudentSidebar />
      <main className="ml-64 p-8">
        <div className="max-w-2xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {task ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 space-y-6">
              {/* Task type badge + title */}
              <div>
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {task.taskType}
                </span>
                <h1 className="text-2xl font-bold text-white mt-3">{task.title}</h1>
                <p className="text-slate-400 mt-2">{task.topic}</p>
              </div>

              {task.description && (
                <p className="text-slate-300 leading-relaxed">{task.description}</p>
              )}

              {/* Basic task meta */}
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {task.estimatedMinutes} minutes
                </span>
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>

              {/* ── Resource section (VIDEO tasks) ── */}
              {task.taskType === "VIDEO" && (
                <>
                  {hasVideo ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5 space-y-4">
                      {/* Resource title */}
                      <h2 className="text-lg font-semibold text-white">{resource.title}</h2>

                      {/* Topic + duration + difficulty + Video/Playlist badge */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-slate-400">{resource.topic}</span>

                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {resource.estimatedMinutes} min
                        </span>

                        {resource.difficulty && (
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                              difficultyStyle[resource.difficulty] ??
                              "bg-slate-700 text-slate-300 border border-slate-600"
                            }`}
                          >
                            {resource.difficulty}
                          </span>
                        )}

                        {/* Video / Playlist badge with icon */}
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {playlist ? (
                            <Video className="w-3.5 h-3.5" />
                          ) : (
                            <PlayCircle className="w-3.5 h-3.5" />
                          )}
                          {playlist ? "Playlist" : "Video"}
                        </span>
                      </div>

                      {/* Watch link — plain <a>, never triggers task completion */}
                      <a
                        href={resource.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {watchLabel}
                      </a>
                    </div>
                  ) : (
                    /* Fallback — resourceId is null or URL is empty */
                    <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
                      <p className="text-slate-400 text-sm">
                        No video resource available for this task yet.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ── Completion controls ── */}
              {completed || task.status === "COMPLETED" ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-emerald-400">Task Completed!</p>
                    <p className="text-sm text-emerald-300/70">Great work. Keep going!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Actual time spent (minutes)
                    </label>
                    <input
                      type="number"
                      value={minutes}
                      onChange={(e) =>
                        setMinutes(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      min={1}
                      max={300}
                      className="w-32 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
                  >
                    {completing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Complete
                      </>
                    )}
                  </button>

                  {/* Inline error for non-2xx completion response */}
                  {completeError && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      {completeError}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400">Task not found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
