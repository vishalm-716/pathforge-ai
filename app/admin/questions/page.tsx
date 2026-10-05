"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Edit2, Trash2, Loader2, HelpCircle, Code2 } from "lucide-react";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ trackId: "", topic: "", questionType: "MCQ", questionText: "", options: "", correctOption: 0, explanation: "", codeDescription: "", sampleInput: "", sampleOutput: "", constraints: "", hints: "", starterCode: "", expectedKeywords: "", difficulty: "BEGINNER" });

  const fetchData = () => {
    Promise.all([
      fetch("/api/admin/questions").then((r) => r.json()),
      fetch("/api/admin/tracks").then((r) => r.json()),
    ]).then(([q, t]) => { setQuestions(Array.isArray(q) ? q : []); setTracks(Array.isArray(t) ? t : []); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, ...form, correctOption: parseInt(String(form.correctOption)) } : { ...form, correctOption: parseInt(String(form.correctOption)) };
    await fetch("/api/admin/questions", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false); setEditId(null); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) return <div className="min-h-screen bg-canvas flex items-center justify-center"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-canvas">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-fg">Manage Questions</h1>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ trackId: tracks[0]?.id || "", topic: "", questionType: "MCQ", questionText: "", options: "", correctOption: 0, explanation: "", codeDescription: "", sampleInput: "", sampleOutput: "", constraints: "", hints: "", starterCode: "", expectedKeywords: "", difficulty: "BEGINNER" }); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-elevated text-accent border border-line hover:bg-surface-hover transition text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-line bg-surface p-6 mb-8 space-y-4">
            <h2 className="text-lg font-bold text-fg">{editId ? "Edit" : "New"} Question</h2>
            <div className="grid grid-cols-2 gap-4">
              <select value={form.trackId} onChange={(e) => setForm({ ...form, trackId: e.target.value })} className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg focus:outline-none focus:border-line-strong">
                <option value="">Select Track</option>
                {tracks.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Topic" className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong" />
              <select value={form.questionType} onChange={(e) => setForm({ ...form, questionType: e.target.value })} className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg focus:outline-none focus:border-line-strong">
                <option value="MCQ">MCQ</option>
                <option value="CODING">Coding</option>
              </select>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg focus:outline-none focus:border-line-strong">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
              </select>
            </div>
            <textarea value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} placeholder="Question Text" rows={2} className="w-full px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong" />

            {form.questionType === "MCQ" && (
              <>
                <textarea value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} placeholder='Options as JSON array: ["Option A", "Option B", "Option C", "Option D"]' rows={2} className="w-full px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong" />
                <input type="number" value={form.correctOption} onChange={(e) => setForm({ ...form, correctOption: parseInt(e.target.value) })} placeholder="Correct option index (0-3)" className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg focus:outline-none focus:border-line-strong" />
                <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Explanation" rows={2} className="w-full px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong" />
              </>
            )}

            {form.questionType === "CODING" && (
              <>
                <textarea value={form.codeDescription} onChange={(e) => setForm({ ...form, codeDescription: e.target.value })} placeholder="Code Description" rows={3} className="w-full px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong" />
                <div className="grid grid-cols-2 gap-4">
                  <textarea value={form.sampleInput} onChange={(e) => setForm({ ...form, sampleInput: e.target.value })} placeholder="Sample Input" rows={2} className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong" />
                  <textarea value={form.sampleOutput} onChange={(e) => setForm({ ...form, sampleOutput: e.target.value })} placeholder="Sample Output" rows={2} className="px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong" />
                </div>
                <input value={form.expectedKeywords} onChange={(e) => setForm({ ...form, expectedKeywords: e.target.value })} placeholder="Expected keywords (comma-separated)" className="w-full px-4 py-2.5 rounded-xl bg-elevated border border-line text-fg placeholder-fg-subtle focus:outline-none focus:border-line-strong" />
              </>
            )}

            <div className="flex gap-3">
              <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-fg text-canvas hover:opacity-90 text-fg font-semibold  transition">Save</button>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-5 py-2.5 rounded-xl border border-line text-fg-muted hover:bg-elevated transition">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="flex items-center justify-between p-4 rounded-2xl border border-line bg-surface">
              <div className="flex items-center gap-4">
                {q.questionType === "CODING" ? <Code2 className="w-5 h-5 text-amber-400" /> : <HelpCircle className="w-5 h-5 text-accent" />}
                <div>
                  <h3 className="font-medium text-fg text-sm">{q.questionText.slice(0, 80)}{q.questionText.length > 80 ? "..." : ""}</h3>
                  <p className="text-xs text-fg-muted">{q.track?.title} · {q.topic} · {q.questionType} · {q.difficulty}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditId(q.id); setForm({ trackId: q.trackId, topic: q.topic, questionType: q.questionType, questionText: q.questionText, options: q.options || "", correctOption: q.correctOption || 0, explanation: q.explanation || "", codeDescription: q.codeDescription || "", sampleInput: q.sampleInput || "", sampleOutput: q.sampleOutput || "", constraints: q.constraints || "", hints: q.hints || "", starterCode: q.starterCode || "", expectedKeywords: q.expectedKeywords || "", difficulty: q.difficulty }); setShowForm(true); }} className="p-2 rounded-lg hover:bg-elevated transition"><Edit2 className="w-4 h-4 text-fg-muted" /></button>
                <button onClick={() => handleDelete(q.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
          ))}
          {questions.length === 0 && <p className="text-center text-fg-muted py-8">No questions yet.</p>}
        </div>
      </main>
    </div>
  );
}
