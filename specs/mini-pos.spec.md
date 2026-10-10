# Spec — Mini POS (Point of Sale)

**Demo ID:** `mini-pos`
**Status:** Draft → Implemented
**Stack:** Angular + TypeScript · Node/Express API · SQLite (better-sqlite3) · Jest · Cypress · Docker

---

## 1. Problem statement

A small shop needs a minimal point-of-sale screen: browse a product catalog, add items to a cart, adjust quantities, and complete a sale that is recorded with a receipt. This demo delivers that core flow with a clean Angular UI and a lightweight embedded database.

## 2. Goals

- Display a product catalog loaded from the API.
- Add/remove products to/from a cart and change quantities.
- Compute subtotal, tax and total.
- Check out: persist the sale + line items and return a receipt.
- List past sales (receipts).

## 3. Non-goals

- Payments integration (simulated only).
- Inventory management beyond a `stock` count.
- User roles / authentication.

## 4. User stories

- **US-1** As a cashier, I can see all available products with price and stock.
- **US-2** As a cashier, I can add a product to the cart and change its quantity.
- **US-3** As a cashier, I can see the running subtotal, tax (16%) and total.
- **US-4** As a cashier, I can check out and get a receipt with a unique sale id.
- **US-5** As a cashier, I can view the list of previous sales.

## 5. Acceptance criteria

| ID | Given | When | Then |
|----|-------|------|------|
| AC-1 | the catalog loaded | I click "Add" on a product | it appears in the cart with qty 1 |
| AC-2 | an item is in the cart | I increase its quantity | the line total and cart total update |
| AC-3 | the cart has items | I click "Checkout" | a sale is persisted in SQLite and a receipt is returned |
| AC-4 | tax rate is 16% | totals are computed | `total === round(subtotal * 1.16)` |
| AC-5 | sales exist | I open "Sales history" | previous receipts are listed newest-first |

## 6. API contract

```
GET  /api/products          → Product[]
POST /api/sales             → Receipt        (body: { items: {productId, qty}[] })
GET  /api/sales             → Receipt[]
GET  /api/sales/:id         → Receipt
```

```ts
type Product = { id: number; name: string; price: number; stock: number };
type SaleItem = { productId: number; name: string; qty: number; unitPrice: number; lineTotal: number };
type Receipt = {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string; // ISO
};
```

## 7. Tech mapping (how each technology is demonstrated)

- **Angular / TypeScript** — standalone components, a `CartService` with DI, reactive state, typed HTTP client.
- **Express / Node** — REST API serving catalog and recording sales.
- **SQLite (better-sqlite3)** — embedded relational storage; `products`, `sales`, `sale_items` tables with a transaction on checkout.
- **Jest** — unit tests for the totals calculation (AC-4).
- **Cypress** — e2e test covering AC-1 → AC-3.
- **Docker** — `web` (Angular) and `api` (Express+SQLite) services.

## 8. Definition of done

- All acceptance criteria pass.
- Jest unit tests green; Cypress e2e green.
- `docker compose up` serves the POS end-to-end.
