import type { Context } from "hono";
import * as PromotionService from "../services/promotion.service";

export async function create(c: Context) {
  const body = await c.req.json();
  PromotionService.submit(body);
  return c.json({ message: "Promoção enviada para validação" }, 201);
}

export function list(c: Context) {
  const category = c.req.query("category");
  return c.json(PromotionService.list(category));
}

export async function vote(c: Context) {
  const saleId = c.req.param("id")!;
  const { clientId, vote } = await c.req.json();
  PromotionService.vote(saleId, clientId, vote);
  return c.json({ message: "Voto registrado" });
}

export function categories(c: Context) {
  return c.json(PromotionService.categories());
}
