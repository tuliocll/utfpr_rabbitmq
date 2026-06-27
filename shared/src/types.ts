export const CATEGORIES = [
  "livro",
  "jogo",
  "eletronico",
  "roupa",
  "alimento",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface ScoreUpdatePayload {
  promoId: string;
  upvotes: number;
  downvotes: number;
  isHotDeal: boolean;
}

export interface SalePayload {
  id: string;
  title: string;
  description: string;
  category: Category;
  originalPrice: number;
  salePrice: number;
  store: string;
  score?: number;
  storeEmail: string;
}

export interface SalePublishedPayload extends SalePayload {
  publishedAt: string;
  storeEmail: string;
}

export interface SaleVotePayload {
  saleId: string;
  vote: "up" | "down";
  previous?: "up" | "down";
}

export const ROUTING_KEYS = {
  RECEBIDA: "promocao.recebida",
  PUBLICADA: "promocao.publicada",
  VOTO: "promocao.voto",
  DESTAQUE: "promocao.destaque",
  category: (cat: Category) => `notificacao.${cat}`,
  categoryDestaque: (cat: Category) => `notificacao.${cat}.destaque`,
  SCORE: "ranking.score",
} as const;

export const EXCHANGE_NAME = "promocoes";
