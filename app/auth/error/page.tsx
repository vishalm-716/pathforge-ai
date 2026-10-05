import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

/**
 * Known Auth.js error codes. `Configuration` covers the case that actually
 * bites in production: a missing AUTH_SECRET or OAuth credentials.
 */
const KNOWN: Record<string, { title: string; body: string }> = {
  Configuration: {
    title: "Sign-in is not configured yet",
    body: "The authentication server started but is missing a setting it needs before it can start a session.",
  },
  AccessDenied: {
    title: "Access denied",
    body: "That account is not allowed to sign in here. If this is unexpected, ask an admin to check your account.",
  },
  Verification: {
    title: "That sign-in link has expired",
    body: "Sign-in links are short-lived. Start again and use the newest link.",
  },
  OAuthAccountNotLinked: {
    title: "Account is linked to a different method",
    body: "An account with this email already exists using another sign-in method. Sign in with that method instead.",
  },
  Callback: {
    title: "Google sign-in did not complete",
    body: "The callback from Google did not match. This usually means the authorised redirect URI in Google Cloud does not exactly match this domain.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const key = error && KNOWN[error] ? error : "Default";
  const detail =
    key === "Default"
      ? {
          title: "Something went wrong signing you in",
          body: "The sign-in flow stopped before it finished. The server logs have the technical details.",
        }
      : KNOWN[key];

  const isConfig = key === "Configuration";

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-line bg-surface p-8">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-warning-subtle text-warning">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-fg">
            {detail.title}
          </h1>
          <p className="mt-3 leading-relaxed text-fg-muted">{detail.body}</p>

          {isConfig && (
            <div className="mt-6 rounded-xl border border-line bg-canvas-subtle p-4">
              <p className="text-sm font-semibold text-fg">
                If you are the owner of this deployment
              </p>
              <ol className="mt-3 space-y-2 text-sm leading-relaxed text-fg-muted">
                <li>
                  <span className="font-medium text-fg">1.</span> Set{" "}
                  <code className="rounded bg-elevated px-1 py-0.5 font-mono text-[13px]">
                    AUTH_SECRET
                  </code>{" "}
                  in Vercel → Settings → Environment Variables.
                </li>
                <li>
                  <span className="font-medium text-fg">2.</span> Set{" "}
                  <code className="rounded bg-elevated px-1 py-0.5 font-mono text-[13px]">
                    AUTH_GOOGLE_ID
                  </code>{" "}
                  and{" "}
                  <code className="rounded bg-elevated px-1 py-0.5 font-mono text-[13px]">
                    AUTH_GOOGLE_SECRET
                  </code>{" "}
                  from Google Cloud.
                </li>
                <li>
                  <span className="font-medium text-fg">3.</span> Redeploy so the
                  new variables are picked up.
                </li>
              </ol>
            </div>
          )}

          <div className="mt-7">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to sign in
            </Link>
          </div>

          {error && (
            <p className="mt-6 font-mono text-xs text-fg-subtle">
              error={error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
