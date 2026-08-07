import Link from "next/link";
import {
  Brain,
  Target,
  TrendingUp,
  Zap,
  BarChart3,
  BookOpen,
  Code2,
  ArrowRight,
  CheckCircle2,
  Shield,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PathForge AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="text-sm text-slate-400 hover:text-white transition px-4 py-2"
            >
              Admin
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Outcome-first, explainable, closed-loop coding learning agent
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-white">A coding path that </span>
              <span className="gradient-text">adapts to how you learn</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              PathForge AI is an outcome-first coding learning agent that adapts to real performance.
              Content is abundant. Completion is scarce. We help CSE students turn coding intention into measurable mastery.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
              >
                Start Your Path
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 rounded-2xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-all"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Not just a course list. A genuine AI agent.
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              PathForge AI observes your progress, detects risk, and proposes concrete changes to your learning plan — then lets you decide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Personalized Learning Path",
                description: "Choose your coding goal — DSA, Python, JavaScript, React, or Java — and get a realistic milestone-based plan tailored to your level and schedule.",
                color: "cyan",
              },
              {
                icon: BarChart3,
                title: "Real-Time Adaptation",
                description: "The agent monitors quiz scores, coding performance, study time, and streaks. When it detects risk, it proposes a concrete plan change with a clear explanation.",
                color: "purple",
              },
              {
                icon: Shield,
                title: "Learner Control",
                description: "Every recommended change requires your approval. Accept, reschedule, or reject — the agent only updates your plan when you say so.",
                color: "emerald",
              },
              {
                icon: BookOpen,
                title: "Curated YouTube Resources",
                description: "No random playlist dumps. Each task links to specific, high-quality YouTube content organized by topic and difficulty.",
                color: "blue",
              },
              {
                icon: Code2,
                title: "Coding Challenges & MCQs",
                description: "Test your understanding with topic-specific quizzes and coding challenges. The agent adapts your path based on your results.",
                color: "amber",
              },
              {
                icon: TrendingUp,
                title: "Streaks & Progress Tracking",
                description: "Track your daily streak, planned vs actual time, and overall completion. Visual progress keeps you motivated and on track.",
                color: "pink",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="card-hover rounded-2xl border border-slate-800 bg-slate-900/50 p-8 space-y-4"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center`}
                >
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Loop */}
      <section className="py-24 border-t border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              The PathForge Agent Loop
            </h2>
            <p className="text-slate-400 text-lg">
              A closed-loop system that continuously adapts to your learning behavior.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { step: "1", label: "Understand Intent", desc: "Choose your goal and preferences" },
              { step: "2", label: "Generate Plan", desc: "Get a personalized milestone path" },
              { step: "3", label: "Observe Progress", desc: "Track quizzes, code, time, streaks" },
              { step: "4", label: "Detect & Adapt", desc: "Agent proposes plan changes" },
              { step: "5", label: "Learner Decides", desc: "Accept, reschedule, or reject" },
            ].map((item, idx) => (
              <div key={idx} className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-slate-700 flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold gradient-text">{item.step}</span>
                </div>
                <h3 className="text-white font-semibold">{item.label}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to forge your coding path?
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join PathForge AI and transform your coding learning from scattered intention to measurable mastery.
          </p>
          <Link
            href="/login"
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-cyan-500/25 transition-all inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Brain className="w-4 h-4 text-cyan-400" />
            PathForge AI — Agentic AI for Human Potential
          </div>    
        </div>
      </footer>
    </div>
  );
}
