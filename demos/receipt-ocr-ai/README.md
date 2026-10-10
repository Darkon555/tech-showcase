# Demo 3 — Receipt Reader (OCR + AI)

> Spec: [`../../specs/receipt-ocr-ai.spec.md`](../../specs/receipt-ocr-ai.spec.md)

Upload a receipt photo → **Tesseract OCR** extracts the text → a **local LLM (Ollama)** structures it into clean expense fields. If the LLM is offline, a regex **heuristic fallback** still returns structured data (spec AC-5).

## Stack & what each piece does

| Layer | Tech | Role |
|-------|------|------|
| Frontend | **Vue 3 + TypeScript** | Composition API, `<script setup>`, **Pinia** store for the session list |
| Backend | **Python + Flask** | File upload, OCR + LLM orchestration, validation |
| OCR | **Tesseract** (`pytesseract`) | Image → raw text |
| AI | **Ollama** (`llama3.2`) | Raw text → structured JSON, with heuristic fallback |
| Tests | **pytest** | Parser/heuristic logic |
| Infra | **Docker Compose** | `web` + `api` + `ollama` |

## Run with Docker

```bash
docker compose up --build
docker compose exec ollama ollama pull llama3.2   # optional; fallback works without it
```
- Web: http://localhost:5173
- API: http://localhost:4003/api/health

## Run locally

```bash
# API — requires Tesseract installed on the host
cd api
pip install -r requirements.txt
python app.py            # http://localhost:4003

# Web
cd web
npm install
npm run dev              # http://localhost:5173
```

## Tests

```bash
cd api && pytest         # heuristic parser (AC-3 shape, AC-5 fallback)
```
