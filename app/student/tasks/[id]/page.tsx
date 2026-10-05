"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import { requiredWatchMinutes, VIDEO_COMPLETE_PROGRESS } from "@/lib/constants";
import { isPlaylistUrl, extractVideoId } from "@/lib/video";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  ArrowLeft,
  PlayCircle,
  ShieldCheck,
  Video,
  AlertTriangle,
} from "lucide-react";

// Difficulty badge colour mapping
const difficultyStyle: Record<string, string> = {
  BEGINNER: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  INTERMEDIATE: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// YouTube IFrame API player states
const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

// A forward jump larger than this (in seconds) that isn't explained by normal
// playback is treated as a seek on the scrubber and snapped back.
const SEEK_TOLERANCE_SECONDS = 3;

type PlayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [minutes, setMinutes] = useState(15);
  const [completed, setCompleted] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  // Embedded-player state (single videos)
  const playerBoxRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const openedAtRef = useRef<number | null>(null);
  const lastSentRef = useRef(0);
  const lastBeatRef = useRef(0);
  // Anti-skip guard: last known playback position + wall-clock sample time
  const lastSampleRef = useRef<{ time: number; at: number } | null>(null);
  const [ytApiLoaded, setYtApiLoaded] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("idle");
  const [verifiedProgress, setVerifiedProgress] = useState(0); // server-confirmed
  const [seekWarning, setSeekWarning] = useState(false);

  // Playlist fallback state
  const [videoOpenedAt, setVideoOpenedAt] = useState<number | null>(null);
  const [openingVideo, setOpeningVideo] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(async (data) => {
        const allTasks =
          data.plan?.milestones?.flatMap((m: any) => m.tasks) || [];
        const found = allTasks.find((t: any) => t.id === params.id);
        setTask(found || null);
        if (found) setMinutes(found.estimatedMinutes ?? 15);
        setLoading(false);

        // Restore verified progress + opened state on refresh
        if (found?.taskType === "VIDEO" && found?.resource?.youtubeUrl) {
          try {
            const res = await fetch(`/api/tasks/visit?taskId=${params.id}`);
            const v = await res.json();
            if (v?.progress) setVerifiedProgress(v.progress);
            if (v?.opened && v?.openedAt) {
              openedAtRef.current = new Date(v.openedAt).getTime();
              setVideoOpenedAt(openedAtRef.current);
            }
          } catch {
            // non-fatal — completion stays locked server-side anyway
          }
        }
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  // ── Load the YouTube IFrame API once ────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as any;
    if (w.YT && w.YT.Player) {
      setYtApiLoaded(true);
      return;
    }
    if (document.getElementById("yt-iframe-api")) return;
    const tag = document.createElement("script");
    tag.id = "yt-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    w.onYouTubeIframeAPIReady = () => setYtApiLoaded(true);
    document.head.appendChild(tag);
  }, []);

  // Send a heartbeat to the server (progress + watched seconds).
  const sendHeartbeat = async (progress: number, secondsWatched: number) => {
    try {
      const res = await fetch("/api/tasks/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: params.id, progress, secondsWatched }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.progress === "number") {
          setVerifiedProgress((p) => Math.max(p, data.progress));
        }
        lastSentRef.current = progress;
        lastBeatRef.current = Date.now();
      }
    } catch {
      // transient — the next tick will retry
    }
  };

  // Create the embedded player once the API + videoId are available.
  const videoId = task?.resource?.youtubeUrl
    ? extractVideoId(task.resource.youtubeUrl)
    : null;
  const embeddable = !!videoId && !isPlaylistUrl(task?.resource?.youtubeUrl ?? "");

  useEffect(() => {
    if (!ytApiLoaded || !embeddable || playerRef.current) return;
    const w = window as any;
    if (!w.YT?.Player || !playerBoxRef.current) return;

    const player = new w.YT.Player(playerBoxRef.current, {
      videoId,
      // disablekb blocks keyboard seeking (arrow keys / j / k / home / end).
      // Scrubber drags are caught by the seek-guard poller below.
      playerVars: { rel: 0, modestbranding: 1, playsinline: 1, disablekb: 1 },
      events: {
        onReady: () => setPlayerStatus("ready"),
        onError: () => setPlayerStatus("error"),
        onStateChange: (e: any) => {
          const state: number = e?.data;
          if (state === YT_STATE.PLAYING) {
            setPlayerStatus("playing");
            setSeekWarning(false);
            // Record the open on first playback start (server rejects
            // heartbeats before the video has been opened).
            if (openedAtRef.current === null) {
              fetch("/api/tasks/visit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId: params.id }),
              })
                .then((r) => r.json())
                .then((v) => {
                  if (v?.openedAt) {
                    const t = new Date(v.openedAt).getTime();
                    openedAtRef.current = t;
                    setVideoOpenedAt(t);
                  }
                })
                .catch(() => {});
            }
          } else if (state === YT_STATE.PAUSED) {
            setPlayerStatus("paused");
          } else if (state === YT_STATE.ENDED) {
            setPlayerStatus("ended");
            const dur = player.getDuration?.() ?? 0;
            sendHeartbeat(100, Math.round(dur));
          }
        },
      },
    });
    playerRef.current = player;

    return () => {
      try {
        playerRef.current?.destroy?.();
      } catch {
        // ignore destroy errors on unmount
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytApiLoaded, embeddable, videoId]);

  // Poll playback position every 5s while playing and heartbeat increases.
  useEffect(() => {
    if (playerStatus !== "playing") return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p || typeof p.getDuration !== "function") return;
      const dur = p.getDuration();
      if (!dur || dur <= 0) return;
      const cur = p.getCurrentTime();
      const pct = Math.min(100, Math.round((cur / dur) * 100));
      const nowMs = Date.now();
      if (pct - lastSentRef.current >= 2 || nowMs - lastBeatRef.current >= 10000) {
        sendHeartbeat(pct, Math.round(cur));
      }
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerStatus]);

  // Reset the seek-guard baseline whenever the video changes (the player is
  // recreated, so the old video's position must not leak into the new one).
  useEffect(() => {
    lastSampleRef.current = null;
    setSeekWarning(false);
  }, [videoId]);

  // ── Anti-skip guard: the red scrubber can't be used to skip ahead ──
  // Samples the player every second. If the position jumps more than
  // SEEK_TOLERANCE_SECONDS ahead of where playback should be (accounting for
  // the current playback rate), the student dragged the progress bar forward
  // — snap back to the expected position and pause, so skipped content is
  // never counted as watched and heartbeats stay honest.
  useEffect(() => {
    if (!embeddable) return;
    if (playerStatus !== "playing" && playerStatus !== "paused") return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p || typeof p.getCurrentTime !== "function") return;
      const state =
        typeof p.getPlayerState === "function"
          ? p.getPlayerState()
          : YT_STATE.PAUSED;
      const dur = typeof p.getDuration === "function" ? p.getDuration() : 0;
      const cur = p.getCurrentTime();
      const nowMs = Date.now();
      const last = lastSampleRef.current;

      if (!last) {
        lastSampleRef.current = { time: cur, at: nowMs };
        return;
      }

      let expected = last.time;
      if (state === YT_STATE.PLAYING) {
        const rate =
          typeof p.getPlaybackRate === "function" ? p.getPlaybackRate() || 1 : 1;
        expected = last.time + ((nowMs - last.at) / 1000) * rate;
        if (dur > 0) expected = Math.min(expected, dur);
      }

      // A forward jump not explained by playback rate = a scrubber drag.
      if (cur > expected + SEEK_TOLERANCE_SECONDS) {
        const snapBack = Math.max(0, Math.min(expected, dur));
        try {
          p.seekTo(snapBack, true);
          p.pauseVideo();
        } catch {
          // ignore player errors during the snap-back
        }
        lastSampleRef.current = { time: snapBack, at: nowMs };
        setSeekWarning(true);
        return;
      }

      // Backward seeks can't inflate progress — just re-baseline.
      lastSampleRef.current = { time: cur, at: nowMs };
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embeddable, playerStatus]);

  // Single-video unlock: server-verified progress >= 80%
  // Playlist fallback unlock: opened + dwell time elapsed
  const videoLocked = task?.taskType === "VIDEO" && task?.resource?.youtubeUrl;
  const playlist = videoLocked
    ? isPlaylistUrl(task.resource.youtubeUrl)
    : false;

  // Tick every second for the playlist fallback countdown (embedded single
  // videos use heartbeat progress instead — no countdown needed).
  useEffect(() => {
    if (!playlist || videoOpenedAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [playlist, videoOpenedAt]);

  // ── Playlist fallback: open the link via our API, then YouTube ──
  const handleWatchVideo = async () => {
    if (!task?.resource?.youtubeUrl) return;
    setOpeningVideo(true);
    setCompleteError(null);
    try {
      const res = await fetch("/api/tasks/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: params.id }),
      });
      const v = await res.json();
      if (res.ok && v?.openedAt) {
        const t = new Date(v.openedAt).getTime();
        openedAtRef.current = t;
        setVideoOpenedAt(t);
      }
    } catch {
      // server-side check remains the source of truth
    } finally {
      setOpeningVideo(false);
      window.open(task.resource.youtubeUrl, "_blank", "noopener,noreferrer");
    }
  };

  const requiredMin = playlist
    ? requiredWatchMinutes(task.resource.estimatedMinutes || task.estimatedMinutes || 15)
    : 0;
  const remainingSec = playlist
    ? Math.max(0, requiredMin * 60 - ((videoOpenedAt ? now - videoOpenedAt : Infinity) / 1000))
    : 0;

  const videoUnlocked = !videoLocked || (playlist
    ? videoOpenedAt !== null && remainingSec <= 0
    : verifiedProgress >= VIDEO_COMPLETE_PROGRESS);

  const handleComplete = async () => {
    setCompleting(true);
    setCompleteError(null);
    try {
      // Video tasks credit the video's estimated duration (they've watched
      // >=80% of it server-verified) — no manual minutes box.
      const actualMinutes =
        task?.taskType === "VIDEO"
          ? task?.resource?.estimatedMinutes || task?.estimatedMinutes || 15
          : minutes;
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: params.id, actualMinutes }),
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

                      {/* ── Embedded player (single videos) ── */}
                      {embeddable ? (
                        <div className="space-y-3">
                          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
                            <div ref={playerBoxRef} className="w-full h-full" />
                            {playerStatus === "idle" && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin text-red-400" />
                                <span className="text-sm">Loading video player…</span>
                              </div>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-slate-400">
                                {playerStatus === "playing" && "Playing…"}
                                {playerStatus === "paused" && "Paused"}
                                {playerStatus === "ended" && "Finished"}
                                {(playerStatus === "idle" || playerStatus === "loading" || playerStatus === "ready") &&
                                  "Press play to start"}
                                {playerStatus === "error" && "Video unavailable"}
                              </span>
                              <span
                                className={`font-semibold tabular-nums ${
                                  verifiedProgress >= VIDEO_COMPLETE_PROGRESS
                                    ? "text-emerald-400"
                                    : "text-amber-400"
                                }`}
                              >
                                {Math.round(verifiedProgress)}% verified
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  verifiedProgress >= VIDEO_COMPLETE_PROGRESS
                                    ? "bg-emerald-500"
                                    : "bg-gradient-to-r from-red-500 to-amber-400"
                                }`}
                                style={{ width: `${Math.min(100, verifiedProgress)}%` }}
                              />
                            </div>
                            {verifiedProgress < VIDEO_COMPLETE_PROGRESS && (
                              <p className="text-xs text-slate-500 mt-1.5">
                                Completion unlocks at {VIDEO_COMPLETE_PROGRESS}% of the video played
                                ({Math.max(0, VIDEO_COMPLETE_PROGRESS - Math.round(verifiedProgress))}% to go).
                              </p>
                            )}
                            {verifiedProgress >= VIDEO_COMPLETE_PROGRESS && (
                              <p className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Playback verified — you can complete this task.
                              </p>
                            )}
                            {playerStatus === "error" && (
                              <p className="flex items-start gap-1.5 text-xs text-red-400 mt-2">
                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                This video can't be embedded, so playback can't be verified here.
                                Contact support if it stays unavailable.
                              </p>
                            )}

                            {seekWarning && (
                              <p className="flex items-start gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mt-2">
                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                Skipping ahead is disabled — playback is verified automatically.
                                Press play to continue from where you were.
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* ── Playlist / non-embeddable fallback ── */
                        <div className="space-y-3">
                          <button
                            onClick={handleWatchVideo}
                            disabled={openingVideo}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition text-sm font-medium disabled:opacity-60 disabled:cursor-wait"
                          >
                            {openingVideo ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ExternalLink className="w-4 h-4" />
                            )}
                            {openingVideo ? "Opening..." : watchLabel}
                          </button>

                          {videoOpenedAt !== null && (
                            <div className="flex items-center gap-2 text-xs text-emerald-400">
                              <ShieldCheck className="w-4 h-4" />
                              {remainingSec > 0 ? (
                                <span>
                                  Video opened ✓ — completion unlocks in{" "}
                                  <span className="font-semibold tabular-nums">
                                    {formatCountdown(remainingSec)}
                                  </span>
                                </span>
                              ) : (
                                <span>Video opened ✓ — watch time verified</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
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
                  {/* Video tasks: minutes come from the verified playback (the
                      video's estimated duration), so the manual input is not
                      shown — it's neither needed nor trustworthy here. */}
                  {task.taskType !== "VIDEO" && (
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
                  )}

                  {videoLocked && !videoUnlocked && (
                    <p className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                      {playlist
                        ? videoOpenedAt === null
                          ? "Open the playlist link first — completion is locked until the video has been opened and the required watch time is met."
                          : `Watch time in progress — completion unlocks in ${formatCountdown(remainingSec)}.`
                        : verifiedProgress <= 0
                        ? "Play the video in the embedded player — completion unlocks after at least 80% of the video has played."
                        : `Keep watching — completion unlocks at ${VIDEO_COMPLETE_PROGRESS}% of the video. You're at ${Math.round(verifiedProgress)}%.`}
                    </p>
                  )}

                  <button
                    onClick={handleComplete}
                    disabled={completing || (videoLocked && !videoUnlocked)}
                    title={
                      videoLocked && !videoUnlocked
                        ? "Watch at least 80% of the video before marking this task complete."
                        : undefined
                    }
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
