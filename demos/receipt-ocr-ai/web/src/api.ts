export interface StructuredItem {
  description: string;
  amount: number | null;
}

export interface Structured {
  merchant: string | null;
  date: string | null;
  currency: string | null;
  total: number | null;
  items: StructuredItem[];
}

export interface ParseResult {
  rawText: string;
  structured: Structured;
}

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4003";

export async function parseReceipt(file: File): Promise<ParseResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/api/parse`, { method: "POST", body: form });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<ParseResult>;
}
