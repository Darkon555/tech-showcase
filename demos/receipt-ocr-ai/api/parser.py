"""Receipt parsing: LLM-based structuring with a regex heuristic fallback.

The heuristic functions are pure and dependency-free so they can be unit-tested
(see test_parser.py) and used as the offline fallback required by spec AC-5.
"""
from __future__ import annotations

import json
import os
import re
from datetime import datetime

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")

_TOTAL_RE = re.compile(r"(?:total|amount due|balance)\D{0,8}(\d+[.,]\d{2})", re.IGNORECASE)
_DATE_RE = re.compile(r"(\d{4}-\d{2}-\d{2})|(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})")
_CURRENCY_RE = re.compile(r"(USD|EUR|MXN|GBP|\$|€|£)")
_ITEM_RE = re.compile(r"^(.*?)\s+(\d+[.,]\d{2})\s*$")


def _to_float(raw: str) -> float:
    return float(raw.replace(",", "."))


def heuristic_structure(text: str) -> dict:
    """Extract receipt fields from raw OCR text using regex only (offline fallback)."""
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    merchant = lines[0] if lines else None

    total = None
    for m in _TOTAL_RE.finditer(text):
        total = _to_float(m.group(1))

    date = None
    d = _DATE_RE.search(text)
    if d:
        date = _normalize_date(d.group(0))

    currency = None
    c = _CURRENCY_RE.search(text)
    if c:
        symbol = c.group(1)
        currency = {"$": "USD", "€": "EUR", "£": "GBP"}.get(symbol, symbol)

    items = []
    for l in lines:
        im = _ITEM_RE.match(l)
        if im and not _TOTAL_RE.search(l):
            items.append({"description": im.group(1).strip(), "amount": _to_float(im.group(2))})

    return {
        "merchant": merchant,
        "date": date,
        "currency": currency,
        "total": total,
        "items": items,
    }


def _normalize_date(raw: str) -> str | None:
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%d/%m/%y"):
        try:
            return datetime.strptime(raw, fmt).date().isoformat()
        except ValueError:
            continue
    return raw


def _call_ollama(text: str) -> dict:
    import requests

    prompt = (
        "Extract structured data from this receipt text. "
        'Respond ONLY with JSON: {"merchant": str|null, "date": "YYYY-MM-DD"|null, '
        '"currency": str|null, "total": number|null, '
        '"items": [{"description": str, "amount": number|null}]}.\n\n'
        f"Receipt:\n{text}"
    )
    res = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False, "format": "json"},
        timeout=20,
    )
    res.raise_for_status()
    return json.loads(res.json()["response"])


def structure_receipt(text: str) -> dict:
    """Use the local LLM to structure the text; fall back to the heuristic (AC-5)."""
    try:
        data = _call_ollama(text)
        if isinstance(data, dict) and "items" in data:
            return data
    except Exception:
        pass
    return heuristic_structure(text)
