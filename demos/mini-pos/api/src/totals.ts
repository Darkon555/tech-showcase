export const TAX_RATE = 0.16;

export type CartLine = { unitPrice: number; qty: number };

export type Totals = { subtotal: number; tax: number; total: number };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Pure totals calculation (spec AC-4: total === round(subtotal * 1.16)).
 * Kept dependency-free so it can be unit-tested and reused on client & server.
 */
export function computeTotals(lines: CartLine[]): Totals {
  const subtotal = round2(lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0));
  const tax = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + tax);
  return { subtotal, tax, total };
}
