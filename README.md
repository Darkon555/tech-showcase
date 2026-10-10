# Tech Showcase — Full-Stack Monorepo

A hands-on monorepo built to **demonstrate, in real running code, every software technology** I work with. It is organized as three independent demo apps, each intentionally built on a different stack so the same engineering principles are shown across ecosystems.

> ⚠️ These are **original demo applications** created from scratch for learning/portfolio purposes. They use only open-source technologies and are **not** related to any employer's codebase.

Every demo is **spec-driven**: the requirements and acceptance criteria are written first (see [`specs/`](./specs)), and the implementation follows the spec.

---

## 🧩 The three demos

| # | Demo | What it does | Primary stack |
|---|------|--------------|---------------|
| 1 | [`task-manager-ai`](./demos/task-manager-ai) | Task manager with an AI assistant that prioritizes and summarizes your tasks | **Next.js (React) + TypeScript**, Node/Express API, **PostgreSQL**, **Ollama** (local LLM) |
| 2 | [`mini-pos`](./demos/mini-pos) | A tiny point-of-sale: product catalog, cart, checkout & receipts | **Angular + TypeScript**, Express API, **SQLite** |
| 3 | [`receipt-ocr-ai`](./demos/receipt-ocr-ai) | Upload a receipt photo → OCR extracts the text → AI structures it into expense data | **Vue 3 + TypeScript**, **Flask (Python)**, **Tesseract OCR**, Ollama |

---

## 🛠️ Technology coverage — and *how* each is used

| Technology | Where it's used | How it's applied |
|------------|-----------------|------------------|
| **TypeScript** | all three demos | Strict typing across frontends and Node backends; shared DTOs/interfaces |
| **JavaScript** | tooling/config | Build config, scripts |
| **React / Next.js** | demo 1 | App Router, Server Components, client interactivity, API routes |
| **Angular** | demo 2 | Standalone components, services, dependency injection, reactive forms |
| **Vue 3** | demo 3 | Composition API, `<script setup>`, Pinia store |
| **Node.js / Express** | demos 1 & 2 | REST APIs, middleware, validation |
| **Python / Flask** | demo 3 | OCR microservice, REST endpoints, file upload handling |
| **PostgreSQL** | demo 1 | Relational storage via Prisma ORM |
| **SQLite** | demo 2 | Embedded DB via better-sqlite3 |
| **AI (Ollama, open-source LLM)** | demos 1 & 3 | Local inference for prioritization/summarization & field extraction |
| **Tesseract OCR** | demo 3 | Image-to-text extraction from receipts |
| **Jest** | demos 1 & 2 | Unit tests (services, utils) |
| **Playwright** | demo 1 | End-to-end browser tests |
| **Cypress** | demo 2 | Component & e2e tests |
| **Docker / docker-compose** | all | Each demo is containerized; root compose orchestrates everything |
| **Git** | repo | Conventional commits, feature-per-spec workflow |

---

## 🚀 Running everything

Each demo is self-contained and documented in its own README. To spin up the full stack:

```bash
docker compose up --build
```

Or run a single demo locally — see the README inside each `demos/*` folder.

---

## 📐 Spec-driven workflow

For every demo:

1. **Spec first** — `specs/<demo>.spec.md` defines the problem, user stories, and acceptance criteria.
2. **Implement** — code is written to satisfy the spec.
3. **Verify** — automated tests assert the acceptance criteria.

---

## 📁 Structure

```
tech-showcase/
├── README.md               ← you are here (tech matrix)
├── docker-compose.yml      ← orchestrates all demos
├── specs/                  ← spec-driven requirements (written first)
│   ├── task-manager-ai.spec.md
│   ├── mini-pos.spec.md
│   └── receipt-ocr-ai.spec.md
└── demos/
    ├── task-manager-ai/    ← Next.js + Express + Postgres + Ollama
    ├── mini-pos/           ← Angular + Express + SQLite
    └── receipt-ocr-ai/     ← Vue + Flask + Tesseract + Ollama
```

---

**Author:** Daniel Fausto Franco · [GitHub](https://github.com/Darkon555) · [LinkedIn](https://www.linkedin.com/in/daniel-fausto-franco/)
