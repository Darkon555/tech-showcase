import { Injectable, computed, signal } from "@angular/core";
import type { CartLine, Product } from "./models";

const TAX_RATE = 0.16;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Cart state via Angular signals + DI. Totals mirror the server's pure calc. */
@Injectable({ providedIn: "root" })
export class CartService {
  private readonly _lines = signal<CartLine[]>([]);
  readonly lines = this._lines.asReadonly();

  readonly subtotal = computed(() =>
    round2(this._lines().reduce((s, l) => s + l.product.price * l.qty, 0))
  );
  readonly tax = computed(() => round2(this.subtotal() * TAX_RATE));
  readonly total = computed(() => round2(this.subtotal() + this.tax()));

  add(product: Product): void {
    const lines = [...this._lines()];
    const existing = lines.find((l) => l.product.id === product.id);
    if (existing) existing.qty += 1;
    else lines.push({ product, qty: 1 });
    this._lines.set(lines);
  }

  setQty(productId: number, qty: number): void {
    if (qty <= 0) {
      this.remove(productId);
      return;
    }
    this._lines.set(
      this._lines().map((l) => (l.product.id === productId ? { ...l, qty } : l))
    );
  }

  remove(productId: number): void {
    this._lines.set(this._lines().filter((l) => l.product.id !== productId));
  }

  clear(): void {
    this._lines.set([]);
  }

  toOrder(): { productId: number; qty: number }[] {
    return this._lines().map((l) => ({ productId: l.product.id, qty: l.qty }));
  }
}
