export const CATEGORIES = [
  "livro",
  "jogo",
  "eletronico",
  "roupa",
  "alimento",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface SalePayload {
  id: string;
  title: string;
  description: string;
  category: Category;
  originalPrice: number;
  salePrice: number;
  store: string;
  score?: number;
}

export interface SalePublishedPayload extends SalePayload {
  publishedAt: string;
}

export interface SaleVotePayload {
  saleId: string;
  vote: "up" | "down";
}

export const ROUTING_KEYS = {
  RECEBIDA: "promocao.recebida",
  PUBLICADA: "promocao.publicada",
  VOTO: "promocao.voto",
  DESTAQUE: "promocao.destaque",
  category: (cat: Category) => `promocao.${cat}`,
  categoryDestaque: (cat: Category) => `promocao.${cat}.destaque`,
} as const;

export const EXCHANGE_NAME = "promocoes";
