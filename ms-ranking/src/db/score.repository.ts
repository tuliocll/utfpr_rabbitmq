import { db } from "./connection";
import type { Category, SalePayload } from "shared";

interface SaleScore extends SalePayload {
  upvotes: number;
  downvotes: number;
  isHotDeal: boolean;
}

export function register(promo: {
  id: string;
  title: string;
  description: string;
  category: Category;
  originalPrice: number;
  salePrice: number;
  store: string;
}): void {
  console.log(promo, [
    promo.id,
    promo.title,
    promo.description,
    promo.category,
    promo.originalPrice,
    promo.salePrice,
    promo.store,
  ]);
  db.run(
    `INSERT OR IGNORE INTO scores
     (promo_id, title, description, category, original_price, promo_price, store)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      promo.id,
      promo.title,
      promo.description,
      promo.category,
      promo.originalPrice,
      promo.salePrice,
      promo.store,
    ],
  );
}

export function findById(promoId: string): SaleScore | null {
  const row = db
    .query("SELECT * FROM scores WHERE promo_id = ?")
    .get(promoId) as any;
  if (!row) return null;

  return {
    id: row.promo_id,
    title: row.title,
    description: row.description,
    category: row.category as Category,
    originalPrice: row.original_price,
    salePrice: row.promo_price,
    store: row.store,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    isHotDeal: row.is_hot_deal === 1,
  };
}

export function upvote(promoId: string): void {
  db.run("UPDATE scores SET upvotes = upvotes + 1 WHERE promo_id = ?", [
    promoId,
  ]);
}

export function downvote(promoId: string): void {
  db.run("UPDATE scores SET downvotes = downvotes + 1 WHERE promo_id = ?", [
    promoId,
  ]);
}

export function removeUpvote(promoId: string): void {
  db.run("UPDATE scores SET upvotes = MAX(upvotes - 1, 0) WHERE promo_id = ?", [
    promoId,
  ]);
}

export function removeDownvote(promoId: string): void {
  db.run(
    "UPDATE scores SET downvotes = MAX(downvotes - 1, 0) WHERE promo_id = ?",
    [promoId],
  );
}

export function markAsHotDeal(promoId: string): void {
  db.run("UPDATE scores SET is_hot_deal = 1 WHERE promo_id = ?", [promoId]);
}
