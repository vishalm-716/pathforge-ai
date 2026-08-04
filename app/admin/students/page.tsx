"use client";

import { useEffect, useState, useRef } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Users, Loader2, Trash2, AlertTriangle } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Student {
  id: string;
  name: string | null;
  email: string;
  domain: string | null;
  progress: number;
  streak: number;
  latestQuizScore: number | null;
  currentRisk: string | null;
  pendingRecommendations: number;
}

interface Toast {
  msg: string;
  type: "success" | "error";
}

// ── ConfirmDeleteModal ────────────────────────────────────────────────────────

function ConfirmDeleteModal({
  student,
  onCancel,
  onConfirm,
  loading,
}: {
  student: { id: string; name: string };
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  // Close on backdrop click
  const backdropRef = useRef<HTMLDivElement>(null);
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onCancel();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </span>
          <h2 className="text-lg font-bold text-white">Delete Student</h2>
        </div>

        <p className="text-slate-300 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white">
            {student.name || student.id}
          </span>
          ? This will permanently remove their account, profile, and all
          associated learning data. This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition text-sm font-medium disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AdminStudentsPage ─────────────────────────────────────────────────────────

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((d) => {
        setStudents(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/students?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || "Failed to delete student.", "error");
      } else {
        setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        showToast(
          `${deleteTarget.name || "Student"} has been deleted.`,
          "success"
        );
      }
    } catch {
      showToast("An unexpected error occurred.", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <h1 className="text-2xl font-bold text-white mb-8">Student Analytics</h1>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900">
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Name</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Email</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Domain</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Progress</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Streak</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Quiz Score</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Risk</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Pending</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30"
                >
                  <td className="py-4 px-6 text-white font-medium">{s.name || "—"}</td>
                  <td className="py-4 px-6 text-slate-300">{s.email}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs">
                      {s.domain || "—"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                      <span className="text-white text-xs">{s.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white">{s.streak} 🔥</td>
                  <td className="py-4 px-6 text-white">
                    {s.latestQuizScore !== null ? `${s.latestQuizScore}%` : "—"}
                  </td>
                  <td className="py-4 px-6">
                    {s.currentRisk ? (
                      <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs">
                        {s.currentRisk.replace(/_/g, " ")}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">None</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-white">{s.pendingRecommendations}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() =>
                        setDeleteTarget({ id: s.id, name: s.name || s.email })
                      }
                      className="p-2 rounded-lg hover:bg-red-500/10 transition"
                      aria-label={`Delete student ${s.name || s.email}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <p className="text-center text-slate-500 py-12">No students yet.</p>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          student={deleteTarget}
          onCancel={() => !deleting && setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleting}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
