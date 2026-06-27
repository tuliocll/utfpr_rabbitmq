import { db } from "./connection";

export function getVote(
  clientId: string,
  saleId: string,
): "up" | "down" | null {
  const row = db
    .query("SELECT vote FROM votes WHERE client_id = ? AND sale_id = ?")
    .get(clientId, saleId) as { vote: "up" | "down" } | null;
  return row?.vote ?? null;
}

export function set(
  clientId: string,
  saleId: string,
  vote: "up" | "down",
): void {
  db.run(
    `INSERT INTO votes (client_id, sale_id, vote) VALUES (?, ?, ?)
     ON CONFLICT(client_id, sale_id) DO UPDATE SET vote = excluded.vote`,
    [clientId, saleId, vote],
  );
}
