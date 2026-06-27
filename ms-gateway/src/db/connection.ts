import { Database } from "bun:sqlite";
import { join } from "node:path";

const DB_PATH = join(import.meta.dir, "..", "..", "data", "gateway.sqlite");

export const db = new Database(DB_PATH);

db.run("PRAGMA journal_mode = WAL");

db.run(`
  CREATE TABLE IF NOT EXISTS promotions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    original_price REAL NOT NULL,
    promo_price REAL NOT NULL,
    store TEXT NOT NULL,
    store_email TEXT,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    is_hot_deal INTEGER NOT NULL DEFAULT 0,
    published_at TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS interests (
    client_id TEXT NOT NULL,
    category TEXT NOT NULL,
    PRIMARY KEY (client_id, category)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS votes (
    client_id TEXT NOT NULL,
    sale_id TEXT NOT NULL,
    vote TEXT NOT NULL,
    PRIMARY KEY (client_id, sale_id)
  )
`);
