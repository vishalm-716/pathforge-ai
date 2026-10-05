"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Edit2, Trash2, Loader2, FileText, ExternalLink } from "lucide-react";

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ trackId: "", topic: "", title: "", youtubeUrl: "", orderIndex: 0, estimatedMinutes: 15, difficulty: "BEGINNER", description: "" });

  const fetchData = () => {
    Promise.all([
      fetch("/api/admin/resources").then((r) => r.json()),
      fetch("/api/admin/tracks").then((r) => r.json()),
    ]).then(([r, t]) => { setResources(Array.isArray(r) ? r : []); setTracks(Array.isArray(t) ? t : []); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, ...form } : form;
    await fetch("/api/admin/resources", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false); setEditId(null); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    await fetch(`/api/admin/resources?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) return <div className="min-h-screen bg-canvas flex items-center justify-center"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-canvas">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-fg">Manage Resources</h1>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ trackId: tracks[0]?.id || "", topic: "", title: "", youtubeUrl: "", orderIndex: 0, estimatedMinutes: 15, difficulty: "BEGINNER", description: "" }); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-elevated text-accent border border-line hover:bg-surface-hover transition text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-line bg-surface p-6 mb-8 space-y-4">
            <h2 className="text-lg font-bold text-fg">{editId ? "Edit" : "New"} Resource</h2>
            <div className="grid grid-cols-2 gap-4">
              <select value={form.trackId} onChange={(e) => setForm({ ...form, trackId: e.target.value })} className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg focus:outline-none focus:border-line-strong">
                <option value="">Select Track</option>
                {tracks.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Topic" className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong" />
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong" />
              <input value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="YouTube URL" className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong" />
              <input type="number" value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: parseInt(e.target.value) })} placeholder="Minutes" className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg focus:outline-none focus:border-line-strong" />
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg focus:outline-none focus:border-line-strong">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
              </select>
            </div>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong" />
            <div className="flex gap-3">
              <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-fg text-canvas hover:opacity-90 text-fg font-semibold  transition">Save</button>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-5 py-2.5 rounded-xl border border-line text-fg-muted hover:bg-elevated transition">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {resources.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl border border-line bg-surface">
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-medium text-fg">{r.title}</h3>
                  <p className="text-xs text-fg-muted">{r.track?.title} · {r.topic} · {r.estimatedMinutes} min · {r.difficulty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={r.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-elevated transition"><ExternalLink className="w-4 h-4 text-red-400" /></a>
                <button onClick={() => { setEditId(r.id); setForm({ trackId: r.trackId, topic: r.topic, title: r.title, youtubeUrl: r.youtubeUrl, orderIndex: r.orderIndex, estimatedMinutes: r.estimatedMinutes, difficulty: r.difficulty, description: r.description || "" }); setShowForm(true); }} className="p-2 rounded-lg hover:bg-elevated transition"><Edit2 className="w-4 h-4 text-fg-muted" /></button>
                <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
          ))}
          {resources.length === 0 && <p className="text-center text-fg-muted py-8">No resources yet.</p>}
        </div>
      </main>
    </div>
  );
}
