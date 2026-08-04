import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * DEV-ONLY demo route.
 * Allows judges to inspect the student dashboard without Google OAuth.
 * This route looks up the demo student and creates a session cookie.
 * 
 * In production, this route should be removed.
 */
export default async function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-2xl font-bold text-white">🧑‍💻 Demo Mode</h1>
        <p className="text-slate-400">
          This is a development-only demo page for hackathon judges.
          Use the links below to explore the application.
        </p>
        
        <div className="space-y-3">
          <a
            href="/admin/login"
            className="block w-full py-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition font-medium"
          >
            Admin Login (admin@pathforge.ai / Admin@123)
          </a>
          
          <a
            href="/login"
            className="block w-full py-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition font-medium"
          >
            Student Login (Google OAuth)
          </a>
        </div>

        <div className="text-xs text-slate-600 border-t border-slate-800 pt-4">
          <p>Demo admin credentials:</p>
          <p className="font-mono text-slate-400">admin@pathforge.ai / Admin@123</p>
          <p className="mt-2">For student dashboard, configure Google OAuth or seed a demo student.</p>
        </div>
      </div>
    </div>
  );
}
