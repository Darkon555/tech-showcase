import cors from "cors";
import express from "express";
import { z } from "zod";
import { prisma } from "./db.js";
import { prioritizeTasks, summarizeTasks } from "./ai.js";

const app = express();
app.use(cors());
app.use(express.json());

const taskInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/tasks", async (_req, res) => {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  res.json(tasks);
});

app.post("/api/tasks", async (req, res) => {
  const parsed = taskInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  const task = await prisma.task.create({
    data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : null },
  });
  res.status(201).json(task);
});

app.patch("/api/tasks/:id", async (req, res) => {
  const partial = taskInput.partial().extend({ done: z.boolean().optional() }).safeParse(req.body);
  if (!partial.success) return res.status(400).json({ error: partial.error.flatten() });
  const data = partial.data;
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : undefined },
    });
    res.json(task);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

app.post("/api/ai/prioritize", async (_req, res) => {
  const tasks = await prisma.task.findMany({ where: { done: false } });
  res.json(await prioritizeTasks(tasks));
});

app.post("/api/ai/summarize", async (_req, res) => {
  const tasks = await prisma.task.findMany();
  res.json({ summary: await summarizeTasks(tasks) });
});

const port = Number(process.env.PORT ?? 4001);
app.listen(port, () => console.log(`task-manager-ai API on :${port}`));
