"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Brain, Shield, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      window.location.href = "/admin/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-fg text-canvas flex items-center justify-center">
              <Shield className="w-7 h-7 text-fg" />
            </div>
            <span className="text-2xl font-bold text-fg">PathForge AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-fg mb-2">Admin Login</h1>
          <p className="text-fg-muted">Sign in to the admin panel</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong focus:ring-1 focus:ring-accent"
                placeholder="admin@pathforge.ai"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong focus:ring-1 focus:ring-accent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-fg text-canvas hover:opacity-90 text-fg font-semibold   transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm text-fg-muted hover:text-fg-muted transition"
          >
            ← Student Login
          </Link>
        </div>
      </div>
    </div>
  );
}
