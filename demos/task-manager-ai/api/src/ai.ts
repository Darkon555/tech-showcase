export type TaskLike = {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | Date | null;
  priority: "low" | "medium" | "high";
  done: boolean;
};

export type PrioritizedTask = { id: string; reason: string };

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

/** Builds the prompt sent to the LLM to prioritize open tasks. Pure + unit-tested. */
export function buildPrioritizePrompt(tasks: TaskLike[]): string {
  const lines = tasks.map((t) => {
    const due = t.dueDate ? ` (due ${new Date(t.dueDate).toISOString().slice(0, 10)})` : "";
    return `- [${t.id}] "${t.title}" priority=${t.priority}${due}`;
  });
  return [
    "You are a productivity assistant. Rank the following OPEN tasks from most to least urgent.",
    "Consider due dates (sooner = more urgent) and the stated priority.",
    "Respond ONLY with a JSON array of objects: {\"id\": string, \"reason\": string}. No prose.",
    "",
    "Tasks:",
    ...lines,
  ].join("\n");
}

/** Builds the prompt used to summarize the workload. Pure + unit-tested. */
export function buildSummarizePrompt(tasks: TaskLike[]): string {
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  return [
    "Summarize this task list in 2-3 short sentences for a busy person.",
    `There are ${open.length} open and ${done.length} completed tasks.`,
    "Open tasks:",
    ...open.map((t) => `- ${t.title} (${t.priority})`),
    "Respond with plain text only.",
  ].join("\n");
}

/**
 * Deterministic, dependency-free ranking used when the LLM is offline.
 * Higher priority first, then earlier due date. Pure + unit-tested (AC-5 fallback).
 */
export function heuristicPrioritize(tasks: TaskLike[]): PrioritizedTask[] {
  const weight = { high: 3, medium: 2, low: 1 } as const;
  return [...tasks]
    .filter((t) => !t.done)
    .sort((a, b) => {
      if (weight[b.priority] !== weight[a.priority]) {
        return weight[b.priority] - weight[a.priority];
      }
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return da - db;
    })
    .map((t) => ({
      id: t.id,
      reason: `priority=${t.priority}${t.dueDate ? `, due ${new Date(t.dueDate).toISOString().slice(0, 10)}` : ""}`,
    }));
}

async function callOllama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Ollama responded ${res.status}`);
  const data = (await res.json()) as { response: string };
  return data.response;
}

export async function prioritizeTasks(tasks: TaskLike[]): Promise<PrioritizedTask[]> {
  try {
    const raw = await callOllama(buildPrioritizePrompt(tasks));
    const match = raw.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(match ? match[0] : raw) as PrioritizedTask[];
    if (Array.isArray(parsed) && parsed.every((p) => p.id)) return parsed;
    throw new Error("Unexpected LLM shape");
  } catch {
    return heuristicPrioritize(tasks);
  }
}

export async function summarizeTasks(tasks: TaskLike[]): Promise<string> {
  try {
    return (await callOllama(buildSummarizePrompt(tasks))).trim();
  } catch {
    const open = tasks.filter((t) => !t.done).length;
    const high = tasks.filter((t) => !t.done && t.priority === "high").length;
    return `You have ${open} open task(s), ${high} of them high priority. Focus on the high-priority items first.`;
  }
}
