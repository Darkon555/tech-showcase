import { computeTotals, TAX_RATE } from "./totals.js";

describe("computeTotals (spec AC-4)", () => {
  it("sums line totals into the subtotal", () => {
    const { subtotal } = computeTotals([
      { unitPrice: 10, qty: 2 },
      { unitPrice: 5.5, qty: 1 },
    ]);
    expect(subtotal).toBe(25.5);
  });

  it("applies 16% tax and total = round(subtotal * 1.16)", () => {
    const lines = [{ unitPrice: 100, qty: 1 }];
    const { subtotal, tax, total } = computeTotals(lines);
    expect(tax).toBe(16);
    expect(total).toBe(Math.round(subtotal * (1 + TAX_RATE) * 100) / 100);
    expect(total).toBe(116);
  });

  it("returns zeros for an empty cart", () => {
    expect(computeTotals([])).toEqual({ subtotal: 0, tax: 0, total: 0 });
  });
});
