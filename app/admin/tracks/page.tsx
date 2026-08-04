"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Edit2, Trash2, Loader2, BookOpen, AlertTriangle } from "lucide-react";

interface TrackCoverage {
  beginner: { resources: number; mcq: number; coding: number };
  intermediate: { resources: number; mcq: number; coding: number };
}

interface Track {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  createdAt: string;
  updatedAt: string;
  coverage: TrackCoverage;
  warnings: string[];
  totals: { resources: number; questions: number };
}

export default function AdminTracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", description: "", difficulty: "BEGINNER", estimatedHours: 20 });

  const fetchTracks = () => {
    fetch("/api/admin/tracks").then((r) => r.json()).then((d) => { setTracks(Array.isArray(d) ? d : []); setLoading(false); });
  };

  useEffect(() => { fetchTracks(); }, []);

  const handleSave = async () => {
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, ...form } : form;
    await fetch("/api/admin/tracks", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false);
    setEditId(null);
    setForm({ title: "", slug: "", description: "", difficulty: "BEGINNER", estimatedHours: 20 });
    fetchTracks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this track?")) return;
    await fetch(`/api/admin/tracks?id=${id}`, { method: "DELETE" });
    fetchTracks();
  };

  const startEdit = (t: Track) => {
    setEditId(t.id);
    setForm({ title: t.title, slug: t.slug, description: t.description, difficulty: t.difficulty, estimatedHours: t.estimatedHours });
    setShowForm(true);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Manage Tracks</h1>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", slug: "", description: "", difficulty: "BEGINNER", estimatedHours: 20 }); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Track
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mb-8 space-y-4">
            <h2 className="text-lg font-bold text-white">{editId ? "Edit" : "New"} Track</h2>
            <div className="grid grid-cols-2 gap-4">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
              </select>
              <input type="number" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: parseInt(e.target.value) })} placeholder="Hours" className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
            <div className="flex gap-3">
              <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:shadow-lg transition">Save</button>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {tracks.map((t) => (
            <div key={t.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white">{t.title}</h3>
                      {t.warnings.length > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          {t.warnings.length === 1 ? t.warnings[0] : `${t.warnings.length} coverage gaps`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{t.slug} · {t.difficulty} · {t.estimatedHours}h</p>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <div className="text-xs text-slate-400 bg-slate-800/60 rounded-lg px-3 py-1.5">
                        <span className="text-cyan-400 font-medium">Beginner:</span>{" "}
                        {t.coverage.beginner.resources} resources,{" "}
                        {t.coverage.beginner.mcq} MCQs,{" "}
                        {t.coverage.beginner.coding} coding
                      </div>
                      <div className="text-xs text-slate-400 bg-slate-800/60 rounded-lg px-3 py-1.5">
                        <span className="text-purple-400 font-medium">Intermediate:</span>{" "}
                        {t.coverage.intermediate.resources} resources,{" "}
                        {t.coverage.intermediate.mcq} MCQs,{" "}
                        {t.coverage.intermediate.coding} coding
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(t)} className="p-2 rounded-lg hover:bg-slate-800 transition"><Edit2 className="w-4 h-4 text-slate-400" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              </div>
            </div>
          ))}
          {tracks.length === 0 && <p className="text-center text-slate-500 py-8">No tracks yet.</p>}
        </div>
      </main>
    </div>
  );
}
