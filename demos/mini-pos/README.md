# Demo 2 — Mini POS

> Spec: [`../../specs/mini-pos.spec.md`](../../specs/mini-pos.spec.md)

A minimal point-of-sale: browse a catalog, build a cart, see live totals (16% tax) and check out to a persisted receipt.

## Stack & what each piece does

| Layer | Tech | Role |
|-------|------|------|
| Frontend | **Angular 19 + TypeScript** | Standalone components, DI, **signals** for cart state, typed `HttpClient` |
| Backend | **Node.js + Express + TypeScript** | REST API, Zod validation, checkout **transaction** |
| Database | **SQLite (better-sqlite3)** | Embedded relational store: `products`, `sales`, `sale_items` |
| Tests | **Jest** (API) · **Cypress** (web) | Unit totals + e2e checkout flow |
| Infra | **Docker Compose** | `web` (nginx) + `api` |

## Run with Docker

```bash
docker compose up --build
```
- Web: http://localhost:4200
- API: http://localhost:4002/api/health

## Run locally

```bash
cd api && npm install && npm run dev     # http://localhost:4002
cd web && npm install && npm start       # http://localhost:4200
```

## Tests

```bash
cd api && npm test                       # Jest — totals (AC-4)
cd web && npm run cypress:run            # Cypress — add/qty/checkout (AC-1→AC-3)
```
