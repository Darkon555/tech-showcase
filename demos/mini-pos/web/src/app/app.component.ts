import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { CartService } from "./cart.service";
import type { Product, Receipt } from "./models";
import { PosService } from "./pos.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="wrap">
      <h1>🛒 Mini <span class="accent">POS</span></h1>
      <p class="muted">Angular + Express + SQLite</p>

      <div class="grid">
        <section class="card">
          <h2>Catalog</h2>
          <div class="product" *ngFor="let p of products()">
            <div>
              <strong>{{ p.name }}</strong>
              <span class="muted"> · {{ p.price | currency }} · stock {{ p.stock }}</span>
            </div>
            <button (click)="cart.add(p)" [attr.data-cy]="'add-' + p.id">Add</button>
          </div>
        </section>

        <section class="card">
          <h2>Cart</h2>
          <p *ngIf="cart.lines().length === 0" class="muted">Cart is empty.</p>
          <div class="line" *ngFor="let l of cart.lines()">
            <span style="flex:1">{{ l.product.name }}</span>
            <button class="qty" (click)="cart.setQty(l.product.id, l.qty - 1)">−</button>
            <span data-cy="qty">{{ l.qty }}</span>
            <button class="qty" (click)="cart.setQty(l.product.id, l.qty + 1)">+</button>
            <span class="line-total">{{ l.product.price * l.qty | currency }}</span>
          </div>

          <div class="totals" *ngIf="cart.lines().length">
            <div><span>Subtotal</span><span>{{ cart.subtotal() | currency }}</span></div>
            <div><span>Tax (16%)</span><span>{{ cart.tax() | currency }}</span></div>
            <div class="grand"><span>Total</span><span data-cy="total">{{ cart.total() | currency }}</span></div>
            <button class="checkout" (click)="checkout()" [disabled]="busy()">Checkout</button>
          </div>
        </section>
      </div>

      <section class="card" *ngIf="receipt() as r">
        <h2>✅ Receipt {{ r.id.slice(0, 8) }}</h2>
        <p class="muted">Total {{ r.total | currency }} · {{ r.createdAt | date: 'short' }}</p>
      </section>
    </main>
  `,
  styles: [
    `
      .wrap { max-width: 860px; margin: 0 auto; padding: 2rem 1rem; }
      h1 { margin: 0; }
      .accent { color: #38bdf8; }
      .muted { color: #94a3b8; font-size: 0.9rem; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
      @media (max-width: 680px) { .grid { grid-template-columns: 1fr; } }
      .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; }
      .product, .line { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
      .product > div:first-child { flex: 1; }
      button { background: #38bdf8; color: #0b1120; border: none; border-radius: 8px; padding: 0.4rem 0.8rem; font-weight: 600; cursor: pointer; }
      button.qty { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #e2e8f0; width: 2rem; }
      .line-total { width: 5rem; text-align: right; }
      .totals { margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.3rem; }
      .totals > div { display: flex; justify-content: space-between; }
      .grand { font-weight: 700; font-size: 1.1rem; }
      .checkout { margin-top: 0.75rem; width: 100%; }
    `,
  ],
})
export class AppComponent {
  readonly cart = inject(CartService);
  private readonly pos = inject(PosService);

  readonly products = signal<Product[]>([]);
  readonly receipt = signal<Receipt | null>(null);
  readonly busy = signal(false);

  constructor() {
    this.pos.getProducts().subscribe((p) => this.products.set(p));
  }

  checkout(): void {
    this.busy.set(true);
    this.pos.checkout(this.cart.toOrder()).subscribe({
      next: (r) => {
        this.receipt.set(r);
        this.cart.clear();
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }
}
