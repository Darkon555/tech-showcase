import { randomUUID } from "node:crypto";
import cors from "cors";
import express from "express";
import { z } from "zod";
import db from "./db.js";
import { computeTotals } from "./totals.js";

const app = express();
app.use(cors());
app.use(express.json());

type Product = { id: number; name: string; price: number; stock: number };

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/products", (_req, res) => {
  res.json(db.prepare("SELECT * FROM products ORDER BY name").all());
});

const saleInput = z.object({
  items: z
    .array(z.object({ productId: z.number().int(), qty: z.number().int().positive() }))
    .min(1),
});

app.post("/api/sales", (req, res) => {
  const parsed = saleInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const getProduct = db.prepare("SELECT * FROM products WHERE id = ?");
  const lines = parsed.data.items.map((i) => {
    const p = getProduct.get(i.productId) as Product | undefined;
    if (!p) throw new Error(`Product ${i.productId} not found`);
    return {
      productId: p.id,
      name: p.name,
      qty: i.qty,
      unitPrice: p.price,
      lineTotal: Math.round(p.price * i.qty * 100) / 100,
    };
  });

  const { subtotal, tax, total } = computeTotals(lines);
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  const insertSale = db.prepare(
    "INSERT INTO sales (id, subtotal, tax, total, createdAt) VALUES (?, ?, ?, ?, ?)"
  );
  const insertItem = db.prepare(
    "INSERT INTO sale_items (saleId, productId, name, qty, unitPrice, lineTotal) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const decStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

  const tx = db.transaction(() => {
    insertSale.run(id, subtotal, tax, total, createdAt);
    for (const l of lines) {
      insertItem.run(id, l.productId, l.name, l.qty, l.unitPrice, l.lineTotal);
      decStock.run(l.qty, l.productId);
    }
  });

  try {
    tx();
  } catch (e) {
    return res.status(400).json({ error: (e as Error).message });
  }

  res.status(201).json({ id, items: lines, subtotal, tax, total, createdAt });
});

app.get("/api/sales", (_req, res) => {
  const sales = db.prepare("SELECT * FROM sales ORDER BY createdAt DESC").all() as {
    id: string;
  }[];
  const items = db.prepare("SELECT * FROM sale_items WHERE saleId = ?");
  res.json(sales.map((s) => ({ ...s, items: items.all(s.id) })));
});

app.get("/api/sales/:id", (req, res) => {
  const sale = db.prepare("SELECT * FROM sales WHERE id = ?").get(req.params.id);
  if (!sale) return res.status(404).json({ error: "Not found" });
  const items = db.prepare("SELECT * FROM sale_items WHERE saleId = ?").all(req.params.id);
  res.json({ ...sale, items });
});

const port = Number(process.env.PORT ?? 4002);
app.listen(port, () => console.log(`mini-pos API on :${port}`));
