import {
  buildPrioritizePrompt,
  buildSummarizePrompt,
  heuristicPrioritize,
  type TaskLike,
} from "./ai.js";

const tasks: TaskLike[] = [
  { id: "a", title: "Pay invoice", priority: "high", done: false, dueDate: "2026-01-10" },
  { id: "b", title: "Read book", priority: "low", done: false, dueDate: null },
  { id: "c", title: "Ship release", priority: "high", done: false, dueDate: "2026-01-05" },
  { id: "d", title: "Archive logs", priority: "medium", done: true, dueDate: null },
];

describe("buildPrioritizePrompt", () => {
  it("lists every task id and asks for JSON output", () => {
    const prompt = buildPrioritizePrompt(tasks);
    for (const t of tasks) expect(prompt).toContain(t.id);
    expect(prompt).toMatch(/JSON array/i);
  });
});

describe("buildSummarizePrompt", () => {
  it("reports the open/completed counts", () => {
    const prompt = buildSummarizePrompt(tasks);
    expect(prompt).toContain("3 open");
    expect(prompt).toContain("1 completed");
  });
});

describe("heuristicPrioritize (offline fallback, AC-5)", () => {
  it("ranks high priority before low and excludes completed tasks", () => {
    const ranked = heuristicPrioritize(tasks);
    expect(ranked.map((r) => r.id)).toEqual(["c", "a", "b"]);
  });

  it("breaks priority ties by earliest due date", () => {
    const ranked = heuristicPrioritize(tasks);
    // c (due 01-05) must come before a (due 01-10), both high priority
    expect(ranked.findIndex((r) => r.id === "c")).toBeLessThan(
      ranked.findIndex((r) => r.id === "a")
    );
  });
});
