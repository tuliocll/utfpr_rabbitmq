import {
  seal,
  publish,
  loadKey,
  ROUTING_KEYS,
  CATEGORIES,
  type Category,
  type SaleVotePayload,
} from "shared";
import * as PromotionRepo from "../db/promotion.repository";
import * as VoteRepo from "../db/vote.repository";
import { HttpError } from "../errors";

export function submit(signedEnvelope: unknown): void {
  publish(ROUTING_KEYS.RECEBIDA, JSON.stringify(signedEnvelope));
}

export function list(category?: string) {
  const all = !category || category === "*";

  if (!all && !CATEGORIES.includes(category as Category)) {
    throw new HttpError(400, "Categoria inválida");
  }

  return PromotionRepo.findAll(all ? undefined : (category as Category));
}

export function vote(saleId: string, clientId: unknown, vote: unknown): void {
  if (typeof clientId !== "string" || clientId.length === 0) {
    throw new HttpError(400, "clientId é obrigatório");
  }

  if (vote !== "up" && vote !== "down") {
    throw new HttpError(400, "Vote deve ser 'up' ou 'down'");
  }

  if (!PromotionRepo.exists(saleId)) {
    throw new HttpError(404, "Promoção não encontrada");
  }

  const previous = VoteRepo.getVote(clientId, saleId);

  if (previous === vote) {
    throw new HttpError(409, "Você já votou nesta promoção");
  }

  VoteRepo.set(clientId, saleId, vote);

  const payload: SaleVotePayload = previous
    ? { saleId, vote, previous }
    : { saleId, vote };
  const gatewayPrivateKey = loadKey("gateway_private.pem");
  const envelope = seal("gateway", payload, gatewayPrivateKey);
  publish(ROUTING_KEYS.VOTO, envelope);
}

export function categories(): readonly Category[] {
  return CATEGORIES;
}
