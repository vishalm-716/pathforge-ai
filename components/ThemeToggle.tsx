"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const STORAGE_KEY = "pathforge-theme";

/**
 * Applies a theme to the document. Kept as a plain function so both the
 * inline no-flash script in `app/layout.tsx` and this component use exactly
 * one definition of what "applying a theme" means.
 */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  // Read the theme that the inline script already applied, so the button never
  // flashes the wrong icon during hydration.
  useEffect(() => {
    const current = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    setTheme(current);
  }, []);

  if (theme === null) {
    // Reserve the same footprint to avoid layout shift on first paint.
    return <div className={`h-9 w-9 ${className}`} aria-hidden="true" />;
  }

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        applyTheme(next);
        setTheme(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Private browsing can block storage; the toggle still works for
          // this session, it just will not be remembered.
        }
      }}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

/**
 * Runs before paint to apply the stored theme, preventing a light flash on a
 * dark-mode load. Injected as a raw script string — it must run synchronously
 * before React hydrates, so it cannot be a component.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY
)});var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
