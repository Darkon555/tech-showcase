# Demo 1 — Task Manager with AI

> Spec: [`../../specs/task-manager-ai.spec.md`](../../specs/task-manager-ai.spec.md)

A task manager with an AI assistant that **prioritizes** your open tasks and **summarizes** your workload — powered by a **local, open-source LLM (Ollama)** so it runs fully offline with no API keys.

## Stack & what each piece does

| Layer | Tech | Role |
|-------|------|------|
| Frontend | **Next.js 15 + React 19 + TypeScript** | UI, App Router, client state, typed API client |
| Backend | **Node.js + Express + TypeScript** | REST API, Zod validation |
| Database | **PostgreSQL + Prisma** | Typed persistence & migrations |
| AI | **Ollama** (`llama3.2`) | Local LLM for prioritize/summarize, with deterministic fallback |
| Tests | **Jest** (API) · **Playwright** (web) | Unit + e2e covering the spec's acceptance criteria |
| Infra | **Docker Compose** | `web`, `api`, `db`, `ollama` |

## Run with Docker (recommended)

```bash
docker compose up --build
# pull the model once the ollama container is up:
docker compose exec ollama ollama pull llama3.2
```

- Web: http://localhost:3001
- API: http://localhost:4001/api/health

> The AI still works without Ollama: the API returns a deterministic heuristic ranking/summary (see spec AC-5).

## Run locally (without Docker)

```bash
# 1) API
cd api
npm install
# point DATABASE_URL at a local Postgres, then:
npx prisma migrate dev --name init
npm run seed
npm run dev          # http://localhost:4001

# 2) Web (new terminal)
cd web
npm install
npm run dev          # http://localhost:3001
```

## Tests

```bash
cd api && npm test            # Jest — prompt builder + heuristic fallback
cd web && npm run test:e2e    # Playwright — create & toggle a task (AC-1, AC-2)
```
