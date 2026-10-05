"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  BarChart3,
} from "lucide-react";

interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  topic: string;
  difficulty: string;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    // First, resolve the task topic from dashboard so we can filter questions
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(async (dashData) => {
        const allTasks =
          dashData.plan?.milestones?.flatMap((m: any) => m.tasks) || [];
        const task = allTasks.find((t: any) => t.id === params.id);
        const topic = task?.topic || "";

        const url = topic
          ? `/api/quiz/questions?topic=${encodeURIComponent(topic)}`
          : "/api/quiz/questions";

        return fetch(url).then((r) => r.json());
      })
      .then((data) => {
        // API returns { questions: [...], fallbackUsed: boolean }
        if (data && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setFallbackUsed(data.fallbackUsed ?? false);
        } else if (Array.isArray(data)) {
          setQuestions(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleSelect = (questionId: string, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const answerArray = questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] ?? -1,
    }));

    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerArray, topic: questions[0]?.topic }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        let msg = "Failed to submit quiz. Please try again.";
        try {
          const body = await res.json();
          if (Array.isArray(body?.error)) {
            msg = body.error.map((e: any) => e?.message || e).join("; ");
          } else if (typeof body?.error === "string") {
            msg = body.error;
          }
        } catch {
          // keep default message
        }
        setSubmitError(msg);
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <StudentSidebar />
      <main className="ml-64 p-8">
        <div className="max-w-3xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-fg-muted hover:text-fg transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {results ? (
            /* Results */
            <div className="rounded-2xl border border-line bg-surface p-8 space-y-6">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-accent mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-fg mb-2">Quiz Results</h1>
                <p className={`text-5xl font-bold mt-4 ${results.score === 100 ? "text-emerald-400" : "text-amber-400"}`}>
                  {results.score}%
                </p>
                <p className="text-fg-muted mt-2">
                  {results.correctCount}/{results.totalQuestions} correct
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t border-line">
                {results.results.map((r: any, idx: number) => {
                  // Skipped / ungradable questions are excluded from the score —
                  // show a distinct label so feedback matches the score.
                  const state = r.unanswered
                    ? { label: "Not answered", color: "text-fg-muted", icon: <XCircle className="w-5 h-5 text-fg-muted" />, border: "border-line bg-elevated" }
                    : r.notGraded
                    ? { label: "Not graded", color: "text-fg-muted", icon: <XCircle className="w-5 h-5 text-fg-muted" />, border: "border-line bg-elevated" }
                    : r.isCorrect
                    ? { label: "Correct", color: "text-emerald-400", icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, border: "border-emerald-500/20 bg-emerald-500/5" }
                    : { label: "Incorrect", color: "text-red-400", icon: <XCircle className="w-5 h-5 text-red-400" />, border: "border-red-500/20 bg-red-500/5" };

                  return (
                    <div key={idx} className={`p-4 rounded-xl border ${state.border}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {state.icon}
                        <span className={`font-medium ${state.color}`}>
                          Question {idx + 1}: {state.label}
                        </span>
                      </div>
                      {r.explanation && (
                        <p className="text-sm text-fg-muted ml-7">{r.explanation}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => router.push("/student/dashboard")}
                className="w-full py-3 rounded-xl bg-accent text-accent-fg font-semibold  transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          ) : questions.length > 0 ? (
            /* Quiz */
            <div className="rounded-2xl border border-line bg-surface p-8 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-fg">
                  Quiz: {questions[0]?.topic}
                </h1>
                <span className="text-sm text-fg-muted">
                  {currentQ + 1} / {questions.length}
                </span>
              </div>
              {fallbackUsed && (
                <p className="text-xs text-amber-400/80 mb-2">
                  Not enough questions at your current level — some questions are from other difficulty levels.
                </p>
              )}

              {/* Progress */}
              <div className="w-full bg-elevated rounded-full h-2">
                <div
                  className="bg-fg h-2 rounded-full transition-all"
                  style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="py-4">
                <p className="text-lg text-fg font-medium mb-6">
                  {questions[currentQ].questionText}
                </p>

                <div className="space-y-3">
                  {questions[currentQ].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(questions[currentQ].id, idx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        answers[questions[currentQ].id] === idx
                          ? "border-line-strong bg-fg/10 ring-1 ring-accent"
                          : "border-line bg-elevated hover:border-line"
                      }`}
                    >
                      <span className="text-sm text-fg">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                  disabled={currentQ === 0}
                  className="px-5 py-2.5 rounded-xl border border-line text-fg-muted hover:bg-elevated transition disabled:opacity-30"
                >
                  Previous
                </button>

                {currentQ < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQ(currentQ + 1)}
                    className="px-5 py-2.5 rounded-xl bg-elevated text-accent border border-line hover:bg-surface-hover transition font-medium"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-fg text-canvas hover:opacity-90 text-fg font-semibold  transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Quiz"
                    )}
                  </button>
                )}
              </div>

              {/* Inline error on failed submission */}
              {submitError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {submitError}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-fg-muted">No quiz questions available for this topic yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
