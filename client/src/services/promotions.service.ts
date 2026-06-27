import { apiFetch } from "../lib/api";

export interface Promotion {
  promo_id: string;
  title: string;
  description: string;
  category: string;
  original_price: number;
  promo_price: number;
  store: string;
  upvotes: number;
  downvotes: number;
  is_hot_deal: number;
  myVote: "up" | "down" | null;
}

interface ApiPromotion {
  id: string;
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  salePrice: number;
  store: string;
  upvotes: number;
  downvotes: number;
  isHotDeal: number;
  publishedAt: string;
}

function mapPromotion(p: ApiPromotion): Promotion {
  return {
    promo_id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    original_price: p.originalPrice,
    promo_price: p.salePrice,
    store: p.store,
    upvotes: p.upvotes || 0,
    downvotes: p.downvotes || 0,
    is_hot_deal: p.isHotDeal || 0,
    myVote: null,
  };
}

export async function getPromotions(category?: string): Promise<Promotion[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const data = await apiFetch<ApiPromotion[]>(`/promos${query}`);
  console.log("getPromotions", data);
  return data.map(mapPromotion);
}

export async function votePromotion(
  promoId: string,
  vote: "up" | "down",
  clientId: string,
): Promise<void> {
  await apiFetch(`/promos/${encodeURIComponent(promoId)}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vote, clientId }),
  });
}
