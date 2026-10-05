"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import {
  Settings,
  Save,
  Loader2,
  CheckCircle2,
  User,
  Bell,
  Gauge,
  Palette,
  BookOpen,
  ArrowRightLeft,
  AlertTriangle,
  X,
} from "lucide-react";

const DOMAINS = [
  { value: "dsa", label: "DSA", desc: "Data Structures & Algorithms", icon: "🧮" },
  { value: "python", label: "Python", desc: "Python Programming", icon: "🐍" },
  { value: "javascript", label: "JavaScript", desc: "JavaScript Development", icon: "⚡" },
  { value: "react", label: "React", desc: "React.js Development", icon: "⚛️" },
  { value: "java", label: "Java", desc: "Java Programming", icon: "☕" },
  { value: "nodejs", label: "Node.js", desc: "Node.js Backend Development", icon: "🟢" },
  { value: "sql", label: "SQL", desc: "SQL & Database Management", icon: "🗄️" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Settings fields
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [learningPace, setLearningPace] = useState("standard");
  const [notifyTaskReminders, setNotifyTaskReminders] = useState(true);
  const [notifyInactivityNudges, setNotifyInactivityNudges] = useState(true);
  const [contentStyle, setContentStyle] = useState("balanced");

  // Account info (read-only)
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Current track
  const [currentTrack, setCurrentTrack] = useState<{ id: string; title: string; slug: string } | null>(null);
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);

  // Switch track modal
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switchStep, setSwitchStep] = useState<"select" | "confirm">("select");
  const [selectedNewDomain, setSelectedNewDomain] = useState("");
  const [selectedNewLevel, setSelectedNewLevel] = useState("BEGINNER");
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setWeeklyHours(data.weeklyHours ?? 5);
          setLearningPace(data.learningPace ?? "standard");
          setNotifyTaskReminders(data.notifyTaskReminders ?? true);
          setNotifyInactivityNudges(data.notifyInactivityNudges ?? true);
          setContentStyle(data.contentStyle ?? "balanced");
          setUserName(data.userName);
          setUserEmail(data.userEmail);
          setCurrentTrack(data.currentTrack);
          setCurrentDomain(data.domain);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weeklyHours,
        learningPace,
        notifyTaskReminders,
        notifyInactivityNudges,
        contentStyle,
      }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleSwitchTrack = async () => {
    setSwitching(true);
    try {
      const res = await fetch("/api/switch-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: selectedNewDomain,
          currentLevel: selectedNewLevel,
        }),
      });
      if (res.ok) {
        setShowSwitchModal(false);
        setSwitchStep("select");
        router.push("/student/dashboard");
      }
    } catch {
      // error handled silently
    }
    setSwitching(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const paceOptions = [
    { value: "relaxed", label: "Relaxed", desc: "Lighter schedule, more review time" },
    { value: "standard", label: "Standard", desc: "Balanced pace for steady progress" },
    { value: "intensive", label: "Intensive", desc: "Aggressive timeline, faster progress" },
  ];

  const contentOptions = [
    { value: "video-first", label: "Video-First", desc: "Prioritize video content" },
    { value: "balanced", label: "Balanced", desc: "Equal mix of video, quiz, coding" },
    { value: "quiz-first", label: "Quiz-First", desc: "Prioritize quizzes and practice" },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <StudentSidebar />
      <main className="ml-64 p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-fg mb-8 flex items-center gap-3">
            <Settings className="w-6 h-6 text-fg-muted" />
            Settings
          </h1>

          <div className="space-y-6">
            {/* ── Account Section ──────────────────────────────── */}
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-fg-muted mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Account
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-fg-muted mb-1">Display Name</label>
                  <p className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg-muted text-sm">
                    {userName || "—"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-fg-muted mb-1">Email</label>
                  <p className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg-muted text-sm">
                    {userEmail || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Current Subject / Track ──────────────────────── */}
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-fg-muted mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Current Subject
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-fg font-medium">
                    {currentTrack?.title || DOMAINS.find((d) => d.value === currentDomain)?.desc || "No active track"}
                  </p>
                  <p className="text-xs text-fg-muted mt-1">
                    {currentTrack ? `Slug: ${currentTrack.slug}` : "Complete onboarding to start a track"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSwitchModal(true);
                    setSwitchStep("select");
                    setSelectedNewDomain("");
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition text-sm font-medium"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Change Subject
                </button>
              </div>
            </div>

            {/* ── Weekly Study Hours ──────────────────────────── */}
            <div className="rounded-2xl border border-line bg-surface p-6">
              <label className="block text-sm font-medium text-fg-muted mb-2">
                Available weekly study hours
              </label>
              <p className="text-xs text-fg-muted mb-3">
                Adjusting this affects how PathForge AI schedules your upcoming tasks.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                  className="flex-1 accent-accent"
                />
                <span className="text-2xl font-bold text-fg w-16 text-center">
                  {weeklyHours}h
                </span>
              </div>
            </div>

            {/* ── Learning Pace ───────────────────────────────── */}
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-fg-muted mb-4 flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Preferred Learning Pace
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {paceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLearningPace(opt.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      learningPace === opt.value
                        ? "border-accent-line bg-accent-subtle ring-1 ring-accent"
                        : "border-line bg-elevated hover:border-line"
                    }`}
                  >
                    <p className="font-medium text-fg text-sm">{opt.label}</p>
                    <p className="text-xs text-fg-muted mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Notification Preferences ────────────────────── */}
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-fg-muted mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm text-fg">Task Reminders</p>
                    <p className="text-xs text-fg-muted">Get reminders about upcoming tasks</p>
                  </div>
                  <button
                    onClick={() => setNotifyTaskReminders(!notifyTaskReminders)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      notifyTaskReminders ? "bg-accent" : "bg-elevated"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        notifyTaskReminders ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm text-fg">Inactivity Nudges</p>
                    <p className="text-xs text-fg-muted">Get nudged when you haven&apos;t practiced</p>
                  </div>
                  <button
                    onClick={() => setNotifyInactivityNudges(!notifyInactivityNudges)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      notifyInactivityNudges ? "bg-accent" : "bg-elevated"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        notifyInactivityNudges ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* ── Content Style ───────────────────────────────── */}
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-fg-muted mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Preferred Content Style
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {contentOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setContentStyle(opt.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      contentStyle === opt.value
                        ? "border-accent-line bg-accent-subtle ring-1 ring-accent"
                        : "border-line bg-elevated hover:border-line"
                    }`}
                  >
                    <p className="font-medium text-fg text-sm">{opt.label}</p>
                    <p className="text-xs text-fg-muted mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Save Button ─────────────────────────────────── */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-fg font-semibold transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Switch Track Modal ─────────────────────────────── */}
        {showSwitchModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-fg">
                  {switchStep === "select" ? "Change Subject" : "Confirm Switch"}
                </h2>
                <button
                  onClick={() => setShowSwitchModal(false)}
                  className="p-1.5 rounded-lg hover:bg-elevated transition"
                >
                  <X className="w-5 h-5 text-fg-muted" />
                </button>
              </div>

              {switchStep === "select" && (
                <>
                  <p className="text-sm text-fg-muted">
                    Select the new subject you want to learn:
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                    {DOMAINS.filter((d) => d.value !== currentDomain).map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setSelectedNewDomain(d.value)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedNewDomain === d.value
                            ? "border-accent-line bg-accent-subtle ring-1 ring-accent"
                            : "border-line bg-elevated hover:border-line"
                        }`}
                      >
                        <span className="text-xl">{d.icon}</span>
                        <p className="font-medium text-fg text-sm mt-1">{d.label}</p>
                        <p className="text-xs text-fg-muted">{d.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm text-fg-muted mb-2">Difficulty Level</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["BEGINNER", "INTERMEDIATE"].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setSelectedNewLevel(lvl)}
                          className={`p-3 rounded-xl border text-center transition-all text-sm ${
                            selectedNewLevel === lvl
                              ? "border-accent-line bg-accent-subtle ring-1 ring-accent text-fg"
                              : "border-line bg-elevated hover:border-line text-fg-muted"
                          }`}
                        >
                          {lvl === "BEGINNER" ? "Beginner" : "Intermediate"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={!selectedNewDomain}
                    onClick={() => setSwitchStep("confirm")}
                    className="w-full py-3 rounded-xl bg-accent text-accent-fg font-semibold hover:shadow-lg transition disabled:opacity-50"
                  >
                    Continue
                  </button>
                </>
              )}

              {switchStep === "confirm" && (
                <>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-300 font-medium">
                        Switching will pause your current track
                      </p>
                      <p className="text-xs text-amber-300/70 mt-1">
                        Your progress on <strong>{currentTrack?.title || currentDomain}</strong> will be archived.
                        You can always switch back later and start a fresh plan.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-line bg-elevated p-4 text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-fg-muted">New Subject</span>
                      <span className="text-fg font-medium">
                        {DOMAINS.find((d) => d.value === selectedNewDomain)?.desc}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Difficulty</span>
                      <span className="text-fg font-medium">
                        {selectedNewLevel === "BEGINNER" ? "Beginner" : "Intermediate"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSwitchStep("select")}
                      className="flex-1 py-3 rounded-xl border border-line text-fg-muted hover:bg-elevated transition font-medium"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSwitchTrack}
                      disabled={switching}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-fg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {switching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Switching...
                        </>
                      ) : (
                        "Confirm Switch"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
