"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Users, BookOpen, FileText, HelpCircle, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/students").then((r) => r.json()),
      fetch("/api/admin/tracks").then((r) => r.json()),
      fetch("/api/admin/resources").then((r) => r.json()),
      fetch("/api/admin/questions").then((r) => r.json()),
    ])
      .then(([students, tracks, resources, questions]) => {
        setStats({
          students: Array.isArray(students) ? students : [],
          tracks: Array.isArray(tracks) ? tracks : [],
          resources: Array.isArray(resources) ? resources : [],
          questions: Array.isArray(questions) ? questions : [],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Students", count: stats?.students?.length || 0, icon: Users, color: "purple" },
    { label: "Tracks", count: stats?.tracks?.length || 0, icon: BookOpen, color: "cyan" },
    { label: "Resources", count: stats?.resources?.length || 0, icon: FileText, color: "emerald" },
    { label: "Questions", count: stats?.questions?.length || 0, icon: HelpCircle, color: "amber" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <h1 className="text-2xl font-bold text-white mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <span className="text-sm text-slate-400">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-white">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Recent Students */}
        {stats?.students?.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Recent Students</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Domain</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Progress</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Streak</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.students.slice(0, 10).map((s: any) => (
                    <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-white">{s.name || "—"}</td>
                      <td className="py-3 px-4 text-slate-300">{s.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs">
                          {s.domain || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-800 rounded-full h-2">
                            <div
                              className="bg-cyan-500 h-2 rounded-full"
                              style={{ width: `${s.progress}%` }}
                            />
                          </div>
                          <span className="text-white text-xs">{s.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white">{s.streak}🔥</td>
                      <td className="py-3 px-4">
                        {s.currentRisk ? (
                          <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs">
                            {s.currentRisk.replace(/_/g, " ")}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
