"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  Brain,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/plan", label: "Learning Plan", icon: BookOpen },
  { href: "/student/notifications", label: "Notifications", icon: Bell },
  { href: "/student/settings", label: "Settings", icon: Settings },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-surface border-r border-line flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-line">
        <Link href="/student/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Brain className="w-6 h-6 text-accent-fg" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-fg">PathForge</h1>
            <p className="text-xs text-accent">AI Learning Agent</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent-subtle text-accent border border-accent-line"
                  : "text-fg-muted hover:text-fg hover:bg-elevated"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-line">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-medium text-fg-subtle">Appearance</span>
          <ThemeToggle />
        </div>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-fg-muted hover:text-danger hover:bg-danger-subtle transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
