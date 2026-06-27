import { db } from "./connection";
import type { Category, SalePublishedPayload } from "shared";

export function insert(promo: SalePublishedPayload): void {
  db.run(
    `INSERT OR IGNORE INTO promotions
     (id, title, description, category, original_price, promo_price, store, store_email, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      promo.id,
      promo.title,
      promo.description,
      promo.category,
      promo.originalPrice,
      promo.salePrice,
      promo.store,
      promo.storeEmail ?? null,
      promo.publishedAt,
    ],
  );
}

export function findAll(category?: Category): SalePublishedPayload[] {
  const rows = (
    category
      ? db
          .query(
            "SELECT * FROM promotions WHERE category = ? ORDER BY published_at DESC",
          )
          .all(category)
      : db.query("SELECT * FROM promotions ORDER BY published_at DESC").all()
  ) as any[];

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category as Category,
    originalPrice: r.original_price,
    salePrice: r.promo_price,
    store: r.store,
    storeEmail: r.store_email,
    upvotes: r.upvotes,
    downvotes: r.downvotes,
    isHotDeal: r.is_hot_deal === 1,
    publishedAt: r.published_at,
  }));
}

export function exists(id: string): boolean {
  return db.query("SELECT 1 FROM promotions WHERE id = ?").get(id) !== null;
}

export function updateScore(
  promoId: string,
  upvotes: number,
  downvotes: number,
  isHotDeal: boolean,
): void {
  db.run(
    "UPDATE promotions SET upvotes = ?, downvotes = ?, is_hot_deal = ? WHERE id = ?",
    [upvotes, downvotes, isHotDeal ? 1 : 0, promoId],
  );
}
