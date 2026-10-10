# Spec — Task Manager with AI Assistant

**Demo ID:** `task-manager-ai`
**Status:** Draft → Implemented
**Stack:** Next.js (React) + TypeScript · Node/Express API · PostgreSQL (Prisma) · Ollama (local LLM) · Jest · Playwright · Docker

---

## 1. Problem statement

Users keep a list of tasks but struggle to decide **what to do next** and to get a quick **overview** of their workload. This demo adds an AI assistant that, on demand, (a) suggests a priority order and (b) produces a short natural-language summary of the open tasks.

## 2. Goals

- Full CRUD on tasks.
- An AI action that ranks open tasks by urgency/importance and explains why.
- An AI action that summarizes the current task list in 2–3 sentences.
- Work fully offline using a **local, open-source** LLM (Ollama). No proprietary API keys.

## 3. Non-goals

- Authentication / multi-user accounts.
- Mobile app.
- Real-time collaboration.

## 4. User stories

- **US-1** As a user, I can create a task with a title, optional description, due date and priority.
- **US-2** As a user, I can view all my tasks and mark them done/undone.
- **US-3** As a user, I can edit and delete a task.
- **US-4** As a user, I can click "Prioritize with AI" and receive an ordered list with a one-line rationale per task.
- **US-5** As a user, I can click "Summarize" and receive a short paragraph describing my workload.

## 5. Acceptance criteria

| ID | Given | When | Then |
|----|-------|------|------|
| AC-1 | the app is open | I submit a valid task form | the task appears in the list and is persisted in PostgreSQL |
| AC-2 | a task exists | I toggle its checkbox | its `done` state flips and persists |
| AC-3 | tasks exist | I call `POST /api/ai/prioritize` | I get a JSON array ordered by priority, each item with `id` and `reason` |
| AC-4 | tasks exist | I call `POST /api/ai/summarize` | I get `{ summary: string }` with a non-empty summary |
| AC-5 | the title field is empty | I submit the form | the API returns 400 and nothing is persisted |

## 6. API contract

```
GET    /api/tasks            → Task[]
POST   /api/tasks            → Task            (body: {title, description?, dueDate?, priority?})
PATCH  /api/tasks/:id        → Task            (partial update)
DELETE /api/tasks/:id        → 204
POST   /api/ai/prioritize    → { id: string, reason: string }[]
POST   /api/ai/summarize     → { summary: string }
```

```ts
type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;   // ISO
  priority: 'low' | 'medium' | 'high';
  done: boolean;
  createdAt: string;        // ISO
};
```

## 7. Tech mapping (how each technology is demonstrated)

- **Next.js / React / TypeScript** — UI with App Router, client components for interactivity.
- **Express / Node** — REST API in `/api` service.
- **PostgreSQL + Prisma** — relational persistence, typed queries, migrations.
- **Ollama** — local LLM called from the API for AC-3 and AC-4; graceful fallback if offline.
- **Jest** — unit tests for the AI prompt builder & task service.
- **Playwright** — e2e test covering AC-1 and AC-2.
- **Docker** — `web`, `api`, `db` and `ollama` services.

## 8. Definition of done

- All acceptance criteria pass.
- `npm test` (Jest) green; `npm run test:e2e` (Playwright) green.
- `docker compose up` brings the demo online end-to-end.
