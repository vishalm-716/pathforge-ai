"use client";

import { useEffect, useState } from "react";
import StudentSidebar from "@/components/StudentSidebar";
import { Bell, CheckCircle2, Loader2, AlertTriangle, Zap, Info } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => { setNotifications(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const typeIcon: Record<string, typeof Bell> = {
    warning: AlertTriangle,
    success: CheckCircle2,
    info: Info,
  };

  const typeColor: Record<string, string> = {
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    info: "text-info bg-blue-500/10 border-blue-500/20",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <StudentSidebar />
      <main className="ml-64 p-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold text-fg mb-8">Notifications</h1>

          <div className="space-y-3">
            {notifications.map((n) => {
              const Icon = typeIcon[n.type] || Bell;
              return (
                <div
                  key={n.id}
                  className={`p-5 rounded-2xl border transition ${
                    n.isRead
                      ? "border-line bg-surface"
                      : `${typeColor[n.type] || "border-line bg-surface"}`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Icon className={`w-5 h-5 mt-0.5 ${n.isRead ? "text-fg-muted" : ""}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${n.isRead ? "text-fg-muted" : "text-fg"}`}>
                          {n.title}
                        </h3>
                        <span className="text-xs text-fg-muted">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${n.isRead ? "text-fg-muted" : "text-fg-muted"}`}>
                        {n.message}
                      </p>
                      {!n.isRead && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-xs text-accent hover:text-accent mt-2 transition"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {notifications.length === 0 && (
              <div className="text-center py-16">
                <Bell className="w-12 h-12 text-fg-muted mx-auto mb-4" />
                <p className="text-fg-muted">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
