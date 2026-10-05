"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Lightbulb,
} from "lucide-react";

interface CodingQuestion {
  id: string;
  topic: string;
  questionText: string;
  codeDescription: string | null;
  sampleInput: string | null;
  sampleOutput: string | null;
  constraints: string | null;
  hints: string | null;
  starterCode: Record<string, string>;
  difficulty: string;
}

/** Fallback starter text when a track's question ships no starter for its language. */
function starterFallback(language: string): string {
  if (language === "sql") return "-- Write your SQL query here\n";
  if (language === "python") return "# Write your solution here\n";
  return "// Write your solution here\n";
}

export default function CodePage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  // Only the track's language is offered (server-enforced too).
  const [languages, setLanguages] = useState<string[]>(["javascript"]);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    // First resolve the task topic (like the quiz page) so the coding page
    // shows the challenge that matches the task, not just any track question.
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(async (dashData) => {
        const allTasks =
          dashData.plan?.milestones?.flatMap((m: any) => m.tasks) || [];
        const task = allTasks.find((t: any) => t.id === params.id);
        const topic = task?.topic || "";

        const url = topic
          ? `/api/code/questions?topic=${encodeURIComponent(topic)}`
          : "/api/code/questions";
        return fetch(url).then((r) => r.json());
      })
      .then((data) => {
        const list = Array.isArray(data?.questions) ? data.questions : [];
        if (list.length > 0) {
          setQuestion(list[0]);
          const allowed = Array.isArray(data?.languages) ? data.languages : ["javascript"];
          setLanguages(allowed);
          setLanguage(allowed[0]);
          // Prefer the track's language starter; SQL questions store their
          // starter under the generic keys, so fall back to any available key.
          const starter =
            list[0].starterCode?.[allowed[0]] ||
            Object.values(list[0].starterCode || {})[0] ||
            starterFallback(allowed[0]);
          setCode(starter);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (question) {
      setCode(
        question.starterCode?.[language] ||
          Object.values(question.starterCode || {})[0] ||
          starterFallback(language)
      );
    }
  }, [language, question]);

  const handleSubmit = async () => {
    if (!question) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/code/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          code,
          language,
          taskId: params.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        let msg = "Failed to submit code. Please try again.";
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
        <div className="max-w-5xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-fg-muted hover:text-fg transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {question ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Problem Description */}
              <div className="rounded-2xl border border-line bg-surface p-6 space-y-4">
                <div>
                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {question.difficulty} · CODING
                  </span>
                  <h1 className="text-xl font-bold text-fg mt-3">{question.questionText}</h1>
                </div>

                {question.codeDescription && (
                  <div className="text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">
                    {question.codeDescription}
                  </div>
                )}

                {question.sampleInput && (
                  <div>
                    <h3 className="text-sm font-semibold text-fg-muted mb-2">Sample Input</h3>
                    <pre className="bg-elevated rounded-xl p-3 text-sm text-accent font-mono">
                      {question.sampleInput}
                    </pre>
                  </div>
                )}

                {question.sampleOutput && (
                  <div>
                    <h3 className="text-sm font-semibold text-fg-muted mb-2">Sample Output</h3>
                    <pre className="bg-elevated rounded-xl p-3 text-sm text-emerald-300 font-mono">
                      {question.sampleOutput}
                    </pre>
                  </div>
                )}

                {question.constraints && (
                  <div>
                    <h3 className="text-sm font-semibold text-fg-muted mb-2">Constraints</h3>
                    <p className="text-sm text-fg-muted">{question.constraints}</p>
                  </div>
                )}

                {question.hints && (
                  <div>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition"
                    >
                      <Lightbulb className="w-4 h-4" />
                      {showHints ? "Hide Hints" : "Show Hints"}
                    </button>
                    {showHints && (
                      <p className="text-sm text-amber-300/70 mt-2 bg-amber-500/5 rounded-xl p-3 border border-amber-500/10">
                        {question.hints}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Code Editor */}
              <div className="rounded-2xl border border-line bg-surface p-6 space-y-4">
                {/* Language — locked to the track's language (server-enforced) */}
                <div className="flex items-center gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      disabled={languages.length === 1}
                      onClick={() => setLanguage(lang)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        language === lang
                          ? "bg-accent/20 text-accent border border-accent-line/30"
                          : "bg-elevated text-fg-muted border border-line hover:border-line"
                      } disabled:cursor-default`}
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                  {languages.length === 1 && (
                    <span className="text-xs text-fg-muted">
                      This track is {languages[0]} only
                    </span>
                  )}
                </div>

                {/* Code Area */}
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-80 bg-canvas border border-line rounded-xl p-4 font-mono text-sm text-fg focus:outline-none focus:border-accent-line resize-none"
                  spellCheck={false}
                />

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !code.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-fg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run & Submit
                    </>
                  )}
                </button>

                {/* Inline error on failed submission */}
                {submitError && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    {submitError}
                  </p>
                )}

                {/* Result */}
                {result && (
                  <div className={`p-4 rounded-xl border ${result.passed ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {result.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className={`font-semibold ${result.passed ? "text-emerald-400" : "text-red-400"}`}>
                        {result.passed ? "Passed!" : "Not Passed"} — Score: {result.score}%
                      </span>
                    </div>
                    <p className="text-sm text-fg-muted">{result.feedback}</p>

                    {/* Show exactly which expected concepts are missing so the
                        student knows what to fix before retrying. */}
                    {!result.passed &&
                      Array.isArray(result.details?.missingKeywords) &&
                      result.details.missingKeywords.length > 0 && (
                        <div className="mt-3 text-sm">
                          <p className="text-fg-muted mb-1.5 font-medium">
                            Missing concepts to include:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {result.details.missingKeywords.map((k: string) => (
                              <span
                                key={k}
                                className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/20 text-xs font-mono"
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {result.passed && result.taskCompleted && (
                      <p className="flex items-center gap-1.5 text-sm text-emerald-400 mt-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        This task is now marked complete in your plan.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Code2 className="w-12 h-12 text-fg-muted mx-auto mb-4" />
              <p className="text-fg-muted">No coding challenge available yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
