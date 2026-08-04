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

const languages = ["javascript", "python", "java"];

export default function CodePage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    fetch("/api/code/questions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const q = data[0];
          setQuestion(q);
          setCode(q.starterCode?.[language] || "// Write your solution here\n");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (question) {
      setCode(question.starterCode?.[language] || `// Write your ${language} solution here\n`);
    }
  }, [language, question]);

  const handleSubmit = async () => {
    if (!question) return;
    setSubmitting(true);
    const res = await fetch("/api/code/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, code, language }),
    });
    if (res.ok) {
      const data = await res.json();
      setResult(data);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <StudentSidebar />
      <main className="ml-64 p-8">
        <div className="max-w-5xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {question ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Problem Description */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                <div>
                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {question.difficulty} · CODING
                  </span>
                  <h1 className="text-xl font-bold text-white mt-3">{question.questionText}</h1>
                </div>

                {question.codeDescription && (
                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {question.codeDescription}
                  </div>
                )}

                {question.sampleInput && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-2">Sample Input</h3>
                    <pre className="bg-slate-800 rounded-xl p-3 text-sm text-cyan-300 font-mono">
                      {question.sampleInput}
                    </pre>
                  </div>
                )}

                {question.sampleOutput && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-2">Sample Output</h3>
                    <pre className="bg-slate-800 rounded-xl p-3 text-sm text-emerald-300 font-mono">
                      {question.sampleOutput}
                    </pre>
                  </div>
                )}

                {question.constraints && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-2">Constraints</h3>
                    <p className="text-sm text-slate-300">{question.constraints}</p>
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
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                {/* Language Selector */}
                <div className="flex items-center gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        language === lang
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Code Area */}
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-80 bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                  spellCheck={false}
                />

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !code.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
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
                    <p className="text-sm text-slate-300">{result.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Code2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No coding challenge available yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
