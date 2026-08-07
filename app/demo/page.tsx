import { redirect } from "next/navigation";

/**
 * Hackathon demo landing page.
 *
 * Disabled in production and by default — enable only for demos by setting
 * DEMO_MODE="true" in a non-production environment. The page no longer prints
 * admin credentials; set them via AUTH + seeded env instead.
 */
const demoEnabled =
  process.env.DEMO_MODE === "true" && process.env.NODE_ENV !== "production";

export default async function DemoPage() {
  if (!demoEnabled) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-2xl font-bold text-white">🧑‍💻 Demo Mode</h1>
        <p className="text-slate-400">
          This is a demo page for hackathon judges.
          Use the links below to explore the application.
        </p>

        <div className="space-y-3">
          <a
            href="/admin/login"
            className="block w-full py-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition font-medium"
          >
            Admin Login
          </a>

          <a
            href="/login"
            className="block w-full py-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition font-medium"
          >
            Student Login (Google OAuth)
          </a>
        </div>

        <div className="text-xs text-slate-600 border-t border-slate-800 pt-4">
          <p>Admin credentials come from your seeded database, not this page.</p>
          <p className="mt-2">For student dashboard, configure Google OAuth or seed a demo student.</p>
        </div>
      </div>
    </div>
  );
}
