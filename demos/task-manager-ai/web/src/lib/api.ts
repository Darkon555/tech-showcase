export type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: "low" | "medium" | "high";
  done: boolean;
  createdAt: string;
};

export type Prioritized = { id: string; reason: string };

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  list: () => fetch(`${API}/api/tasks`, { cache: "no-store" }).then(json<Task[]>),
  create: (body: Partial<Task>) =>
    fetch(`${API}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(json<Task>),
  update: (id: string, body: Partial<Task>) =>
    fetch(`${API}/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(json<Task>),
  remove: (id: string) => fetch(`${API}/api/tasks/${id}`, { method: "DELETE" }),
  prioritize: () =>
    fetch(`${API}/api/ai/prioritize`, { method: "POST" }).then(json<Prioritized[]>),
  summarize: () =>
    fetch(`${API}/api/ai/summarize`, { method: "POST" }).then(json<{ summary: string }>),
};
