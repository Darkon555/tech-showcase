"use client";

import { useEffect, useState } from "react";
import { api, type Prioritized, type Task } from "@/lib/api";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [summary, setSummary] = useState("");
  const [ranked, setRanked] = useState<Prioritized[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = () => api.list().then(setTasks).catch(() => setTasks([]));
  useEffect(() => {
    refresh();
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await api.create({ title: title.trim(), priority });
    setTitle("");
    setPriority("medium");
    refresh();
  }

  async function toggle(t: Task) {
    await api.update(t.id, { done: !t.done });
    refresh();
  }

  async function remove(id: string) {
    await api.remove(id);
    refresh();
  }

  async function runAi(kind: "prioritize" | "summarize") {
    setBusy(true);
    try {
      if (kind === "prioritize") setRanked(await api.prioritize());
      else setSummary((await api.summarize()).summary);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <h1>📋 Task Manager <span style={{ color: "#38bdf8" }}>AI</span></h1>
      <p className="muted">Next.js + Express + PostgreSQL + Ollama (local LLM)</p>

      <form className="card" onSubmit={addTask}>
        <div className="row">
          <input
            aria-label="Task title"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            aria-label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task["priority"])}
            style={{ width: "auto" }}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
          <button type="submit">Add</button>
        </div>
      </form>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>Tasks ({tasks.length})</strong>
          <div className="row">
            <button className="ghost" disabled={busy} onClick={() => runAi("prioritize")}>
              ⚡ Prioritize with AI
            </button>
            <button className="ghost" disabled={busy} onClick={() => runAi("summarize")}>
              📝 Summarize
            </button>
          </div>
        </div>

        {tasks.length === 0 && <p className="muted" style={{ marginTop: ".75rem" }}>No tasks yet.</p>}

        {tasks.map((t) => (
          <div key={t.id} className={`task ${t.done ? "done" : ""}`}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggle(t)}
              style={{ width: "auto" }}
              aria-label={`toggle ${t.title}`}
            />
            <span className="title" style={{ flex: 1 }}>{t.title}</span>
            <span className={`badge ${t.priority}`}>{t.priority}</span>
            <button className="ghost" onClick={() => remove(t.id)} aria-label={`delete ${t.title}`}>✕</button>
          </div>
        ))}
      </div>

      {summary && (
        <div className="card">
          <strong>AI summary</strong>
          <p style={{ marginTop: ".5rem" }}>{summary}</p>
        </div>
      )}

      {ranked.length > 0 && (
        <div className="card">
          <strong>AI priority order</strong>
          <ol style={{ marginTop: ".5rem", paddingLeft: "1.2rem" }}>
            {ranked.map((r) => {
              const t = tasks.find((x) => x.id === r.id);
              return (
                <li key={r.id} style={{ marginBottom: ".35rem" }}>
                  {t?.title ?? r.id} <span className="muted">— {r.reason}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </main>
  );
}
