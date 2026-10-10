import Database from "better-sqlite3";

const db = new Database(process.env.DB_PATH ?? "pos.db");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    subtotal REAL NOT NULL,
    tax REAL NOT NULL,
    total REAL NOT NULL,
    createdAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sale_items (
    saleId TEXT NOT NULL,
    productId INTEGER NOT NULL,
    name TEXT NOT NULL,
    qty INTEGER NOT NULL,
    unitPrice REAL NOT NULL,
    lineTotal REAL NOT NULL,
    FOREIGN KEY (saleId) REFERENCES sales(id)
  );
`);

const seedCount = db.prepare("SELECT COUNT(*) AS c FROM products").get() as { c: number };
if (seedCount.c === 0) {
  const insert = db.prepare("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)");
  const seed = db.transaction(() => {
    insert.run("Espresso", 2.5, 100);
    insert.run("Cappuccino", 3.5, 100);
    insert.run("Blueberry Muffin", 2.0, 40);
    insert.run("Bagel", 1.75, 60);
    insert.run("Orange Juice", 3.0, 30);
  });
  seed();
}

export default db;
