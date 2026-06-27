import { Database } from "bun:sqlite";
import { join } from "node:path";

const DB_PATH = join(import.meta.dir, "..", "..", "data", "ranking.sqlite");

export const db = new Database(DB_PATH);

db.run("PRAGMA journal_mode = WAL");

db.run(`
  CREATE TABLE IF NOT EXISTS scores (
    promo_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    original_price REAL NOT NULL,
    promo_price REAL NOT NULL,
    store TEXT NOT NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    is_hot_deal INTEGER NOT NULL DEFAULT 0
  )
`);
