import { db } from "./connection";
import type { Category } from "shared";

export function add(clientId: string, category: Category): void {
  db.run(
    "INSERT OR IGNORE INTO interests (client_id, category) VALUES (?, ?)",
    [clientId, category],
  );
}

export function remove(clientId: string, category: Category): void {
  db.run("DELETE FROM interests WHERE client_id = ? AND category = ?", [
    clientId,
    category,
  ]);
}

export function findByClient(clientId: string): Category[] {
  const rows = db
    .query("SELECT category FROM interests WHERE client_id = ?")
    .all(clientId) as any[];
  return rows.map((r) => r.category as Category);
}
