import Link from "next/link";
import {
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
import { ThemeToggle } from "@/components/ThemeToggle";

const FEATURES = [
  {
    icon: Target,
    title: "A plan built around your goal",
    description:
      "Pick DSA, Python, JavaScript, React or Java. You get a milestone-based path sized to your level and the hours you actually have each week.",
    tint: "bg-accent-subtle text-accent",
  },
  {
    icon: BarChart3,
    title: "Adapts when you slip",
    description:
      "Quiz scores, coding submissions, study minutes and streaks feed a rules engine that spots risk early and proposes a concrete change.",
    tint: "bg-info-subtle text-info",
  },
  {
    icon: Shield,
    title: "You stay in control",
    description:
      "Nothing changes without your approval. Accept, reschedule or reject each recommendation, and the plan only moves when you say so.",
    tint: "bg-accent-subtle text-accent",
  },
  {
    icon: BookOpen,
    title: "Curated, not dumped",
    description:
      "Every task points at one specific, well-made resource organised by topic and difficulty. No 40-hour playlist roulette.",
    tint: "bg-warning-subtle text-warning",
  },
  {
    icon: Code2,
    title: "Practice, not just watching",
    description:
      "Topic-scoped quizzes and coding challenges close the loop, so progress is measured by what you can do rather than what you have opened.",
    tint: "bg-info-subtle text-info",
  },
  {
    icon: TrendingUp,
    title: "Progress you can see",
    description:
      "Streaks, planned versus actual minutes, and per-milestone completion — enough signal to know whether the plan is working.",
    tint: "bg-accent-subtle text-accent",
  },
] as const;

const STEPS = [
  { step: "01", label: "Set your goal", desc: "Domain, level, hours per week" },
  { step: "02", label: "Get your plan", desc: "A milestone path, not a pile of links" },
  { step: "03", label: "Work the plan", desc: "Watch, quiz, submit code" },
  { step: "04", label: "See the gap", desc: "The agent flags what is slipping" },
  { step: "05", label: "You decide", desc: "Accept, reschedule, or reject" },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <nav className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-fg">
              <Zap className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-[17px] font-semibold tracking-tight text-fg">
              PathForge
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/admin/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
            >
              Admin
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pb-24 sm:pt-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-line bg-accent-subtle px-3 py-1 text-[13px] font-medium text-accent">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Built for CSE students
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-5xl">
              Stop collecting courses.
              <br />
              <span className="text-accent">Start finishing them.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
              Everyone has the same 40-hour playlist open. Almost nobody
              finishes it. PathForge turns it into a dated plan, watches how
              you actually do, and tells you what to change when you fall
              behind.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
              >
                Start your path
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center rounded-xl border border-line-strong bg-surface px-6 py-3 font-medium text-fg transition-colors hover:bg-surface-hover"
              >
                See how it works
              </a>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-muted">
              {["No credit card", "Google sign-in", "Adjust anytime"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    className="h-4 w-4 text-accent"
                    aria-hidden="true"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-line bg-canvas-subtle">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-fg">
              What PathForge actually does
            </h2>
            <p className="mt-3 text-fg-muted">
              The plan is the product. Everything below exists to keep it
              honest.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="card-hover rounded-xl border border-line bg-surface p-6"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.tint}`}
                >
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold text-fg">{feature.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loop */}
      <section id="how" className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-fg">
              The loop
            </h2>
            <p className="mt-3 text-fg-muted">
              Five steps that repeat for as long as you are learning.
            </p>
          </div>

          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((item) => (
              <li
                key={item.step}
                className="rounded-xl border border-line bg-surface p-5"
              >
                <span className="font-mono text-sm font-semibold text-accent">
                  {item.step}
                </span>
                <h3 className="mt-3 font-semibold text-fg">{item.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                  {item.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-fg">
            Your next semester, planned.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-fg-muted">
            Sign in, pick a track, and get a dated plan in about two minutes.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
          >
            Create your plan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
          <p className="text-sm text-fg-subtle">
            PathForge — a coding path built from your actual results.
          </p>
          <p className="text-sm text-fg-subtle">
            Educational and portfolio project.
          </p>
        </div>
      </footer>
    </div>
  );
}
