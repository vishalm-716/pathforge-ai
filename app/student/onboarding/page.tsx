"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  GraduationCap,
} from "lucide-react";

const domains = [
  { value: "dsa", label: "DSA", desc: "Data Structures & Algorithms", icon: "🧮" },
  { value: "python", label: "Python", desc: "Python Programming", icon: "🐍" },
  { value: "javascript", label: "JavaScript", desc: "JavaScript Development", icon: "⚡" },
  { value: "react", label: "React", desc: "React.js Development", icon: "⚛️" },
  { value: "java", label: "Java", desc: "Java Programming", icon: "☕" },
  { value: "nodejs", label: "Node.js", desc: "Node.js Backend Development", icon: "🟢" },
  { value: "sql", label: "SQL", desc: "SQL & Database Management", icon: "🗄️" },
];

const levels = [
  { value: "BEGINNER", label: "Beginner", desc: "Just getting started" },
  { value: "INTERMEDIATE", label: "Intermediate", desc: "Know the basics" },
];

const weeklyHoursOptions = [3, 5, 7, 10];
const targetWeeksOptions = [2, 4, 6, 8];
const learningStyles = [
  { value: "video-first", label: "Video-First", desc: "Learn by watching", icon: "🎬" },
  { value: "practice-first", label: "Practice-First", desc: "Learn by doing", icon: "💻" },
  { value: "balanced", label: "Balanced", desc: "Mix of both", icon: "⚖️" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    domain: "",
    currentLevel: "BEGINNER",
    weeklyHours: 5,
    targetWeeks: 4,
    learningStyle: "balanced",
  });

  const steps = [
    { title: "What do you want to learn?", key: "domain" },
    { title: "What's your current level?", key: "level" },
    { title: "How much time per week?", key: "hours" },
    { title: "Target duration?", key: "weeks" },
    { title: "How do you prefer to learn?", key: "style" },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/student/dashboard");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const canProceed = () => {
    if (step === 0) return form.domain !== "";
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Step {step + 1} of {steps.length}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{steps[step].title}</h1>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-10">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
          {/* Domain Selection */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {domains.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setForm({ ...form, domain: d.value })}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    form.domain === d.value
                      ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <span className="text-2xl">{d.icon}</span>
                  <h3 className="text-lg font-bold text-white mt-2">{d.label}</h3>
                  <p className="text-sm text-slate-400">{d.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Level Selection */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {levels.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setForm({ ...form, currentLevel: l.value })}
                  className={`p-6 rounded-xl border text-left transition-all ${
                    form.currentLevel === l.value
                      ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <GraduationCap className="w-8 h-8 text-cyan-400 mb-3" />
                  <h3 className="text-lg font-bold text-white">{l.label}</h3>
                  <p className="text-sm text-slate-400">{l.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Weekly Hours */}
          {step === 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {weeklyHoursOptions.map((h) => (
                <button
                  key={h}
                  onClick={() => setForm({ ...form, weeklyHours: h })}
                  className={`p-6 rounded-xl border text-center transition-all ${
                    form.weeklyHours === h
                      ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <span className="text-2xl font-bold text-white">{h}</span>
                  <p className="text-sm text-slate-400">hrs/week</p>
                </button>
              ))}
            </div>
          )}

          {/* Target Weeks */}
          {step === 3 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {targetWeeksOptions.map((w) => (
                <button
                  key={w}
                  onClick={() => setForm({ ...form, targetWeeks: w })}
                  className={`p-6 rounded-xl border text-center transition-all ${
                    form.targetWeeks === w
                      ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <Target className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <span className="text-2xl font-bold text-white">{w}</span>
                  <p className="text-sm text-slate-400">weeks</p>
                </button>
              ))}
            </div>
          )}

          {/* Learning Style */}
          {step === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {learningStyles.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setForm({ ...form, learningStyle: s.value })}
                  className={`p-6 rounded-xl border text-center transition-all ${
                    form.learningStyle === s.value
                      ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <span className="text-3xl">{s.icon}</span>
                  <h3 className="text-lg font-bold text-white mt-3">{s.label}</h3>
                  <p className="text-sm text-slate-400">{s.desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating your path...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate My Learning Path
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
