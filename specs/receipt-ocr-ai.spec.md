# Spec — Receipt Reader (OCR + AI)

**Demo ID:** `receipt-ocr-ai`
**Status:** Draft → Implemented
**Stack:** Vue 3 + TypeScript · Flask (Python) · Tesseract OCR · Ollama (local LLM) · Docker

---

## 1. Problem statement

Manually typing receipts into an expense sheet is tedious. This demo lets a user upload a photo of a receipt; the backend runs **OCR** to extract raw text and then uses a **local LLM** to structure that text into clean expense fields (merchant, date, total, line items).

## 2. Goals

- Upload a receipt image from the browser.
- Extract raw text with Tesseract OCR.
- Use a local LLM to turn raw text into structured JSON.
- Show the structured result and the raw OCR text side by side.
- Keep a session list of parsed receipts.

## 3. Non-goals

- Persisting receipts to a database (in-memory/session only).
- Multi-language OCR tuning beyond English/Spanish defaults.
- Accounting/export integrations.

## 4. User stories

- **US-1** As a user, I can upload a receipt image (jpg/png).
- **US-2** As a user, I can see the raw OCR text extracted from the image.
- **US-3** As a user, I can see structured fields: merchant, date, currency, total, and items.
- **US-4** As a user, I can see a list of receipts I've parsed this session.

## 5. Acceptance criteria

| ID | Given | When | Then |
|----|-------|------|------|
| AC-1 | a valid image is selected | I click "Parse" | the API returns `{ rawText, structured }` |
| AC-2 | OCR runs | processing completes | `rawText` is a non-empty string |
| AC-3 | structured parsing runs | the LLM responds | `structured` has keys `merchant`, `date`, `total`, `items[]` |
| AC-4 | the file is not an image | I upload it | the API returns 400 with an error message |
| AC-5 | the LLM is unavailable | I parse | the API still returns `rawText` and a heuristic `structured` fallback |

## 6. API contract

```
POST /api/parse   (multipart/form-data: file=<image>)
     → { rawText: string, structured: Structured }
GET  /api/health  → { status: "ok" }
```

```ts
type Structured = {
  merchant: string | null;
  date: string | null;      // ISO or null
  currency: string | null;
  total: number | null;
  items: { description: string; amount: number | null }[];
};
```

## 7. Tech mapping (how each technology is demonstrated)

- **Vue 3 / TypeScript** — Composition API, `<script setup>`, Pinia store for the session list, typed fetch client.
- **Flask / Python** — file upload endpoint, orchestration of OCR + LLM.
- **Tesseract OCR** (`pytesseract`) — image-to-text extraction (AC-2).
- **Ollama** — local LLM structures the text (AC-3), with a regex heuristic fallback (AC-5).
- **Docker** — `web` (Vue), `api` (Flask + Tesseract) and `ollama` services.

## 8. Definition of done

- All acceptance criteria pass.
- `pytest` green for the parsing/fallback logic.
- `docker compose up` serves the uploader end-to-end.
